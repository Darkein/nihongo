<script setup lang="ts">
import Jauge from '../components/Jauge.vue'
import JpText from '../components/JpText.vue'
import { ACTIVITES, couleur, enTete, lessonParId } from '../content/lessons'
import { avancement, etatTest, lienTest } from '../srs/avancement'
import { progression } from '../srs/store'

const props = defineProps<{ id: string }>()
const lesson = lessonParId(props.id)
const lien = (type: string) => `/session?lecon=${props.id}&type=${type}`
const enCours = (type: string) => progression.session?.retour === lien(type)
</script>

<template>
  <p v-if="!lesson">Leçon introuvable.</p>
  <template v-else>
    <header class="affiche" :style="{ background: couleur(lesson) }">
      <p class="sur">{{ enTete(lesson) }}</p>
      <h1>{{ lesson.titre }}</h1>
      <p class="ligne"><span>{{ avancement(lesson).pct }} % acquis</span></p>
      <Jauge :pct="avancement(lesson).pct" />
      <span class="geant" aria-hidden="true">{{ lesson.kana[0]?.[0] }}</span>
    </header>

    <h2>S'entraîner</h2>
    <div class="activites">
      <RouterLink v-for="a in ACTIVITES" :key="a.type" :to="lien(a.type)">
        <span class="corps">
          <span class="ligne"><strong>{{ a.nom }}</strong><span>{{ enCours(a.type) ? 'En cours' : avancement(lesson, a.type).texte }}</span></span>
          <Jauge :pct="avancement(lesson, a.type).pct" />
        </span>
      </RouterLink>
    </div>

    <h2>Mini-tests</h2>
    <div class="activites">
      <RouterLink v-if="lesson.miniTest" :to="lienTest(lesson.id, 'minitest')">
        <span class="corps">
          <span class="ligne"><strong>Mini-test du cours</strong><span>{{ etatTest(lesson.id, 'minitest').etat }}</span></span>
          <small>Celui passé en classe, {{ lesson.miniTest.length }} questions</small>
          <small v-if="etatTest(lesson.id, 'minitest').detail">{{ etatTest(lesson.id, 'minitest').detail }}</small>
        </span>
      </RouterLink>
      <RouterLink :to="lienTest(lesson.id, 'blanc')">
        <span class="corps">
          <span class="ligne"><strong>Mini-test blanc</strong><span>{{ etatTest(lesson.id, 'blanc').etat }}</span></span>
          <small>Nouveau tirage à chaque fois, au même format</small>
          <small v-if="etatTest(lesson.id, 'blanc').detail">{{ etatTest(lesson.id, 'blanc').detail }}</small>
        </span>
      </RouterLink>
    </div>

    <h2>Le cours</h2>
    <div class="activites">
      <RouterLink :to="`/lecon/${lesson.id}/resume`">
        <span class="corps">
          <span class="ligne"><strong>Résumé, kana et vocabulaire</strong><span aria-hidden="true">›</span></span>
          <small>{{ lesson.resume.map((s) => s.titre).join(', ') }}</small>
        </span>
      </RouterLink>
    </div>

    <h2>Devoirs donnés à ce cours</h2>
    <ul class="liste">
      <li v-for="a in lesson.prochainCours.annonce" :key="a"><strong>Annoncé :</strong> <JpText :texte="a" /></li>
      <li v-for="d in lesson.prochainCours.devoirs" :key="d"><JpText :texte="d" /></li>
    </ul>
  </template>
</template>
