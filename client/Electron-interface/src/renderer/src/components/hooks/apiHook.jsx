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
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`, // Agregar token si existe
        },
        body: isFormData ? body : body ? JSON.stringify(body) : null,// se vuelve el objeto js un json 
      };

      console.log(body);
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

  const fetchPdf = async (url, method = 'GET', body = null, headers = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Configurar opciones de la solicitud
      const options = {
        method,
        headers: {
          ...headers,
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`, // Agregar token si existe
        },
        body: body ? JSON.stringify(body) : null,
      };

      console.log('Opciones de la solicitud para PDF:', options);

      // Realizar la solicitud
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.statusText}`);
      }

      // Comprobar si la respuesta es un PDF
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/pdf')) {
        const pdfBlob = await response.blob();
        return { data: pdfBlob, isPdf: true }; // Retornar el Blob y un flag indicando que es PDF
      }

      throw new Error('La respuesta no es un PDF.');
    } catch (error) {
      console.error('Error en la solicitud para PDF:', error.message);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { fetchApi, fetchPdf, loading, error };
};
