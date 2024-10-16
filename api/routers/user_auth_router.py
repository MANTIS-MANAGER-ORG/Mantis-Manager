from datetime import datetime

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from passlib.context import CryptContext
from sqlalchemy.orm import Session

from config.db import get_db
from models.user_model import User
from schemas.user_schema import LoginData, LoginResponse
from services.jwt_services import create_acess_token, create_refresh_token

# Crear un objeto de contexto de cifrado con bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
#Crear un router
user_auth_router = APIRouter(tags=["Autenticación de usuario"])

# Ruta para iniciar sesión
@user_auth_router.post(
    "/login", 
    summary="Iniciar sesión en el sistema",
    description=(
        "Este endpoint permite a un usuario sin autenticar subir iniciar sesion en el sistema. "
        "Esto se logra verificando las credenciales del usuario y generando tokens de acceso y refresco."
    ),
    response_model=LoginResponse,
    response_description="Un JSON con los datos del usuario y los tokens de acceso y refresco."
)
async def login(
    data: LoginData, 
    db: Session = Depends(get_db)
):
    """
    Iniciar sesión en el sistema y generar tokens de acceso y refresco.
    
    Este endpoint permite a un usuario sin autenticar subir iniciar sesion en el sistema.
    Esto se logra verificando las credenciales del usuario y generando tokens de acceso y refresco.

    Args:
        Datos de inicio de sesión (ID y contraseña).

    Returns:
        Mensaje de éxito, los datos del usuario y los tokens de acceso y refresco.
    """
    user = db.query(User).filter(User.id == data.id).first()

    # Verificar si el usuario existe y si la contraseña es correcta
    if not user or not user.verify_password(data.password):
        return JSONResponse(status_code=400, content={
            "error": "Credenciales incorrectas"
        })

    # Datos del usuario autenticado
    user_data = {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "phone": user.phone,
        "role_id": user.role_id
    }

    from services.web_socket_service import manager
    
    await manager.send_personal_message(
        f"Se ha iniciado sesion en el sistema, bienvenido {user.first_name} ({datetime.now()})",
        user.id
    )

    # Crear tokens de acceso y refresco
    token_info = {"sub": user.id, "scopes": user.role_id}
    access_token = create_acess_token(data=token_info)
    refresh_token = create_refresh_token(data=token_info)
    
    # Respuesta con el token y datos del usuario
    response = LoginResponse(
        data=user_data,
        access_token=access_token,
        refresh_token=refresh_token
    )


    return response