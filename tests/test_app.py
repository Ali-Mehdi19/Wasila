import re

import pytest

import app as wasila
from core import rag


@pytest.fixture
def client(monkeypatch):
    def fake_answer(question, history, voice=False):
        source = rag.Source(1, "Medical Assistance", "Documents required", "medical.md", "x", 0.8)
        return rag.Answer(
            text="Bring your membership card [1].",
            sources=[source],
            cited=[source],
            emergency=rag.is_emergency(question),
        )

    monkeypatch.setattr(wasila.rag, "answer_question", fake_answer)
    wasila.app.config["TESTING"] = True
    with wasila.app.test_client() as client:
        yield client


def csrf(client, path):
    return re.search(r'name="csrf" value="([^"]+)"', client.get(path).get_data(as_text=True)).group(1)


def sign_in(client, account):
    return client.post("/login", data={"account": account, "csrf": csrf(client, "/login")})


def test_chat_requires_sign_in(client):
    assert client.get("/chat").headers["Location"].endswith("/login")


def test_post_without_csrf_is_rejected(client):
    assert client.post("/login", data={"account": "member"}).status_code == 400


def test_member_asks_and_sees_cited_answer(client):
    sign_in(client, "member")
    token = csrf(client, "/chat")
    client.post("/chat", data={"question": "Chest pain, Aadhaar 1234 5678 9012", "csrf": token})
    page = client.get("/chat").get_data(as_text=True)
    assert "Bring your membership card" in page
    assert 'class="cite" href="#m1-s1"' in page and 'id="m1-s1"' in page
    assert "1234 5678 9012" not in page and "XXXX-XXXX-9012" in page
    assert "call <strong>112</strong>" in page


def test_answer_html_is_escaped(client, monkeypatch):
    monkeypatch.setattr(wasila.rag, "answer_question", lambda q, h, voice=False: rag.Answer(text="<script>x</script>"))
    sign_in(client, "member")
    client.post("/chat", data={"question": "hi", "csrf": csrf(client, "/chat")})
    assert "<script>x</script>" not in client.get("/chat").get_data(as_text=True)


def test_roles_are_separated(client):
    sign_in(client, "member")
    assert client.get("/admin").status_code == 403
    client.post("/logout", data={"csrf": csrf(client, "/chat")})
    sign_in(client, "admin")
    assert client.get("/admin").status_code == 200
    assert client.get("/chat").status_code == 403


# ---------- talking avatar ----------


def test_avatar_page_and_session_flow(client, monkeypatch):
    started = {"session_id": "s1", "session_token": "secret-token", "livekit_url": "wss://x", "livekit_client_token": "lk"}
    stopped = []
    monkeypatch.setattr(wasila.avatar, "is_configured", lambda: True)
    monkeypatch.setattr(wasila.avatar, "start_session", lambda: started)
    monkeypatch.setattr(wasila.avatar, "stop_session", lambda sid, tok: stopped.append((sid, tok)))

    sign_in(client, "member")
    token = csrf(client, "/chat")
    headers = {"X-CSRF-Token": token}

    res = client.post("/api/avatar/start", headers=headers)
    assert res.get_json() == {"livekit_url": "wss://x", "livekit_token": "lk"}
    assert "secret-token" not in res.get_data(as_text=True)

    res = client.post("/api/ask", json={"question": "chest pain"}, headers=headers).get_json()
    assert res["speech"].startswith("If this is a medical emergency")
    assert 'class="cite"' in res["html"] and "[1]" not in res["speech"]
    assert "Bring your membership card" in client.get("/chat").get_data(as_text=True)

    client.post("/api/avatar/stop", headers=headers)
    assert stopped == [("s1", "secret-token")]


def test_avatar_api_needs_csrf_and_member(client):
    assert client.post("/api/avatar/start").status_code == 400
    sign_in(client, "admin")
    token = csrf(client, "/admin")
    assert client.post("/api/avatar/start", headers={"X-CSRF-Token": token}).status_code == 403


def test_single_helpdesk_page(client, monkeypatch):
    seen = []
    monkeypatch.setattr(
        wasila.rag, "answer_question", lambda q, h, voice=False: seen.append(voice) or rag.Answer(text="ok")
    )
    sign_in(client, "member")
    assert client.get("/avatar").headers["Location"].endswith("/chat")

    monkeypatch.setattr(wasila.avatar, "is_configured", lambda: True)
    page = client.get("/chat").get_data(as_text=True)
    assert 'id="start-btn"' in page and 'id="composer"' in page
    monkeypatch.setattr(wasila.avatar, "is_configured", lambda: False)
    assert 'id="start-btn"' not in client.get("/chat").get_data(as_text=True)

    headers = {"X-CSRF-Token": csrf(client, "/chat")}
    client.post("/api/ask", json={"question": "typed"}, headers=headers)
    client.post("/api/ask", json={"question": "spoken", "voice": True}, headers=headers)
    assert seen == [False, True]
