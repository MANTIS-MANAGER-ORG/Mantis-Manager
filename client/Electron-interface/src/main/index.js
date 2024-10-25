const { app, shell, BrowserWindow, ipcMain } = require('electron');
const { join } = require('path');
const { electronApp, optimizer, is } = require('@electron-toolkit/utils');
const fs = require('fs');
const FormData = require('form-data');

// Maneja las peticiones de red
ipcMain.handle('fetch-api', async (event, url, method , body, headers, token = null) => {
  const urlImage = 'https://mantis-manager-production-ce86.up.railway.app/users/upload/'; 
  let options;

  // Si la URL es para subir una imagen
  if (url.startsWith(urlImage)) {
    const formData = new FormData();
    if (body?.filePath) {
      formData.append('file', fs.createReadStream(body.filePath)); // Leer y adjuntar archivo
    }

    options = {
      method,
      headers: {
        ...formData.getHeaders(),
        ...headers,
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    };
  } else {
    // Para solicitudes normales
    options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      ...(body && { body: JSON.stringify(body) }),
    };
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error en la solicitud');
    }

    return response.headers.get('content-type')?.includes('application/json')
      ? await response.json()
      : response;
  } catch (error) {
    console.error('Error fetching API:', error);
    throw new Error('Failed to fetch API');
  }
});

// Configuración de la ventana principal
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => mainWindow.show());

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
