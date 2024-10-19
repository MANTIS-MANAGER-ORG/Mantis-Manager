import React, { useState } from "react";
import GenerarTickets from "../ToolsContents/GenerarTickets";
import { useTicketContext } from "../context/ticketContext";
import HistoryTable from "../historial/HistoryTable";

/**
 * Componente de la barra lateral que proporciona herramientas para generar tickets y ver el historial de tickets.
 * 
 * @returns {React.ReactElement} - La barra lateral con botones para generar tickets y mostrar historial.
 */
const SidebarTickets = () => {
  // Estado para controlar la visibilidad del componente de generación de tickets
  const [isOpen, setIsOpen] = useState(false);
  
  // Estado para controlar la visibilidad del historial de tickets
  const [showHistory, setShowHistory] = useState(false);
  
  // Hook para obtener el historial de tickets desde el contexto
  const { history } = useTicketContext();

  // Función para alternar la visibilidad del componente de generación de tickets
  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  // Función para cerrar el componente de generación de tickets
  const handleClose = () => {
    setIsOpen(false);
  };

  // Función para mostrar el historial de tickets
  const handleShowHistory = () => {
    setShowHistory(true);
  };

  // Función para cerrar el historial de tickets
  const handleCloseHistory = () => {
    setShowHistory(false);
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Botón para generar nuevos tickets */}
      <div
        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-700 rounded-full p-2"
        onClick={handleOpen}
      >
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white">
          {/* Icono SVG para generar tickets */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 3H8C6.343 3 5 4.343 5 6v12c0 1.657 1.343 3 3 3h8c1.657 0 3-1.343 3-3V6c0-1.657-1.343-3-3-3zm-1 14h-6v-1h6v1zm0-3h-6v-1h6v1zm0-3H8V7h6v4z"/>
          </svg>
        </div>
        
      </div>

      {/* Botón para ver el historial de tickets */}
      <div
        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-700 rounded-full p-2"
        onClick={handleShowHistory}
      >
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-600 text-white">
          {/* Icono SVG para historial de tickets */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v9.25l5.47 2.94.96-1.72-4.47-2.43V3H12zm-1 12H5V6h6v6h2V6h6v9.25l-5.47-2.94-.96 1.72 4.47 2.43V15z"/>
          </svg>
        </div>
        
      </div>

      {/* Mostrar componente GenerarTickets si isOpen es verdadero */}
      {isOpen && <GenerarTickets CerrarHerramienta={handleClose} />}

      {/* Mostrar componente HistoryTable si showHistory es verdadero */}
      {showHistory && <HistoryTable data={history} onClose={handleCloseHistory} />}
    </div>
  );
};

export default SidebarTickets;
