import React, { useState } from 'react';

const NotificationComponent = () => {
    const [ws, setWs] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const userId = localStorage.getItem('user_id'); // Obtener automáticamente el User ID
    const token = localStorage.getItem('access_token');

    const connectWebSocket = () => {
        if (userId) {
            const websocket = new WebSocket(`wss://mantis-manager-production-ce86.up.railway.app/ws/${userId}`);

            websocket.onopen = () => {
                console.log("Conectado a WebSocket");
                setIsConnected(true);
                addMessage("Conectado a WebSocket");
                // Enviar el token de autenticación al conectar
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
                addMessage("Desconectado de WebSocket");
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

    const sendMessage = () => {
        const message = document.getElementById("message").value; // Obtener el mensaje del input
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            alert("WebSocket no está conectado.");
            return;
        }
        ws.send(message);
        addMessage(`Tú: ${message}`);
        document.getElementById("message").value = ''; // Limpiar el campo de mensaje
    };

    const getPendingMessages = () => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            alert("WebSocket no está conectado.");
            return;
        }
        ws.send("get_nosend_messages");
        addMessage("Tú: get_nosend_messages");
    };

    const authenticateUser = () => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            alert("WebSocket no está conectado.");
            return;
        }
        ws.send(`Authorization: Bearer ${token}`);
        addMessage(`Tú: Authorization: ${token}`);
    };

    const addMessage = (message) => {
        setNotifications((prev) => [...prev, message]);
    };

    const disconnectWebSocket = () => {
        if (ws) {
            ws.close();
            setWs(null);
            setIsConnected(false);
            console.log("WebSocket cerrado manualmente");
        }
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    return (
        <div>
            <h2>Notificaciones</h2>
            <button onClick={connectWebSocket} className='text-black'>Conectar WebSocket</button>
            <button onClick={disconnectWebSocket} className='text-black'>Desconectar WebSocket</button>
            <br /><br />
            <input
                type="text"
                id="message"
                placeholder="Mensaje"
            />
            <button onClick={sendMessage} className='text-black'>Enviar Mensaje</button>
            <button onClick={getPendingMessages} className='text-black'>Obtener Mensajes Pendientes</button>
            <button onClick={authenticateUser} className='text-black'>Autenticar</button>
            <button onClick={clearNotifications} className='text-black'>Limpiar Notificaciones</button>
            <ul>
                {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                        <li key={index}>{notification}</li>
                    ))
                ) : (
                    <li>No hay notificaciones.</li>
                )}
            </ul>
            {isConnected ? (
                <p>Conectado al WebSocket.</p>
            ) : (
                <p>No conectado al WebSocket.</p>
            )}
        </div>
    );
};

export default NotificationComponent;

