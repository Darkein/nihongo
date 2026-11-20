<template>
  <header class="entete">
    <RouterLink to="/" class="marque"><span class="sceau">あ</span> Nihongo</RouterLink>
    <RouterLink to="/reglages">Réglages</RouterLink>
  </header>
  <main><RouterView :key="$route.fullPath" /></main>
</template>
