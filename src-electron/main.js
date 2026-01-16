const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, '../public/logo.ico')
  });

  // Load the Angular app.
  // In development, we might want to wait for the local server to start.
  // For this "conversion", we are serving the Angular app via the Express server 
  // OR we are serving the Angular app separately?
  // The plan said Angular app makes requests to localhost:port/api.
  // We need to decide: Does Express serve the built Angular assets?
  // YES, that is the most robust way for a strictly "convert to electron" app.
  // So the Express server will serve static files from /dist/trafquiz/browser.
  
  // We will try to connect to the server.
  const loadApp = () => {
    mainWindow.loadURL('http://localhost:3000').catch((err) => {
        console.log('Server not ready, retrying...', err);
        setTimeout(loadApp, 1000);
    });
  };

  loadApp();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

const { spawn } = require('child_process');

// ...

function startServer() {
  // Use system 'node' to avoid Electron native module mismatch issues
  // We use current working directory as project root so require paths work relative to it if needed,
  // but better to keep CWD as is or ensure paths are absolute.
  // actually, let's keep CWD as the project root (.. from src-electron)
  serverProcess = spawn('node', [path.join(__dirname, 'server.js')], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  serverProcess.on('error', (err) => {
      console.error('Failed to start server:', err);
  });
}

app.on('ready', () => {
  startServer();
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

app.on('will-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
