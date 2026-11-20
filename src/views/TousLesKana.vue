<script setup lang="ts">
import { isHiragana } from 'wanakana'
import Chevron from '../components/Chevron.vue'
import { lessons } from '../content/lessons'

const lignes = lessons.flatMap((l) => l.kana)
const ecritures = [
  { nom: 'Hiragana', lignes: lignes.filter((k) => isHiragana(k[0])) },
  { nom: 'Katakana', lignes: lignes.filter((k) => !isHiragana(k[0])) },
]
const total = new Set(lignes.flatMap((k) => [...k])).size
</script>

<template>
  <RouterLink class="retour" to="/entrainer"><Chevron gauche />S’entraîner</RouterLink>
  <h1 class="titre-page">Tous les kana</h1>
  <p class="calme">Les {{ total }} kana vus en cours, dans le désordre. Les réponses ne comptent pas pour la révision.</p>

  <div class="activites">
    <RouterLink to="/session?mode=libre&type=kana">
      <span class="corps">
        <span class="ligne"><strong>Lecture</strong><Chevron /></span>
        <small>Écrire le rōmaji de chaque kana</small>
      </span>
    </RouterLink>
    <RouterLink to="/session?mode=libre&type=trace">
      <span class="corps">
        <span class="ligne"><strong>Tracé</strong><Chevron /></span>
        <small>Tracer chaque kana, avec le modèle la première fois</small>
      </span>
    </RouterLink>
  </div>

  <template v-for="e in ecritures" :key="e.nom">
    <h2>{{ e.nom }}</h2>
    <p class="calme">Touche un caractère pour le tracer avec le modèle.</p>
    <div v-for="ligne in e.lignes" :key="ligne" class="ligne-kana">
      <RouterLink v-for="k in ligne" :key="k" class="kana" :to="`/tracer/${k}`">{{ k }}</RouterLink>
    </div>
  </template>
</template>
