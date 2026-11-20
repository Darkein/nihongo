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
    { path: '/revision', component: () => import('./views/Revision.vue') },
    { path: '/session', component: () => import('./views/Session.vue'), meta: { plein: true } },
    { path: '/tracer/:kana', component: () => import('./views/Tracer.vue'), props: true, meta: { plein: true } },
    { path: '/reglages', component: () => import('./views/Reglages.vue') },
    { path: '/:reste(.*)', redirect: '/' },
  ],
})
