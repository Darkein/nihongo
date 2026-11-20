<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import Flashcard from '../components/Flashcard.vue'
import Qcm from '../components/Qcm.vue'
import Saisie from '../components/Saisie.vue'
import Trace from '../components/Trace.vue'
import Tuiles from '../components/Tuiles.vue'
import {
  ACTIVITES,
  cartesDe,
  couleur,
  lessonParId,
  lessons,
  melanger,
  miniTestBlanc,
  numero,
  toutesLesCartes,
  type Carte,
} from '../content/lessons'
import type { Exercice } from '../content/schema'
import { aReviser } from '../srs/leitner'
import { aujourdhui, enregistrer, progression } from '../srs/store'

const route = useRoute()
const { mode, lecon, type } = route.query as Record<string, string | undefined>
const lesson = lecon ? lessonParId(lecon) : undefined
const estTest = type === 'minitest' || type === 'blanc'
const cle = route.fullPath
const NOMS: Record<string, string> = {
  ...Object.fromEntries(ACTIVITES.map((a) => [a.type, a.nom.toLowerCase()])),
  minitest: 'mini-test',
  blanc: 'mini-test blanc',
}
const titre = mode === 'jour' ? 'Révision du jour' : lesson ? `Cours ${numero(lesson)}, ${NOMS[type ?? ''] ?? ''}` : ''

const blanc = (e: Exercice): Carte => ({ id: `blanc/${e.id}`, categorie: 'minitest', lesson: lesson!, genre: 'exercice', exercice: e })

function nouvelles(): Carte[] {
  if (mode === 'jour') return melanger(aReviser(toutesLesCartes(), progression.cartes, aujourdhui()))
  if (!lesson) return []
  if (type === 'blanc') return miniTestBlanc(lesson).map(blanc)
  const cartes = cartesDe(lesson).filter((c) => c.categorie === type)
  return type === 'exercices' || type === 'minitest' ? cartes : melanger(cartes)
}

function reprises(): Carte[] | undefined {
  const s = progression.session
  if (s?.cle !== cle) return undefined
  if (s.exercices) return s.exercices.map(blanc)
  const parId = new Map(lessons.flatMap(cartesDe).map((c) => [c.id, c] as const).reverse())
  return s.ids?.map((id) => parId.get(id)).filter((c): c is Carte => !!c)
}

const reprise = reprises()
const cartes = reprise ?? nouvelles()
const index = ref(reprise ? Math.min(progression.session!.index, cartes.length) : 0)
const justes = ref(reprise ? progression.session!.justes : 0)
const repriseA = reprise && index.value > 0 ? index.value + 1 : 0

function memoriser() {
  progression.session =
    index.value < cartes.length
      ? {
          cle,
          titre,
          retour: cle,
          index: index.value,
          justes: justes.value,
          ...(type === 'blanc' ? { exercices: cartes.map((c) => (c as Extract<Carte, { genre: 'exercice' }>).exercice) } : { ids: cartes.map((c) => c.id) }),
        }
      : null
}
if (cartes.length && !reprise) memoriser()

const carte = computed(() => cartes[index.value])
const fond = computed(() => couleur(carte.value?.lesson ?? lesson ?? lessons[0]))
const etiquette = computed(() =>
  mode === 'jour' && carte.value ? `Révision du jour, cours ${numero(carte.value.lesson)}` : titre,
)
// Recalculé seulement quand la carte change, pour que les choix du QCM ne bougent pas.
const motEnExercice = computed((): Exercice | undefined => {
  const c = carte.value
  if (c?.genre !== 'mot' || progression.vocabulaire !== 'saisie') return undefined
  if (c.sens === 'fr-jp')
    return { type: 'saisie', id: c.mot.id, question: `Écris en japonais : ${c.mot.fr}`, attendu: 'kana', reponses: [c.mot.jp] }
  const autres = melanger(c.lesson.mots.filter((m) => m.fr !== c.mot.fr)).slice(0, 3)
  const choix = melanger([c.mot, ...autres])
  return { type: 'qcm', id: c.mot.id, question: `Que veut dire ${c.mot.jp} ?`, choix: choix.map((m) => m.fr), reponse: choix.indexOf(c.mot) }
})
const note = computed(() => Math.round((justes.value / cartes.length) * 100) / 10)
const sortie = lesson ? `/lecon/${lesson.id}` : '/'

function fini(juste: boolean) {
  if (juste) justes.value++
  if (!carte.value.id.startsWith('blanc/')) enregistrer(carte.value.id, juste)
  index.value++
  memoriser()
  if (index.value === cartes.length && estTest && lesson) progression.tests[`${lesson.id}/${type}`] = { note: note.value, date: aujourdhui() }
}

function recommencer() {
  progression.session = null
  location.reload()
}
</script>

<template>
  <div class="session" :style="{ '--teinte': fond }">
    <header class="barre-session">
      <RouterLink class="fermer" :to="sortie" aria-label="Quitter, la session sera gardée">✕</RouterLink>
      <span class="jauge epaisse" role="progressbar" :aria-valuenow="index" aria-valuemin="0" :aria-valuemax="cartes.length">
        <i :style="{ width: (index / Math.max(cartes.length, 1)) * 100 + '%' }"></i>
      </span>
      <strong v-if="carte" class="compteur">{{ index + 1 }}/{{ cartes.length }}</strong>
    </header>

    <template v-if="carte">
      <p class="ou">
        <span>{{ etiquette }}</span>
        <span>{{ justes }} juste{{ justes > 1 ? 's' : '' }} sur {{ index }}</span>
      </p>
      <p v-if="repriseA && index + 1 === repriseA" class="reprise">
        Reprise à la question {{ repriseA }}. <button type="button" class="lien" @click="recommencer">Recommencer</button>
      </p>
      <section class="exercice" :key="index">
        <Saisie
          v-if="carte.genre === 'kana'"
          :exercice="{ type: 'saisie', id: carte.id, question: carte.kana, attendu: 'romaji', reponses: [carte.kana] }"
          grand
          @fini="fini"
        />
        <Trace v-else-if="carte.genre === 'trace'" :kana="carte.kana" rappel @fini="fini" />
        <Saisie v-else-if="carte.genre === 'mot' && motEnExercice?.type === 'saisie'" :exercice="motEnExercice" @fini="fini" />
        <Qcm v-else-if="carte.genre === 'mot' && motEnExercice?.type === 'qcm'" :exercice="motEnExercice" @fini="fini" />
        <Flashcard
          v-else-if="carte.genre === 'mot'"
          :recto="carte.sens === 'jp-fr' ? carte.mot.jp : carte.mot.fr"
          :verso="carte.sens === 'jp-fr' ? carte.mot.fr : carte.mot.jp"
          :recto-jp="carte.sens === 'jp-fr'"
          :verso-jp="carte.sens === 'fr-jp'"
          :audio="carte.mot.jp"
          @fini="fini"
        />
        <Qcm v-else-if="carte.exercice.type === 'qcm'" :exercice="carte.exercice" @fini="fini" />
        <Tuiles v-else-if="carte.exercice.type === 'tuiles'" :exercice="carte.exercice" @fini="fini" />
        <Saisie v-else :exercice="carte.exercice" :fiches="carte.lesson.fiches" @fini="fini" />
      </section>
    </template>

    <section v-else class="bilan">
      <template v-if="cartes.length">
        <p class="ou"><span>{{ titre }}</span></p>
        <p v-if="estTest" class="note">{{ note }}<small>/10</small></p>
        <h1>{{ justes }} juste{{ justes > 1 ? 's' : '' }} sur {{ cartes.length }}</h1>
        <p v-if="justes < cartes.length">Les cartes ratées reviendront demain dans la révision du jour.</p>
      </template>
      <h1 v-else>Rien à faire dans cette série</h1>
      <RouterLink class="bouton primaire" :to="sortie">Terminer</RouterLink>
      <button v-if="cartes.length" type="button" @click="recommencer">Recommencer</button>
    </section>
  </div>
</template>
