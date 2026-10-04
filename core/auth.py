"""Sign-in and roles. Mock login for now; OneID comes later."""

import os
from functools import wraps

from dotenv import load_dotenv
from flask import abort, redirect, session, url_for

load_dotenv()

USER = "user"
ADMIN = "admin"

DEMO_ACCOUNTS = {
    "member": {"oneid": "DEMO-USER-001", "name": "Demo Member"},
    "admin": {"oneid": "DEMO-ADMIN-001", "name": "Demo Admin"},
}


def use_mock_login() -> bool:
    return os.getenv("USE_MOCK_LOGIN", "true").lower() == "true"


def admin_ids() -> set[str]:
    ids = {i.strip() for i in os.getenv("ADMIN_IDS", "").split(",") if i.strip()}
    if use_mock_login():
        ids.add(DEMO_ACCOUNTS["admin"]["oneid"])
    return ids


def role_for(oneid: str) -> str:
    return ADMIN if oneid in admin_ids() else USER


def sign_in(account: dict) -> None:
    session.clear()
    session["user"] = {**account, "role": role_for(account["oneid"])}


def sign_out() -> None:
    session.clear()


def current_user() -> dict | None:
    return session.get("user")


def home_endpoint(user: dict) -> str:
    return "admin_home" if user["role"] == ADMIN else "chat"


def require_role(role: str):
    """Route decorator: send signed-out visitors to sign-in, refuse other roles."""

    def decorator(view):
        @wraps(view)
        def wrapped(*args, **kwargs):
            user = current_user()
            if not user:
                return redirect(url_for("login"))
            if user["role"] != role:
                abort(403)
            return view(*args, **kwargs)

        return wrapped

    return decorator
