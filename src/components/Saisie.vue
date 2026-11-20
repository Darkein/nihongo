<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { bind, unbind } from 'wanakana'
import type { Exercice, Fiche } from '../content/schema'
import { estJuste, romaji } from '../content/text'
import Fiches from './Fiches.vue'
import JpText from './JpText.vue'
import Son from './Son.vue'
import Verdict from './Verdict.vue'

const props = defineProps<{ exercice: Extract<Exercice, { type: 'saisie' | 'transformation' }>; fiches?: Fiche[] }>()
defineEmits<{ fini: [juste: boolean] }>()

const enRomaji = props.exercice.type === 'saisie' && props.exercice.attendu === 'romaji'
const champ = ref<HTMLInputElement>()
const juste = ref<boolean>()

onMounted(() => {
  if (!enRomaji) bind(champ.value!, { IMEMode: true })
  champ.value!.focus()
})
onBeforeUnmount(() => {
  if (!enRomaji) unbind(champ.value!)
})

function verifier() {
  juste.value = estJuste(champ.value!.value, props.exercice.reponses, enRomaji ? 'romaji' : 'kana')
}
</script>

<template>
  <template v-if="exercice.type === 'transformation'">
    <p class="serie">{{ exercice.serie }}</p>
    <Fiches v-if="fiches" :fiches="fiches" />
    <p class="exemple">Exemple : <JpText :texte="exercice.exemple" /></p>
    <p class="question"><JpText :texte="exercice.enonce" /> →</p>
  </template>
  <p v-else class="question"><JpText :texte="exercice.question" /></p>

  <form @submit.prevent="verifier">
    <input
      ref="champ"
      class="saisie"
      type="text"
      :readonly="juste !== undefined"
      :placeholder="enRomaji ? 'rōmaji' : 'tape en rōmaji → かな'"
      autocomplete="off"
      autocapitalize="off"
      autocorrect="off"
      spellcheck="false"
    />
    <p v-if="!enRomaji && juste === undefined" class="aide">
      La particule は se tape « ha », ー se tape « - ». Les katakana peuvent être saisis en hiragana.
    </p>
    <button v-if="juste === undefined" class="primaire" type="submit">Vérifier</button>
  </form>

  <Verdict v-if="juste !== undefined" :juste="juste" @suite="$emit('fini', juste)">
    <template v-if="enRomaji">{{ romaji(exercice.reponses[0]) }}</template>
    <template v-else><JpText :texte="exercice.reponses[0]" romaji /> <Son :texte="exercice.reponses[0]" /></template>
  </Verdict>
</template>
