import os
from uuid import uuid4
import time
from fastapi import (
    APIRouter, Depends, File, HTTPException, Path, UploadFile
)
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from cloudinary.uploader import upload, destroy
from cloudinary.utils import cloudinary_url
from config.db import get_db
from models.user_model import User
from schemas.user_schema import ImageResponse

# Crear el router para manejar las imágenes de los usuarios
user_image_router = APIRouter(tags=["Users Images"])

@user_image_router.post(
    "/users/upload/{user_id}",
    summary="Subir una imagen de perfil para un usuario específico",
    description="Sube y optimiza la imagen de perfil del usuario en Cloudinary.",
    response_model=ImageResponse,
    response_description="URL donde se encuentra la imagen optimizada."
)
async def upload_user_image(
    user_id: str = Path(..., title="ID del usuario", description="ID del usuario al que corresponde la imagen"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    token: str = Depends(HTTPBearer())
):
    """
    Sube una imagen de perfil para un usuario específico, la optimiza usando Cloudinary 
    y guarda el nombre en la base de datos.

    Args:
        user_id: ID del usuario que sube la imagen.
        file: Imagen que se va a subir (debe ser un archivo de tipo imagen).

    Returns:
        La URL optimizada de la imagen.
    """
    # Comprobar si el usuario existe en la base de datos
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Verificar si el archivo es una imagen
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo no es una imagen")

    image_name = f"{uuid4()}"

    if user.image_field:
        try: 
            image_delete_result = destroy(user.image_field.replace(".avif",""), resource_type="image", type="upload")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al eliminar la imagen anterior: {str(e)}")
    # Subir la imagen a Cloudinary con el nombre del usuario y sobreescribir si ya existe
    try:
        result = upload (
            file.file,
            public_id=image_name,  
            resource_type="image",
            overwrite=True,  # Sobrescribir la imagen si ya existe
            format="avif",  # Guardar como AVIF
            transformation=[
                {"quality": "auto"}  # Optimización automática
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir la imagen a Cloudinary: {str(e)}")

    # Actualizar el campo de imagen en la base de datos
    user.image_field = f"{result['display_name']}.{result['format']}"
    db.commit()
    db.refresh(user)

    # Retornar la URL segura de la imagen
    return ImageResponse(path=user.image_field)


@user_image_router.get(
    "/users/image/{user_id}",
    summary="Obtener la imagen de perfil de un usuario específico con firma temporal",
    response_description="URL firmada de la imagen.",
)
async def get_user_image(
    user_id: str = Path(..., title="ID del usuario", description="ID del usuario al que corresponde la imagen"),
    db: Session = Depends(get_db),
    token: str = Depends(HTTPBearer())
):
    """
    Obtiene una URL firmada de la imagen de perfil de un usuario específico, válida por un tiempo limitado.
    
    Args:
        user_id: ID del usuario cuya imagen se desea obtener.

    Returns:
        La URL firmada de la imagen.
    """
    # Buscar el usuario en la base de datos
    user = db.query(User).filter(User.id == user_id).first()

    # Verificar si el usuario tiene una imagen asociada
    if not user or not user.image_field:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")

    # Generar la URL firmada con una expiración de 5 minutos
    signed_url, options = cloudinary_url(
        user.image_field,  
        resource_type="image",
        sign_url=True,
        secure=True,
        expires_at=int(time.time() + 60) 
    )

    return ImageResponse(path=signed_url)