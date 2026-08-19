import os
import json
from pydantic import BaseModel
from openai import AsyncOpenAI
from models.architecture import ArchitecturePayload

class EvaluationResult(BaseModel):
    score: int
    strengths: list[str]
    bottlenecks: list[str]
    suggestions: list[str]

# Initialize AsyncOpenAI client. It will automatically use the OPENAI_API_KEY env var.
client = AsyncOpenAI()

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

async def evaluate_architecture_with_ai(payload: ArchitecturePayload) -> EvaluationResult:
    # Ensure OPENAI_API_KEY is set
    if not os.getenv("OPENAI_API_KEY"):
        # Fallback dummy response if key is missing during testing
        return EvaluationResult(
            score=0,
            strengths=[],
            bottlenecks=["OPENAI_API_KEY environment variable is not set."],
            suggestions=["Set the OPENAI_API_KEY environment variable to enable AI evaluation."]
        )

    # Prepare the payload for the LLM
    architecture_data = {
        "nodes": [n.model_dump() for n in payload.nodes],
        "edges": [e.model_dump() for e in payload.edges]
    }
    
    try:
        completion = await client.beta.chat.completions.parse(
            model="gpt-4o-2024-08-06", # Structured outputs model
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Please evaluate this architecture:\n\n{json.dumps(architecture_data, indent=2)}"}
            ],
            response_format=EvaluationResult,
        )
        
        result = completion.choices[0].message.parsed
        return result
    except Exception as e:
        # Graceful degradation
        print(f"OpenAI API Error: {e}")
        return EvaluationResult(
            score=0,
            strengths=[],
            bottlenecks=[f"AI Evaluation failed due to an API error: {str(e)}"],
            suggestions=["Check backend logs for details."]
        )
