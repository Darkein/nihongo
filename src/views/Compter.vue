<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Nombre from '../components/Nombre.vue'
import { cleNiveau, maitrise, MODES, niveauParId, NIVEAUX, serie, suivant, type Mode } from '../content/nombres'
import { noterTest, progression } from '../srs/store'

const TAILLE = 10
const route = useRoute()
const router = useRouter()
const niveau = niveauParId(String(route.query.niveau)) ?? NIVEAUX[0]
const mode: Mode = MODES.find((m) => m.mode === route.query.mode)?.mode ?? 'ecrire'
const nomMode = MODES.find((m) => m.mode === mode)!.nom
const cle = cleNiveau(niveau)

// Une question ratée revient une fois en fin de série ; seule la première réponse compte pour la note.
type Question = { n: number; reprise: boolean }
const questions = ref<Question[]>([])
const index = ref(0)
const justes = ref(0)
const fin = ref(false)
const precedente = ref<number>()

function nouvelle() {
  questions.value = serie(niveau, TAILLE).map((n) => ({ n, reprise: false }))
  index.value = 0
  justes.value = 0
  fin.value = false
  precedente.value = progression.tests[cle]?.reduce((m, x) => Math.max(m, x.note), 0)
}
nouvelle()

const question = computed(() => questions.value[index.value])
const prochain = suivant(niveau)
const acquis = computed(() => fin.value && maitrise(progression.tests[cle]))

function fini(juste: boolean) {
  const q = question.value
  if (!q.reprise && juste) justes.value++
  if (!juste && !q.reprise) questions.value.push({ n: q.n, reprise: true })
  index.value++
  if (index.value === questions.value.length) {
    noterTest(cle, justes.value)
    fin.value = true
  }
}

const quitter = () => router.push('/entrainer/nombres')
const aller = (id: string) => router.replace(`/compter?niveau=${id}&mode=${mode}`)
</script>

<template>
  <div class="session">
    <header class="barre-session">
      <button class="fermer" type="button" aria-label="Quitter la série" @click="quitter">✕</button>
      <span class="jauge epaisse" role="progressbar" :aria-valuenow="index" aria-valuemin="0" :aria-valuemax="questions.length">
        <i :style="{ width: (index / questions.length) * 100 + '%' }"></i>
      </span>
      <strong v-if="!fin" class="compteur">{{ index + 1 }}/{{ questions.length }}</strong>
    </header>

    <template v-if="!fin && question">
      <p class="ou">
        <span>{{ niveau.nom }}, {{ nomMode.toLowerCase() }}</span>
        <span v-if="question.reprise">Deuxième essai</span>
        <span v-else>{{ justes }} juste{{ justes > 1 ? 's' : '' }}</span>
      </p>
      <section :key="index" class="exercice">
        <Nombre :n="question.n" :niveau="niveau" :mode="mode" @fini="fini" />
      </section>
    </template>

    <section v-else class="bilan">
      <p class="ou"><span>{{ niveau.nom }}, {{ nomMode.toLowerCase() }}</span></p>
      <p class="note">{{ justes }}<small>/{{ TAILLE }}</small></p>
      <h1>{{ justes }} juste{{ justes > 1 ? 's' : '' }} du premier coup</h1>
      <p v-if="precedente !== undefined">Meilleure note avant cette série : {{ precedente }} / {{ TAILLE }}</p>
      <template v-if="acquis">
        <p>Deux séries à 9 / 10 ou plus : niveau maîtrisé.</p>
        <button v-if="prochain" class="primaire" type="button" @click="aller(prochain.id)">Niveau suivant : {{ prochain.nom }}</button>
      </template>
      <button :class="{ primaire: !acquis || !prochain }" type="button" @click="nouvelle">Nouvelle série</button>
      <button type="button" @click="quitter">Terminer</button>
    </section>
  </div>
</template>
