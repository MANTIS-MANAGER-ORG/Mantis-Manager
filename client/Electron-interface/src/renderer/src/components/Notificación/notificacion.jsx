import React, { useState, useEffect } from 'react';

const NotificationComponent = () => {
    const [ws, setWs] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('access_token');
    const [showOldNotifications, setShowOldNotifications] = useState(false);

    useEffect(() => {
        // Conectar al WebSocket automáticamente al montar el componente
        connectWebSocket();
    }, []);

    const connectWebSocket = () => {
        if (userId) {
            const websocket = new WebSocket(`wss://mantis-manager-production-ce86.up.railway.app/ws/${userId}`);

            websocket.onopen = () => {
                console.log("Conectado a WebSocket");
                setIsConnected(true);
                
                websocket.send(`Authorization: Bearer ${token}`);
            };

            websocket.onmessage = (event) => {
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
                setIsConnected(false);
                console.log("Desconectado de WebSocket");
                console.log(showOldNotifications)
               
            };

            websocket.onerror = (error) => {
                console.error("Error en WebSocket:", error);
                addMessage("Error en WebSocket.");
            };

            setWs(websocket);
        } else {
            console.error("User ID no encontrado en localStorage.");
        }
    };

   

    const addMessage = (message) => {
        setNotifications((prev) => [...prev, message]);
    };

    const getPendingMessages = () => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            alert("WebSocket no está conectado.");
            return;
        }
        ws.send("get_nosend_messages");
        addMessage("Tú: get_nosend_messages");
    };

    const handleShowOldNotifications = () => {
        setShowOldNotifications(true);
        getPendingMessages(); // Llamar al WebSocket para obtener mensajes pendientes
    };

    return (
        <div className="p-2 bg-white flex items-center justify-center">
            <div className="w-full  bg-white rounded-lg p-2">
                
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
