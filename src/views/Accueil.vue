<script setup lang="ts">
import { computed } from 'vue'
import Jauge from '../components/Jauge.vue'
import { ACTIVITES, couleur, derniere, enTete, lessons, numero, toutesLesCartes } from '../content/lessons'
import { avancement, etatTest, lienTest } from '../srs/avancement'
import { aReviser } from '../srs/leitner'
import { aujourdhui, progression } from '../srs/store'

const duJour = computed(() => aReviser(toutesLesCartes(), progression.cartes, aujourdhui()).length)

const suite = computed(() => {
  const s = progression.session
  if (s) return { sur: 'Reprendre', titre: `${s.titre}, ${s.index + 1} sur ${s.ids?.length ?? s.exercices?.length}`, vers: s.retour }
  if (duJour.value) return { sur: 'À faire aujourd’hui', titre: `Révision du jour, ${duJour.value} cartes`, vers: '/session?mode=jour' }
  const a = ACTIVITES.find((x) => avancement(derniere, x.type).pct < 100)
  if (a) return { sur: `Continuer le cours ${numero(derniere)}`, titre: a.nom, vers: `/session?lecon=${derniere.id}&type=${a.type}` }
  return undefined
})
const tuiles = computed(() => [
  ...ACTIVITES.map((a) => ({ ...a, a: avancement(derniere, a.type) })),
])
// Un mini-test blanc par cours, le plus récent en premier.
const blancs = computed(() => [...lessons].reverse().map((l) => ({ l, ...etatTest(l.id, 'blanc') })))
</script>

<template>
  <RouterLink class="affiche" :style="{ background: couleur(derniere) }" :to="`/lecon/${derniere.id}`">
    <p class="sur">{{ enTete(derniere) }}</p>
    <h1>{{ derniere.titre }}</h1>
    <span class="geant" aria-hidden="true">{{ derniere.kana[0]?.[0] }}</span>
  </RouterLink>

  <RouterLink v-if="suite" class="pilule" :to="suite.vers">
    <span><small>{{ suite.sur }}</small>{{ suite.titre }}</span>
    <span class="fleche" aria-hidden="true">▶</span>
  </RouterLink>
  <p v-else class="calme">Tout est à jour pour aujourd'hui.</p>

  <div class="tuiles">
    <RouterLink v-for="t in tuiles" :key="t.type" class="tuile-etat" :class="{ fait: t.a.pct === 100, entame: t.a.fait > 0 }" :to="`/session?lecon=${derniere.id}&type=${t.type}`">
      <span>{{ t.nom }}</span>
      <strong>{{ t.a.texte }}</strong>
    </RouterLink>
  </div>

  <h2>Mini-tests blancs</h2>
  <div class="activites">
    <RouterLink v-for="b in blancs" :key="b.l.id" :to="lienTest(b.l.id, 'blanc')">
      <span class="pastille" :style="{ background: couleur(b.l) }">{{ numero(b.l) }}</span>
      <span class="corps">
        <span class="ligne"><strong>Cours {{ numero(b.l) }}</strong><span>{{ b.etat }}</span></span>
        <small>{{ b.l.titre }}</small>
        <small v-if="b.detail">{{ b.detail }}</small>
      </span>
    </RouterLink>
  </div>

  <h2>Où tu en es</h2>
  <ol class="parcours">
    <li v-for="l in lessons" :key="l.id">
      <RouterLink :to="`/lecon/${l.id}`">
        <span class="pastille" :style="{ background: couleur(l) }">{{ numero(l) }}</span>
        <span class="corps">
          <span class="ligne"><strong>{{ l.titre }}</strong><span>{{ avancement(l).pct }} %</span></span>
          <Jauge :pct="avancement(l).pct" />
        </span>
      </RouterLink>
    </li>
  </ol>

  <h2>Pour le prochain cours</h2>
  <ul class="liste">
    <li v-for="a in derniere.prochainCours.annonce" :key="a"><strong>Annoncé :</strong> {{ a }}</li>
    <li v-for="d in derniere.prochainCours.devoirs" :key="d">{{ d }}</li>
  </ul>
</template>
