import React, { useState } from 'react';
import { useTicketContext } from '../context/ticketContext'; // Importa el contexto

const TicketDetails = ({ ticket }) => {
  const { AsignedTicket, changeTicketState } = useTicketContext(); // Usa las funciones del contexto
  const [assignedTo, setAssignedTo] = useState(''); // Estado para almacenar el ID del usuario asignado
  const [newStatus, setNewStatus] = useState(ticket.state); // Estado para cambiar el estado del ticket
  const [isEditingStatus, setIsEditingStatus] = useState(false); // Estado para controlar la edición del estado
  const [message, setMessage] = useState(''); // Estado para mostrar mensajes

  // Maneja la asignación del ticket
  const handleAssign = async () => {
    if (assignedTo) {
      try {
        console.log(ticket.id, assignedTo)
        await AsignedTicket(String(ticket.id), assignedTo); // Usa la función del contexto
        setMessage(`Ticket asignado al usuario con ID: ${assignedTo}`);
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
    } catch (error) {
      setMessage('Error al actualizar el estado del ticket');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Detalles del Ticket</h2>
      <div className="mb-4">
        <p className="mb-2">
          <span className="font-semibold">ID:</span> {ticket.id}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Descripción:</span> {ticket.description}
        </p>
        <p className="mb-4">
          <span className="font-semibold">Estado:</span>
          {!isEditingStatus ? (
            <span
              className={`font-bold pl-2 ${
                ticket.state === 'En cola'
                  ? 'text-orange-500'
                  : ticket.state === 'Closed'
                  ? 'text-red-500'
                  : 'text-green-500'
              }`}
            >
              {ticket.state}
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
          disabled={!!ticket.assigned_to} // Deshabilita si ya tiene asignado
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
            ticket.assigned_to ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500'
          } text-white px-4 py-2 rounded-lg shadow-sm`}
          onClick={handleAssign}
          disabled={!!ticket.assigned_to} // Deshabilita si ya tiene asignado
        >
          {ticket.assigned_to ? 'Ya Asignado' : 'Asignar'}
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
    </div>
  );
};

export default TicketDetails;



