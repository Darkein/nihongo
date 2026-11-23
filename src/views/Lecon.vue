<script setup lang="ts">
import Chevron from '../components/Chevron.vue'
import Devoirs from '../components/Devoirs.vue'
import JpText from '../components/JpText.vue'
import { ACTIVITES, devoirsDe, enTete, filigrane, lessonParId, vedette } from '../content/lessons'
import { avancement, etatTest, lienTest, passage } from '../srs/avancement'
import { progression } from '../srs/store'

const props = defineProps<{ id: string }>()
const lesson = lessonParId(props.id)
const lien = (type: string) => `/session?lecon=${props.id}&type=${type}`
const enCours = (type: string) => progression.session?.retour === lien(type)
const enDevoir = (type: string) =>
  !!lesson && !progression.passages[`${lesson.id}/${type}`] && devoirsDe(lesson).some((d) => (d.activites as string[]).includes(type))
// Circonférence de l'anneau d'avancement (rayon 26).
const TOUR = 2 * Math.PI * 26
</script>

<template>
  <p v-if="!lesson">Leçon introuvable.</p>
  <template v-else>
    <span class="filigrane" lang="ja" aria-hidden="true">{{ filigrane(lesson) }}</span>
    <RouterLink class="retour" to="/lecons"><Chevron gauche />Leçons</RouterLink>
    <header class="tete-lecon">
      <div>
        <p class="sur">{{ enTete(lesson) }}</p>
        <h1>{{ lesson.titre }}</h1>
      </div>
      <svg class="anneau" viewBox="0 0 62 62" role="img" :aria-label="`${avancement(lesson).pct} % acquis`">
        <circle cx="31" cy="31" r="26" />
        <circle v-if="avancement(lesson).pct" cx="31" cy="31" r="26" class="plein" :stroke-dasharray="`${(avancement(lesson).pct / 100) * TOUR} ${TOUR}`" />
        <text x="31" y="36">{{ avancement(lesson).pct }}%</text>
      </svg>
    </header>

    <RouterLink class="bloc-cours" :to="`/lecon/${lesson.id}/resume`">
      <span class="ligne"><strong>Relire le cours</strong><span class="fleche"><Chevron /></span></span>
      <small>{{ lesson.resume.map((s) => s.titre).join(', ') }}<template v-if="lesson.liens?.length"> · {{ lesson.liens.length }} liens</template></small>
      <span class="vedette"><JpText :texte="vedette(lesson)" /></span>
    </RouterLink>

    <h2>Apprentissage</h2>
    <div class="tuiles">
      <RouterLink v-for="a in ACTIVITES" :key="a.type" class="tuile-etat" :class="{ fait: passage(lesson, a.type).dernier }" :to="lien(a.type)">
        <span class="repere" aria-hidden="true">{{ a.repere }}</span>
        <b>{{ a.nom }}</b>
        <span class="ligne compte">
          <strong v-if="passage(lesson, a.type).dernier">{{ passage(lesson, a.type).dernier!.justes }}<small> / {{ passage(lesson, a.type).dernier!.total }}</small></strong>
          <strong v-else><small>{{ passage(lesson, a.type).total }} cartes</small></strong>
          <span v-if="enCours(a.type)" class="marqueur">En cours</span>
          <span v-else-if="enDevoir(a.type)" class="marqueur devoir">Devoir</span>
        </span>
      </RouterLink>
    </div>
    <RouterLink v-if="lesson.miniTest" class="pilule secondaire" :to="lienTest(lesson.id, 'minitest')">
      <span>Mini-test du cours<small>{{ etatTest(lesson.id, 'minitest').etat }}<template v-if="etatTest(lesson.id, 'minitest').detail"> · {{ etatTest(lesson.id, 'minitest').detail }}</template></small></span>
      <span class="fleche"><Chevron /></span>
    </RouterLink>
    <RouterLink class="pilule secondaire" :to="lienTest(lesson.id, 'blanc')">
      <span>Mini-test blanc<small>{{ etatTest(lesson.id, 'blanc').etat }}<template v-if="etatTest(lesson.id, 'blanc').detail"> · {{ etatTest(lesson.id, 'blanc').detail }}</template></small></span>
      <span class="fleche"><Chevron /></span>
    </RouterLink>

    <template v-if="lesson.prochainCours.annonce.length || lesson.prochainCours.devoirs.length">
      <h2>Devoirs</h2>
      <Devoirs :lesson="lesson" />
    </template>
  </template>
</template>
