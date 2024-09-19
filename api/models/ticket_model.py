from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql.schema import ForeignKey
from config.db import Base, engine

# Tabla Ticket
class Ticket(Base):
    __tablename__ = 'ticket'
    id = Column(Integer, primary_key=True, autoincrement=True)
    description = Column(String, nullable=False)
    state = Column(String, nullable=False)  # Estado del ticket (pendiente, en progreso, finalizado)
    
    # Relación con la tabla Machine
    machine_id = Column(String, ForeignKey('machine.id'), nullable=False)
    machine = relationship("Machine", back_populates="tickets")

    # Relación con el creador del ticket
    created_by = Column(String, ForeignKey('user.id'), nullable=False)  # Usuario que creó el ticket
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_tickets")
    
    # Relación con el trabajador asignado al ticket
    assigned_to = Column(String, ForeignKey('user.id'), nullable=True)  # Trabajador asignado al ticket
    assignee = relationship("User", foreign_keys=[assigned_to], back_populates="assigned_tickets")