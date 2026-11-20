<script setup lang="ts">
import { ref } from 'vue'
import Trace from '../components/Trace.vue'

defineProps<{ kana: string }>()
const essai = ref(0)
</script>

<template>
  <div class="session" style="--teinte: #7cc6fe">
    <header class="barre-session">
      <button class="fermer" type="button" aria-label="Retour" @click="$router.back()">✕</button>
      <span class="ou-titre">Tracé libre</span>
    </header>
    <section class="exercice">
      <Trace :key="essai" :kana="kana" @fini="essai++" />
    </section>
  </div>
</template>
