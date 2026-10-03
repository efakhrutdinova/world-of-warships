import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import './styles/tokens.css'
import './styles/base.css'

const app = createApp(App)

/**
 * Last line of defence so an unexpected render error reaches the console once,
 * in a readable form, instead of surfacing as a blank page.
 */
app.config.errorHandler = (error, _instance, info) => {
  console.error(`[app] unhandled error while ${info}`, error)
}

app.use(createPinia())
app.use(router)
app.mount('#app')
