import { createApp } from 'vue'
import App from './App.vue'
import store from "./store"

const app = createApp(App)

// provide all Vue components with '$electron' property
app.config.globalProperties.$electron = window.electron || {}
// (see definition in preload.js, see App.vue for usage)

app
  .use(store)
  .mount('#app')