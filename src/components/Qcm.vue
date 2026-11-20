<script setup lang="ts">
import { ref } from 'vue'
import type { Exercice } from '../content/schema'
import Barre from './Barre.vue'
import JpText from './JpText.vue'

const props = defineProps<{ exercice: Extract<Exercice, { type: 'qcm' }> }>()
defineEmits<{ fini: [juste: boolean] }>()

const choisi = ref<number>()
const etat = (i: number) =>
  choisi.value === undefined ? '' : i === props.exercice.reponse ? 'juste' : i === choisi.value ? 'faux' : ''
</script>

<template>
  <p class="question"><JpText :texte="exercice.question" /></p>
  <div class="choix">
    <button
      v-for="(c, i) in exercice.choix"
      :key="i"
      type="button"
      :class="etat(i)"
      :disabled="choisi !== undefined"
      @click="choisi = i"
    >
      <JpText :texte="c" />
    </button>
  </div>
  <Barre
    :juste="choisi === undefined ? undefined : choisi === exercice.reponse"
    libelle="Suivant"
    :inactif="choisi === undefined"
    @action="$emit('fini', choisi === exercice.reponse)"
  >
    <template #aide>Touche une réponse.</template>
    <template v-if="choisi !== exercice.reponse">Réponse : <JpText :texte="exercice.choix[exercice.reponse]" /></template>
  </Barre>
</template>
