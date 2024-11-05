import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';

const NotificationComponent = ({ isOpen }) => {
    const { websocket, isConnected, setIsConnected } = useAuth();
    const [notifications, setNotifications] = useState([]);
    
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('access_token');
    const [showOldNotifications, setShowOldNotifications] = useState(false);

    useEffect(() => {
        if (websocket) {
            // Set up WebSocket event handlers
            websocket.onopen = () => {
                console.log("Conectado al WebSocket");
                
                websocket.send(`Authorization: Bearer ${token}`);
                setIsConnected(true);
            };

            websocket.onmessage = (event) => {
                console.log('hola')
                const message = event.data;
                console.log(message);
                try {
                    const jsonMessage = JSON.parse(message);
                    if (jsonMessage.error) {
                        console.error("Error del servidor:", jsonMessage.error);
                    } else if (jsonMessage.notification) {
                        setNotifications((prev) => [...prev, jsonMessage.notification]);
                    } else {
                        addMessage(`Servidor: ${message}`);
                    }
                } catch (error) {
                    console.error("Error al procesar el mensaje:", error);
                    addMessage(`Servidor (Texto): ${message}`);
                }
            };

            websocket.onclose = () => {
                
                console.log("Desconectado del WebSocket");
                setIsConnected(false);
            };

            websocket.onerror = (error) => {
                console.error("Error en WebSocket:", error);
                addMessage("Error en WebSocket.");
            };

            return () => {
                // Cleanup on component unmount
                websocket.onopen = null;
               
                websocket.onclose = null;
                websocket.onerror = null;
                console.log("Manejadores de WebSocket eliminados.");
            };
        } else {
            console.error("WebSocket no está disponible.");
        }
    }, [websocket, showOldNotifications]); // Depend on websocket to set up listeners when it changes

    const addMessage = (message) => {
        setNotifications((prev) => [...prev, message]);
    };

    const getPendingMessages = () => {
        console.log('hola')
        if (!websocket || websocket.readyState !== WebSocket.OPEN) {
            alert("WebSocket no está conectado.");

            return;
        }
        websocket.send("get_nosend_messages");
        addMessage("Tú: get_nosend_messages");
    };

    const handleShowOldNotifications = () => {
        console.log('hola')
        setShowOldNotifications(true);
        getPendingMessages(); // Llamar al WebSocket para obtener mensajes pendientes
    };

    return (
        <div className="p-2 bg-white flex items-center justify-center">
            <div className="w-full bg-white rounded-lg p-2">
                <div className="overflow-y-auto max-h-60 mb-2">
                    {notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                            <div key={index} className="bg-white p-3 rounded-lg mb-2 text-gray-800">
                                {notification}
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-500 text-center text-sm font-light">No hay notificaciones.</div>
                    )}
                </div>
                {!showOldNotifications && (
                    <button
                        onClick={handleShowOldNotifications}
                        className="bg-blue-500 text-white py-2 px-4 rounded-lg w-full"
                    >
                        Ver todas las notificaciones
                    </button>
                )}
                {isConnected ? (
                    <p className="text-green-600 text-center mt-4">Conectado al WebSocket.</p>
                ) : (
                    <p className="text-red-600 text-center mt-4">No conectado al WebSocket.</p>
                )}
            </div>
        </div>
    );
};

export default NotificationComponent;
