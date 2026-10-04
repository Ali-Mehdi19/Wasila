"""Wasila web app: sign-in, role routing, the helpdesk chat and the talking avatar.

Run with:  python app.py   (then open http://localhost:5000)
"""

import logging
import os
import re
import secrets
import uuid

from dotenv import load_dotenv
from flask import Flask, abort, jsonify, redirect, render_template, request, session, url_for
from markupsafe import Markup, escape

from core import auth, avatar, rag

load_dotenv()
log = logging.getLogger(__name__)

MAX_QUESTION_CHARS = 1000

SUGGESTED_QUESTIONS = [
    "What documents do I need for medical assistance?",
    "How do I apply for a college scholarship?",
    "What are the Jamaat office timings?",
]

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY") or secrets.token_hex(32)
app.config.update(SESSION_COOKIE_HTTPONLY=True, SESSION_COOKIE_SAMESITE="Lax")

# Chat history per browser session, kept in server memory (prototype only).
CHATS: dict[str, list[dict]] = {}
# Running LiveAvatar session per browser session; the session token never leaves the server.
AVATAR_SESSIONS: dict[str, dict] = {}


# ---------- helpers ----------


def csrf_token() -> str:
    if "csrf" not in session:
        session["csrf"] = secrets.token_hex(16)
    return session["csrf"]


@app.before_request
def check_csrf():
    if request.method == "POST":
        token = request.form.get("csrf") or request.headers.get("X-CSRF-Token")
        if not token or not secrets.compare_digest(token, session.get("csrf", "")):
            abort(400)


@app.context_processor
def inject_globals():
    return {"csrf_token": csrf_token, "user": auth.current_user()}


@app.template_filter("cite")
def cite(text: str, message_id: str) -> Markup:
    """Escape the answer and turn [n] citations into links to its source list."""
    html = str(escape(text))
    html = re.sub(
        r"\[(\d+)\]",
        lambda m: f'<sup><a class="cite" href="#{message_id}-s{m.group(1)}">{m.group(1)}</a></sup>',
        html,
    )
    return Markup(html)


def chat_id() -> str:
    if "chat_id" not in session:
        session["chat_id"] = uuid.uuid4().hex
    return session["chat_id"]


def chat_history() -> list[dict]:
    return CHATS.setdefault(chat_id(), [])


def ask_and_record(question: str, voice: bool = False) -> tuple[dict, rag.Answer]:
    """Answer a masked question and add both turns to the chat history."""
    history = chat_history()
    past = [{"role": m["role"], "content": m["content"]} for m in history]
    answer = rag.answer_question(question, past, voice=voice)

    history.append({"role": "user", "content": question})
    message = {
        "role": "assistant",
        "id": f"m{len(history)}",
        "content": answer.text,
        "emergency": answer.emergency,
        "failed": answer.failed,
        "sources": [
            {"number": s.number, "title": s.title, "section": s.section, "source": s.source}
            for s in answer.cited
        ],
    }
    history.append(message)
    return message, answer


def stop_avatar() -> None:
    running = AVATAR_SESSIONS.pop(session.get("chat_id", ""), None)
    if running:
        try:
            avatar.stop_session(running["session_id"], running["session_token"])
        except avatar.AvatarError:
            log.exception("Could not stop LiveAvatar session")


# ---------- sign-in ----------


@app.get("/")
def index():
    user = auth.current_user()
    return redirect(url_for(auth.home_endpoint(user) if user else "login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        if not auth.use_mock_login():
            abort(404)
        account = auth.DEMO_ACCOUNTS.get(request.form.get("account", ""))
        if not account:
            abort(400)
        auth.sign_in(account)
        return redirect(url_for(auth.home_endpoint(auth.current_user())))
    return render_template("login.html", mock=auth.use_mock_login())


@app.post("/logout")
def logout():
    stop_avatar()
    CHATS.pop(session.get("chat_id", ""), None)
    auth.sign_out()
    return redirect(url_for("login"))


# ---------- member: helpdesk chat ----------


@app.get("/chat")
@auth.require_role(auth.USER)
def chat():
    return render_template(
        "chat.html",
        messages=chat_history(),
        suggestions=SUGGESTED_QUESTIONS,
        avatar_configured=avatar.is_configured(),
    )


@app.post("/chat")
@auth.require_role(auth.USER)
def ask():
    question = rag.prepare_question(request.form.get("question", ""))[:MAX_QUESTION_CHARS]
    if not question:
        return redirect(url_for("chat"))
    ask_and_record(question)
    return redirect(url_for("chat", _anchor="latest"))


@app.post("/chat/clear")
@auth.require_role(auth.USER)
def clear_chat():
    chat_history().clear()
    return redirect(url_for("chat"))


# ---------- member: helpdesk API (used by the page's script, typed and spoken) ----------


@app.get("/avatar")
def avatar_page():
    # The avatar now lives on the helpdesk page.
    return redirect(url_for("chat"))


@app.post("/api/ask")
@auth.require_role(auth.USER)
def api_ask():
    payload = request.get_json(silent=True) or {}
    question = rag.prepare_question(str(payload.get("question", "")))[:MAX_QUESTION_CHARS]
    if not question:
        return jsonify(error="Empty question"), 400
    message, answer = ask_and_record(question, voice=bool(payload.get("voice")))
    return jsonify(
        question=question,
        speech=answer.speech,
        html=render_template("_bot_message.html", m=message, is_last=False),
    )


@app.post("/api/avatar/start")
@auth.require_role(auth.USER)
def avatar_start():
    stop_avatar()  # one running session per member
    try:
        started = avatar.start_session()
    except avatar.AvatarError:
        log.exception("Could not start LiveAvatar session")
        return jsonify(error="The avatar could not be started. Please try again or use the text chat."), 502
    AVATAR_SESSIONS[chat_id()] = started
    return jsonify(livekit_url=started["livekit_url"], livekit_token=started["livekit_client_token"])


@app.post("/api/avatar/stop")
@auth.require_role(auth.USER)
def avatar_stop():
    stop_avatar()
    return jsonify(ok=True)


# ---------- admin ----------


@app.get("/admin")
@auth.require_role(auth.ADMIN)
def admin_home():
    return render_template("admin_home.html")


@app.errorhandler(403)
def forbidden(_):
    return render_template("error.html", title="No access", message="You do not have access to this page."), 403


@app.errorhandler(400)
def bad_request(_):
    message = "That request could not be processed. Please go back and try again."
    return render_template("error.html", title="Something went wrong", message=message), 400


@app.errorhandler(500)
def server_error(_):
    message = "Something went wrong on our side. Please try again in a few minutes."
    return render_template("error.html", title="Something went wrong", message=message), 500


if __name__ == "__main__":
    # The reloader would open embedded Qdrant twice, which it does not allow.
    app.run(debug=os.getenv("FLASK_DEBUG") == "1", use_reloader=False)
