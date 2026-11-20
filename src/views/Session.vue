<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { toRomaji } from 'wanakana'
import Flashcard from '../components/Flashcard.vue'
import Qcm from '../components/Qcm.vue'
import Saisie from '../components/Saisie.vue'
import Trace from '../components/Trace.vue'
import Tuiles from '../components/Tuiles.vue'
import { cartesDe, lessonParId, melanger, miniTestBlanc, toutesLesCartes, type Carte } from '../content/lessons'
import { aReviser } from '../srs/leitner'
import { aujourdhui, enregistrer, progression } from '../srs/store'

const { mode, lecon, type } = useRoute().query as Record<string, string | undefined>
const lesson = lecon ? lessonParId(lecon) : undefined
const estTest = type === 'minitest' || type === 'blanc'

function construire(): Carte[] {
  if (mode === 'jour') return melanger(aReviser(toutesLesCartes(), progression.cartes, aujourdhui()))
  if (!lesson) return []
  const exercice = (prefixe: string) => (e: NonNullable<typeof lesson.miniTest>[number]): Carte => ({
    id: `${prefixe}/${e.id}`,
    categorie: 'exercices',
    lesson,
    genre: 'exercice',
    exercice: e,
  })
  if (type === 'blanc') return miniTestBlanc(lesson).map(exercice('blanc'))
  if (type === 'minitest') return (lesson.miniTest ?? []).map(exercice(`${lesson.id}/ex`))
  const cartes = cartesDe(lesson).filter((c) => type === 'tout' || c.categorie === type)
  return type === 'exercices' ? cartes : melanger(cartes)
}

const cartes = construire()
const index = ref(0)
const justes = ref(0)
const carte = computed(() => cartes[index.value])
const titre = mode === 'jour' ? 'Révision du jour' : type === 'blanc' ? 'Mini-test blanc' : type === 'minitest' ? 'Mini-test du cours' : lesson?.titre

function fini(juste: boolean) {
  if (juste) justes.value++
  if (!carte.value.id.startsWith('blanc/')) enregistrer(carte.value.id, juste)
  index.value++
}
</script>

<template>
  <p class="fil">{{ titre }}</p>
  <template v-if="carte">
    <progress :value="index" :max="cartes.length" :aria-label="`Carte ${index + 1} sur ${cartes.length}`"></progress>
    <section class="bloc exercice" :key="index">
      <Flashcard v-if="carte.genre === 'kana'" :recto="carte.kana" :verso="toRomaji(carte.kana)" recto-jp :audio="carte.kana" @fini="fini" />
      <Trace v-else-if="carte.genre === 'trace'" :kana="carte.kana" rappel @fini="fini" />
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
  <section v-else class="bloc vedette">
    <template v-if="cartes.length">
      <h1>Terminé</h1>
      <p v-if="estTest" class="note">{{ Math.round((justes / cartes.length) * 100) / 10 }} / 10</p>
      <p>{{ justes }} réponse(s) juste(s) sur {{ cartes.length }}.</p>
    </template>
    <p v-else>Aucune carte dans cette série.</p>
    <RouterLink class="bouton primaire" :to="lesson ? `/lecon/${lesson.id}` : '/'">Retour</RouterLink>
  </section>
</template>
