from sqlalchemy import Column, Integer, String, DateTime, func, Enum, Identity
from sqlalchemy.orm import relationship
from sqlalchemy.sql.schema import ForeignKey
from config.db import Base, engine
from datetime import datetime

class Ticket(Base):
    """
    Modelo que representa un ticket en el sistema.

    Atributos:
        id (int): Identificador único del ticket. Es la clave primaria e 
            incrementa automáticamente.
        description (str): Descripción detallada del ticket. No puede ser nula.
        state (str): Estado del ticket. Puede ser 'pendiente', 'asignado',
            'en progreso', o 'finalizado'. Por defecto es 'pendiente'.
        created_at (datetime): Fecha y hora de creación del ticket. Se establece
            automáticamente al momento de la creación.
        priority (Enum): Prioridad del ticket. Puede ser 'alta', 'media', o 'baja'.
        deadline (datetime): Fecha límite para completar el ticket. Puede ser nula.
        machine_id (int): Identificador de la máquina asociada al ticket. No puede 
            ser nulo.
        machine (relationship): Relación con el modelo Machine, a través de la clave 
            foránea `machine_id`.
        created_by (str): Identificador del usuario que creó el ticket. No puede ser 
            nulo.
        creator (relationship): Relación con el modelo User, que representa al creador
            del ticket.
        assigned_to (str): Identificador del trabajador asignado al ticket. Puede 
            ser nulo.
        assignee (relationship): Relación con el modelo User, que representa al 
            trabajador asignado al ticket.
        solicitud (relationship): Relación bidireccional con el modelo Solicitud. Cada 
            ticket puede tener una única solicitud asociada.
    """

    __tablename__ = 'ticket'

    id = Column(Integer, Identity(start=1, increment=1), primary_key=True)  
    description = Column(String(2000), nullable=False)
    state = Column(String(50), default='pendiente', nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(),
                        nullable=False)
    priority = Column(Enum('alta', 'media', 'baja', name='ticket_priority'),
                      nullable=False)
    deadline = Column(DateTime, nullable=True)

    # Relación con la tabla Machine
    machine_id = Column(String(3), ForeignKey('machine.id'), nullable=False)
    machine = relationship("Machine", back_populates="tickets")

    # Relación con el creador del ticket
    created_by = Column(String(11), ForeignKey('user.id'), nullable=False)
    creator = relationship("User", foreign_keys=[created_by],
                           back_populates="created_tickets")

    # Relación con el trabajador asignado al ticket
    assigned_to = Column(String(11), ForeignKey('user.id'), nullable=True)
    assignee = relationship("User", foreign_keys=[assigned_to],
                            back_populates="assigned_tickets")

    # Relación bidireccional con Solicitud
    solicitudes = relationship("Solicitud", back_populates="ticket", cascade="all, delete-orphan")
    
    # Relación inversa con Registro
    records = relationship("Registro", back_populates="ticket")  
    
    def to_dict(self):
        
        solicitud_cierre = None
        fecha_cierre = None
        repairDetails = None
        
        for solicitud in self.solicitudes:
            if solicitud.type == 'cierre':
                solicitud_cierre = f"Solicitud de cierre con id: {solicitud.id}"
                if solicitud.status == 'respondido':
                    fecha_cierre = solicitud.created_at.strftime('%Y-%m-%d %H:%M:%S')
                    if solicitud.response == 'aceptado':
                        repairDetails = solicitud.description
                else:
                    fecha_cierre = 'Pendiente a respuesta'
        
        return {
            "id": self.id,
            "description": self.description,
            "state": self.state,
            "created_at": self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            "priority": self.priority,
            "deadline": self.deadline.isoformat() if self.deadline else "No aplica",
            "machine_id": self.machine_id,
            "created_by": f"{self.creator.first_name} {self.creator.last_name}",
            "assigned_to": f"{self.assignee.first_name} {self.assignee.last_name}" if self.assignee else "No asignado aun",
            "closureRequest": solicitud_cierre if solicitud_cierre else "No hay solicitud de cierre",
            "closureDate": fecha_cierre if solicitud_cierre else "No aplica",
            "repairDetails": repairDetails if repairDetails else "Aun no se ha aceptado la solicitud de cierre o no ha sido solucionado" 
        }