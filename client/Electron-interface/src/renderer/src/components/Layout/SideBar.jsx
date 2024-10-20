import React, { useState } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { FaTicketAlt, FaTools, FaProjectDiagram, FaDesktop, FaCog } from 'react-icons/fa'; // Importar iconos
import { useAuth } from '../context/authContext';
import SidebarTickets from '../TicketsContent/SidebarTickets';

const Sidebar = ({ activeTab, onTabChange }) => {
  const { userRole } = useAuth();
  const [isOpen, setIsOpen] = useState(true); // Estado para abrir/cerrar el sidebar

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <aside className={`transition-all duration-300 shadow-lg ${isOpen ? 'bg-gray-900 w-64' : 'bg-gray-800 w-20'}`}>
      {/* Toggle Button */}
      <div className="flex justify-end">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-l-lg bg-gray-700 hover:bg-gray-600 transition duration-300"
        >
          {isOpen ? <HiChevronLeft size={20} /> : <HiChevronRight size={20} />}
        </button>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col items-center py-6">
        <div className="w-16 h-16 bg-cover bg-center rounded-full border-2 border-gray-600 mb-2"
             style={{ backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/a114458c-9a52-45d0-9740-8dc760b86b4e.png")' }}>
        </div>
        <h2 className={`text-sm font-semibold text-center text-gray-100 transition-all duration-300 ${isOpen ? 'block' : 'hidden'}`}>
          Ed Roh
        </h2>
        <h3 className={`text-xs font-medium text-center text-gray-400 transition-all duration-300 ${isOpen ? 'block' : 'hidden'}`}>
          VP Fancy Admin
        </h3>
      </div>

      {/* Navigation Menu */}
      <nav className="px-4">
        <ul className="space-y-3">
          {/* Categoría de Tablero */}
          {isOpen && <li className="text-xs text-gray-500 font-light">Tablero</li>}
          <li onClick={() => onTabChange('board')} className={`flex items-center cursor-pointer ${activeTab === 'board' ? 'text-red-400' : 'text-gray-400'} hover:bg-gray-600`}>
            <FaDesktop className={`${isOpen ? 'block' : 'hidden'} text-gray-300 ml-2 text-sm`} />
            <span className={`${isOpen ? 'block' : 'hidden'} text-xs ml-2`}>Tablero</span>
          </li>

          {/* Categoría de Máquinas */}
          {isOpen && <li className="text-xs text-gray-500 font-light">Máquinas</li>}
          <li onClick={() => onTabChange('maquinas')} className={`flex items-center cursor-pointer ${activeTab === 'maquinas' ? 'text-red-400' : 'text-gray-400'} hover:bg-gray-600`}>
            <FaCog className={`${isOpen ? 'block' : 'hidden'} text-gray-300 ml-2 text-sm`} />
            <span className={`${isOpen ? 'block' : 'hidden'} text-xs ml-2`}>Máquinas</span>
          </li>
          {userRole === 4 && (
            <>
              <li onClick={() => onTabChange('mantenimiento')} className={`flex items-center cursor-pointer ${activeTab === 'mantenimiento' ? 'text-red-400' : 'text-gray-400'} hover:bg-gray-600`}>
                <FaTools className={`${isOpen ? 'block' : 'hidden'} text-gray-300 ml-2 text-sm`} />
                <span className={`${isOpen ? 'block' : 'hidden'} text-xs ml-2`}>Mantenimiento</span>
              </li>
            </>
          )}

          {/* Categoría de Tickets */}
          {isOpen && <li className="text-xs text-gray-500 font-light">Tickets</li>}
          <li onClick={() => onTabChange('tickets')} className={`flex items-center cursor-pointer ${activeTab === 'tickets' ? 'text-red-400' : 'text-gray-400'} hover:bg-gray-600`}>
            <FaTicketAlt className={`${isOpen ? 'block' : 'hidden'} text-gray-300 ml-2 text-sm`} />
            <span className={`${isOpen ? 'block' : 'hidden'} text-xs ml-2`}>Tickets</span>
          </li>

          {/* Componente adicional para 'tickets' si está activo */}
          {activeTab === 'tickets' && (
            <div className="mt-2">
              <SidebarTickets />
            </div>
          )}

          {(userRole === 4 || userRole === 2) && (
            <>
              <li onClick={() => onTabChange('Gestion ticktes')} className={`flex items-center cursor-pointer ${activeTab === 'Gestion ticktes' ? 'text-red-400' : 'text-gray-400'} hover:bg-gray-600`}>
                <FaTicketAlt className={`${isOpen ? 'block' : 'hidden'} text-gray-300 ml-2 text-sm`} />
                <span className={`${isOpen ? 'block' : 'hidden'} text-xs ml-2`}>Gestión Tickets</span>
              </li>
            </>
          )}

          {/* Sección de Roles */}
          {userRole === 1 && (
            <>
              {isOpen && <li className="text-xs text-gray-500 font-light">Desarrollo</li>}
              <li onClick={() => onTabChange('desarrollo')} className={`flex items-center cursor-pointer ${activeTab === 'desarrollo' ? 'text-red-400' : 'text-gray-400'} hover:bg-gray-600`}>
                <FaProjectDiagram className={`${isOpen ? 'block' : 'hidden'} text-gray-300 ml-2 text-sm`} />
                <span className={`${isOpen ? 'block' : 'hidden'} text-xs ml-2`}>Desarrollo</span>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;


