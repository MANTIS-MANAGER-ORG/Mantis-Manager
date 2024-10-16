# routers/user_auth_router.py

from datetime import datetime

from fastapi import WebSocket, WebSocketDisconnect, APIRouter 
from services.web_socket_service import manager
from services.jwt_services import verify_access_token
import logging

logger = logging.getLogger(__name__)

ws_router = APIRouter()

async def process_command(command: str, user_id: str) -> str:
    # Implementar lógica para diferentes comandos
    if command.lower() == "status":
        return f"Estado del usuario {user_id}: activo"
    elif command.lower().startswith("echo "):
        message = command[5:]
        return f"ECHO: {message}"
    elif command.lower() == "get_nosend_messages":
        # Este comando será manejado directamente en el endpoint WebSocket
        return "GET_PENDING_MESSAGES"
    elif command.lower().startswith("auth:"):
        # Aquí se maneja un caso básico de autenticación
        return command
    elif "authorization: bearer " in command.lower():
        # Separar el token del comando
        try:
            token = command.split("Bearer ")[1].strip()
            return ("Authorization", token)
        except IndexError:
            return "Comando de autorización malformado."
    else:
        return "Comando no reconocido."


@ws_router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    logger.info(f"Connected to user {user_id}")
    try:
        while True:
            data = await websocket.receive_text()

            response = await process_command(data, user_id)
            
            if response == "GET_PENDING_MESSAGES":
                # Enviar mensajes pendientes
                logger.info("Enviando mensajes pendientes...")
                await manager.send_pending_messages(user_id)
            elif len(response) == 2:
                if response[0] == "Authorization":
                    try:
                        payload = verify_access_token(response[1])
                        if payload.get("sub") == user_id:
                            manager.set_auth(user_id, True)
                            await manager.send_personal_message(
                                {
                                    "message": "Autenticación exitosa.",
                                    "type":"info",
                                    "timestamp": datetime.now().isoformat()
                                },
                                user_id
                            )
                        else:
                            await manager.send_personal_message(
                                {
                                    "message": "Error al autenticar usuario.",
                                    "type":"error",
                                    "timestamp": datetime.now().isoformat()
                                },
                                user_id
                            )
                    except Exception as e:
                        logger.error(f"Error al autenticar usuario {user_id}: {e}")
                        await manager.send_personal_message(
                            {
                                "message": "Error al autenticar usuario.",
                                "type":"error",
                                "timestamp": datetime.now().isoformat()
                            },
                            user_id
                        )
            else:
                # Enviar la respuesta normalmente
                await websocket.send_text(response)
                logger.info(f"Enviado a {user_id}: {response}")
    except WebSocketDisconnect:
        logger.info(f"Disconnected from user {user_id}")
        await manager.disconnect(user_id)
    except Exception as e:
        logger.error(f"Error occurred: {e}")
        await manager.disconnect(user_id)
        await websocket.close()