const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Add methods here if needed, e.g.
  // setTitle: (title) => ipcRenderer.send('set-title', title)
});
