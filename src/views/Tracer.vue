<script setup lang="ts">
import { ref } from 'vue'
import Trace from '../components/Trace.vue'

defineProps<{ kana: string }>()
const essai = ref(0)
</script>

<template>
  <section class="bloc exercice">
    <Trace :key="essai" :kana="kana" @fini="essai++" />
  </section>
  <button class="bouton" type="button" @click="$router.back()">Retour</button>
</template>
