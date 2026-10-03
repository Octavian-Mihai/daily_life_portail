const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('portailStore', {
  load: () => ipcRenderer.invoke('store:load'),
  save: (data) => ipcRenderer.invoke('store:save', data),
});
