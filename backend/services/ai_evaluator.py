import os
import json
from pydantic import BaseModel
from openai import AsyncOpenAI
from models.architecture import ArchitecturePayload

# ─── Try loading .env as a fallback (e.g., local dev) ────────────────────────
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # python-dotenv not installed; rely on system env vars (Render, Docker, etc.)

# ─── Pydantic Output Schema ─────────────────────────────────────────────────

class EvaluationResult(BaseModel):
    score: int
    strengths: list[str]
    bottlenecks: list[str]
    suggestions: list[str]

# ─── Lazy Client Initialization ──────────────────────────────────────────────
# The client is NOT instantiated at module import time.
# This prevents Uvicorn from crashing on boot if the key isn't set yet.

_client: AsyncOpenAI | None = None

def _get_client() -> AsyncOpenAI:
    """Lazily create the AsyncOpenAI client on first API call, not at import."""
    global _client
    if _client is None:
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError(
                "OPENAI_API_KEY is not set. "
                "Set it as an environment variable on Render or in a local .env file."
            )
        _client = AsyncOpenAI(api_key=api_key)
    return _client

# ─── System Prompt ───────────────────────────────────────────────────────────

SYSTEM_PROMPT = """
You are a Principal Cloud Architect and Machine Learning Systems Expert. 
Your task is to analyze the provided architecture diagram (supplied as JSON nodes and edges) 
and evaluate it based on standard best practices for scalability, security, resilience, 
and performance.

Instructions:
1. Understand the architecture flow by examining the nodes and how they connect via edges.
2. Identify the strong points of this design (e.g., caching, load balancing, replication).
3. Identify single points of failure, missing components, or potential bottlenecks.
4. Provide actionable suggestions to improve the architecture.
5. Grade the architecture with a score between 0 and 100.

Return the response strictly matching the required JSON schema.
"""

# ─── Evaluation Function ────────────────────────────────────────────────────

async def evaluate_architecture_with_ai(payload: ArchitecturePayload) -> EvaluationResult:
    # Prepare the payload for the LLM
    architecture_data = {
        "nodes": [n.model_dump() for n in payload.nodes],
        "edges": [e.model_dump() for e in payload.edges]
    }

    try:
        client = _get_client()
    except RuntimeError as e:
        # Key is missing — return a structured error instead of crashing the server
        return EvaluationResult(
            score=0,
            strengths=[],
            bottlenecks=[str(e)],
            suggestions=["Set the OPENAI_API_KEY environment variable to enable AI evaluation."]
        )

    try:
        completion = await client.beta.chat.completions.parse(
            model="gpt-4o-2024-08-06",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Please evaluate this architecture:\n\n{json.dumps(architecture_data, indent=2)}"}
            ],
            response_format=EvaluationResult,
        )

        result = completion.choices[0].message.parsed
        return result
    except Exception as e:
        # Graceful degradation — never crash, always return valid JSON
        print(f"[ERROR] OpenAI API call failed: {e}")
        return EvaluationResult(
            score=0,
            strengths=[],
            bottlenecks=[f"AI Evaluation failed: {str(e)}"],
            suggestions=["Check backend logs and verify your OPENAI_API_KEY is valid."]
        )
