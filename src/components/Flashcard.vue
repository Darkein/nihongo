<script setup lang="ts">
import { ref } from 'vue'
import Barre from './Barre.vue'
import JpText from './JpText.vue'

defineProps<{ recto: string; verso: string; rectoJp?: boolean; versoJp?: boolean; audio?: string }>()
defineEmits<{ fini: [juste: boolean] }>()

const retournee = ref(false)
</script>

<template>
  <div class="carte" :class="{ voilee: !retournee }">
    <p class="recto" :class="{ grand: rectoJp }"><JpText :texte="recto" :romaji="rectoJp" /></p>
    <p class="verso" :class="{ grand: versoJp }"><JpText :texte="verso" :romaji="versoJp" /></p>
  </div>
  <Barre v-if="!retournee" libelle="Afficher la réponse" :audio="rectoJp ? audio : undefined" @action="retournee = true">
    <template #aide>Trouve la réponse, puis retourne.</template>
  </Barre>
  <Barre v-else libelle="Je savais" :audio="audio" @action="$emit('fini', true)">
    <template #aide>Est-ce que tu savais ?</template>
    <template #secondaire><button type="button" @click="$emit('fini', false)">À revoir</button></template>
  </Barre>
</template>
