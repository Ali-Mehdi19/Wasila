"""Retrieval and grounded answer generation for the helpdesk chatbot.

The chatbot only reads the `procedures` collection, never member data, and
answers only from the passages it retrieves.
"""

import logging
import os
import re
from dataclasses import dataclass, field

import openai
from dotenv import load_dotenv

from core import db
from core.security import mask

load_dotenv()
log = logging.getLogger(__name__)

DEFAULT_MODEL = "gpt-5.4-mini"
TOP_K = 5
# Cosine similarity below which a passage is treated as unrelated.
MIN_SCORE = float(os.getenv("RAG_MIN_SCORE", "0.35"))
# Past messages sent to the model (user + assistant).
HISTORY_LIMIT = 10

HANDOVER = (
    "I couldn't find this in the Jamaat's verified documents. "
    "Please contact the Jamaat office and they will help you directly."
)
ERROR_REPLY = "Sorry, the helpdesk is not available right now. Please try again in a few minutes."
EMERGENCY_SPEECH = "If this is a medical emergency, please call 112, or 108 for an ambulance, right away."

VOICE_PROMPT = """

You are speaking out loud through a video avatar. Answer in two to four short, natural sentences \
that are easy to follow by ear; mention only the most important documents or steps and offer to \
share more. Keep the [n] citations; they are removed before speaking."""

SYSTEM_PROMPT = """You are Wasila, the helpdesk assistant of the Khoja Shia Ithna-Asheri Jamaat, Mumbai. \
You help Jamaat members understand procedures for Jamaat services: which documents a service needs, \
which committee or office handles it, eligibility, forms, timings and next steps.

How to answer:
- Answer only from the passages inside <documents> in the latest message. They come from the Jamaat's \
verified documents. Do not use outside knowledge about Jamaat procedures, amounts, dates or contacts.
- Cite the passages you used with their number in square brackets, e.g. [1] or [2][3], right after the \
sentence they support.
- If the passages do not answer the question, say plainly that you could not find it in the verified \
documents and suggest contacting the Jamaat office. Never guess.
- Keep answers short and practical. Write plain text without Markdown symbols such as ** or #; for \
steps or required documents, put each item on its own line starting with "1.", "2." and so on.
- Reply in the language the member writes in when you can; otherwise use simple English.
- Greetings and thanks need no documents; reply briefly and offer help.

Boundaries:
- Religious rulings (masail, fiqh, halal/haram, rituals): do not answer. Kindly refer the member to the \
Jamaat's aalim.
- Medical questions: do not diagnose or give medical advice. You may explain Jamaat medical-assistance \
procedures from the documents. If something sounds urgent or life-threatening, tell the member to call \
emergency services (112, or 108 for an ambulance) first.
- Never ask for or repeat Aadhaar, PAN, bank or card numbers. Personal details are handled in the \
member's profile, not in this chat.
- You cannot see member records, book appointments or submit applications from this chat. Point the \
member to the matching section of Wasila (Medical, Scholarship, My Requests) instead."""

_EMERGENCY = re.compile(
    r"\b(emergency|unconscious|not breathing|heart attack|stroke|severe bleeding|bleeding heavily|"
    r"chest pain|suicid\w*|overdose|accident|ambulance|seizure)\b",
    re.IGNORECASE,
)


@dataclass
class Source:
    number: int
    title: str
    section: str
    source: str
    text: str
    score: float


@dataclass
class Answer:
    text: str = ""
    sources: list[Source] = field(default_factory=list)
    cited: list[Source] = field(default_factory=list)
    emergency: bool = False
    failed: bool = False

    @property
    def speech(self) -> str:
        """The answer as the avatar should say it."""
        return speech_text(self.text, self.emergency)


def is_emergency(text: str) -> bool:
    return bool(_EMERGENCY.search(text))


def prepare_question(text: str) -> str:
    """Mask ID numbers before the question is shown, stored or sent anywhere."""
    return mask(text.strip())


def retrieval_query(question: str, history: list[dict]) -> str:
    """Add the previous user message so short follow-ups ("and the fees?") still match."""
    previous = [m["content"] for m in history if m["role"] == "user"]
    return f"{previous[-1]}\n{question}" if previous else question


def retrieve(query: str, k: int = TOP_K, client=None) -> list[Source]:
    client = client or db.get_client()
    if not client.collection_exists(db.PROCEDURES):
        return []
    hits = client.query_points(
        collection_name=db.PROCEDURES,
        query=db.embed([query])[0],
        limit=k,
        score_threshold=MIN_SCORE,
        with_payload=True,
    ).points
    return [
        Source(
            number=i,
            title=hit.payload.get("title", ""),
            section=hit.payload.get("section", ""),
            source=hit.payload.get("source", ""),
            text=hit.payload.get("text", ""),
            score=hit.score,
        )
        for i, hit in enumerate(hits, start=1)
    ]


def format_documents(sources: list[Source]) -> str:
    if not sources:
        return "<documents>\nNo matching passages were found.\n</documents>"
    parts = []
    for s in sources:
        heading = f"{s.title} - {s.section}" if s.section else s.title
        parts.append(f'<document index="{s.number}" title="{heading}">\n{s.text}\n</document>')
    return "<documents>\n" + "\n".join(parts) + "\n</documents>"


def cited_sources(text: str, sources: list[Source]) -> list[Source]:
    numbers = {int(n) for n in re.findall(r"\[(\d+)\]", text)}
    return [s for s in sources if s.number in numbers]


def build_messages(question: str, history: list[dict], sources: list[Source]) -> list[dict]:
    """Plain-text history plus the new question with its retrieved passages.

    Passages go in the latest user turn, not the system prompt, so the system
    prompt stays identical across requests and can be cached.
    """
    past = [{"role": m["role"], "content": m["content"]} for m in history[-HISTORY_LIMIT:]]
    # The API needs the conversation to start with a user turn.
    while past and past[0]["role"] != "user":
        past.pop(0)
    turn = f"{format_documents(sources)}\n\nMember's question: {question}"
    return past + [{"role": "user", "content": turn}]


def get_llm() -> openai.OpenAI:
    return openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY") or None)


def speech_text(text: str, emergency: bool = False) -> str:
    """Drop citation markers and line breaks, which sound odd when spoken."""
    spoken = re.sub(r"\s*\[\d+\]", "", text)
    spoken = re.sub(r"\s+", " ", spoken).strip()
    if emergency:
        spoken = f"{EMERGENCY_SPEECH} {spoken}"
    return spoken


def answer_question(
    question: str, history: list[dict], llm=None, client=None, voice: bool = False
) -> Answer:
    """Retrieve passages and generate a grounded answer.

    `question` and `history` must already be masked (see `prepare_question`).
    `voice=True` asks for a short answer suited to being spoken by the avatar.
    """
    answer = Answer(emergency=is_emergency(question))
    answer.sources = retrieve(retrieval_query(question, history), client=client)
    request = {
        "model": os.getenv("OPENAI_MODEL") or DEFAULT_MODEL,
        "instructions": SYSTEM_PROMPT + (VOICE_PROMPT if voice else ""),
        "input": build_messages(question, history, answer.sources),
        "max_output_tokens": 4000,
        "store": False,
    }
    if effort := os.getenv("OPENAI_REASONING_EFFORT"):
        request["reasoning"] = {"effort": effort}

    try:
        response = (llm or get_llm()).responses.create(**request)
    # OpenAIError also covers a missing API key.
    except openai.OpenAIError:
        log.exception("Helpdesk answer failed")
        answer.failed = True
        answer.text = ERROR_REPLY
        return answer

    answer.text = (response.output_text or "").strip() or HANDOVER
    answer.cited = cited_sources(answer.text, answer.sources)
    return answer
