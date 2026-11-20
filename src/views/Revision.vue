<script setup lang="ts">
import { computed } from 'vue'
import { toutesLesCartes } from '../content/lessons'
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
</script>

<template>
  <header class="affiche" style="background: #ffd400">
    <p class="sur">Révision du jour</p>
    <h1>{{ duJour ? `${duJour} cartes à revoir` : 'Rien à revoir aujourd’hui' }}</h1>
    <span class="geant" aria-hidden="true">復</span>
  </header>
  <RouterLink v-if="duJour" class="pilule" to="/session?mode=jour">
    <span><small>Toutes leçons confondues</small>Commencer</span>
    <span class="fleche" aria-hidden="true">▶</span>
  </RouterLink>

  <h2>Ta mémoire, carte par carte</h2>
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
