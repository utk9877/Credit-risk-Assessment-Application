import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db")

# echo=True can be enabled for verbose SQL in dev
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    # #region agent log
    import json
    try:
        with open('/Users/utkarsh/Downloads/credit-risk-mvp/.cursor/debug.log', 'a') as f:
            f.write(json.dumps({"location":"session.py:17","message":"get_db entry","data":{"database_url":DATABASE_URL[:20]+"..." if len(DATABASE_URL) > 20 else DATABASE_URL},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"D"}) + '\n')
    except Exception as e:
        try:
            with open('/Users/utkarsh/Downloads/credit-risk-mvp/.cursor/debug.log', 'a') as f:
                f.write(json.dumps({"location":"session.py:17","message":"get_db log error","data":{"error":str(e)},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"D"}) + '\n')
        except: pass
    # #endregion
    db = SessionLocal()
    try:
        # #region agent log
        try:
            with open('/Users/utkarsh/Downloads/credit-risk-mvp/.cursor/debug.log', 'a') as f:
                f.write(json.dumps({"location":"session.py:22","message":"DB session created","data":{},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"D"}) + '\n')
        except: pass
        # #endregion
        yield db
    finally:
        db.close()
        # #region agent log
        try:
            with open('/Users/utkarsh/Downloads/credit-risk-mvp/.cursor/debug.log', 'a') as f:
                f.write(json.dumps({"location":"session.py:25","message":"DB session closed","data":{},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"D"}) + '\n')
        except: pass
        # #endregion
