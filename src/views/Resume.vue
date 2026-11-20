<script setup lang="ts">
import Chevron from '../components/Chevron.vue'
import JpText from '../components/JpText.vue'
import Son from '../components/Son.vue'
import { enTete, lessonParId } from '../content/lessons'

const props = defineProps<{ id: string }>()
const lesson = lessonParId(props.id)
</script>

<template>
  <p v-if="!lesson">Leçon introuvable.</p>
  <template v-else>
    <RouterLink class="retour" :to="`/lecon/${lesson.id}`"><Chevron gauche />{{ enTete(lesson) }}</RouterLink>
    <h1 class="titre-page">{{ lesson.titre }}</h1>

    <template v-for="s in lesson.resume" :key="s.titre">
      <h2>{{ s.titre }}</h2>
      <ul class="liste">
        <li v-for="p in s.points" :key="p"><JpText :texte="p" /></li>
      </ul>
    </template>

    <h2>Kana</h2>
    <p class="calme">Touche un caractère pour le tracer.</p>
    <div v-for="ligne in lesson.kana" :key="ligne" class="ligne-kana">
      <RouterLink v-for="k in ligne" :key="k" class="kana" :to="`/tracer/${k}`">{{ k }}</RouterLink>
    </div>

    <h2>Vocabulaire</h2>
    <ul class="mots">
      <li v-for="m in lesson.mots" :key="m.id">
        <span class="mot"><JpText :texte="m.jp" romaji /></span>
        <span>{{ m.fr }}</span>
        <Son :texte="m.jp" />
      </li>
    </ul>

    <template v-if="lesson.liens">
      <h2>Pour aller plus loin</h2>
      <ul class="liste">
        <li v-for="l in lesson.liens" :key="l.url"><a :href="l.url" target="_blank" rel="noopener noreferrer">{{ l.titre }}</a></li>
      </ul>
    </template>
  </template>
</template>
