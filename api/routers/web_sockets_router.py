# routers/user_auth_router.py

from fastapi import WebSocket, WebSocketDisconnect, APIRouter 
from services.web_socket_service import manager, NotificationManager
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
        # Retornamos un indicador para que el endpoint sepa qué hacer
        return "GET_PENDING_MESSAGES"
    else:
        return "Comando no reconocido."

@ws_router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    logger.info(f"Connected to user {user_id}")
    try:
        while True:
            data = await websocket.receive_text()
            
            logger.info(f"Recibido de {user_id}: {data}")
            response = await process_command(data, user_id)
            
            if response == "GET_PENDING_MESSAGES":
                # Enviar mensajes pendientes
                logger.info("Enviando mensajes pendientes...")
                await manager.send_pending_messages(user_id)
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