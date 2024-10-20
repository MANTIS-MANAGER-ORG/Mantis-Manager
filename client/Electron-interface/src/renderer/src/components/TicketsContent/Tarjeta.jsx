import React, { useState } from "react";
import TicketDetails from "./detailTickets"; // Importamos el nuevo componente

const TicketCard = ({ ticket, onCancel, onEdit, tab }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Función para determinar el estilo según la prioridad
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "alta":
        return { backgroundColor: "bg-red-200" }; // Fondo rojo claro y texto oscuro
      case "media":
        return { backgroundColor: "bg-yellow-200" }; // Fondo amarillo claro y texto oscuro
      case "baja":
        return { backgroundColor: "bg-blue-200" }; // Fondo azul claro y texto oscuro
      default:
        return { backgroundColor: "bg-gray-200" }; // Color por defecto
    }
  };

  const priorityStyle = getPriorityStyle(ticket.priority);

  return (
    <div
      className={`ticket-card bg-white rounded-lg shadow-lg p-6 mb-4 hover:shadow-xl transition-all border-l-4 h-24 max-w-md`}
      style={{ borderColor: ticket.color }} // Mantiene el color original de la tarjeta
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-700 mb-2">Ticket #{ticket.id}</h3>
        <button
          onClick={() => setShowDetails(true)}
          className="text-sm text-blue-700 hover:underline  text-btn btn-primary"
        >
          Ver detalles
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: ticket.color }}></div>
          <span className="text-sm text-gray-500">Prioridad:</span>
          <span className={`text-sm ${priorityStyle.backgroundColor}  font-sans text-xs font-medium uppercase py-1 px-3 text-left   text-slate-900  rounded-md `}>
            {ticket.priority} {/* Estilo aplicado solo a la prioridad */}
          </span>
        </div>
        <div className="flex space-x-1"> {/* Espaciado reducido entre los botones */}
          <button
            className="bg-red-500 text-gray-200 font-semibold text-xs px-2 py-1 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            onClick={() => onCancel(ticket.id, tab)}
          >
            Cancelar
          </button>
          <button
            className="bg-blue-500 text-gray-200 font-semibold text-xs px-2 py-1 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Editar
          </button>
        </div>
      </div>

      {/* Mostrar los detalles cuando se haga clic */}
      {showDetails && (
        <TicketDetails
          ticket={ticket}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

export default TicketCard;

