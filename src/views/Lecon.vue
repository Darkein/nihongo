<script setup lang="ts">
import JpText from '../components/JpText.vue'
import Son from '../components/Son.vue'
import { lessonParId } from '../content/lessons'

const props = defineProps<{ id: string }>()
const lesson = lessonParId(props.id)
const modes = [
  ['tout', 'Tout'],
  ['kana', 'Kana'],
  ['trace', 'Tracé'],
  ['vocabulaire', 'Vocabulaire'],
  ['exercices', 'Exercices'],
]
</script>

<template>
  <p v-if="!lesson">Leçon introuvable.</p>
  <template v-else>
    <h1>{{ lesson.titre }}</h1>

    <section class="bloc">
      <h2>S'entraîner</h2>
      <div class="rangee">
        <RouterLink v-for="[type, nom] in modes" :key="type" class="bouton" :to="`/session?lecon=${lesson.id}&type=${type}`">{{ nom }}</RouterLink>
      </div>
      <div class="rangee">
        <RouterLink v-if="lesson.miniTest" class="bouton primaire" :to="`/session?lecon=${lesson.id}&type=minitest`">Mini-test du cours</RouterLink>
        <RouterLink class="bouton" :to="`/session?lecon=${lesson.id}&type=blanc`">Mini-test blanc</RouterLink>
      </div>
    </section>

    <section v-for="s in lesson.resume" :key="s.titre" class="bloc">
      <h2>{{ s.titre }}</h2>
      <ul>
        <li v-for="p in s.points" :key="p"><JpText :texte="p" /></li>
      </ul>
    </section>

    <section class="bloc">
      <h2>Kana <small>— touche un caractère pour le tracer</small></h2>
      <div v-for="ligne in lesson.kana" :key="ligne" class="ligne-kana">
        <RouterLink v-for="k in ligne" :key="k" class="kana" :to="`/tracer/${k}`">{{ k }}</RouterLink>
      </div>
    </section>

    <section class="bloc">
      <h2>Vocabulaire</h2>
      <ul class="mots">
        <li v-for="m in lesson.mots" :key="m.id">
          <span><JpText :texte="m.jp" romaji /></span>
          <span>{{ m.fr }}</span>
          <Son :texte="m.jp" />
        </li>
      </ul>
    </section>

    <section v-if="lesson.liens" class="bloc">
      <h2>Pour aller plus loin</h2>
      <ul>
        <li v-for="l in lesson.liens" :key="l.url"><a :href="l.url" target="_blank" rel="noopener noreferrer">{{ l.titre }}</a></li>
      </ul>
    </section>

    <section class="bloc">
      <h2>Devoirs donnés à ce cours</h2>
      <ul>
        <li v-for="a in lesson.prochainCours.annonce" :key="a"><strong>Annoncé :</strong> <JpText :texte="a" /></li>
        <li v-for="d in lesson.prochainCours.devoirs" :key="d"><JpText :texte="d" /></li>
      </ul>
    </section>
  </template>
</template>
