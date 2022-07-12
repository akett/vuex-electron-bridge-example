import { createApp } from 'vue'
import store from "./store"

import App from './App.vue'

const app = createApp(App)

// provide all components with $ access to our custom contextBridge (see preload.js)
app.config.globalProperties.$electron = window.electron || {}

// set some config
app.config.performance = false;
app.config.devtools    = false;

app.use(store)
   .mount('#app')