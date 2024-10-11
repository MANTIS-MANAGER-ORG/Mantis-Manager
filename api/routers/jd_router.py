from fastapi import APIRouter, Depends, HTTPException, Request, Query, status
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from sqlalchemy import func
from passlib.context import CryptContext

from schemas.auth_schema import UserUpdate, PaginatedUsers, UserData
from schemas.auth_schema import RegisterData, CreatedUser
from services.jwt_services import create_acess_token, create_refresh_token 
from models.user_model import User, Role
from config.db import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

jd_router = APIRouter(
    tags=["Acciones del Jefe de Desarrollo"],
    prefix="/jefe_desarrollo"
)

@jd_router.get(
    "/user_info",
    summary="Obtener información paginada de los usuarios",
    description=(
        "Este endpoint devuelve información paginada de los usuarios, "
        "como el nombre completo, correo electrónico, rol y teléfono. "
        "Requiere autenticación con un token válido y permisos adecuados."
    ),
    response_model=PaginatedUsers,  
    response_description="Un JSON con la información de los usuarios paginados."
)
async def get_user_info(
    req: Request = None, 
    token: str = Depends(HTTPBearer()), 
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Número de la página que se desea obtener. Comienza en 1."),  
    limit: int = Query(10, ge=1, description="Cantidad de usuarios por página. Valor predeterminado: 10.") 
):
    """
    Devuelve la información de los usuarios en formato paginado.

    - **token**: Token de autenticación requerido.
    - **page**: Número de la página que se desea obtener (empieza en 1).
    - **limit**: Cantidad de usuarios por página (el valor predeterminado es 10).
    - **full_name**: Nombre completo del usuario (unión de `first_name` y `last_name`).
    - **email**: Correo electrónico del usuario.
    - **role**: Nombre del rol del usuario.
    - **phone**: Teléfono del usuario.
    
    Responde con un JSON que contiene:
    - **page**: Número de la página solicitada.
    - **limit**: Cantidad de usuarios devueltos en la página.
    - **total_users**: Número total de usuarios en la base de datos.
    - **users**: Lista de usuarios con su información filtrada.
    """
    current_user = req.state.user
    
    # Calcular el offset en base al número de página
    offset = (page - 1) * limit

    # Consultar los usuarios con límite y offset para paginación
    users = db.query(User).offset(offset).limit(limit).all()

    # Mapeo de los datos de los usuarios utilizando UserOut
    users_data = [
        UserData(
            id=user.id,
            first_name=user.first_name,
            last_name=user.last_name,   
            email=user.email,
            phone=user.phone,
            role_id = user.role_id
        ) 
        for user in users
    ]

    # Total de usuarios en la base de datos
    total_users = db.query(User).count()

    # Retornar los datos de paginación y los usuarios
    paginated_response = PaginatedUsers(
        page=page,
        limit=limit,
        total_users=total_users,
        users=users_data
    )

    return paginated_response

@jd_router.put("/user_info/{user_id}", 
    summary="Actualizar información de un usuario",
    description="Permite al jefe de desarrollo actualizar el correo electrónico, rol o teléfono de un usuario específico.",
    response_model=UserData
)
async def update_user_info(
    user_id: int,
    user_update: UserUpdate,
    token: str = Depends(HTTPBearer()),
    db: Session = Depends(get_db)
):
    """
    Actualiza la información de un usuario específico.

    - **user_id**: ID del usuario a actualizar.
    - **user_update**: Datos a actualizar (email, role_id, phone).
    - **token**: Token de autenticación requerido.
    """
    
    # Obtener el usuario a actualizar
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return  JSONResponse(status_code=404, content={"error": "Usuario no encontrado"})
        
    # Actualizar los campos proporcionados
    if user_update.first_name:
        user.first_name = user_update.first_name
    if user_update.last_name:
        user.last_name = user_update.last_name
    if user_update.password:
        user.password = pwd_context.hash(user_update.password)
    if user_update.email:
        user.email = user_update.email
    if user_update.role_id:
        user.role_id = user_update.role_id
    if user_update.phone:
        user.phone = user_update.phone

    # Confirmar los cambios en la base de datos
    db.commit()
    db.refresh(user)

    # Preparar la respuesta
    updated_user = UserData(
        id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        role_id =user.role.id,
        phone=user.phone
    )

    return updated_user

@jd_router.delete("/user_info/{user_id}",
    summary="Eliminar un usuario",
    description="Permite al jefe de desarrollo eliminar un usuario específico.",
    response_model=UserData
)
async def delete_user(
    user_id: int,
    token: str = Depends(HTTPBearer()),
    db: Session = Depends(get_db)
):
    """
    Elimina un usuario específico.

    - **user_id**: ID del usuario a eliminar.
    - **token**: Token de autenticación requerido.
    """
    # Obtener el usuario a eliminar
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return JSONResponse(status_code=404, content={"error": "Usuario no encontrado"})

    # Eliminar el usuario de la base de datos
    db.delete(user)

    # Preparar la respuesta
    deleted_user = UserData(
        id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        role_id = user.role.id,
        phone=user.phone
    )
    
    db.commit()

    return deleted_user

@jd_router.post(
    "/register",
    summary="Registrar un nuevo usuario",
    description="Permite al jefe de desarrollo crear un nuevo usuario.", 
    response_model=CreatedUser
)
async def register(
    data: RegisterData, 
    db: Session = Depends(get_db), 
    token: str = Depends(HTTPBearer())
):
    """
    Registrarse en el sistema y generar tokens de acceso y refresco.
    """
    # Verificar si el id ya está registrado
    existing_user = db.query(User).filter(User.id == data.id).first()
    if existing_user:
        return JSONResponse(status_code=400, content={
            "error": "El email ya está registrado"
        })

    # Normalizar los nombres de los roles en la consulta
    role = db.query(Role).filter(Role.id == data.role).first()
    
    if not role:
        return JSONResponse(status_code=404, content={
            "error": "El rol no existe"
        })
        
    # Crear el nuevo usuario con los datos proporcionados
    new_user = User(
        id=data.id,
        password=pwd_context.hash(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        phone=data.phone,
        role_id=role.id
    )

    # Guardar el usuario en la base de datos
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Respuesta con el token y datos del nuevo usuario
    response = CreatedUser(
        detail="Usuario creado con éxito"
    )
    
    return response