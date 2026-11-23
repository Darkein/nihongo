<script setup lang="ts">
import { ACTIVITES, devoirsDe } from '../content/lessons'
import type { Lesson } from '../content/schema'
import { passage } from '../srs/avancement'
import { cocherDevoir, progression } from '../srs/store'
import JpText from './JpText.vue'

const props = defineProps<{ lesson: Lesson }>()
const devoirs = devoirsDe(props.lesson)
const activite = (type: string) => ACTIVITES.find((a) => a.type === type)!
</script>

<template>
  <ul v-if="lesson.prochainCours.annonce.length" class="liste">
    <li v-for="a in lesson.prochainCours.annonce" :key="a"><strong>Annoncé :</strong> <JpText :texte="a" /></li>
  </ul>
  <ul class="devoirs">
    <li v-for="d in devoirs" :key="d.cle" :class="{ fait: progression.devoirs.includes(d.cle) }">
      <label>
        <input type="checkbox" :checked="progression.devoirs.includes(d.cle)" @change="cocherDevoir(d.cle, ($event.target as HTMLInputElement).checked)" />
        <JpText :texte="d.texte" />
      </label>
      <span v-if="d.activites.length" class="faire">
        <RouterLink v-for="t in d.activites" :key="t" :to="`/session?lecon=${lesson.id}&type=${t}`">
          {{ activite(t).nom }} · {{ passage(lesson, t).texte }}
        </RouterLink>
      </span>
    </li>
  </ul>
</template>
