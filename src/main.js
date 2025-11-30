import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import FloatingVue from 'floating-vue'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'floating-vue/dist/style.css'
import auth from './auth.js'
import terminalCursor from './scripts/custom directives/terminalCursor.js'
import rubberButton from './scripts/custom directives/rubberButton.js'

const app = createApp(App)
app.use(auth)
app.use(router)
app.use(FloatingVue)
app.mount('#app')
app.directive('terminal-cursor', terminalCursor)
app.directive('rubber-button', rubberButton)
