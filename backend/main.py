from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
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

@app.post("/api/evaluate")
async def evaluate_architecture(payload: ArchitecturePayload, db: Session = Depends(get_db)):
    # Split nodes based on React Flow custom node types defined in the frontend
    system_nodes = [n for n in payload.nodes if n.type == "systemComponent"]
    nn_nodes = [n for n in payload.nodes if n.type == "neuralLayer"]

    # Evaluate subsystems independently
    sys_eval = evaluate_system_architecture(system_nodes, payload.edges)
    nn_eval = evaluate_nn_architecture(nn_nodes, payload.edges)

    # Calculate an overall composite score
    overall_score = 100
    if system_nodes:
        sys_scores = sys_eval.get("scores", {})
        sys_avg = sum(sys_scores.values()) / max(1, len(sys_scores))
        overall_score = sys_avg
        
    if nn_nodes and not nn_eval.get("valid"):
        overall_score *= 0.5  # 50% penalty if the NN architecture violates hard constraints

    # Save to db
    record = ArchitectureRecord(
        payload=payload.model_dump(),
        score=int(overall_score)
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "status": "success",
        "message": "Evaluation complete",
        "overall_score": round(overall_score, 2),
        "system_evaluation": sys_eval,
        "nn_evaluation": nn_eval,
        "node_count": len(payload.nodes),
        "edge_count": len(payload.edges),
        "record_id": record.id
    }

@app.get("/api/history")
async def get_history(db: Session = Depends(get_db)):
    records = db.query(ArchitectureRecord).all()
    return records

@app.post("/api/generate-code")
async def generate_code(payload: ArchitecturePayload):
    code = generate_boilerplate(payload.nodes, payload.edges)
    return {"code": code}
