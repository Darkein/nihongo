<script setup lang="ts">
import { computed, ref } from 'vue'
import Chevron from '../components/Chevron.vue'
import EnTete from '../components/EnTete.vue'
import { lessons, numero, toutesLesCartes } from '../content/lessons'
import { etatTest, lienTest } from '../srs/avancement'
import { aReviser, NB_BOITES } from '../srs/leitner'
import { aujourdhui, progression } from '../srs/store'

const cartes = toutesLesCartes()
const duJour = computed(() => aReviser(cartes, progression.cartes, aujourdhui()).length)
const boites = computed(() =>
  Array.from({ length: NB_BOITES }, (_, i) => cartes.filter((c) => progression.cartes[c.id]?.boite === i + 1).length),
)
const nouvelles = computed(() => cartes.filter((c) => !progression.cartes[c.id]).length)
const max = computed(() => Math.max(1, nouvelles.value, ...boites.value))
const NOMS = ['Demain', 'Dans 2 jours', 'Dans 4 jours', 'Dans 8 jours', 'Dans 16 jours']
// Un mini-test blanc par cours, le plus récent en premier.
const blancs = computed(() => [...lessons].reverse().map((l) => ({ l, ...etatTest(l.id, 'blanc') })))
const MAX_TESTS = 8
const tousLesTests = ref(false)
const testsVisibles = computed(() => (tousLesTests.value ? blancs.value : blancs.value.slice(0, MAX_TESTS)))
const classeTest = (b: { enCours?: boolean; note?: number }) =>
  b.enCours ? 'en-cours' : b.note === undefined ? 'a-passer' : b.note >= 7 ? 'reussi' : 'a-revoir'
</script>

<template>
  <EnTete :sur="duJour ? `${duJour} cartes à revoir aujourd’hui` : 'Rien à revoir aujourd’hui'" titre="S’entraîner" filigrane="練習" />

  <RouterLink v-if="duJour" class="pilule secondaire" to="/session?mode=jour">
    <span><small>Toutes leçons confondues</small>Révision du jour</span>
    <span class="fleche"><Chevron /></span>
  </RouterLink>

  <h2>Librement</h2>
  <div class="tuiles">
    <RouterLink class="tuile-etat" to="/entrainer/kana">
      <span class="repere" lang="ja" aria-hidden="true">仮</span>
      <b>Kana</b>
      <small>Lecture et tracé</small>
    </RouterLink>
    <RouterLink class="tuile-etat" to="/entrainer/nombres">
      <span class="repere" lang="ja" aria-hidden="true">数</span>
      <b>Nombres</b>
      <small>Écrire, lire et écouter</small>
    </RouterLink>
  </div>

  <h2>Mini-tests blancs</h2>
  <ul class="grille-tests">
    <li v-for="b in testsVisibles" :key="b.l.id">
      <RouterLink
        :class="classeTest(b)"
        :to="lienTest(b.l.id, 'blanc')"
        :aria-label="`Cours ${numero(b.l)}, ${b.l.titre} : ${b.etat}`"
        :title="b.detail ? `${b.l.titre}. ${b.detail}` : b.l.titre"
      >
        <b>{{ numero(b.l) }}</b>
        <small>{{ b.etat }}</small>
      </RouterLink>
    </li>
  </ul>
  <button v-if="blancs.length > MAX_TESTS" type="button" class="lien tout-afficher" @click="tousLesTests = !tousLesTests">
    {{ tousLesTests ? 'Afficher moins' : `Tout afficher (${blancs.length})` }}
  </button>

  <h2>Ta mémoire</h2>
  <p class="calme">Une carte réussie est revue de plus en plus tard. Une carte ratée revient le lendemain.</p>
  <ul class="boites">
    <li>
      <span>Jamais vues</span><span class="barre"><i :style="{ width: (nouvelles / max) * 100 + '%' }"></i></span><strong>{{ nouvelles }}</strong>
    </li>
    <li v-for="(n, i) in boites" :key="i">
      <span>{{ NOMS[i] }}</span><span class="barre"><i :style="{ width: (n / max) * 100 + '%' }"></i></span><strong>{{ n }}</strong>
    </li>
  </ul>
</template>
