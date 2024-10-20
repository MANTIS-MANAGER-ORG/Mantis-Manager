from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import cloudinary

from middlewares.auth_midddleware import AuthMiddleware
from middlewares.logger_middleware import LogRequestsMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from routers.user_auth_router import user_auth_router
from routers.tokens_router import tokens_router
from routers.user_image_router import user_image_router
from routers.ticket_router import ticket_router
from routers.machine_router import machine_router
from routers.solicitud_router import solicitud_router
from routers.web_sockets_router import ws_router
from routers.jd_router import jd_router
from models.create_tables import create_tables
from config.db import init_roles  
from config.config import get_cloudinary_info
from config.db import get_db, init_roles
from services.ticket_service import actualizar_prioridad_y_deadline
from passlib.context import CryptContext


# Crear las tablas en la base de datos
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Suponiendo que data.password es tu contraseña
password = "Colo12"

# Generar el hash de la contraseña
hashed_password = pwd_context.hash(password)
print(hashed_password)

create_tables()
init_roles()

# Crear la instancia principal de FastAPI
app = FastAPI(
    title="MANTIS MANAGER API",
    version="0.7.0",
)

cloudinary_info = get_cloudinary_info()

cloudinary.config(
    cloud_name=cloudinary_info["cloud_name"],
    api_key=cloudinary_info["api_key"],
    api_secret=cloudinary_info["api_secret"]
)  

# Agregar el middleware de autenticación
app.add_middleware(AuthMiddleware)
app.add_middleware(LogRequestsMiddleware)

# Agregar los routers
app.include_router(user_auth_router)
app.include_router(tokens_router)
app.include_router(user_image_router)
app.include_router(jd_router)
app.include_router(ticket_router)
app.include_router(machine_router)
app.include_router(solicitud_router)
app.include_router(ws_router)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

"""
scheduler = BackgroundScheduler()

def ejecutar_actualizacion():
    try:
        db = next(get_db())
        actualizar_prioridad_y_deadline(db)
    except Exception as e:
        print(f"Error en ejecutar_actualizacion: {e}")

scheduler.add_job(ejecutar_actualizacion, 'interval', seconds=20)

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()

# Inicializar roles
@app.on_event("startup")
def startup_event():
    init_roles()
    
scheduler.start()"""