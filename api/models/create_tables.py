from config.db import engine, Base
from models import Machine, Ticket, User, Role, Notification, Registro  # Importa todos los modelos

# Crea las tablas
def create_tables():
    Base.metadata.create_all(bind=engine)