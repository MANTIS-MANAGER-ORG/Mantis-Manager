import React, { useState } from 'react';
import { HiCog, HiBell, HiMoon, HiSun } from 'react-icons/hi';
import { useAuth } from '../context/authContext'; // Asegúrate de que la ruta sea correcta
import { useTheme } from '../context/ThemeContext'; // Importa useTheme
import Ajustes from '../settings/ajustes';
import TicketNotifications from '../Notificación/notificacion';

const Header = ({ onTabChange }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { userRole } = useAuth(); // Obtener el rol del usuario desde el contexto
  const { darkMode, toggleDarkMode } = useTheme(); // Obtén el estado y función del contexto

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  return (
    <header className="bg-gray-800 text-white shadow-md p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Mantis Manager</h2>

        <div className="flex items-center space-x-4">
          <div className="flex space-x-3">
            <button onClick={toggleNotifications} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition duration-300">
              <HiBell className="text-white" size={20} />
            </button>
            <button onClick={toggleSettings} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition duration-300">
              <HiCog className="text-white" size={20} />
            </button>

            {/* Botón para alternar modo oscuro */}
            <button onClick={toggleDarkMode} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition duration-300">
              {darkMode ? <HiSun className="text-yellow-400" size={20} /> : <HiMoon className="text-white" size={20} />}
            </button>
          </div>

          {isSettingsOpen && <Ajustes />}
          {isNotificationsOpen && (
            <div className="absolute top-16 right-4 bg-white shadow-lg rounded-lg p-4 w-80">
              <TicketNotifications />
            </div>
          )}

          <div
            className="w-10 h-10 rounded-full bg-cover bg-center"
            style={{ backgroundImage: 'url("https://cdn.usegalileo.io/avatars/1.png")' }}
          ></div>
        </div>
      </div>
    </header>
  );
};

export default Header;

