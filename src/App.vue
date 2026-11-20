<script setup lang="ts">
const onglets = [
  ['/', 'Accueil'],
  ['/lecons', 'Leçons'],
  ['/revision', 'Révision'],
  ['/reglages', 'Réglages'],
]
const actif = (chemin: string, courant: string) =>
  chemin === '/' ? courant === '/' : courant.startsWith(chemin) || (chemin === '/lecons' && courant.startsWith('/lecon/'))
</script>

<template>
  <RouterView v-if="$route.meta.plein" :key="$route.fullPath" />
  <template v-else>
    <main class="page"><RouterView :key="$route.fullPath" /></main>
    <nav class="onglets" aria-label="Navigation principale">
      <RouterLink v-for="[chemin, nom] in onglets" :key="chemin" :to="chemin" :class="{ actif: actif(chemin, $route.path) }">{{ nom }}</RouterLink>
    </nav>
  </template>
</template>
