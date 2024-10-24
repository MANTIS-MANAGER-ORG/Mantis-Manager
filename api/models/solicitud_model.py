from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from config.db import Base

class Solicitud(Base):
    """
    Modelo que representa una solicitud en el sistema.

    Atributos:
        id (int): Identificador único de la solicitud. Es la clave primaria e
            incrementa automáticamente.
        created_at (datetime): Fecha y hora de creación de la solicitud. Se 
            establece automáticamente al momento de la creación.
        description (str): Descripción detallada de la solicitud. No puede ser nula.
        ticket_id (int): Identificador del ticket relacionado con la solicitud. No 
            puede ser nulo.
        ticket (relationship): Relación con el modelo Ticket, definida a través
            de la clave foránea `ticket_id`.
        status (str): Estado de la solicitud, por defecto es 'pendiente'.
        type (str): Tipo de solicitud, puede ser de apertura o cierre. No puede 
            ser nulo.
    """

    __tablename__ = 'solicitud'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(),
                        nullable=False)
    description = Column(String(2000), nullable=False)

    # Relación con la tabla Ticket
    ticket_id = Column(Integer, ForeignKey('ticket.id'), nullable=False)
    ticket = relationship("Ticket", back_populates="solicitudes")

    status = Column(String(100), default='pendiente', nullable=False)
    type = Column(String(100), nullable=False)
    
    def to_dict(self):
        return {
            "id": self.id,
            "created_at": self.created_at,
            "description": self.description,
            "ticket_id": self.ticket_id,
            "status": self.status,
            "type": self.type
        }