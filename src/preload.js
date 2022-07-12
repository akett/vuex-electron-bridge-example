// expose the vuex-electron-bridge contextBridge
import { exposeBridge } from "vuex-electron-bridge"

exposeBridge();

// expose your own contextBridge if needed
import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld('electron', {
  dispatch: (type, payload) => ipcRenderer.invoke('dispatch', { type, payload }),
  spawnRenderer: () => ipcRenderer.invoke('spawnRenderer'),
})