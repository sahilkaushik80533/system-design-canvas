from sqlalchemy import Column, Integer, JSON, DateTime, func
from database import Base


class ArchitectureRecord(Base):
    __tablename__ = "architectures"
    id = Column(Integer, primary_key=True, index=True)
    payload = Column(JSON, nullable=False)
    score = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
