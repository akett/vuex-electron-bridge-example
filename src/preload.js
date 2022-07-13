import { contextBridge, ipcRenderer } from "electron"
import { exposeBridge } from "vuex-electron-bridge"

// expose the vuex-electron-bridge API
exposeBridge();

// expose the API required for this example app
contextBridge.exposeInMainWorld('electron', {
  dispatch: (type, payload) => ipcRenderer.invoke('dispatch', { type, payload }),
  spawnRenderer: () => ipcRenderer.invoke('spawnRenderer'),
})