import React from "react";

const TicketDetails = ({ ticket, onClose }) => {
  const stages = [
    { name: "En cola", color: "bg-gray-300", index: 1 },
    { name: "Asignado", color: "bg-green-500", index: 2 },
    { name: "En proceso", color: "bg-orange-500", index: 3 },
    { name: "Completado", color: "bg-blue-500", index: 4 },
  ];

  return (
    <div className="ticket-details fixed inset-0 bg-white p-6 shadow-lg rounded-lg z-50 max-w-lg mx-auto mt-10 overflow-y-auto h-auto max-h-[50%]"> {/* Ajusté la altura máxima */}
      <h3 className="text-xl font-bold text-gray-700 mb-4">
        Detalles del Ticket #{ticket.id}
      </h3>

      <p className="text-gray-600">
        <strong>Descripción:</strong> {ticket.description}
      </p>
      <p className="text-gray-600">
        <strong>Persona que hace la petición:</strong> {ticket.created_by.id}
      </p>
      <p className="text-gray-600">
        <strong>Máquina:</strong> {ticket.machine_id}
      </p>

      <div className="mt-4 text-gray-500">
        <p><strong>Detalles adicionales:</strong></p>
        <ul className="list-disc pl-5">
          <li>Fecha de creación: {ticket.created_at}</li>
          <li>Última actualización: {ticket.updated_at}</li>
        </ul>
      </div>

      {/* Timeline de etapas */}
      <div className="mt-4">
        <p className="font-semibold text-gray-700">Progreso del ticket:</p>
        <div className="flex justify-between items-center">
          {stages.map((stage, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className={`h-4 w-4 rounded-full ${ticket.stage >= stage.index ? stage.color : "bg-gray-300"}`}
              ></div>
              <span
                className={`text-sm ${ticket.stage >= stage.index ? "text-green-600" : "text-gray-400"}`}
              >
                {stage.name}
              </span>
              {index < stages.length - 1 && <div className="h-px w-8 bg-gray-300"></div>}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default TicketDetails;
