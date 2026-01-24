const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./db');

app.whenReady().then(async () => {
    await db.init();
    createWindow();
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 700,
    icon: path.join(__dirname, '../public/logo.png'),
    frame: false, // Disable default frame
    titleBarStyle: 'hidden', // Hide default title bar but keep window controls overlay on macOS if needed (optional)
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true
    }
  });

  // Window Controls IPC
  ipcMain.handle('window:minimize', () => {
    mainWindow.minimize();
  });

  ipcMain.handle('window:maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.restore();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.handle('window:close', () => {
    mainWindow.close();
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
