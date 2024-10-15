import { contextBridge } from 'electron';

// API personalizada para exponer en el renderer
const api = {
  fetchApi: async (url, method = 'GET', body = null, headers = {}) => {
    
    const options = {
      method,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`, // O cualquier token que necesites
      },
      ...(body && { body: JSON.stringify(body) }),
    };
    console.log("hola soy options", options);
   


    try {
  
      // Aquí hacemos la solicitud a la API usando el contexto de Electron
      const response = await fetch(url, options);
      
      if (!response.ok) {
        // Intentar obtener el mensaje de error específico de la respuesta
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error en la solicitud');
        // Cambia 'detail' según lo que devuelve tu API
      }

      return await response.json();
    } catch (error) {
      // Manejar el error aquí, tal vez mostrando una alerta o registrándolo
      console.error('Error en la API:', error.message);
      throw error; // Vuelve a lanzar el error si deseas manejarlo más arriba
    }
  },
};

// Usar `contextBridge` para exponer las API de Electron al renderer
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api); // Exponer la API al contexto de la ventana
  } catch (error) {
    console.error(error);
  }
} else {
  window.api = api; // Para entornos sin aislamiento de contexto
}


