<script setup lang="ts">
import { watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const onglets = [
  ['/', 'Aujourd’hui'],
  ['/lecons', 'Leçons'],
  ['/entrainer', 'S’entraîner'],
]
const actif = (chemin: string, courant: string) =>
  chemin === '/'
    ? courant === '/'
    : courant.startsWith(chemin) || (chemin === '/lecons' && courant.startsWith('/lecon/'))

// La couleur de l'accueil s'applique à toute la page, barre d'onglets comprise.
// Avant la première navigation, la route vaut « / » par défaut : on attend qu'elle soit résolue.
watchEffect(() => route.matched.length && document.documentElement.classList.toggle('accueil', route.path === '/'))
// Les transitions de couleur ne servent qu'entre deux pages, pas au chargement.
useRouter()
  .isReady()
  .then(() => requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add('anime'))))
</script>

<template>
  <RouterView v-if="$route.meta.plein" :key="$route.fullPath" />
  <template v-else>
    <main class="page"><RouterView :key="$route.fullPath" /></main>
    <nav class="onglets" aria-label="Navigation principale">
      <p class="nom-app" lang="ja">日本語</p>
      <RouterLink v-for="[chemin, nom] in onglets" :key="chemin" :to="chemin" :class="{ actif: actif(chemin, $route.path) }">{{ nom }}</RouterLink>
      <RouterLink to="/reglages" class="roue" :class="{ actif: actif('/reglages', $route.path) }" aria-label="Réglages">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
          />
        </svg>
        <span class="libelle-roue">Réglages</span>
      </RouterLink>
    </nav>
  </template>
</template>
