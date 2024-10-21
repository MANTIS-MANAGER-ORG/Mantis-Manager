import React, { useState, useEffect } from 'react';

const TicketNotification = ({ notification }) => (
  <div className="bg-white p-5 shadow-lg rounded-lg flex justify-between items-center mb-3 border-l-4 transition-all duration-200 ease-in-out hover:shadow-xl hover:scale-[1.02] 
    border-blue-400">
    <div>
      <p className="text-sm text-gray-800 font-semibold">
        {notification.type === 'ticket_request' && `Nueva solicitud de ticket: ${notification.ticketId}`}
        {notification.type === 'ticket_update' && `Actualización en ticket: ${notification.ticketId}`}
        {notification.type === 'machine_ready' && `Máquina lista para: ${notification.machine}`}
      </p>
      <span className={`block text-xs font-bold mt-1 ${
        notification.type === 'ticket_request' ? 'text-green-500' 
        : notification.type === 'ticket_update' ? 'text-yellow-500' 
        : 'text-blue-500'
      }`}>
        {notification.message}
      </span>
      <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
    </div>
    <button className="text-blue-500 hover:text-blue-600 hover:underline text-sm transition duration-150">
      Ver Detalles
    </button>
  </div>
);

const TicketNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [ws, setWs] = useState(null);

  // Conexión WebSocket
  useEffect(() => {
    const connectWebSocket = () => {
      const userId = localStorage.getItem('user_id'); // Obtener el userId del localStorage
      if (!userId) {
        alert("User ID no encontrado en el almacenamiento local.");
        return;
      }

      const webSocket = new WebSocket(`wss://mantis-manager-production-ce86.up.railway.app/ws/${userId}`);
      
      webSocket.onopen = () => {
        console.log("Conectado a WebSocket");
      };

      webSocket.onmessage = (event) => {
        try {
          const jsonMessage = JSON.parse(event.data);
          const newNotification = {
            id: notifications.length + 1,
            type: jsonMessage.type,
            ticketId: jsonMessage.ticketId || null,
            machine: jsonMessage.machine || null,
            message: jsonMessage.message,
            time: 'Ahora mismo',
          };
          setNotifications((prev) => [newNotification, ...prev]);
        } catch (e) {
          console.log("Error al procesar mensaje:", e);
        }
      };

      webSocket.onclose = () => {
        console.log("Desconectado de WebSocket");
      };

      webSocket.onerror = (error) => {
        console.error("Error en WebSocket:", error);
      };

      setWs(webSocket);

      return () => {
        if (webSocket) webSocket.close();
      };
    };

    connectWebSocket();
  }, [notifications]);

  // Enviar mensajes
  const sendMessage = (message) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert("WebSocket no está conectado.");
      return;
    }
    ws.send(message);
  };

  // Obtener mensajes pendientes
  const getPendingMessages = () => {
    sendMessage("get_nosend_messages");
  };

  // Función de autenticación de usuario
  const authenticateUser = () => {
    const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsInR5cGUiOiJhY2Nlc3MifQ.eyJzdWIiOiJhZG1pbiIsInNjb3BlcyI6MSwiZXhwIjoxNzI5MDkzNDM5fQ.gGpS9lPLlAOiNfD5FzyA8kjLdpLw6RhuXv17thxxiUo";
    sendMessage(`Authorization: ${token}`);
  };

  return (
    <div className="max-w-lg mx-auto mt-10">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Notificaciones del Sistema de Tickets</h3>
      <div className="mb-4">
        <button onClick={() => authenticateUser()} className="bg-blue-500 text-white px-4 py-2 rounded-lg">Autenticar</button>
        <button onClick={() => getPendingMessages()} className="bg-yellow-500 text-white px-4 py-2 ml-4 rounded-lg">Obtener Mensajes Pendientes</button>
      </div>
      <div className="overflow-y-auto h-64 p-5 bg-white rounded-lg shadow-md">
        {notifications.map((notification) => (
          <TicketNotification
            key={notification.id}
            notification={notification}
          />
        ))}
      </div>
    </div>
  );
};

export default TicketNotifications;
