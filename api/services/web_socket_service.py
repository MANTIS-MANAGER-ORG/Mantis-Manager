from fastapi import WebSocket
from typing import Dict
from config.db import get_db
from models.notification_model import Notification
from datetime import datetime
from middlewares.logger_middleware import logger
import json

class NotificationManager:
    @staticmethod
    async def get_pending_messages(user_id: str):
        session = next(get_db())
        try:
            data = session.query(Notification).filter(
                Notification.user_id == user_id,
                Notification.sent_by_app.is_(False)
            ).all()
            
            # Marcar las notificaciones como enviadas
            session.query(Notification).filter(
                Notification.user_id == user_id,
                Notification.sent_by_app.is_(False)
            ).update({"sent_by_app": True})
            session.commit()
            
            notifications = [notification.message for notification in data]

            return notifications
        finally:
            session.close()
            
    async def exist_notifications(user_id: str):
        session = next(get_db())
        try:
            data = session.query(Notification).filter(
                Notification.user_id == user_id,
                Notification.sent_by_app.is_(False)
            ).all()
            return len(data) > 0
        finally:
            session.close()

    @staticmethod
    def add_notification(user_id: str, message: str):
        session = next(get_db())
        try:
            if isinstance(message, dict):
                message = json.dumps(message)
            new_notification = Notification(
                user_id=user_id,
                message=message,
                sent_by_app=False,
                created_at=datetime.utcnow()
            )
            session.add(new_notification)
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Error al agregar notificación: {e}")
        finally:
            session.close()

class ConnectionManager:
    def __init__(self):
        # Ahora active_connections guarda una tupla con (WebSocket, autenticado)
        self.active_connections: Dict[str, (WebSocket, bool)] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            # Cerrar la conexión anterior si existe
            try:
                await self.active_connections[user_id][0].close()
                logger.info(f"Conexión WebSocket anterior cerrada para usuario {user_id}")
            except Exception as e:
                logger.error(f"Error al cerrar la conexión anterior para usuario {user_id}: {e}")
        
        # Aceptar la nueva conexión y agregarla al diccionario con estado de autenticación False por defecto
        await websocket.accept()
        self.active_connections[user_id] = (websocket, False)
        logger.info(f"Conexión WebSocket establecida para usuario {user_id}")

    async def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id][0].close()
                self.active_connections[user_id][1] = False
                logger.info(f"Conexión WebSocket desconectada para usuario {user_id}")
            except Exception as e:
                logger.error(f"Error al cerrar la conexión WebSocket para usuario {user_id}: {e}")
            del self.active_connections[user_id]

    # Método para establecer la autenticación
    def set_auth(self, user_id: str, is_authenticated: bool):
        if user_id in self.active_connections:
            websocket, _ = self.active_connections[user_id]
            self.active_connections[user_id] = (websocket, is_authenticated)
            logger.info(f"Autenticación establecida para usuario {user_id}: {is_authenticated}")
        else:
            logger.warning(f"Intento de autenticación fallido: Usuario {user_id} no conectado.")

    async def send_personal_message(self, message: str | dict, user_id: str, obligate : bool = False):
        if isinstance(message, dict):
            message = json.dumps(message)

        if user_id in self.active_connections:
            websocket, is_authenticated = self.active_connections[user_id]

            # Verificar si el usuario está autenticado antes de enviar mensajes
            if not is_authenticated and not obligate:
                logger.warning(f"Usuario {user_id} no está autenticado. No se puede enviar el mensaje.")
                NotificationManager.add_notification(user_id, message)
                return

            try:
                await websocket.send_text(message)
                logger.info(f"Mensaje enviado a usuario {user_id}: {message}")
            except Exception as e:
                logger.error(f"Error al enviar mensaje a usuario {user_id}: {e}")
                NotificationManager.add_notification(user_id, message)
                logger.info(f"Mensaje almacenado para usuario {user_id} debido a error al enviar.")
        else:
            if not obligate:
                NotificationManager.add_notification(user_id, message)
                logger.info(f"Mensaje almacenado para usuario {user_id}: {message}")

    async def send_pending_messages(self, user_id: str):
        
        if user_id in self.active_connections and await NotificationManager.exist_notifications(user_id):
            websocket, is_authenticated = self.active_connections[user_id]

            if not is_authenticated:
                logger.warning(f"Usuario {user_id} no está autenticado. No se pueden enviar mensajes pendientes.")
                await websocket.send_text("Aún no ha sido autenticado. No se pueden enviar mensajes pendientes.")
                return            
            notifications = await NotificationManager.get_pending_messages(user_id)
            for message in notifications:
                try:
                    await websocket.send_text(message)
                    logger.info(f"Mensaje pendiente enviado a usuario {user_id}: {message}")
                except Exception as e:
                    logger.error(f"Error al enviar mensaje pendiente a usuario {user_id}: {e}")
                    NotificationManager.add_notification(user_id, message)
        else:
            try:
                await self.active_connections[user_id][0].send_text("No hay mensajes pendientes.")
            except Exception as e:
                logger.error(f"Error al enviar mensaje de no hay mensajes pendientes a usuario {user_id}: {e}")

    async def broadcast(self, message: str):
        for user_id, (websocket, is_authenticated) in self.active_connections.items():
            if not is_authenticated:
                logger.warning(f"Usuario {user_id} no está autenticado. No se le enviará el broadcast.")
                continue
            try:
                await websocket.send_text(message)
                logger.info(f"Mensaje broadcast enviado a usuario {user_id}: {message}")
            except Exception as e:
                logger.error(f"Error al enviar broadcast a usuario {user_id}: {e}")

# Instanciar el ConnectionManager
manager = ConnectionManager()