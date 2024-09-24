import './assets/scss/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import vue3GoogleLogin from 'vue3-google-login'

// Plugins
import { registerPlugins } from '@/plugins'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(vue3GoogleLogin, {
    clientId: '567094205545-j5ed0fqndfju3jnknb7ttn7q11vn5t7f.apps.googleusercontent.com'
  })

registerPlugins(app)

app.mount('#app')
