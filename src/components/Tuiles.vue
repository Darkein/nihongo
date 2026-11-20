<script setup lang="ts">
import { computed, ref } from 'vue'
import { melanger } from '../content/lessons'
import type { Exercice } from '../content/schema'
import JpText from './JpText.vue'
import Son from './Son.vue'
import Verdict from './Verdict.vue'

const props = defineProps<{ exercice: Extract<Exercice, { type: 'tuiles' }> }>()
defineEmits<{ fini: [juste: boolean] }>()

const reserve = ref(melanger([...props.exercice.tuiles, ...(props.exercice.leurres ?? [])].map((texte, cle) => ({ texte, cle }))))
const phrase = ref<typeof reserve.value>([])
const juste = ref<boolean>()
const solution = computed(() => props.exercice.tuiles.join(' '))

type Tuile = (typeof reserve.value)[number]
function deplacer(de: Tuile[], vers: Tuile[], i: number) {
  if (juste.value === undefined) vers.push(...de.splice(i, 1))
}
function verifier() {
  juste.value = phrase.value.map((t) => t.texte).join('') === props.exercice.tuiles.join('')
}
</script>

<template>
  <p class="question"><JpText :texte="exercice.question" /></p>
  <div class="phrase" aria-label="Ta phrase">
    <button v-for="(t, i) in phrase" :key="t.cle" class="tuile" type="button" @click="deplacer(phrase, reserve, i)">
      <JpText :texte="t.texte" />
    </button>
  </div>
  <div class="reserve" aria-label="Tuiles disponibles">
    <button v-for="(t, i) in reserve" :key="t.cle" class="tuile" type="button" @click="deplacer(reserve, phrase, i)">
      <JpText :texte="t.texte" />
    </button>
  </div>
  <button v-if="juste === undefined" class="primaire" type="button" :disabled="!phrase.length" @click="verifier">Vérifier</button>
  <Verdict v-else :juste="juste" @suite="$emit('fini', juste)">
    <JpText :texte="solution" romaji /> <Son :texte="solution" />
  </Verdict>
</template>
