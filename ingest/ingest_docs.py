"""Load verified Jamaat documents into the Qdrant `procedures` collection.

Usage:
    python ingest/ingest_docs.py            # add or update every file in data/documents
    python ingest/ingest_docs.py --reset    # drop the collection first

Supports .md, .txt and digital .pdf files. Re-running replaces a file's old chunks.
"""

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from pypdf import PdfReader  # noqa: E402
from qdrant_client import models  # noqa: E402

from core import db  # noqa: E402

DOCS_DIR = ROOT / "data" / "documents"
CHUNK_CHARS = 1000
OVERLAP_CHARS = 150


def read_text(path: Path) -> str:
    if path.suffix.lower() == ".pdf":
        return "\n\n".join(page.extract_text() or "" for page in PdfReader(path).pages)
    return path.read_text(encoding="utf-8")


def split_sections(text: str) -> list[tuple[str, str]]:
    """Split Markdown on headings into (heading, body) pairs. Text before any heading has heading ''."""
    sections, heading, lines = [], "", []
    for line in text.splitlines():
        match = re.match(r"^#{1,6}\s+(.*)", line)
        if match:
            if "".join(lines).strip():
                sections.append((heading, "\n".join(lines).strip()))
            heading, lines = match.group(1).strip(), []
        else:
            lines.append(line)
    if "".join(lines).strip():
        sections.append((heading, "\n".join(lines).strip()))
    return sections


def split_long(text: str, size: int = CHUNK_CHARS, overlap: int = OVERLAP_CHARS) -> list[str]:
    """Split on paragraph breaks into pieces of at most ~`size` characters."""
    if len(text) <= size:
        return [text]
    pieces, current = [], ""
    for para in re.split(r"\n\s*\n", text):
        if current and len(current) + len(para) + 2 > size:
            pieces.append(current.strip())
            current = current[-overlap:] + "\n\n"
        current += para + "\n\n"
        while len(current) > size:  # a single paragraph longer than `size`
            pieces.append(current[:size].strip())
            current = current[size - overlap :]
    if current.strip():
        pieces.append(current.strip())
    return pieces


def chunk_document(path: Path) -> list[dict]:
    text = read_text(path)
    title_match = re.search(r"^#\s+(.*)", text, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else path.stem.replace("_", " ").title()
    chunks = []
    for heading, body in split_sections(text):
        section = "" if heading == title else heading
        for piece in split_long(body):
            chunks.append({"title": title, "section": section, "source": path.name, "text": piece})
    return chunks


def ingest(paths: list[Path], client=None) -> int:
    client = client or db.get_client()
    db.ensure_collection(db.PROCEDURES, client)
    total = 0
    for path in paths:
        chunks = chunk_document(path)
        client.delete(
            collection_name=db.PROCEDURES,
            points_selector=models.FilterSelector(
                filter=models.Filter(
                    must=[models.FieldCondition(key="source", match=models.MatchValue(value=path.name))]
                )
            ),
        )
        if not chunks:
            continue
        # Embed the heading with the text so section names help matching.
        vectors = db.embed([f"{c['title']} - {c['section']}\n{c['text']}" for c in chunks])
        client.upsert(
            collection_name=db.PROCEDURES,
            points=[
                models.PointStruct(id=db.point_id(f"{path.name}::{i}"), vector=vector, payload=chunk)
                for i, (chunk, vector) in enumerate(zip(chunks, vectors))
            ],
        )
        print(f"{path.name}: {len(chunks)} chunks")
        total += len(chunks)
    return total


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--reset", action="store_true", help="delete the procedures collection first")
    args = parser.parse_args()

    client = db.get_client()
    if args.reset and client.collection_exists(db.PROCEDURES):
        client.delete_collection(db.PROCEDURES)

    paths = sorted(p for p in DOCS_DIR.iterdir() if p.suffix.lower() in {".md", ".txt", ".pdf"})
    if not paths:
        sys.exit(f"No documents found in {DOCS_DIR}")
    total = ingest(paths, client)
    client.close()
    print(f"Done: {total} chunks from {len(paths)} files in '{db.PROCEDURES}'.")


if __name__ == "__main__":
    main()
