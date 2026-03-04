# Credit Risk Assessment Application

An AI-powered credit risk assessment platform that helps financial institutions evaluate loan applications using machine learning, with full explainability and decision-tracking capabilities.

---

## What Does This App Do?

This application allows a loan officer (or analyst) to:

1. **Submit a loan application** with applicant details (name, income, credit score, loan amount, etc.)
2. **Get an AI-generated risk score** — the system runs an XGBoost ML model that predicts the probability of default
3. **Understand why** — SHAP (Explainable AI) breaks down which factors contributed most to the score (e.g., "high debt-to-income ratio increased risk by 12%")
4. **Run what-if scenarios** — simulate how changing a factor (e.g., increasing credit score by 50 points) would affect the risk score
5. **Approve, decline, or send for review** — take action on applications, with all decisions persisted to the database
6. **Track everything on a dashboard** — see total applications, approval rates, risk distribution, and the status of every application

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript | UI, routing, server-side rendering |
| **UI Components** | Radix UI, Tailwind CSS, Framer Motion, Lucide Icons | Design system, animations, iconography |
| **Backend** | FastAPI (Python) | REST API, request validation, routing |
| **Database** | SQLAlchemy + SQLite | Persistence (applications, risk assessments, SHAP explanations) |
| **ML Model** | XGBoost, scikit-learn | Credit risk prediction |
| **Explainability** | SHAP | Feature contribution analysis |
| **Notifications** | Sonner (toast) | In-app feedback for user actions |

---

## Project Structure

```
credit-risk-mvp/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── main.py              # FastAPI app, CORS, routes, lifespan
│   │   │   └── routes/
│   │   │       ├── applications.py   # CRUD + status update endpoints
│   │   │       ├── risk_assessment.py # Risk calculation, simulation, SHAP
│   │   │       └── simulation.py     # Simulation endpoint
│   │   ├── db/
│   │   │   ├── models.py            # SQLAlchemy models (Application, RiskAssessment, etc.)
│   │   │   ├── session.py           # Database session management
│   │   │   └── base.py              # Base model class
│   │   ├── models/
│   │   │   ├── credit_risk_model.py  # XGBoost training & inference
│   │   │   ├── feature_engineering.py # Feature derivation & preprocessing
│   │   │   └── shap_explainer.py     # SHAP explainability
│   │   ├── schemas/
│   │   │   └── risk_schemas.py       # Pydantic v2 request/response schemas
│   │   └── services/
│   │       ├── application_service.py # Application CRUD logic
│   │       └── risk_service.py       # Risk assessment + SHAP caching
│   ├── models/                       # Trained model artifacts
│   │   ├── xgboost_model.pkl
│   │   ├── preprocessor.pkl
│   │   └── feature_names.json
│   ├── requirements.txt
│   └── .env                          # Database URL config
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                  # Root redirect → /dashboard
│   │   ├── layout.tsx                # Root layout, fonts, Toaster
│   │   ├── dashboard/page.tsx        # Dashboard with stats, charts, table
│   │   ├── applications/
│   │   │   ├── page.tsx              # Application list
│   │   │   └── [id]/page.tsx         # Application detail + actions
│   │   ├── apply/page.tsx            # Multi-step new application form
│   │   ├── settings/page.tsx         # Configuration page
│   │   └── login/page.tsx            # Mock login page
│   ├── components/                   # Reusable UI components
│   ├── lib/
│   │   ├── api.ts                    # Backend API client
│   │   ├── types.ts                  # TypeScript interfaces
│   │   ├── mock-data.ts              # Demo/fallback data
│   │   └── utils.ts                  # Utility functions
│   ├── .env.local                    # NEXT_PUBLIC_API_URL
│   └── next.config.mjs
│
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+ (3.11 or 3.14 recommended)

### 1. Set Up the Backend

```bash
cd backend

# Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Start the backend server
export PYTHONPATH=$(pwd)
uvicorn src.api.main:app --host 127.0.0.1 --port 8001
```

Verify it's running:
```bash
curl http://127.0.0.1:8001/health
# → {"status":"OK"}
```

### 2. Set Up the Frontend

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start the dev server
PORT=3001 npm run dev
```

Open your browser: **http://localhost:3001**

---

## API Endpoints

### Applications

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/applications/` | List all applications |
| `POST` | `/api/applications/` | Create a new application |
| `GET` | `/api/applications/{id}` | Get a single application |
| `PATCH` | `/api/applications/{id}/status` | Update status (approve/decline/review) |

### Risk Assessments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/risk-assessments/calculate` | Run ML model on an application |
| `POST` | `/api/risk-assessments/simulate` | Run a what-if scenario (not persisted) |
| `GET` | `/api/risk-assessments/application/{id}` | Get risk assessments for an application |
| `GET` | `/api/risk-assessments/application/{id}/explainability` | Get SHAP feature contributions |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/` | API info and available endpoints |
| `GET` | `/docs` | Auto-generated Swagger UI |

---

## Key Features Explained

### Risk Scoring

When a risk assessment is triggered, the backend:
1. Loads the application data from the database
2. Runs it through the feature engineering pipeline (`feature_engineering.py`)
3. Feeds the processed features into the trained XGBoost model
4. Returns a **probability of default** (0.0 to 1.0)
5. The frontend converts this into a **risk score** (0–1000, where higher = safer)

### Explainability (SHAP)

After scoring, the system generates SHAP values that show how each feature pushed the prediction up or down. For example:
- "Credit Score: 712" → reduced risk by 15%
- "Debt-to-Income: 28%" → increased risk by 12%

These are displayed as a bar chart on the application detail page.

### Scenario Simulation

The "Scenario Sandbox" lets you adjust inputs (credit score, income, DTI ratio, etc.) and see how the risk score would change — without saving anything to the database.

### Application Status Tracking

Every application has a `status` field that tracks the analyst's decision:
- **Pending** — no action taken yet
- **Review** — flagged for further review
- **Approved** — application approved
- **Declined** — application declined

Status changes are persisted to the database and reflected across the dashboard, application list, and detail pages immediately.

---

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL=sqlite:///./dev.db
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8001
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Address already in use` (port 8001 or 3001) | Run `lsof -ti :8001 \| xargs kill -9` to free the port |
| `ModuleNotFoundError: No module named 'src'` | Set `PYTHONPATH` to the backend folder: `export PYTHONPATH=$(pwd)` |
| CORS errors in browser console | Confirm the backend `main.py` includes `http://localhost:3001` in allowed origins |
| Frontend shows empty data | Make sure the backend is running on port 8001 before starting the frontend |
| `pydantic` import errors | Ensure pydantic v2+ is installed: `pip install 'pydantic>=2'` |

---

## License

This project is for educational and demonstration purposes.
