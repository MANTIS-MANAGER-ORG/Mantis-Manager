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

  // Maneja la selección del ticket
  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    console.log('cerrando modal')
    setOpenModal(false);
  };

  // Muestra un loader si está cargando
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
        <h1 className="text-3xl font-bold text-center mb-8">Lista de Tickets</h1>
        {/* Pestañas para los estados de los tickets */}
        <div className="flex justify-around mb-4">
          {Object.keys(ticketsData).map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 ${currentTab === tab ? 'bg-blue-500 text-white' : 'text-blue-500'}`}
              onClick={() => setCurrentTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead >
              <tr className="bg-slate-50 border-slate-200 ">
                <th className="py-4 px-6 text-left font-sans text-sm font-normal leading-none text-slate-500">ID</th>
                <th className="py-4 px-6 text-left font-sans text-sm font-normal leading-none text-slate-500">Descripción</th>
                <th className="py-4 px-6 text-left font-sans text-sm font-normal leading-none text-slate-500">Estado</th>
                <th className="py-4 px-6 text-left font-sans text-sm font-normal leading-none text-slate-500">Acciones</th>
                <th className="py-4 px-6 text-left font-sans text-sm font-normal leading-none text-slate-500">Asignado</th>
              </tr>
            </thead>
            <tbody>
              {ticketsData[currentTab].map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-left border-b boder-slate-200 text-sm font-semibold text-slate-700">{ticket.id}</td>
                  <td className="py-4 px-6 text-left border-b boder-slate-200 text-sm font-semibold text-slate-700">{ticket.description}</td>
                  <td className='border-b'>
                    <span  className={`py-1 px-1 text-left h-10 w-10 rounded-md font-sans text-xs font-medium uppercase text-slate-900 ${ticket.state === 'pendiente' ? 'text-red-500 bg-red-200' : 'text-green-800 bg-green-200'}`}>
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
                  </td >
                  <td className='"py-4 px-6 text-left border-b boder-slate-200 text-sm font-semibold text-slate-700"'>{ticket?.assigned_to?.id || 'No asignado'}</td>
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
            {selectedTicket && <TicketDetails ticket={selectedTicket} handleClose={handleCloseModal} />} {/* Componente TicketDetails */}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;



