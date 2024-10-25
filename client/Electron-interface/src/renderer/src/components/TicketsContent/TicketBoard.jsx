import React, { useState } from "react";
import TicketCard from "./Tarjeta"; // Importa el componente TicketCard
import { useTicketContext } from "../context/ticketContext"; // Importa el contexto para manejar los tickets
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi';

// Componente TicketBoard

const TicketBoard = () => {
  const [selectedTab, setSelectedTab] = useState("En cola");
  
  const { 
    ticketsData, 
    handleCancel, 
    handleEdit, 
    page,
    setCurrentPage,
    handlePageR,
    handlePageL,
    loading,
    hasMoreTickets, // Obtener el estado de más tickets
  } = useTicketContext();

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
  };

  return (
    <div className="ticket-board container mx-auto p-4 bg-gray-50 shadow-md rounded-lg">
      <div className="tabs flex justify-center space-x-4 mb-4">
        <button
          className={`py-2 px-4 rounded-full focus:outline-none transition duration-300 ${
            selectedTab === "En cola"
              ? "bg-blue-500 text-white"
              : "bg-white text-blue-500 border border-blue-500 hover:bg-blue-100"
          }`}
          onClick={() => handleTabClick("En cola")}
        >
          En cola
        </button>
        <button
          className={`py-2 px-4 rounded-full focus:outline-none transition duration-300 ${
            selectedTab === "En proceso"
              ? "bg-yellow-500 text-white"
              : "bg-white text-yellow-500 border border-yellow-500 hover:bg-yellow-100"
          }`}
          onClick={() => handleTabClick("Asignado")}
        >
          Asignado
        </button>
        <button
          className={`py-2 px-4 rounded-full focus:outline-none transition duration-300 ${
            selectedTab === "Terminados"
              ? "bg-green-500 text-white"
              : "bg-white text-green-500 border border-green-500 hover:bg-green-100"
          }`}
          onClick={() => handleTabClick("En proceso")}
        >
          En proceso
        </button>
      </div>

      <div className="ticket-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {console.log(ticketsData)}
        {ticketsData[selectedTab] && ticketsData[selectedTab].map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onCancel={handleCancel}
            onEdit={handleEdit}
            tab={selectedTab}
          />
        ))}
      </div>

      {/* Botones de flechas */}
      <div className="flex p-4">
        <HiArrowLeft onClick={handlePageL} className={`cursor-pointer ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}/>
        <HiArrowRight  onClick={handlePageR} className={`ml-2 cursor-pointer ${!hasMoreTickets ? 'opacity-50 cursor-not-allowed' : ''}`}  />
      </div>

      {/* Mensaje si no hay tickets en la categoría seleccionada */}
      {(!ticketsData[selectedTab] || ticketsData[selectedTab].length === 0) && (
        <p className="text-center text-gray-500 mt-4">No hay tickets en esta categoría.</p>
      )}
    </div>
  );
};

export default TicketBoard;

