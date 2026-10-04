from types import SimpleNamespace

import pytest
from qdrant_client import QdrantClient

from core import db, rag
from core.security import mask
from ingest.ingest_docs import chunk_document, ingest, split_long, split_sections


# ---------- masking and guards ----------


def test_mask_hides_ids_and_phone():
    masked = mask("Aadhaar 1234 5678 9012, PAN abcde1234f, call 9876543210")
    assert "1234 5678" not in masked and "XXXX-XXXX-9012" in masked
    assert "ABCDE" not in masked.upper() and "XXXXXX234F" in masked
    assert "98765432" not in masked and masked.endswith("XXXXXXXX10")


def test_emergency_detection():
    assert rag.is_emergency("My father has chest pain")
    assert not rag.is_emergency("What documents do I need for a scholarship?")


def test_retrieval_query_includes_previous_user_message():
    history = [{"role": "user", "content": "scholarship documents"}, {"role": "assistant", "content": "..."}]
    assert rag.retrieval_query("and the deadline?", history) == "scholarship documents\nand the deadline?"


def test_build_messages_starts_with_user_and_trims_history():
    history = [{"role": "assistant", "content": "hi"}] + [
        {"role": r, "content": str(i)} for i in range(20) for r in ("user", "assistant")
    ]
    messages = rag.build_messages("q", history, [])
    assert messages[0]["role"] == "user"
    assert len(messages) <= rag.HISTORY_LIMIT + 1
    assert "No matching passages" in messages[-1]["content"]


def test_cited_sources():
    sources = [rag.Source(i, "T", "", "f.md", "x", 0.9) for i in (1, 2, 3)]
    assert [s.number for s in rag.cited_sources("A [1]. B [3][1].", sources)] == [1, 3]


# ---------- chunking ----------


def test_split_sections_and_long_text():
    sections = split_sections("# Title\nintro\n## Docs\n1. card\n## How\nstep")
    assert [h for h, _ in sections] == ["Title", "Docs", "How"]
    pieces = split_long("\n\n".join(["word " * 50] * 10), size=400, overlap=50)
    assert len(pieces) > 1 and all(len(p) <= 400 for p in pieces)


def test_chunk_document_uses_title(tmp_path):
    path = tmp_path / "doc.md"
    path.write_text("# Medical Help\n\n## Documents\n\n1. Card\n2. Prescription\n", encoding="utf-8")
    chunks = chunk_document(path)
    assert chunks[0]["title"] == "Medical Help" and chunks[0]["section"] == "Documents"


# ---------- retrieval and answering (in-memory Qdrant, fake LLM) ----------


@pytest.fixture(scope="module")
def qdrant(tmp_path_factory):
    client = QdrantClient(":memory:")
    docs = tmp_path_factory.mktemp("docs")
    (docs / "scholarship.md").write_text(
        "# Scholarship\n\n## Documents required\n\n1. Marksheet\n2. Fee receipt\n", encoding="utf-8"
    )
    (docs / "office.md").write_text("# Office\n\n## Timings\n\nOpen 10 am to 6 pm.\n", encoding="utf-8")
    ingest(sorted(docs.iterdir()), client)
    return client


def test_reingest_replaces_chunks(qdrant, tmp_path):
    before = qdrant.count(db.PROCEDURES).count
    path = tmp_path / "office.md"
    path.write_text("# Office\n\n## Timings\n\nOpen 10 am to 6 pm.\n", encoding="utf-8")
    ingest([path], qdrant)
    assert qdrant.count(db.PROCEDURES).count == before


def test_retrieve_finds_relevant_passage(qdrant):
    sources = rag.retrieve("Which documents do I need for a scholarship?", client=qdrant)
    assert sources and sources[0].source == "scholarship.md"
    assert [s.number for s in sources] == list(range(1, len(sources) + 1))


class FakeLLM:
    """Stands in for openai.OpenAI: records requests, returns a fixed reply."""

    def __init__(self, text=""):
        self.calls = []

        def create(**kwargs):
            self.calls.append(kwargs)
            return SimpleNamespace(output_text=text)

        self.responses = SimpleNamespace(create=create)


def test_answer_question_cites_and_sends_documents(qdrant):
    llm = FakeLLM("You need your marksheet and fee receipt [1].")
    answer = rag.answer_question("scholarship documents?", [], llm=llm, client=qdrant)
    assert answer.cited and answer.cited[0].source == "scholarship.md"
    sent = llm.calls[0]
    assert "<documents>" in sent["input"][-1]["content"]
    assert sent["instructions"] == rag.SYSTEM_PROMPT


def test_voice_answer_is_short_and_spoken_without_citations(qdrant):
    llm = FakeLLM("Bring your marksheet [1] and\nfee receipt [1][2].")
    answer = rag.answer_question("chest pain, scholarship?", [], llm=llm, client=qdrant, voice=True)
    assert rag.VOICE_PROMPT in llm.calls[0]["instructions"]
    assert answer.speech.startswith(rag.EMERGENCY_SPEECH)
    assert answer.speech.endswith("Bring your marksheet and fee receipt.")


def test_empty_reply_hands_over(qdrant):
    answer = rag.answer_question("anything", [], llm=FakeLLM(""), client=qdrant)
    assert answer.text == rag.HANDOVER


def test_missing_api_key_gives_friendly_reply(qdrant, monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    answer = rag.answer_question("office timings?", [], client=qdrant)
    assert answer.failed and answer.text == rag.ERROR_REPLY
