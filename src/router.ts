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
