# Credit Risk MVP

A Next.js-based credit risk assessment dashboard with explainable AI features.

## Credit Risk MVP

Full-stack minimal viable product for credit-risk assessment with explainable AI.

This repository contains:
- `backend/` — FastAPI backend that hosts the ML model, persistence (SQLite), and explainability (SHAP) endpoints.
- `frontend/` — Next.js (App Router) TypeScript frontend that calls the backend APIs.

This README explains how to run the project locally (macOS / zsh) and common troubleshooting notes.

Prerequisites
 - Node.js (16+ / 18+ recommended) and npm
 - Python 3.10+ (3.11/3.14 tested in the dev environment)
 - (Optional) Jupyter if you want to run the training notebook

Repository layout (top-level)

```
credit-risk-mvp/
├── backend/            # FastAPI backend, ML artifacts, training notebook
├── frontend/           # Next.js app (app/ router), components, lib
├── models/             # persisted model metadata used by backend (feature names etc.)
└── README.md           # this file
```

1) Backend — setup and run (development)

Open a terminal and change to the backend directory:

```bash
cd /Users/utkarsh/Downloads/credit-risk-mvp/backend
# create a venv (skip if you already have .venv)
python3 -m venv .venv
source .venv/bin/activate

# upgrade packaging tools and install runtime deps
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

# If FastAPI raises an ImportError for pydantic.TypeAdapter, install pydantic v2+:
pip install 'pydantic>=2'
```

Start the dev server (uses `src.api.main:app`):

```bash
# make sure the backend package root is importable
export PYTHONPATH=$(pwd)
uvicorn src.api.main:app --reload --host 127.0.0.1 --port 8001
```

Quick verification (in another terminal):

```bash
curl -sS http://127.0.0.1:8001/health
curl -sS http://127.0.0.1:8001/api/applications/ | jq .
```

Notes and troubleshooting (backend)
- If you see "Address already in use" for port 8001, find and kill the process:
	```bash
	lsof -nP -i :8001
	kill <PID>
	```
- If you see `ModuleNotFoundError: No module named 'src'`, set `PYTHONPATH` to the backend folder when running uvicorn (see above).
- The backend stores data in a local SQLite file (dev). The app will create tables on startup.
- Model artifacts (trained model, preprocessor, and SHAP explainer) are expected under `backend/models/` or `models/` depending on how training was run. If missing, run the training notebook.

2) Training the model (optional)

Training is performed in `backend/notebooks/train_model.ipynb`. To re-train:

```bash
cd backend
source .venv/bin/activate
pip install -r requirements-training.txt
# open the notebook in Jupyter and run cells to produce artifacts in models/
jupyter notebook notebooks/train_model.ipynb
```

3) Frontend — setup and run

Open a new terminal and go to the frontend directory:

```bash
cd /Users/utkarsh/Downloads/credit-risk-mvp/frontend

# ensure the frontend knows where the backend is running
export NEXT_PUBLIC_API_URL="http://127.0.0.1:8001"

# install dependencies (only once)
npm install

# run Next dev server on port 3001 (this project uses 3001 in dev)
PORT=3001 npm run dev
```

Open the app in your browser: http://localhost:3001/applications

Browser debugging
- The frontend logs API calls from `frontend/lib/api.ts` to the browser console. These logs help diagnose "Failed to fetch" and invalid `application_id` issues.
- If you see CORS errors, confirm the backend `src.api.main` includes CORSMiddleware and that the origin (http://localhost:3001) is allowed.

4) Useful commands
- Kill a process using port 8001: `lsof -nP -i :8001` then `kill <PID>`
- Start backend in background (example):
	```bash
	cd backend
	source .venv/bin/activate
	nohup python -m uvicorn src.api.main:app --reload --host 127.0.0.1 --port 8001 > uvicorn.log 2>&1 &
	```

5) Development notes
- The backend uses SQLAlchemy + SQLite for dev and persists SHAP explanations in a `shap_explanations` table.
- The frontend uses Next.js App Router and TypeScript. Route params from Next are strings — API helpers coerce/validate IDs.
- There was a pydantic v1 vs v2 compatibility issue during development. The fast fix is installing `pydantic>=2` in your venv; for long-term stability, pin compatible versions in `requirements.txt`.

6) Where to look for code
- Backend entry: `backend/src/api/main.py`
- Backend routes: `backend/src/api/routes/*.py`
- Backend services: `backend/src/services/*.py`
- Frontend entry: `frontend/app/page.tsx` and `frontend/app/applications/page.tsx`
- Frontend API wrapper: `frontend/lib/api.ts`

If you'd like, I can: start the backend and frontend (and verify /health and the Applications page) from here, or update the README further with a quick troubleshooting checklist tailored to errors you've seen. Which would you prefer?

