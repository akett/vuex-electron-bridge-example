'use strict'

import { app, BrowserWindow, ipcMain, protocol } from 'electron'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import path from "path"
import store from "./store";
import { createBridge } from "vuex-electron-bridge";

// (1) ----- setup vuex-electron-bridge with persistence ----

const vuexBridge = createBridge(store, { persist: true });
// - createBridge(), when called with your store, will immediately
//   mount itself. Mounting registers the IPC listeners and (if using
//   persistence) attempts to load the persisted state from storage.

// - You can delay mounting by passing no arguments to createBridge(),
//   then at some later point you would call Bridge.mount(store, options).
//   In this example it would be vuexBridge.mount(store, { persist: true })

// - If you aren't going to use 'Bridge.mount()' or 'Bridge.unmount()'
//   you don't have to save createBridge() to a variable. Just call it directly:
//   createBridge(store, { persist: true });

// - Go to (3) to see the required webPreferences for renderers.
// - Go to (7) to see usage of 'Bridge.unmount()' (at the bottom).

// (2) ----- do some setup / define some helpers -----

const isDeployed      = () => typeof process.env.WEBPACK_DEV_SERVER_URL === 'undefined';
const isDevelopment   = () => !isDeployed() || process.env.NODE_ENV === 'development';
const installDevtools = () => isDevelopment() ? installExtension(VUEJS_DEVTOOLS) : Promise.resolve()
const registerSchemes = (schemes) => !isDeployed() ? null : protocol.registerSchemesAsPrivileged(schemes);
const installProtocol = () => !isDeployed() ? null : createProtocol('app');
registerSchemes([{ scheme: 'app', privileges: { secure: true, standard: true } }]); // enables app://

// (3) ----- create renderers with contextIsolation and preload -----

const createWindow = (x = 20, y = 20) => new BrowserWindow({
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

// (4) ----- set up some IPC listeners -----

// provide simple IPC alias for store.dispatch on the main process.
ipcMain.handle('dispatch', (e, { type, payload }) => {
  console.log(type, payload || '') // show what's happening in console
  return store.dispatch(type, payload) // return dispatch (since it's a promise anyways)
              .then(() => console.log(store.state.counter)); // show new counter value
});

// spawn another window slightly to the right of the calling window
ipcMain.handle('spawnRenderer', async (e) => {
  const bounds = BrowserWindow.fromWebContents(e.sender).getNormalBounds();
  return await createWindow(bounds.x + 350, bounds.y)
})

// (5) ----- handle quit signals -----

process.on('SIGTERM', () => app.quit())
process.on('SIGINT', () => app.quit())
process.on('SIGQUIT', () => app.quit())
process.on('message', (data) => data === 'graceful-exit' ? app.quit() : null)

// (6) ----- handle app start -----

app.on('ready', async () => {
  installProtocol(); // enables app://
  await installDevtools();
  await createWindow(20, 20);
});

// (7) ----- handle app shutdown / unmount() the Bridge instance -----

app.on('before-quit', () => {
  vuexBridge.unmount();
  // - unmount() unregisters the IPC listeners and (if using persistence)
  //   makes an attempt to save the state one last time.

  // - Since we are using persistence, we placed this here in 'before-quit'.
  //   This is to handle a case where the state may have recently changed,
  //   but the app quits before 'persistThrottle' would have fired a state save.

  // - Of course, you don't have to use unmount(), (especially if not persisting)
  //   and you can call it anywhere that makes sense in your application.
})