<script setup lang="ts">
import { computed } from 'vue'
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
</script>

<template>
  <EnTete :sur="duJour ? `${duJour} cartes à revoir aujourd’hui` : 'Rien à revoir aujourd’hui'" titre="S’entraîner" filigrane="練習" />

  <RouterLink v-if="duJour" class="pilule secondaire" to="/session?mode=jour">
    <span><small>Toutes leçons confondues</small>Révision du jour</span>
    <span class="fleche"><Chevron /></span>
  </RouterLink>

  <h2>Librement</h2>
  <div class="activites">
    <RouterLink to="/entrainer/kana">
      <span class="corps">
        <span class="ligne"><strong>Tous les kana</strong><Chevron /></span>
        <small>Lecture et tracé, sans compter pour la révision</small>
      </span>
    </RouterLink>
    <RouterLink to="/entrainer/nombres">
      <span class="corps">
        <span class="ligne"><strong>Compter</strong><Chevron /></span>
        <small>Écrire, lire et écouter les nombres, à ton niveau</small>
      </span>
    </RouterLink>
  </div>

  <h2>Mini-tests blancs</h2>
  <div class="activites">
    <RouterLink v-for="b in blancs" :key="b.l.id" :to="lienTest(b.l.id, 'blanc')">
      <span class="pastille">{{ numero(b.l) }}</span>
      <span class="corps">
        <span class="ligne"><strong>Cours {{ numero(b.l) }}</strong><span>{{ b.etat }}</span></span>
        <small>{{ b.l.titre }}</small>
        <small v-if="b.detail">{{ b.detail }}</small>
      </span>
    </RouterLink>
  </div>

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
