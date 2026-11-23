<script setup lang="ts">
import JpText from './JpText.vue'

defineProps<{ titre: string; sur: string; filigrane: string }>()
</script>

<template>
  <header class="entete">
    <p class="sur"><JpText :texte="sur" /></p>
    <h1>{{ titre }}</h1>
    <span class="filigrane" lang="ja" aria-hidden="true">{{ filigrane }}</span>
  </header>
</template>
