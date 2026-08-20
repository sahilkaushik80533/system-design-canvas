from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import engine, Base, SessionLocal
from models.architecture import ArchitecturePayload
from models.db_models import ArchitectureRecord
from services.system_evaluator import evaluate_system_architecture
from services.nn_evaluator import evaluate_nn_architecture
from services.code_generator import generate_boilerplate

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "online", "message": "System Design Architecture API is running"}

@app.get("/api/keep-alive")
async def keep_alive(db: Session = Depends(get_db)):
    """Lightweight health-check that pings Supabase to reset the free-tier inactivity timer."""
    try:
        db.execute(text("SELECT 1"))
        return {"status": "awake", "database": "connected"}
    except Exception as e:
        print(f"[WARN] Keep-alive DB ping failed: {e}")
        return {"status": "awake", "database": "unreachable", "error": str(e)}

from services.ai_evaluator import evaluate_architecture_with_ai

@app.post("/api/evaluate")
async def evaluate_architecture(payload: ArchitecturePayload, db: Session = Depends(get_db)):
    # Call the LLM to evaluate the architecture
    ai_result = await evaluate_architecture_with_ai(payload)
    
    # Persist the evaluation result to the database
    record_id = None
    try:
        record = ArchitectureRecord(
            nodes=[n.model_dump() for n in payload.nodes],
            edges=[e.model_dump() for e in payload.edges],
            score=ai_result.score
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        record_id = str(record.id)
    except Exception as e:
        db.rollback()
        print(f"[WARN] Failed to persist evaluation record: {e}")

    # Return the exact JSON schema expected by the frontend AIEvaluationPanel
    return ai_result.model_dump()

@app.get("/api/history")
async def get_history(db: Session = Depends(get_db)):
    records = db.query(ArchitectureRecord).order_by(ArchitectureRecord.id.desc()).all()
    return records

@app.post("/api/save-architecture")
async def save_architecture(payload: ArchitecturePayload, db: Session = Depends(get_db)):
    print(f"Received auto-save: {len(payload.nodes)} nodes, {len(payload.edges)} edges")
    try:
        record = ArchitectureRecord(
            nodes=[n.model_dump() for n in payload.nodes],
            edges=[e.model_dump() for e in payload.edges],
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return {
            "status": "success",
            "message": "Architecture saved successfully",
            "id": str(record.id),
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-code")
async def generate_code(payload: ArchitecturePayload):
    code = generate_boilerplate(payload.nodes, payload.edges)
    return {"code": code}
