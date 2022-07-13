'use strict'

import { app, BrowserWindow, ipcMain, protocol } from 'electron'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import path from "path"

// (1) ----- create vuex-electron-bridge with state persistence ----

import store from "./store";
import { createBridge } from "vuex-electron-bridge";

const vuexBridge = createBridge(store, { persist: true });
// you can optionally call Bridge.mount(), passing your store and options to it
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
const createWindow    = (x = 20, y = 20) => new BrowserWindow({ x, y, ...windowOptions }).loadURL(windowURL);
const windowURL       = (isDeployed() ? 'app://./' : process.env.WEBPACK_DEV_SERVER_URL) + 'index.html';
const windowOptions   = {
  title: process.env.npm_package_name,
  width: 600,
  height: 600,
  show: true,
  webPreferences: {
    preload: path.resolve(__dirname, 'preload.js'), // required
    contextIsolation: true, // required
    sandbox: true, // remaining are optional
    webSecurity: true,
    nodeIntegration: false,
    nodeIntegrationInWorker: false,
    enableRemoteModule: false,
  },
}

// (3) ----- set up custom IPC listeners -----

// simple IPC alias for store.dispatch. Allows renderers to dispatch to the main process instead of locally.
// this is just for example's sake - if you don't have code that must execute on main, you don't need this.
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
  BrowserWindow.getAllWindows().forEach(win => win.destroy())

  // unmount our Bridge instance
  vuexBridge.unmount();
  // since we are using persistence, we place this here in 'before-quit' to make one final attempt at persistence, this
  // handles a case where the state may have recently changed and persistThrottle wouldn't save it before the app quits.
  // of course, call unmount() anywhere you like, or not at all (e.g. if you aren't persisting).
})