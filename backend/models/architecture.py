from pydantic import BaseModel, Field, ConfigDict
from typing import Dict, Any, List

class Node(BaseModel):
    model_config = ConfigDict(extra='allow')
    id: str
    type: str
    position: Dict[str, float]
    data: Dict[str, Any] = Field(default_factory=dict)

class Edge(BaseModel):
    model_config = ConfigDict(extra='allow')
    id: str
    source: str
    target: str

class ArchitecturePayload(BaseModel):
    nodes: List[Node]
    edges: List[Edge]
