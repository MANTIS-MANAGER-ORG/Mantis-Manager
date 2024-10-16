from fastapi import APIRouter, Depends, HTTPException, Request, Query, Path
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from schemas.user_schema import UserUpdate, PaginatedUsers, UserData
from schemas.user_schema import RegisterData, InfoUser
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
    description="""Este endpoint devuelve información paginada de los usuarios
                   como el nombre completo, correo electrónico, rol y teléfono,
                   Requiere autenticación con un token válido y permisos adecuados.""",
    response_model=PaginatedUsers,
    response_description="Un JSON con la información de los usuarios paginados."
)
async def get_user_info(
    req: Request = None, 
    token: str = Depends(HTTPBearer()), 
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Número de la página que se desea obtener. Comienza en 1."),  
    limit: int = Query(10, ge=1, description="Cantidad de usuarios por página. Valor predeterminado: 10."),
    role_id: int = Query(None, description="ID del rol para filtrar los usuarios. Opcional.")
):
    """ Devuelve la información de los usuarios en formato paginado. """
    
    # Calcular el offset en base al número de página
    offset = (page - 1) * limit

    # Consultar los usuarios con límite y offset para paginación
    query = db.query(User)

    # Si se proporciona role_id, agregarlo a la consulta
    if role_id is not None:
        query = query.filter(User.role_id == role_id)

    users = query.offset(offset).limit(limit).all()

    # Mapeo de los datos de los usuarios utilizando UserData
    users_data = [
        UserData(
            id=user.id,
            first_name=user.first_name,
            last_name=user.last_name,   
            email=user.email,
            phone=user.phone,
            role_id=user.role_id
        ) 
        for user in users
    ]

    # Total de usuarios en la base de datos considerando el filtro
    total_users = query.count()

    # Determinar si es la última página
    is_last_page = len(users) < limit or (page * limit >= total_users)

    # Retornar los datos de paginación y los usuarios
    paginated_response = PaginatedUsers(
        page=page,
        limit=limit,
        total_users=total_users,
        users=users_data,
        is_last_page=is_last_page  # Añadir el nuevo atributo
    )

    return paginated_response


@jd_router.patch(
    "/user_info/{user_id}", 
    summary="Actualizar información de un usuario",
    description="""
        Permite al jefe de desarrollo actualizar la información de un usuario específico.
        Los campos que se pueden actualizar son: nombre, apellido, contraseña, correo electrónico, rol y teléfono.
    """,
    response_model=InfoUser
)
async def update_user_info(
    user_id: str = Path(..., title="ID del usuario", description="ID del usuario a actualizar."),
    user_update: UserUpdate = None,
    token: str = Depends(HTTPBearer()),
    db: Session = Depends(get_db)
):
    """
    Actualiza la información de un usuario específico, como el correo electrónico, rol o teléfono.
    Los parámetros son opcionales y solo se actualizarán los campos proporcionados.

    Args:
        user_id (int): ID del usuario a actualizar.
        user_update (UserUpdate): Un objeto que contiene los campos a actualizar.
        token (str): Token de autenticación requerido.
        db (Session): Sesión de la base de datos.

    Returns:
        UserData: Un JSON con la información del usuario actualizado.
    """
    
    # Obtener el usuario a actualizar
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return HTTPException(status_code=404, detail="Usuario no encontrado")
        
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

    response = InfoUser(
        detail="Usuario actualizado con exito"
    )

    return response


@jd_router.post(
    "/register",
    summary="Registrar un nuevo usuario",
    description="Permite al jefe de desarrollo crear un nuevo usuario. Requiere un token de autenticación.", 
    response_model=InfoUser
)
async def register(
    data: RegisterData, 
    db: Session = Depends(get_db), 
    token: str = Depends(HTTPBearer())
):
    """
    Registra un nuevo usuario en el sistema.

    Args:
        data (RegisterData): Un objeto que contiene la información del nuevo usuario.
        db (Session): Sesión de la base de datos.
        token (str): Token de autenticación requerido.

    Returns:
        InfoUser: Un JSON indicando el éxito del registro.
    """
    # Verificar si el id ya está registrado
    existing_user = db.query(User).filter(User.id == data.id).first()
    if existing_user:
        return HTTPException(status_code=400, detail="El ID de usuario ya está registrado")

    # Normalizar los nombres de los roles en la consulta
    role = db.query(Role).filter(Role.id == data.role).first()
    
    if not role:
        return HTTPException(status_code=404, detail="Rol no encontrado")

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

    # Respuesta con el detalle del nuevo usuario
    response = InfoUser(
        detail="Usuario creado con éxito"
    )
    
    return response


@jd_router.delete(
    "/user_info/{user_id}",
    summary="Eliminar un usuario específico",
    description="Permite al jefe de desarrollo eliminar un usuario específico pasando su ID especifico.",
    response_model=InfoUser
)
async def delete_user(
    user_id: str = Path(..., title="ID del usuario", description="ID del usuario a eliminar."),
    token: str = Depends(HTTPBearer()),
    db: Session = Depends(get_db)
):
    """
    Elimina un usuario específicicando su id.

    Args:
        user_id (int): ID del usuario a eliminar.
        token (str): Token de autenticación requerido.
        db (Session): Sesión de la base de datos.

    Returns:
        UserData: Un JSON con la información del usuario eliminado.
    """
    # Obtener el usuario a eliminar
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return HTTPException(status_code=404, detail="Usuario no encontrado")

    # Eliminar el usuario de la base de datos
    db.delete(user)

    # Preparar la respuesta
    response = InfoUser(
        detail="Usuario eliminado con exito" 
    )
    
    db.commit()

    return response