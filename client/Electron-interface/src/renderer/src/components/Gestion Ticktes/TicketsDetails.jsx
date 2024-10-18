import React, { useState, useEffect } from 'react';
import { useTicketContext } from '../context/ticketContext'; // Importa el contexto

const TicketDetails = ({ ticket, handleClose }) => {
  const { AsignedTicket, changeTicketState, createRequest } = useTicketContext(); // Usa createRequest
  const [assignedTo, setAssignedTo] = useState(''); // Estado para almacenar el ID del usuario asignado
  const [newStatus, setNewStatus] = useState(ticket.state); // Estado para cambiar el estado del ticket
  const [isEditingStatus, setIsEditingStatus] = useState(false); // Estado para controlar la edición del estado
  const [message, setMessage] = useState(''); // Estado para mostrar mensajes
  const [ticketDetails, setTicketDetails] = useState(ticket); // Estado para mostrar los detalles del ticket

  // Sincroniza el estado local cuando se recibe un nuevo ticket
  useEffect(() => {
    setTicketDetails(ticket);
    setNewStatus(ticket.state); // Actualiza el nuevo estado también
  }, [ticket]);

  // Maneja la asignación del ticket
  const handleAssign = async () => {
    if (assignedTo) {
      try {
        await AsignedTicket(String(ticket.id), assignedTo); // Usa la función del contexto
        setMessage(`Ticket asignado al usuario con ID: ${assignedTo}`);
        setTicketDetails((prevDetails) => ({ ...prevDetails, assigned_to: assignedTo })); // Actualiza el estado local
        handleClose(); // Cierra el modal después de la asignación
      } catch (error) {
        setMessage('Error al asignar el ticket');
      }
    } else {
      setMessage('Por favor ingrese el ID del usuario');
    }
  };

  // Maneja el cambio de estado del ticket
  const handleStatusChange = async () => {
    try {
      await changeTicketState(ticket.id, newStatus); // Usa la función del contexto
      setMessage(`Estado del ticket actualizado a: ${newStatus}`);
      setIsEditingStatus(false); // Oculta el campo de edición del estado
      setTicketDetails((prevDetails) => ({ ...prevDetails, state: newStatus })); // Actualiza el estado local
      handleClose(); // Cierra el modal después de guardar el estado
    } catch (error) {
      setMessage('Error al actualizar el estado del ticket');
    }
  };

  // Maneja la solicitud de cierre del ticket
  const handleCloseRequest = async () => {
    try {
      await createRequest(ticket.id, 'close', 'cierre'); // Usa createRequest para solicitar el cierre
      setMessage('Solicitud de cierre enviada');
      handleClose(); // Cierra el modal después de solicitar el cierre
    } catch (error) {
      setMessage('Error al solicitar el cierre del ticket');
    }
  };

  // Maneja la solicitud de reapertura del ticket
  const handleReopenRequest = async () => {
    try {
      await createRequest(ticket.id, 'reopen'); // Usa createRequest para solicitar la reapertura
      setMessage('Solicitud de reapertura enviada');
      handleClose(); // Cierra el modal después de solicitar la reapertura
    } catch (error) {
      setMessage('Error al solicitar la reapertura del ticket');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Detalles del Ticket</h2>
      <div className="mb-4">
        <p className="mb-2">
          <span className="font-semibold">ID:</span> {ticketDetails.id}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Descripción:</span> {ticketDetails.description}
        </p>
        <p className="mb-4">
          <span className="font-semibold">Estado:</span>
          {!isEditingStatus ? (
            <span
              className={`font-bold pl-2 ${
                ticketDetails.state === 'En cola'
                  ? 'text-orange-500'
                  : ticketDetails.state === 'Closed'
                  ? 'text-red-500'
                  : 'text-green-500'
              }`}
            >
              {ticketDetails.state}
            </span>
          ) : (
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)} // Permite seleccionar el nuevo estado
              className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="pendiente">Pendiente</option>
              <option value="asignado">Asignado</option>
              <option value="en proceso">En Proceso</option>
            </select>
          )}
        </p>
      </div>

      {/* Input para asignar usuario por ID */}
      <div className="mb-6">
        <label className="font-semibold block mb-2">Asignar a (Ingrese ID):</label>
        <input
          type="text"
          className="block w-full p-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          placeholder="Ingrese ID del usuario"
          disabled={!!ticketDetails.assigned_to} // Deshabilita si ya tiene asignado
        />
      </div>

      {/* Mensajes */}
      {message && (
        <div className="mb-4 p-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg">
          {message}
        </div>
      )}

      <div className="flex space-x-4">
        {/* Botón de asignar ticket */}
        <button
          className={`${
            ticketDetails.assigned_to ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500'
          } text-white px-4 py-2 rounded-lg shadow-sm`}
          onClick={handleAssign}
          disabled={!!ticketDetails.assigned_to} // Deshabilita si ya tiene asignado
        >
          {ticketDetails.assigned_to ? 'Ya Asignado' : 'Asignar'}
        </button>

        {/* Botón para editar el estado */}
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-sm"
          onClick={() => setIsEditingStatus(!isEditingStatus)}
        >
          Editar Estado
        </button>

        {/* Guardar estado */}
        {isEditingStatus && (
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-sm"
            onClick={handleStatusChange}
          >
            Guardar Estado
          </button>
        )}
      </div>

      {/* Botones de solicitud de cierre y reapertura */}
      <div className="mt-4 flex space-x-4">
        {/* Botón de Solicitud de Cierre */}
        <button
          className={`${
            ticketDetails.state !== 'en proceso' ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-500'
          } text-white px-4 py-2 rounded-lg shadow-sm`}
          onClick={handleCloseRequest}
          disabled={ticketDetails.state !== 'en proceso'} // Deshabilita si el estado no es "en proceso"
        >
          Solicitar Cierre
        </button>

        {/* Botón de Solicitud de Reapertura */}
        <button
          className={`${
            ticketDetails.state !== 'terminado' ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500'
          } text-white px-4 py-2 rounded-lg shadow-sm`}
          onClick={handleReopenRequest}
          disabled={ticketDetails.state !== 'terminado'} // Deshabilita si el estado no es "terminado"
        >
          Solicitar Reapertura
        </button>
      </div>
    </div>
  );
};

export default TicketDetails;



