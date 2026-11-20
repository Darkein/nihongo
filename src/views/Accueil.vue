<script setup lang="ts">
import { computed } from 'vue'
import { cartesDe, derniere, lessons, toutesLesCartes } from '../content/lessons'
import { aReviser } from '../srs/leitner'
import { aujourdhui, progression } from '../srs/store'

const duJour = computed(() => aReviser(toutesLesCartes(), progression.cartes, aujourdhui()).length)
const avancement = (id: string) => {
  const cartes = cartesDe(lessons.find((l) => l.id === id)!)
  return `${cartes.filter((c) => progression.cartes[c.id]).length} / ${cartes.length}`
}
const date = (d?: string) => (d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : '')
</script>

<template>
  <section class="bloc vedette">
    <h1>Révision du jour</h1>
    <p v-if="duJour">{{ duJour }} carte(s) à revoir, toutes leçons confondues.</p>
    <p v-else>Rien à revoir aujourd'hui. 👏</p>
    <RouterLink v-if="duJour" class="bouton primaire" to="/session?mode=jour">Commencer</RouterLink>
  </section>

  <section class="bloc">
    <h2>À préparer pour le prochain cours</h2>
    <ul>
      <li v-for="a in derniere.prochainCours.annonce" :key="a"><strong>Annoncé :</strong> {{ a }}</li>
      <li v-for="d in derniere.prochainCours.devoirs" :key="d">{{ d }}</li>
    </ul>
    <div class="rangee">
      <RouterLink class="bouton" :to="`/session?lecon=${derniere.id}&type=blanc`">Mini-test blanc</RouterLink>
      <RouterLink class="bouton" :to="`/lecon/${derniere.id}`">Revoir la leçon</RouterLink>
    </div>
  </section>

  <h2>Leçons</h2>
  <RouterLink v-for="l in [...lessons].reverse()" :key="l.id" class="bloc lien-lecon" :to="`/lecon/${l.id}`">
    <span class="numero">{{ Number(l.id.slice(-2)) }}</span>
    <span>
      <strong>{{ l.titre }}</strong>
      <small>{{ date(l.date) }} <span class="jp">{{ l.kana.map((k) => k[0]).join('・') }}</span> · {{ avancement(l.id) }} cartes vues</small>
    </span>
  </RouterLink>
</template>
