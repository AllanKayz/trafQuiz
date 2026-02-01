const { BrowserWindow } = require('electron');

function broadcastChange(entity, action, data) {
    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send('data-change', { entity, action, data });
    });
}

module.exports = { broadcastChange };
