<script setup lang="ts">
import { computed, ref } from 'vue'
import { melanger } from '../content/lessons'
import type { Exercice } from '../content/schema'
import Barre from './Barre.vue'
import JpText from './JpText.vue'

const props = defineProps<{ exercice: Extract<Exercice, { type: 'tuiles' }> }>()
const emit = defineEmits<{ fini: [juste: boolean] }>()

const reserve = melanger([...props.exercice.tuiles, ...(props.exercice.leurres ?? [])].map((texte, cle) => ({ texte, cle })))
const phrase = ref<number[]>([])
const juste = ref<boolean>()
const solution = computed(() => props.exercice.tuiles.join(' '))
const texteDe = (cle: number) => reserve.find((t) => t.cle === cle)!.texte

function poser(cle: number) {
  if (juste.value === undefined) phrase.value.push(cle)
}
function retirer(i: number) {
  if (juste.value === undefined) phrase.value.splice(i, 1)
}
function valider() {
  if (juste.value !== undefined) return emit('fini', juste.value)
  juste.value = phrase.value.map(texteDe).join('') === props.exercice.tuiles.join('')
}
</script>

<template>
  <p class="question"><JpText :texte="exercice.question" /></p>
  <div class="phrase" aria-label="Ta phrase">
    <button v-for="(cle, i) in phrase" :key="cle" class="tuile" type="button" @click="retirer(i)">
      <JpText :texte="texteDe(cle)" />
    </button>
  </div>
  <div class="reserve" aria-label="Tuiles disponibles">
    <button
      v-for="t in reserve"
      :key="t.cle"
      class="tuile"
      :class="{ prise: phrase.includes(t.cle) }"
      type="button"
      :disabled="phrase.includes(t.cle)"
      @click="poser(t.cle)"
    >
      <JpText :texte="t.texte" />
    </button>
  </div>
  <Barre
    :juste="juste"
    :libelle="juste === undefined ? 'Vérifier' : 'Suivant'"
    :inactif="!phrase.length"
    :audio="juste !== undefined ? solution : undefined"
    @action="valider"
  >
    <template #aide>Touche les tuiles dans l'ordre.</template>
    <JpText :texte="solution" romaji />
  </Barre>
</template>
