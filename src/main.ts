import { createApp, watchEffect } from 'vue'
import App from './App.vue'
import { router } from './router'
import { progression } from './srs/store'
import '@fontsource-variable/figtree'
import './style.css'

watchEffect(() => (document.documentElement.dataset.theme = progression.theme))

createApp(App).use(router).mount('#app')

// Police des filigranes japonais : son CSS est lourd (une règle par tranche de caractères),
// on le charge après le premier affichage pour ne pas le retarder.
void import('@fontsource-variable/murecho')

// Mise à jour automatique : dès qu'une nouvelle version est publiée, le service worker
// la récupère et la page se recharge toute seule. Une app installée pouvant rester ouverte
// longtemps en arrière-plan, on vérifie aussi à chaque retour sur l'app.
if (import.meta.env.PROD) {
  void import('virtual:pwa-register').then(({ registerSW }) =>
    registerSW({
      immediate: true,
      onRegisteredSW(_url, registration) {
        if (!registration) return
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible' && navigator.onLine) void registration.update()
        })
      },
    }),
  )
}
