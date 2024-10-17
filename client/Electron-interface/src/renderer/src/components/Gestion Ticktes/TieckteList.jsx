import React, { useState } from 'react';
import { HiOutlineEye } from 'react-icons/hi';
import { useTicketContext } from '../context/ticketContext'; // Importamos el contexto
import TicketDetails from './TicketsDetails'; 

const TicketList = () => {
  const { ticketsData, loading } = useTicketContext(); // Usamos el contexto
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [currentTab, setCurrentTab] = useState('En cola');

  // Asegúrate de que `ticketsData[currentTab]` existe y es un array
  if (!ticketsData[currentTab]) {
    return <div>No hay datos disponibles para la pestaña actual.</div>;
  }


  // Estado inicial para las pestañas
  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setOpenModal(true);
  };

  console.log (Object.keys(ticketsData));
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen ">
      <div className="bg-white p-8 rounded-lg w-full">
        <h1 className="text-3xl font-bold text-center mb-8">Tickets List</h1>
        {/* Tabs for ticket states */}
        <div className="flex justify-around mb-4">
          {Object.keys(ticketsData).map((tab) => (
            
            <button
              key={tab}
              className={`px-4 py-2 ${
                currentTab === tab ? 'bg-blue-500 text-white' : 'text-blue-500'
              }`}
              onClick={() => setCurrentTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-4 px-6 text-left">ID</th>
                <th className="py-4 px-6 text-left">Description</th>
                <th className="py-4 px-6 text-left">Estado</th>
                <th className="py-4 px-6 text-left">Acciones</th>
                
                <th className="py-4 px-6 text-left">Asignado</th>
              </tr>
            </thead>
            <tbody>
              {ticketsData[currentTab].map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-left">{ticket.id}</td>
                  <td className="py-4 px-6">{ticket.description}</td>
                  <td
                    className={`py-4 px-6 text-left ${
                      ticket.state === 'pendiente' ? 'text-red-500' : 'text-green-500'
                    }`}
                  >
                    {ticket.state}
                  </td>
                  <td className="py-4 px-10 text-left">
                    <button
                      onClick={() => handleSelectTicket(ticket)}
                      className="text-blue-500 hover:text-blue-700 transition-all"
                    >
                      <HiOutlineEye size={24} />
                    </button>
                  </td>
                  
                  <td>{ticket?.assigned_to?.id ? ticket.assigned_to.id : 'No asignado'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg relative max-w-md w-full">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={handleCloseModal}
            >
              &times;
            </button>
            {selectedTicket && <TicketDetails ticket={selectedTicket} />} {/* TicketDetails componente */}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;



