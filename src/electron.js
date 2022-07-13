'use strict'

import { app, BrowserWindow, ipcMain, protocol } from 'electron'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import path from "path"

// (1) ----- create vuex-electron-bridge with state persistence ----
import store from "./store";
import { createBridge } from "vuex-electron-bridge";

// immediately create and mount the bridge by passing the store
const vuexBridge = createBridge(store, { persist: true });
// you can also delay mounting by passing no args here, and then Bridge.mount(store, options) later
// see the usage of 'Bridge.unmount()' at the very bottom


// (2) ----- do some setup / define some helpers -----
const isDeployed    = () => typeof process.env.WEBPACK_DEV_SERVER_URL === 'undefined';
const isDevelopment = () => !isDeployed() || process.env.NODE_ENV === 'development';

// protocol helpers - enables usage of app://
const registerSchemes = (schemes) => !isDeployed() ? null : protocol.registerSchemesAsPrivileged(schemes);
const installProtocol = () => !isDeployed() ? null : createProtocol('app');
registerSchemes([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

// window helpers
const installDevtools = async () => isDevelopment() ? await installExtension(VUEJS3_DEVTOOLS) : Promise.resolve()
const createWindow    = (x = 20, y = 20) => new BrowserWindow({
  x, y,
  width: 600,
  height: 600,
  show: true,
  webPreferences: {
    preload: path.resolve(__dirname, 'preload.js'), // required
    contextIsolation: true, // required
    sandbox: true, // this and the rest are optional
    webSecurity: true,
    nodeIntegration: false,
    nodeIntegrationInWorker: false,
    enableRemoteModule: false,
  },
}).loadURL((isDeployed() ? 'app://./' : process.env.WEBPACK_DEV_SERVER_URL) + 'index.html');


// (3) ----- set up custom IPC listeners -----
// provides simple IPC alias for store.dispatch on the main process.
ipcMain.handle('dispatch', (e, { type, payload }) => {
  console.log(type, payload || '') // show what's happening in console
  return store.dispatch(type, payload) // return dispatch (since it's a promise anyways)
              .then(() => console.log(store.state.counter)); // show new counter value
});

// spawns another window slightly to the right of the calling window
ipcMain.handle('spawnRenderer', async (e) => {
  const bounds = BrowserWindow.fromWebContents(e.sender).getNormalBounds();
  return await createWindow(bounds.x + 350, bounds.y)
})


// (4) ----- handle quit signals -----
process.on('SIGTERM', () => app.quit())
process.on('SIGINT', () => app.quit())
process.on('SIGQUIT', () => app.quit())
process.on('message', (data) => data === 'graceful-exit' ? app.quit() : null)


// (5) ----- handle app start -----
app.on('ready', async () => {
  installProtocol();
  await installDevtools();
  await createWindow(20, 20);
});


// (6) ----- handle app quit -----
app.on('before-quit', () => {
  // unmount our Bridge instance
  vuexBridge.unmount();
  // since we are using persistence, we place this here in 'before-quit' to make one final attempt at persistence, this
  // handles a case where the state may have recently changed and persistThrottle wouldn't save it before the app quits.
  // of course, call unmount() anywhere you like, or not at all (e.g. if you aren't persisting).
})