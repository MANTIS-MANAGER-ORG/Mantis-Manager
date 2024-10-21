import React from 'react';
import TicketsBoard from '../TicketsContent/TicketBoard';
import Ajustes from '../settings/ajustes';
import Maquina from '../Maquina/maquina';
import Board from '../board/board';
import Desarrollo from'../Gestión de usuario/userG';
import Mantenimiento from '../Mantenimietno/Mantenimiento'
import ListaSolicitudes from '../Gestion Ticktes/RequestList'

import ListaTickets from '../Gestion Ticktes/TieckteList'

/**
 * Componente principal para mostrar el contenido basado en la pestaña activa.
 * 
 * @param {Object} props - Props del componente.
 * @param {string} props.activeTab - El nombre de la pestaña activa que determina qué contenido mostrar.
 * 
 * @returns {React.ReactElement} - El contenido principal basado en la pestaña activa.
 */
const MainContent = ({ activeTab }) => {

  // Renderiza el contenido basado en el valor de activeTab
  return (
    <main className="main-content">
      <div className="tabs">
        {/* cambio de pestaña dado por active tab que  viene del header  */}
      </div>
      <div className="content-box">
        {activeTab === 'board' && <Board/>}
        {activeTab === 'Lista tickets'&& <ListaTickets/>}
        {activeTab === 'maquinas' && <Maquina />}
        {activeTab === 'tickets' && <TicketsBoard />}
        {activeTab === 'desarrollo'&& <Desarrollo/>}
        {activeTab === 'mantenimiento'&& <Mantenimiento/>}
        {activeTab === 'Lista Solicitudes' && <ListaSolicitudes/>}
        
      </div>
    </main>
  );
};

export default MainContent;


