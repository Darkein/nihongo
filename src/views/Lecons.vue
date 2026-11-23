<script setup lang="ts">
import EnTete from '../components/EnTete.vue'
import Jauge from '../components/Jauge.vue'
import { dateDe, filigrane, lessons, numero } from '../content/lessons'
import { avancement, noteDe } from '../srs/avancement'

const debut = lessons[0]?.date
const sur =
  `${lessons.length} cours` +
  (debut ? ` depuis le ${new Date(debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}` : '')
</script>

<template>
  <EnTete :sur="sur" titre="Leçons" filigrane="授業" />
  <div class="grille-lecons">
    <RouterLink v-for="l in [...lessons].reverse()" :key="l.id" class="carte-lecon" :to="`/lecon/${l.id}`">
      <span class="geant" lang="ja" aria-hidden="true">{{ [...filigrane(l)][0] }}</span>
      <p class="sur">Cours {{ numero(l) }}<template v-if="l.date">, {{ dateDe(l) }}</template></p>
      <h2>{{ l.titre }}</h2>
      <p class="ligne">
        <span>{{ avancement(l).pct }} % acquis</span>
        <span v-if="noteDe(`${l.id}/minitest`)" class="badge">Mini-test {{ noteDe(`${l.id}/minitest`) }}</span>
      </p>
      <Jauge :pct="avancement(l).pct" />
    </RouterLink>
  </div>
</template>
