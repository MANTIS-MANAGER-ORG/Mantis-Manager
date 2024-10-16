from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from config.db import Base

class Notification(Base):
    """
    Modelo que representa una notificación en el sistema.

    Atributos:
        id (int): Identificador único de la notificación. Es la clave primaria e
            indexada.
        user_id (int): Identificador del usuario asociado a la notificación. No 
            puede ser nulo.
        message (str): Contenido del mensaje de la notificación. No puede ser nulo.
        sent_by_app (bool): Indica si la notificación ha sido enviada a través de 
            la app. Por defecto es False.
        sent_by_email (bool): Indica si la notificación ha sido enviada por correo 
            electrónico. Por defecto es False.
        created_at (datetime): Fecha y hora de creación de la notificación. Por 
            defecto es la fecha y hora actual.
    """

    __tablename__ = 'notifications'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(11), nullable=False)
    message = Column(String(2000), nullable=False)
    sent_by_app = Column(Boolean, default=False)
    sent_by_email = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)