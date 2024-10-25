import { useState } from 'react';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchApi = async (url, method = 'GET', body = null, headers = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Detectar si el cuerpo es de tipo FormData para una carga de imagen
      const isFormData = body instanceof FormData;
      
      // Configurar opciones de la solicitud
      const options = {
        method,
        headers: {
          ...headers,
          // Solo agregar Content-Type si no es FormData
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`, // Agregar token si existe
        },
        // Configurar el cuerpo: serializar a JSON solo si no es FormData
        body: isFormData ? body : body ? JSON.stringify(body) : null,
      };

      console.log('Opciones de la solicitud:', options);

      // Realizar la solicitud
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.statusText}`);
      }

      // Parsear JSON solo si la respuesta no está vacía
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en la solicitud:', error.message);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { fetchApi, loading, error };
};
