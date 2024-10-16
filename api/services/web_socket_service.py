# services/web_socket_service.py

import logging
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

class ConeccionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            # Cerrar la conexión anterior si existe
            try:
                await self.active_connections[user_id].close()
                logger.info(f"Conexión WebSocket anterior cerrada para usuario {user_id}")
            except Exception as e:
                logger.error(f"Error al cerrar la conexión anterior para usuario {user_id}: {e}")
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"Conexión WebSocket establecida para usuario {user_id}")

    async def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].close()
                logger.info(f"Conexión WebSocket desconectada para usuario {user_id}")
            except Exception as e:
                logger.error(f"Error al cerrar la conexión WebSocket para usuario {user_id}: {e}")
            del self.active_connections[user_id]

    async def send_personal_message(self, message: str | dict, user_id: str):
        if isinstance(message, dict):
            message = json.dumps(message)

        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_text(message)
                logger.info(f"Mensaje enviado a usuario {user_id}: {message}")
            except Exception as e:
                logger.error(f"Error al enviar mensaje a usuario {user_id}: {e}")
                # Si falla al enviar, almacenar el mensaje
                NotificationManager.add_notification(user_id, message)
                logger.info(f"Mensaje almacenado para usuario {user_id} debido a error al enviar.")
        else:
            # Si no hay conexiones activas, almacenar el mensaje
            NotificationManager.add_notification(user_id, message)
            logger.info(f"Mensaje almacenado para usuario {user_id}: {message}")

    async def send_pending_messages(self, user_id: str):
        notifications = await NotificationManager.get_pending_messages(user_id)
        if user_id in self.active_connections and notifications:
            for message in notifications:
                try:
                    await self.active_connections[user_id].send_text(message)
                    logger.info(f"Mensaje pendiente enviado a usuario {user_id}: {message}")
                except Exception as e:
                    logger.error(f"Error al enviar mensaje pendiente a usuario {user_id}: {e}")
                    # Si falla al enviar, volver a almacenar el mensaje
                    NotificationManager.add_notification(int(user_id), message)
                    logger.info(f"Mensaje re-almacenado para usuario {user_id} debido a error al enviar.")
        else:
            try:
                await self.active_connections[user_id].send_text("No hay mensajes pendientes.")
            except Exception as e:
                logger.error(f"Error al enviar mensaje de no hay mensajes pendientes a usuario {user_id}: {e}")
    
    async def broadcast(self, message: str):
        for user_id, connection in self.active_connections.items():
            try:
                await connection.send_text(message)
                logger.info(f"Mensaje broadcast enviado a usuario {user_id}: {message}")
            except Exception as e:
                logger.error(f"Error al enviar broadcast a usuario {user_id}: {e}")

manager = ConeccionManager()