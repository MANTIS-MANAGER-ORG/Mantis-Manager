import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './authContext';
import { useApi } from '../hooks/apiHook'; // Importar el hook de API
// esto es una opción la otra sería refrescarlo en las mismas peticiones , se evaluará con mi compañero
const SessionContext = createContext();

export const useSession = () => {
  return useContext(SessionContext);
};

export const SessionProvider = ({ children }) => {
  const { logout } = useAuth();
  const { fetchApi } = useApi(); // Utilizar el hook de API

  const [showNotification, setShowNotification] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false); // Nueva variable para gestionar expiración
  const sessionDuration = 1000 * 60 * 15; // 15 minutos
  const warningDuration = 1000 * 60 * 13; // 13 minutos para advertencia

  const resetTimer = () => {
    setShowNotification(false);
    setSessionExpired(false); // Reiniciamos la expiración

    const id = setTimeout(() => {
      setShowNotification(true); // Mostrar advertencia después de 13 minutos
    }, warningDuration);

    // Limpia el temporizador existente si existe
    return id;
  };

  const refreshToken = async () => {
    console.log('Refrescando token...');
    const url = 'https://mantis-manager-production-ce86.up.railway.app/token/refresh'; // Endpoint para refrescar el token

    try {
      const data = await fetchApi(url, 'POST'); // Utilizar el hook de API para refrescar token
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refreshToken);
      setShowNotification(false); // Ocultar la notificación si el token se refresca correctamente
    } catch (error) {
      console.error('Error refrescando token:', error);
    }
  };

  useEffect(() => {
    const timeoutId = resetTimer();

    // Tiempo de expiración de la sesión (15 minutos)
    const sessionTimeout = setTimeout(() => {
      setSessionExpired(true); // Marcar como sesión expirada
      setShowNotification(true); // Mostrar notificación personalizada
    }, sessionDuration);

    // Limpia los temporizadores al desmontar
    return () => {
      clearTimeout(sessionTimeout);
      clearTimeout(timeoutId);
    };
  }, []);

  // Manejar clic en continuar
  const handleContinue = () => {
    refreshToken(); // Refrescar el token
    setShowNotification(false); // Cerrar la notificación
    resetTimer(); // Reiniciar el temporizador
  };

  // Manejar clic en salir
  const handleLogout = () => {
    setShowNotification(false); // Cerrar la notificación
    logout(); // Llamar a la función de logout
  };

  return (
    <SessionContext.Provider value={{ refreshToken }}>
      {children}
      {showNotification && (
        <div className='bg-yellow-300 p-2 fixed bottom-4 right-4 z-10'>
          {sessionExpired ? (
            <p>Tu sesión ha expirado. Por favor, inicia sesión nuevamente.</p>
          ) : (
            <p>Tu sesión está a punto de expirar. ¿Deseas seguir?</p>
          )}
          {!sessionExpired && (
            <button className='pr-4' onClick={handleContinue}>Seguir</button>
          )}
          <button onClick={handleLogout}>Salir</button>
        </div>
      )}
    </SessionContext.Provider>
  );
};
