"""LiveAvatar sessions for the talking helpdesk.

LiveAvatar runs in FULL mode without a context, so its own LLM stays silent:
it turns the member's speech into `user.transcription` events, and the avatar
says only the text Wasila sends back with `avatar.speak_text`. The answers
themselves come from `core.rag`, like the text chat.

The API key stays on the server. The browser only receives the LiveKit room
credentials for one session.
"""

import os

import requests
from dotenv import load_dotenv

load_dotenv()

API_URL = "https://api.liveavatar.com"
# (connect, read) seconds
TIMEOUT = (5, 20)
# Optional cap per session in seconds, to protect credits (FULL mode costs 2 credits a minute).
# Unset = the plan's own limit (300 s on the current plan, 60 s in sandbox).
MAX_SESSION_SECONDS = os.getenv("LIVEAVATAR_MAX_SECONDS", "").strip()


class AvatarError(Exception):
    pass


def is_configured() -> bool:
    return bool(os.getenv("LIVEAVATAR_API_KEY") and os.getenv("LIVEAVATAR_AVATAR_ID"))


def _post(path: str, headers: dict, body: dict | None = None) -> dict:
    try:
        response = requests.post(
            f"{API_URL}{path}",
            headers={"accept": "application/json", **headers},
            json=body,
            timeout=TIMEOUT,
        )
        payload = response.json()
    except (requests.RequestException, ValueError) as e:
        raise AvatarError(f"LiveAvatar request failed: {e}") from e
    if not response.ok:
        raise AvatarError(f"LiveAvatar {path} returned {response.status_code}: {payload.get('message')}")
    return payload.get("data") or {}


def start_session() -> dict:
    """Create and start a session. Returns the ids, the session token and the LiveKit credentials."""
    if not is_configured():
        raise AvatarError("LIVEAVATAR_API_KEY and LIVEAVATAR_AVATAR_ID must be set")
    sandbox = os.getenv("LIVEAVATAR_SANDBOX", "false").lower() == "true"
    config = {
        "mode": "FULL",
        "avatar_id": os.environ["LIVEAVATAR_AVATAR_ID"],
        "is_sandbox": sandbox,
        # No context_id: LiveAvatar's LLM stays silent and Wasila supplies every answer.
        # The avatar's default voice is used.
        "avatar_persona": {"language": os.getenv("LIVEAVATAR_LANGUAGE", "en")},
        "video_settings": {"quality": "high"},
    }
    if MAX_SESSION_SECONDS:
        config["max_session_duration"] = int(MAX_SESSION_SECONDS)
    token = _post("/v1/sessions/token", {"X-API-KEY": os.environ["LIVEAVATAR_API_KEY"]}, config)
    started = _post("/v1/sessions/start", {"authorization": f"Bearer {token['session_token']}"})
    return {
        "session_id": token["session_id"],
        "session_token": token["session_token"],
        "livekit_url": started["livekit_url"],
        "livekit_client_token": started["livekit_client_token"],
    }


def stop_session(session_id: str, session_token: str) -> None:
    _post(
        "/v1/sessions/stop",
        {"authorization": f"Bearer {session_token}"},
        {"session_id": session_id, "reason": "USER_CLOSED"},
    )
