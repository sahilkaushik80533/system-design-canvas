import uuid
from sqlalchemy import Column, Integer, JSON, DateTime, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB
from database import Base


class ArchitectureRecord(Base):
    __tablename__ = "architectures"
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nodes = Column(JSONB, nullable=False)
    edges = Column(JSONB, nullable=False)
    score = Column(Integer, nullable=True)  # Only populated by /api/evaluate
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
