from sqlalchemy import Column, Integer, String, DateTime, func, Enum as SQLAEnum, Identity
from sqlalchemy.orm import relationship
from sqlalchemy.sql.schema import ForeignKey
from config.db import Base, engine
from enum import Enum

class EventType(str, Enum):
    CREATION = "creación"
    STATE_CHANGE = "cambio de estado"
    CLOSE_REQUEST = "solicitud de cierre"
    CLOSURE = "cierre"
    ASIGNATION = "asignacion"
    

class Registro(Base):
    __tablename__ = 'records'
    
    id = Column(Integer, Identity(start=1, increment=1), primary_key=True)  
    description = Column(String(1000), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Nuevo campo para el tipo de evento
    event_type = Column(SQLAEnum(EventType), nullable=False)
    
    # Relación con el Ticket
    ticket_id = Column(Integer, ForeignKey('ticket.id'), nullable=False)
    ticket = relationship("Ticket", back_populates="records")  # Asegúrate de que Ticket tenga la relación inversa