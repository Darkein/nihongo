import { createApp, watchEffect } from 'vue'
import App from './App.vue'
import { router } from './router'
import { progression } from './srs/store'
import '@fontsource-variable/figtree'
import './style.css'

watchEffect(() => (document.documentElement.dataset.theme = progression.theme))

createApp(App).use(router).mount('#app')
