from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from ..db.session import engine
from ..db import base as base_module

from .routes.applications import router as applications_router
from .routes.risk_assessment import router as risk_router
from .routes.simulation import router as simulation_router


def configure_logging() -> None:
    # Basic structured logging using loguru
    logger.remove()
    logger.add(lambda msg: msg, serialize=True)


app = FastAPI(title="Credit Risk - Backend (FastAPI)")

# Allow the frontend dev server to call the API (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    configure_logging()
    logger.info("Starting application and ensuring DB tables exist")
    # Create tables for dev - production should use Alembic migrations
    base_module.Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return JSONResponse({
        "message": "Credit Risk API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "applications": "/api/applications",
            "risk_assessments": "/api/risk-assessments",
            "simulation": "/api/simulation"
        }
    })


@app.get("/health")
def health():
    return JSONResponse({"status": "OK"})


app.include_router(applications_router, prefix="/api/applications", tags=["applications"])
# risk endpoints including calculate and simulate
app.include_router(risk_router, prefix="/api/risk-assessments", tags=["risk_assessments"])
# keep old simulation router (not used) but mounted for compatibility
app.include_router(simulation_router, prefix="/api/simulation", tags=["simulation"])
