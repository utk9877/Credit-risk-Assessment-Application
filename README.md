# Credit Risk Assessment Application

An AI-powered credit risk assessment tool. Submit a loan application, get an ML-generated risk score with a plain-language explanation of what drove it, and approve, decline, or send it for review.

## Features

- Submit a loan application with applicant, credit, and income details
- Get a risk score (XGBoost) with a probability of default and confidence level
- See which factors drove the score, via SHAP explainability
- Run "what-if" scenarios (e.g. higher credit score) without saving changes
- Approve / decline / review applications, tracked on a dashboard

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind
- **Backend:** FastAPI (Python), SQLAlchemy + SQLite
- **ML:** XGBoost + SHAP

## Getting Started

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
export PYTHONPATH=$(pwd)
uvicorn src.api.main:app --host 127.0.0.1 --port 8001
```

Check it's up: `curl http://127.0.0.1:8001/health`

### Frontend

```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8001" > .env.local
npm install
PORT=3001 npm run dev
```

Open **http://localhost:3001**.

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/applications/` | List / create applications |
| PATCH | `/api/applications/{id}/status` | Approve / decline / review |
| POST | `/api/risk-assessments/calculate` | Run the ML model on an application |
| POST | `/api/risk-assessments/simulate` | Run a what-if scenario (not saved) |
| GET | `/api/risk-assessments/application/{id}/explainability` | SHAP feature contributions |
| GET | `/docs` | Swagger UI |

## License

Educational and demonstration purposes.
