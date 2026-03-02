from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...db.session import get_db
from ...schemas.risk_schemas import SimulationRequest, SimulationResponse
from ...services.risk_service import simulate_scenario

router = APIRouter()


@router.post("/run", response_model=SimulationResponse)
def run_simulation(payload: SimulationRequest, db: Session = Depends(get_db)):
    # Simulation/ML logic is intentionally not implemented in this scaffold.
    # We provide a clear 501 to indicate the implementation is pending.
    try:
        result = simulate_scenario(db, payload)
    except NotImplementedError as e:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=str(e))
    return result
