# Wasila

**One profile. Every Jamaat service.**

Wasila is an AI-powered web application for the Khoja Shia Ithna-Asheri Jamaat, Mumbai. A member signs in once, asks for help in plain language, and is guided to the right Jamaat service. Details given for one request are reused for the next, so nobody fills in the same form twice.

Hackathon track: **AI, Automation & Cybersecurity**

> Status: hackathon prototype. Items marked *(planned)* are not built yet.

---

## The problem

- Members do not know which documents, forms or committees a service needs, so they call or visit the office repeatedly.
- Every application (medical, education, ration) asks for the same personal details again.
- Procedures live in scattered circulars, PDFs and people's heads.
- Sensitive member data is passed around on paper and WhatsApp.

## The solution

| Track area | What Wasila does |
|---|---|
| AI-powered helpdesk | A chatbot answers questions from verified Jamaat documents and shows its source |
| Data analytics & intelligent search | Procedures and requirement documents are indexed in a vector database for fast, meaning-based search |
| Process automation | The chatbot collects only the missing details and creates a ready-to-review application for the committee |
| Cybersecurity | OneID sign-in, role-based access, masked ID numbers, consent before data reuse, and an audit log |

## Example journeys

### 1. Hospital admission

1. The member signs in with OneID.
2. They type: "My father has a breathing problem and needs to be admitted."
3. The chatbot retrieves the hospital admission procedure and asks for the missing details (patient, urgency, existing reports).
4. It suggests the right department or hospital from the Jamaat's list and creates a case for the medical committee.
5. If the situation sounds urgent, it tells the member to call emergency services first.

Wasila does **not** diagnose. It only routes the member to the right place.

### 2. College scholarship

1. The same member signs in a week later.
2. They type: "I want to apply for a college scholarship."
3. Name, address, family and contact details are pre-filled from the saved profile, with the member's consent.
4. The chatbot asks only for what is new: course, college, fees and marksheets.
5. The application goes to the education committee.

Health details from journey 1 are never carried into the scholarship application.

---

## How it works

```
Member (browser)
      |
      v
 Web app (FastAPI) ---- OneID sign-in
      |
      +--> Chat service --> Vector DB (procedures, forms, requirements)
      |          |
      |          +--> LLM (answers only from retrieved documents)
      |
      +--> Profile & applications --> PostgreSQL (member data, cases, audit log)
      |
      +--> Committee dashboard (review, approve, follow up)
```

Two separate stores are used on purpose:

- **Vector DB** holds public knowledge: procedures, requirement lists, forms.
- **PostgreSQL** holds personal data: profiles, applications, consent and audit records.

## Tech stack

| Layer | Choice |
|---|---|
| Backend | Python, FastAPI |
| Frontend | Jinja2 templates + HTMX (or Streamlit for a faster prototype) |
| Vector DB | ChromaDB (or PostgreSQL with pgvector) |
| Database | PostgreSQL |
| LLM | Any chat model via API, set in `.env` |
| Embeddings | Multilingual embedding model (English, Gujarati, Urdu, Hindi) |
| Sign-in | OneID API, with a mock login as fallback |

---

## Project structure

```
wasila/
├── app/
│   ├── main.py              # FastAPI entry point
│   ├── auth/                # OneID sign-in and mock login
│   ├── chat/                # Retrieval and answer generation
│   ├── profile/             # Member profile and consent
│   ├── applications/        # Hospital and scholarship flows
│   ├── dashboard/           # Committee views
│   └── security/            # Roles, masking, audit log
├── ingest/
│   └── ingest_docs.py       # Load documents into the vector DB
├── data/
│   └── documents/           # Verified Jamaat procedures and forms
├── templates/
├── tests/
├── .env.example
├── requirements.txt
└── README.md
```

## Getting started

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- An LLM API key

### Setup

```bash
git clone <repo-url>
cd wasila
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # then fill in the values
```

### Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `LLM_API_KEY` | Key for the chat model |
| `LLM_MODEL` | Model name |
| `ONEID_CLIENT_ID` | OneID application ID |
| `ONEID_CLIENT_SECRET` | OneID secret |
| `USE_MOCK_LOGIN` | `true` to skip OneID during development |
| `SECRET_KEY` | Session signing key |

### Load the documents

Put verified procedure documents in `data/documents/`, then run:

```bash
python ingest/ingest_docs.py
```

### Run

```bash
uvicorn app.main:app --reload
```

Open http://localhost:8000

---

## Security and privacy

- **Sign-in:** OneID only; no passwords are stored by Wasila.
- **Roles:** member, committee reviewer and admin. Reviewers see only their own committee's cases.
- **Masking:** Aadhaar and PAN numbers are masked on screen and in logs.
- **Consent:** the member is shown which saved details will be reused and must agree.
- **Separation:** health data stays within medical cases.
- **Audit log:** every view of a member's record is recorded.
- **Grounded answers:** the chatbot answers only from verified documents and hands over to the office when it does not know.
- **Religious questions:** masail are referred to the Jamaat's aalim, not answered by the AI.

## Roadmap

- [ ] Document ingestion and vector search
- [ ] Chatbot with source citations
- [ ] OneID sign-in and mock login
- [ ] Member profile with consent
- [ ] Hospital admission flow
- [ ] Scholarship flow with pre-filled details
- [ ] Committee dashboard
- [ ] Gujarati, Urdu and Hindi support *(planned)*
- [ ] Analytics on common questions and pending cases *(planned)*
- [ ] More services: ration, housing, elderly care *(planned)*

## Team

| Name | Role |
|---|---|
| Taqi | Team lead |
| _to add_ | Backend |
| _to add_ | AI and data |
| _to add_ | Frontend |

## Disclaimer

Wasila is a hackathon prototype. It does not give medical or religious advice, and it must not be used with real member data until the Jamaat has reviewed and approved it.
