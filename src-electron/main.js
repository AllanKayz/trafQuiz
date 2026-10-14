const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const { runMigrations } = require('./migration-runner');

app.whenReady().then(async () => {
    // Set strict Content Security Policy (CSP) headers
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http://localhost:*;"
                ]
            }
        });
    });

    try {
        await runMigrations();
    } catch (err) {
        console.error('Migration failed during startup:', err);
    }
    createWindow();
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1024,
    minHeight: 720,
    icon: path.join(__dirname, '../public/logo.ico'),
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false // Sandbox false allows preload script access required for IPC bridge
    }
  });

  // Secure navigation & external links handling
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const parsedUrl = new URL(url);
    if (parsedUrl.origin !== 'http://localhost:4200' && !url.startsWith('file://')) {
      event.preventDefault();
      console.warn(`[Security] Navigation blocked to external URL: ${url}`);
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    console.warn(`[Security] Prevented opening new window for URL: ${url}`);
    return { action: 'deny' };
  });

  // Window Controls IPC
  ipcMain.handle('window:minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.handle('window:maximize', () => {
    if (!mainWindow) return;
    if (mainWindow.isMaximized()) {
      mainWindow.restore();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.handle('window:close', () => {
    if (mainWindow) mainWindow.close();
  });

  const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
  
  if (isDev) {
    console.log('Running in development mode');
    const loadApp = () => {
        mainWindow.loadURL('http://localhost:4200').catch((err) => {
            console.log('Server not ready, retrying...', err);
            setTimeout(loadApp, 1000);
        });
    };
    loadApp();
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, '../dist/trafquiz/browser/index.html');
    mainWindow.loadFile(indexPath).catch(err => {
        console.error('Failed to load local app:', err);
    });
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

// Import and register IPC handlers
require('./ipc-handlers/auth-handler');
require('./ipc-handlers/dashboard-handler');
require('./ipc-handlers/questions-handler');
require('./ipc-handlers/students-handler');
require('./ipc-handlers/instructors-handler');
require('./ipc-handlers/lessons-handler');
require('./ipc-handlers/admin-handler');
require('./ipc-handlers/vehicles-handler');
require('./ipc-handlers/misc-handler');
require('./ipc-handlers/messages-handler');
require('./ipc-handlers/exam-handler');
require('./ipc-handlers/finances-handler');
require('./ipc-handlers/reports-handler');
