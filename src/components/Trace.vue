<script setup lang="ts">
import HanziWriter from 'hanzi-writer'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { toRomaji } from 'wanakana'
import Barre from './Barre.vue'

// `libre` : pas de barre d'exercice, le parent enchaîne. `contour` : opacité du modèle, de 0 à 1.
const props = withDefaults(defineProps<{ kana: string; rappel?: boolean; libre?: boolean; contour?: number }>(), { contour: 1 })
const emit = defineEmits<{ fini: [juste: boolean, erreurs: number] }>()

const MAX_ERREURS = 2
const cible = ref<HTMLDivElement>()
const erreurs = ref<number>()
let writer: HanziWriter | undefined

// Passe par `color` pour obtenir une couleur résolue (light-dark, thème de la session).
function couleur(nom: string) {
  const sonde = cible.value!
  sonde.style.color = `var(${nom})`
  const rgb = getComputedStyle(sonde).color
  sonde.style.color = ''
  return rgb
}

function quiz() {
  erreurs.value = undefined
  writer?.quiz({
    onComplete: (bilan) => {
      erreurs.value = bilan.totalMistakes
      if (props.libre) emit('fini', bilan.totalMistakes <= MAX_ERREURS, bilan.totalMistakes)
    },
  })
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
    showOutline: !props.rappel && props.contour > 0,
    showHintAfterMisses: 2,
    strokeColor: couleur('--encre'),
    outlineColor: couleur('--trait').replace('rgb(', 'rgba(').replace(')', `, ${props.contour})`),
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
defineExpose({ montrer })
</script>

<template>
  <p class="question">
    Trace <strong class="cible">{{ toRomaji(kana) }}</strong> en {{ /[ァ-ヶ]/.test(kana) ? 'katakana' : 'hiragana' }}
  </p>
  <div ref="cible" class="trace"></div>
  <Barre
    v-if="!libre"
    :juste="erreurs === undefined ? undefined : erreurs <= MAX_ERREURS"
    libelle="Suivant"
    :inactif="erreurs === undefined"
    :audio="kana"
    @action="emit('fini', erreurs! <= MAX_ERREURS, erreurs!)"
  >
    <template #aide>Trait par trait, dans l'ordre.</template>
    <template #secondaire>
      <button v-if="!rappel" type="button" :disabled="erreurs !== undefined" @click="montrer">Montrer le tracé</button>
    </template>
    {{ erreurs ? `${erreurs} trait${erreurs > 1 ? 's' : ''} raté${erreurs > 1 ? 's' : ''}` : 'Aucun trait raté' }}
  </Barre>
</template>
