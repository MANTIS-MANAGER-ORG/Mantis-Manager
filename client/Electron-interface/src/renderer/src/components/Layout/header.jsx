import React, { useState } from 'react';
import { HiCog, HiBell, HiSearch, HiMoon, HiSun } from 'react-icons/hi';
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
        <div className="flex items-center space-x-4">
          <div className="logo w-10 h-10 flex justify-center items-center bg-gray-700 rounded-full">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white">
              <path
                d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Mantis Manager</h2>
        </div>

        <div className="hidden md:flex space-x-6">
          <button onClick={() => onTabChange('board')} className="text-gray-300 hover:text-white transition duration-300">
            Board
          </button>
          <button onClick={() => onTabChange('maquinas')} className="text-gray-300 hover:text-white transition duration-300">
            Máquinas
          </button>
          <button onClick={() => onTabChange('tickets')} className="text-gray-300 hover:text-white transition duration-300">
            Tickets
          </button>
          {userRole === 1 && (
            <button onClick={() => onTabChange('desarrollo')} className="text-gray-300 hover:text-white transition duration-300">
              Desarrollo
            </button>
          )}
          {userRole === 4 && (
            <button onClick={() => onTabChange('mantenimiento')} className="text-gray-300 hover:text-white transition duration-300">
              Mantenimiento
            </button>
          )}
          {(userRole === 4 || userRole === 2) && (
            <button onClick={() => onTabChange('Gestion ticktes')} className="text-gray-300 hover:text-white transition duration-300">
              Gestión Ticktes
            </button>
          )}
        </div>

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
