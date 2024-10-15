import { useState } from 'react';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchApi = async (url, method = 'GET', body = null, headers = {}) => {
    setLoading(true);
    setError(null);
    console.log(body);

    try {
      const options = {
        method,
        headers: {
          ...headers,
          
          'Content-Type': 'application/json',

          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`, // Agregar el token si existe
        },
        ...(body && { body: JSON.stringify(body) }),
      };


      console.log(localStorage.getItem('access_token'));

      // Usar la función fetchApi expuesta en el preload
      const response = await window.api.fetchApi(url, method, body, headers);

      return response; // Devolver los datos obtenidos
    } catch (error) {
      console.error('Error en la solicitud:', error.message);
      setError(error.message);
      throw error; // Lanzar el error para manejarlo en el componente
    } finally {
      setLoading(false); // Cambiar loading a false al final
    }
  };

  return { fetchApi, loading, error }; // Retornar fetchApi, loading y error
};

