import { contextBridge, ipcRenderer } from 'electron';

// API personalizada expuesta en el renderer para solicitudes de red
contextBridge.exposeInMainWorld('api', {
  fetchApi: async (url, method = 'GET', body = null, headers = {}) => {
    try {
      // Obtener el token desde localStorage
      const token = localStorage.getItem('access_token');

      // Llama al proceso principal para realizar la petición API con todos los datos necesarios
      const response = await ipcRenderer.invoke('fetch-api', url, method, body, headers, token);
      return response; // Retorna la respuesta al renderer
    } catch (error) {
      console.error('Error en la API:', error);
      throw error; // Lanza el error para que sea manejado en el renderer
    }
  },
});

