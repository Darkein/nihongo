<script setup lang="ts">
import HanziWriter from 'hanzi-writer'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { toRomaji } from 'wanakana'
import Son from './Son.vue'
import Verdict from './Verdict.vue'

const props = defineProps<{ kana: string; rappel?: boolean }>()
defineEmits<{ fini: [juste: boolean] }>()

const MAX_ERREURS = 2
const cible = ref<HTMLDivElement>()
const erreurs = ref<number>()
let writer: HanziWriter | undefined

const couleur = (nom: string) => getComputedStyle(document.documentElement).getPropertyValue(nom).trim()

function quiz() {
  erreurs.value = undefined
  writer?.quiz({ onComplete: (bilan) => (erreurs.value = bilan.totalMistakes) })
}

onMounted(async () => {
  const traces: Record<string, any> = (await import('../data/kana-strokes.json')).default
  if (!cible.value) return
  const taille = Math.min(cible.value.clientWidth, 320)
  writer = HanziWriter.create(cible.value, props.kana, {
    width: taille,
    height: taille,
    padding: 16,
    showCharacter: false,
    showOutline: !props.rappel,
    showHintAfterMisses: 2,
    strokeColor: couleur('--encre'),
    outlineColor: couleur('--trait'),
    drawingColor: couleur('--accent'),
    highlightColor: couleur('--accent'),
    drawingWidth: 24,
    charDataLoader: (c, pret) => pret(traces[c]),
  })
  quiz()
})
onBeforeUnmount(() => writer?.cancelQuiz())

async function montrer() {
  writer?.cancelQuiz()
  await writer?.animateCharacter()
  quiz()
}
</script>

<template>
  <p class="question">
    Trace <strong>{{ toRomaji(kana) }}</strong> en {{ /[ァ-ヶ]/.test(kana) ? 'katakana' : 'hiragana' }}, trait par trait.
    <Son :texte="kana" />
  </p>
  <div ref="cible" class="trace"></div>
  <div v-if="erreurs === undefined" class="rangee">
    <button v-if="!rappel" type="button" @click="montrer">Montrer le tracé</button>
  </div>
  <Verdict v-else :juste="erreurs <= MAX_ERREURS" @suite="$emit('fini', erreurs <= MAX_ERREURS)">
    <span class="jp grand">{{ kana }}</span> — {{ erreurs }} trait(s) raté(s)
  </Verdict>
</template>
