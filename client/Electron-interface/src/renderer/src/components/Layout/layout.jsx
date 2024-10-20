import React, { useState } from 'react';
import Header from './header';
import Sidebar from './SideBar';
import MainContent from './mainContent';
import { TicketProvider } from "../context/ticketContext";
import { MachineProvider } from '../context/MachineContext'; // Asegúrate de que la ruta sea correcta
import { Routes, Route } from 'react-router-dom';
import Ajustes from '../settings/ajustes';
import Profile from '../Perfil/perfil';
import './Layout.css';

const Layout = () => {
    const [activeTab, setActiveTab] = useState("queque");

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <TicketProvider>
            <MachineProvider>
                <div className="app-container">
                    <Header onTabChange={handleTabChange} />
                    <div className="main-container">
                        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
                        <MainContent activeTab={activeTab} />

                        {/* Define las rutas aquí */}
                        <Routes>
                            <Route path="profile" element={<Profile />} />
                            <Route path="perfil/seguridad" element={<Ajustes />} />
                        </Routes>
                    </div>
                </div>
            </MachineProvider>
        </TicketProvider>
    );
};

export default Layout;
