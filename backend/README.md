Credit Risk Backend (FastAPI) - scaffold

This folder contains a scaffolded backend for the credit risk MVP using FastAPI, SQLAlchemy and Pydantic.

Key features
- FastAPI app entrypoint: `src/api/main.py`
- Routes: `src/api/routes/*` (applications, risk_assessment, simulation)
- DB models: `src/db/models.py` (Application, RiskAssessment)
- Pydantic schemas: `src/schemas/risk_schemas.py`
- Services: `src/services/*` to keep business logic separate from HTTP layer
- SQLite for development (Postgres-ready SQLAlchemy design)
- Alembic-ready (models and Base metadata are available in `src/db`)
- Structured logging with `loguru`

Quickstart (development)
1. Create and activate a virtualenv (optional but recommended):

   python -m venv .venv
   source .venv/bin/activate

2. Install dependencies:

   pip install -r requirements.txt

3. Copy `.env.example` to `.env` and edit if needed.

4. Run the app with uvicorn from the `backend` folder:

   uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000

5. Health endpoint:

   GET http://localhost:8000/health  -> {"status": "OK"}

Notes and next steps
- Alembic is configured as a dependency; initialize migrations with `alembic init` and configure `alembic.ini` to point to `src.db.base.Base.metadata`.
- ML scoring and SHAP/explainability are intentionally NOT implemented here. The simulation endpoint and services include a clear NotImplementedError to indicate where ML will be integrated.
# Backend

This directory contains the backend code for the Credit Risk MVP application.

## Getting Started

Backend code will be organized here. Choose your preferred technology stack:

### Common Options:
- **Node.js/Express** - JavaScript/TypeScript REST API
- **Python/FastAPI** - Python REST API
- **Python/Django** - Full-featured Python web framework
- **Go/Gin** - High-performance Go REST API
- **Java/Spring Boot** - Enterprise Java framework

## Recommended Structure

```
backend/
├── src/              # Source code
│   ├── routes/      # API routes
│   ├── models/      # Data models
│   ├── services/    # Business logic
│   ├── middleware/  # Middleware functions
│   └── utils/       # Utility functions
├── tests/           # Test files
├── config/          # Configuration files
├── .env.example     # Environment variables template
├── package.json     # Dependencies (if Node.js)
└── README.md        # This file
```

## API Endpoints (Planned)

The backend should provide APIs for:

- **Applications**
  - `GET /api/applications` - List all applications
  - `GET /api/applications/:id` - Get application details
  - `POST /api/applications` - Create new application
  - `PUT /api/applications/:id` - Update application
  - `DELETE /api/applications/:id` - Delete application

- **Risk Assessment**
  - `POST /api/risk-assessments/calculate` - Calculate risk score
  - `GET /api/risk-assessments/:id` - Get risk assessment details
  - `POST /api/risk-assessments/simulate` - Simulate scenario

- **Applicants**
  - `GET /api/applicants` - List applicants
  - `GET /api/applicants/:id` - Get applicant details
  - `POST /api/applicants` - Create applicant

## Database

Consider using:
- **PostgreSQL** - Relational database
- **MongoDB** - NoSQL database
- **SQLite** - Lightweight database for development

