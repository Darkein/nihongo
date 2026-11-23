import { createRouter, createWebHashHistory } from 'vue-router'
import Accueil from './views/Accueil.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', component: Accueil },
    { path: '/lecons', component: () => import('./views/Lecons.vue') },
    { path: '/lecon/:id', component: () => import('./views/Lecon.vue'), props: true },
    { path: '/lecon/:id/resume', component: () => import('./views/Resume.vue'), props: true },
    { path: '/entrainer', component: () => import('./views/Entrainer.vue') },
    { path: '/entrainer/kana', component: () => import('./views/TousLesKana.vue') },
    { path: '/entrainer/nombres', component: () => import('./views/Nombres.vue') },
    { path: '/compter', component: () => import('./views/Compter.vue'), meta: { plein: true } },
    { path: '/session', component: () => import('./views/Session.vue'), meta: { plein: true } },
    { path: '/tracer/:kana', component: () => import('./views/Tracer.vue'), props: true, meta: { plein: true } },
    { path: '/reglages', component: () => import('./views/Reglages.vue') },
    { path: '/:reste(.*)', redirect: '/' },
  ],
})

// Après une mise en ligne, une page restée ouverte réclame les anciens fichiers des pages
// (leur nom change à chaque version) : ils n'existent plus, la navigation échoue en silence
// et les boutons ne répondent plus. On recharge alors sur la page visée, une fois au plus
// par minute pour ne pas boucler si le réseau est vraiment coupé.
const CLE = 'nihongo-rechargement'
export function recharger(cible?: string) {
  try {
    const dernier = Number(sessionStorage.getItem(CLE))
    if (Date.now() - dernier < 60_000) return false
    sessionStorage.setItem(CLE, String(Date.now()))
  } catch {}
  if (cible) history.replaceState(history.state, '', `#${cible}`)
  location.reload()
  return true
}
export const fichierManquant = (e: unknown) =>
  e instanceof Error && /dynamically imported module|module script failed|Importing a module script failed|Unable to preload/i.test(e.message)

router.onError((erreur, cible) => {
  if (!fichierManquant(erreur) || !recharger(cible.fullPath)) console.error(erreur)
})
