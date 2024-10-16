"""
En el archivo jwt_services.py se definen funcionalidades encargadas de la creación 
y verificación de tokens JWT.

Existen dos tipos de tokens JWT: de acceso y de actualización. 
    - El token de acceso se utiliza para autenticar a un usuario en la aplicación 
      y tiene una duración de 10 minutos. 
    - El token de actualización se utiliza para obtener un nuevo token de acceso y 
      tiene una duración de 1 día.
"""

import jwt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from config.config import get_secret_key

SECRET_KEY = get_secret_key()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE = timedelta(minutes=15)
REFRESH_TOKEN_EXPIRE = timedelta(days=1)

# Crear token de acceso
def create_acess_token(data: dict) -> str:
    """Crea un token de acceso con la información del usuario.
    
    Args:
        data (dict): Información del usuario.

    Returns:
        str: Token de acceso.
    """
    
    # Crea un token de acceso con la información del usuario
    to_encode = data.copy()
    # Establece la fecha de expiración del token
    expire = datetime.now(tz=timezone.utc) + ACCESS_TOKEN_EXPIRE    
    # Agrega la fecha de expiración al token
    to_encode.update({"exp": expire})
    # Codifica el token
    encoded_jwt = jwt.encode(
        to_encode, 
        SECRET_KEY, 
        algorithm=ALGORITHM, 
        headers={
            "type":"access"
        }
    )
    
    return encoded_jwt



# Verificar token de acceso
def verify_access_token(token: str) -> dict:
    """Verifica el token de acceso.

    Args:
        token (str): Token de acceso.

    Raises:
        HTTPException(401): Si el token ha expirado o es inválido.

    Returns:
        dict: Información del usuario.
    """
    
    # Verifica el token
    try:
        # Decodifica el token
        payload = jwt.decode(
            token, 
            SECRET_KEY, 
            algorithms=[ALGORITHM]
        )
        # Verifica que el token sea de tipo access
        if jwt.get_unverified_header(token)['type'] != "access":
            raise HTTPException(status_code=401, detail={
                "message":"El token no es de acceso",
                "code": "token/invalid_token"
                }
            )

        return payload  
    except jwt.ExpiredSignatureError:
        # Si el token ha expirado lanza una excepción HTTP 401
        raise HTTPException(status_code=401,detail={
                "message":"El token ha expirado",
                "code": "token/expired_token"
                }
            )
        
    except jwt.InvalidTokenError as e:
        # Si el token es inválido lanza una excepción HTTP 401
        raise HTTPException(status_code=401, detail="Token inválido")
    
    
    
# Crear refresh token
def create_refresh_token(data: dict) -> str:
    """Crea un token de refresco con la información del usuario.
    
    Args:
        data (dict): Información del usuario.

    Returns:
        str: Token de refresco.
    """
    
    
    # Crea un token de refresco con la información del usuario
    to_encode = data.copy()
    # Establece la fecha de expiración del token
    expire = datetime.now(tz=timezone.utc) + REFRESH_TOKEN_EXPIRE
    # Agrega la fecha de expiración al token
    to_encode.update({"exp": expire})
    # Codifica el token
    encoded_jwt = jwt.encode(
        to_encode, 
        SECRET_KEY, 
        algorithm=ALGORITHM,
        headers={
            "type":"refresh"
            }
    )
    
    return encoded_jwt


# Verificar token de refresco
def verify_refresh_token(token: str) -> dict:
    """Verifica el token de refresco.

    Args:
        token (str): Token de refresco.

    Raises:
        HTTPException(401): Si el token ha expirado o es inválido.

    Returns:
        dict: Información del usuario.
    """
    
    # Verifica el token
    try:
        # Decodifica el token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # Verifica que el token sea de tipo refresh
        if jwt.get_unverified_header(token)['type'] != "refresh":
            raise HTTPException(status_code=401, detail=
                                {
                                    "message":"El token no es de refresco",
                                    "code": "token/invalid_token"
                                })
        return payload
    except jwt.ExpiredSignatureError:
        # Si el token ha expirado lanza una excepción HTTP 401
        raise HTTPException(status_code=401, detail={
                "message":"El token ha expirado",
                "code": "token/expired_token"
                }
            )
    except jwt.InvalidTokenError as e:
        # Si el token es inválido lanza una excepción HTTP 401
        raise HTTPException(status_code=401, detail="Refresh token inválido")
    
