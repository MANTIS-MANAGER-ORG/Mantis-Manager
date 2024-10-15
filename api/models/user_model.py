from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql.schema import ForeignKey
from config.db import Base, engine
from passlib.context import CryptContext
from models.ticket_model import Ticket

# Configuración del contexto de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class User(Base):
    """
    Modelo que representa un usuario en el sistema.

    Atributos:
        id (str): Identificador único del usuario. Es la clave primaria.
        password (str): Contraseña encriptada del usuario. No puede ser nula.
        first_name (str): Nombre del usuario. No puede ser nulo.
        last_name (str): Apellido del usuario. No puede ser nulo.
        email (str): Correo electrónico del usuario. No puede ser nulo.
        phone (str): Número de teléfono del usuario. No puede ser nulo.
        image_field (str): Campo opcional para almacenar una imagen de perfil.
        role_id (int): Identificador del rol del usuario.
        role (relationship): Relación con el modelo Role, definida a través de
            la clave foránea `role_id`.
        created_tickets (relationship): Relación con los tickets creados por el
            usuario, definida a través del campo `created_by` en la tabla Ticket.
        assigned_tickets (relationship): Relación con los tickets asignados al
            usuario, definida a través del campo `assigned_to` en la tabla Ticket.
    """

    __tablename__ = 'user'

    id = Column(String(11), primary_key=True)
    password = Column(String(350), nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(200), nullable=False)
    phone = Column(String(14), nullable=False)
    image_field = Column(String(200), nullable=True, default=None)
    role_id = Column(Integer, ForeignKey('role.id'))
    role = relationship("Role", back_populates="user")

    created_tickets = relationship("Ticket", foreign_keys=[Ticket.created_by],
                                   back_populates="creator")
    assigned_tickets = relationship("Ticket", foreign_keys=[Ticket.assigned_to],
                                    back_populates="assignee")

    def verify_password(self, password):
        """
        Verifica si la contraseña proporcionada coincide con la almacenada.

        Args:
            password (str): Contraseña a verificar.

        Returns:
            bool: True si la contraseña es correcta, False en caso contrario.
        """
        return pwd_context.verify(password, self.password)


class Role(Base):
    """
    Modelo que representa un rol en el sistema.

    Atributos:
        id (int): Identificador único del rol. Es la clave primaria.
        name (str): Nombre del rol. No puede ser nulo.
        user (relationship): Relación con el modelo User, definida a través de
            la clave foránea en la tabla User.
    """

    __tablename__ = 'role'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    user = relationship("User", back_populates="role")