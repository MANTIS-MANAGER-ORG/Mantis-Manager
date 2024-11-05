import React, { useState, useEffect } from 'react';
import { HiOutlineEye, HiArrowLeft, HiArrowRight } from 'react-icons/hi';
import { useTicketContext } from '../context/ticketContext';
import TicketDetails from './TicketsDetails';

const TicketList = () => {
  const {
    ticketsData,
    loading,
    handlePageR,
    handlePageL,
    page,
    hasMoreTickets,
  } = useTicketContext();

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [showSpinner, setShowSpinner] = useState(true);

  const allTickets = Object.values(ticketsData).flat();

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setOpenModal(true);
  };

  const handleAssignTo = (newAssignedId) => {
    if (selectedTicket) {
      selectedTicket.assigned_to = { id: newAssignedId };
    }
  };

  useEffect(() => {
    setShowSpinner(true); // Activar el spinner cada vez que `ticketsData` cambia
    const timer = setTimeout(() => {
      setShowSpinner(false); // Desactivar el spinner después de un retraso
    }, 1000); // Ajusta el tiempo aquí (1000 ms = 1 segundo)

    return () => clearTimeout(timer); // Limpiar el temporizador en caso de que el componente se desmonte
  }, [ticketsData]);

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  if (loading || showSpinner) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg w-full">
        <h1 className="text-3xl font-bold text-center mb-8">Lista de Tickets</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-slate-200">
                <th className="py-4 px-6 text-left font-sans text-sm font-normal leading-none text-slate-500">ID</th>
                <th className="py-4 px-6 text-left font-sans text-sm font-normal leading-none text-slate-500">Descripción</th>
                <th className="py-4 px-6 text-left font-sans text-sm font-normal leading-none text-slate-500">Estado</th>
                <th className="py-4 px-6 text-left font-sans text-sm font-normal leading-none text-slate-500">Acciones</th>
                <th className="py-4 px-6 text-left font-sans text-sm font-normal leading-none text-slate-500">Asignado</th>
              </tr>
            </thead>
            <tbody>
              {allTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-left border-b border-slate-200 text-sm font-semibold text-slate-700">{ticket.id}</td>
                  <td className="py-4 px-6 text-left border-b border-slate-200 text-sm font-semibold text-slate-700">{ticket.description}</td>
                  <td className="border-b">
                    <span className={`py-1 px-2 rounded-md font-sans text-xs font-medium uppercase text-slate-900
                      ${ticket.state === 'pendiente' ? 'text-red-500 bg-red-200' : 
                      ticket.state === 'asignado' ? 'text-yellow-900 bg-yellow-200' : 
                      ticket.state === 'en proceso' ? 'text-green-800 bg-green-200' : ''}`}>
                      {ticket.state}
                    </span>
                  </td>
                  <td className="py-4 px-10 text-left border-b">
                    <button
                      onClick={() => handleSelectTicket(ticket)}
                      className="text-blue-500 hover:text-blue-700 transition-all"
                    >
                      <HiOutlineEye size={24} />
                    </button>
                  </td>
                  <td className="py-4 px-6 text-left border-b border-slate-200 text-sm font-semibold text-slate-700">
                    {ticket?.assigned_to?.id || 'No asignado'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex p-4">
          <HiArrowLeft onClick={handlePageL} className={`cursor-pointer ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`} />
          <HiArrowRight onClick={handlePageR} className={`ml-2 cursor-pointer ${!hasMoreTickets ? 'opacity-50 cursor-not-allowed' : ''}`} />
        </div>
      </div>

      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg relative max-w-md w-full">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={handleCloseModal}
            >
              &times;
            </button>
            {selectedTicket && (
              <TicketDetails 
                ticket={selectedTicket} 
                handleClose={handleCloseModal} 
                handleAssignTo={handleAssignTo} 
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;




