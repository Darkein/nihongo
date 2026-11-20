import { createRouter, createWebHashHistory } from 'vue-router'
import Accueil from './views/Accueil.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', component: Accueil },
    { path: '/lecon/:id', component: () => import('./views/Lecon.vue'), props: true },
    { path: '/session', component: () => import('./views/Session.vue') },
    { path: '/tracer/:kana', component: () => import('./views/Tracer.vue'), props: true },
    { path: '/reglages', component: () => import('./views/Reglages.vue') },
    { path: '/:reste(.*)', redirect: '/' },
  ],
})
