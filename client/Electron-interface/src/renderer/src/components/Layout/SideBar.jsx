import React from 'react';
import SidebarTickets from '../TicketsContent/SidebarTickets';

/**
 * props que ayuda a cambiar el contenido de la barra de herramientas
 * según seleccionado en el header.
 * 
 * @param {Object} props - Props del componente.
 * @param {string} props.activeTab - El nombre de la pestaña activa que determina qué ícono resaltar.
 * 
 * @returns {React.ReactElement} - La barra lateral con íconos para las pestañas.
 */
const Sidebar = ({ activeTab }) => {
  return (
    <aside className="w-16 bg-gray-800 text-gray-100 shadow-lg flex flex-col items-center py-6">
      {/* Imagen de perfil o logo */}
      <div
        className="w-12 h-12 bg-cover bg-center rounded-full border-2 border-gray-700 mb-4"
        style={{ backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/a114458c-9a52-45d0-9740-8dc760b86b4e.png")' }}
      ></div>

      <nav>
        <ul className="space-y-4">
          {/* Ícono para la pestaña 'board' */}
          {activeTab === 'board' && (
            <li className={`flex items-center justify-center w-10 h-10 rounded-full ${activeTab === 'board' ? 'bg-gray-800 text-blue-400' : 'bg-gray-700 text-gray-400'} hover:bg-gray-600`}>
              <span className="text-lg font-semibold">B</span>
            </li>
          )}
          
          {/* Ícono para la pestaña 'maquinas' */}
          {activeTab === 'maquinas' && (
            <li className={`flex items-center justify-center w-10 h-10 rounded-full ${activeTab === 'maquinas' ? 'bg-gray-800 text-green-400' : 'bg-gray-700 text-gray-400'} hover:bg-gray-600`}>
              <span className="text-lg font-semibold">M</span>
            </li>
          )}
          
          {/* Ícono para la pestaña 'tickets' */}
          {activeTab === 'tickets' && (
            <div>
              <div className=' m-auto flex'>
              <li className={`flex items-center justify-center w-20 h-10 rounded-full ${activeTab === 'tickets' ? 'bg-gray-800 text-yellow-400' : 'bg-gray-700 text-gray-400'} hover:bg-gray-600`}>
                <span className="text-lg font-semibold">T</span>
              </li>
              </div>
              {/* Componente adicional para 'tickets' */}
              <SidebarTickets className="mt-8" />
            </div>
          )}

          {/* Ícono para la pestaña 'settings'  esto se va a borrar*/}
          {activeTab === 'settings' && (
            <li className={`flex items-center justify-center w-10 h-10 rounded-full ${activeTab === 'settings' ? 'bg-gray-800 text-red-400' : 'bg-gray-700 text-gray-400'} hover:bg-gray-600`}>
              <span className="text-lg font-semibold">S</span>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
