import React, { useState } from 'react';
import TicketList from './TieckteList';
import RequestsManager from './RequestManager';
import { HiChevronDown } from 'react-icons/hi';
import { useTicketContext } from '../context/ticketContext';

const TicketsManager = () => {
  const {activeSession, setActiveSection}= useTicketContext();
  const [menuOpen, setMenuOpen] = useState(false);
  

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleSelectSection = (section) => {
    setActiveSection(section);
    setMenuOpen(false);
  };

  return (
    <div className="bg-white min-h-screen p-6 relative">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Gestión de Tickets</h1>

      <div className="flex justify-center mb-4 relative">
        <button
          onClick={toggleMenu}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition duration-300"
        >
          <span className="mr-2">Gestión de Tickets</span>
          <HiChevronDown />
        </button>

        {menuOpen && (
          <div className="absolute top-12 bg-white rounded-lg mt-2 w-56 z-10">
            <ul className="flex flex-col">
              <li>
                <button
                  onClick={() => handleSelectSection('list')}
                  className="w-full text-left px-4 py-2 hover:bg-blue-100 focus:outline-none"
                >
                  Lista de Tickets
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleSelectSection('requests')}
                  className="w-full text-left px-4 py-2 hover:bg-blue-100 focus:outline-none"
                >
                  Gestión de Solicitudes
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Mostrar componente según la sección activa */}
      {activeSession=== 'list' && (
        
        
          <TicketList />
        
      )}

      {activeSession === 'requests' && (
        <div className="bg-white rounded-lg mt-4 mx-auto w-3/4 p-6">
          <h2 className="text-2xl font-semibold mb-4  text-black text-center">Gestión de Solicitudes</h2>
          <RequestsManager />
        </div>
      )}
    </div>
  );
};

export default TicketsManager;
