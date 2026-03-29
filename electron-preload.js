const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  captureScreenshot: () => ipcRenderer.invoke('capture-screenshot'),
  toggleCompact: () => ipcRenderer.invoke('toggle-compact'),
  getCompactState: () => ipcRenderer.invoke('get-compact-state'),
  minimizeToTray: () => ipcRenderer.invoke('minimize-to-tray'),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-always-on-top'),
  closeApp: () => ipcRenderer.invoke('close-app'),
  isElectron: true,
});
