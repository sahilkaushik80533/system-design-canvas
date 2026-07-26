from sqlalchemy import Column, Integer, JSON
from database import Base

class ArchitectureRecord(Base):
    __tablename__ = "architectures"
    id = Column(Integer, primary_key=True, index=True)
    payload = Column(JSON, nullable=False)
    score = Column(Integer, nullable=False)
