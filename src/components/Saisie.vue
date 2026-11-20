<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { bind, unbind } from 'wanakana'
import type { Exercice, Fiche } from '../content/schema'
import { estJuste, romaji } from '../content/text'
import Barre from './Barre.vue'
import Fiches from './Fiches.vue'
import JpText from './JpText.vue'

const props = defineProps<{ exercice: Extract<Exercice, { type: 'saisie' | 'transformation' }>; fiches?: Fiche[]; grand?: boolean }>()
const emit = defineEmits<{ fini: [juste: boolean] }>()

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

function valider() {
  if (juste.value !== undefined) return emit('fini', juste.value)
  if (champ.value!.value.trim()) juste.value = estJuste(champ.value!.value, props.exercice.reponses, enRomaji ? 'romaji' : 'kana')
}
</script>

<template>
  <template v-if="exercice.type === 'transformation'">
    <p class="serie">{{ exercice.serie }}</p>
    <Fiches v-if="fiches" :fiches="fiches" />
    <p class="exemple">Exemple : <JpText :texte="exercice.exemple" /></p>
    <p class="question"><JpText :texte="exercice.enonce" /> →</p>
  </template>
  <template v-else-if="grand">
    <p class="serie">Écris la prononciation en rōmaji</p>
    <p class="carte grand">{{ exercice.question }}</p>
  </template>
  <p v-else class="question"><JpText :texte="exercice.question" /></p>

  <form @submit.prevent="valider">
    <input
      ref="champ"
      class="saisie"
      type="text"
      :readonly="juste !== undefined"
      :placeholder="enRomaji ? 'rōmaji' : 'tape en rōmaji → かな'"
      aria-label="Ta réponse"
      autocomplete="off"
      autocapitalize="off"
      autocorrect="off"
      spellcheck="false"
    />
  </form>

  <Barre
    :juste="juste"
    :libelle="juste === undefined ? 'Vérifier' : 'Suivant'"
    :audio="juste !== undefined && (!enRomaji || grand) ? exercice.reponses[0] : undefined"
    @action="valider"
  >
    <template #aide>
      {{ enRomaji ? 'Tape la lecture en lettres latines.' : 'は se tape « ha », ー se tape « - ».' }}
    </template>
    <template v-if="enRomaji">{{ romaji(exercice.reponses[0]) }}</template>
    <JpText v-else :texte="exercice.reponses[0]" romaji />
  </Barre>
</template>
