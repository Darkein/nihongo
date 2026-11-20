<script setup lang="ts">
import { computed } from 'vue'
import Chevron from '../components/Chevron.vue'
import Devoirs from '../components/Devoirs.vue'
import EnTete from '../components/EnTete.vue'
import { ACTIVITES, derniere, enTete, numero, toutesLesCartes } from '../content/lessons'
import { dateJaponaise } from '../content/date'
import { avancement } from '../srs/avancement'
import { aReviser } from '../srs/leitner'
import { aujourdhui, progression } from '../srs/store'

const duJour = computed(() => aReviser(toutesLesCartes(), progression.cartes, aujourdhui()).length)

const suite = computed(() => {
  const s = progression.session
  if (s) return { sur: 'Reprendre', titre: `${s.titre}, ${s.index + 1} sur ${s.ids?.length ?? s.exercices?.length}`, vers: s.retour }
  if (duJour.value) return { sur: 'À faire maintenant', titre: `Révision du jour, ${duJour.value} cartes`, vers: '/session?mode=jour' }
  const a = ACTIVITES.find((x) => avancement(derniere, x.type).pct < 100)
  if (a) return { sur: `Continuer le cours ${numero(derniere)}`, titre: a.nom, vers: `/session?lecon=${derniere.id}&type=${a.type}` }
  return undefined
})
const { annonce, devoirs } = derniere.prochainCours
</script>

<template>
  <EnTete :sur="dateJaponaise(new Date())" titre="Aujourd’hui" filigrane="今日" />

  <RouterLink v-if="suite" class="pilule" :to="suite.vers">
    <span><small>{{ suite.sur }}</small>{{ suite.titre }}</span>
    <span class="fleche"><Chevron /></span>
  </RouterLink>
  <p v-else class="calme">Tout est à jour pour aujourd'hui.</p>

  <template v-if="annonce.length || devoirs.length">
    <h2>Pour le prochain cours</h2>
    <Devoirs :lesson="derniere" />
  </template>

  <h2>Dernier cours</h2>
  <div class="activites">
    <RouterLink :to="`/lecon/${derniere.id}`">
      <span class="pastille">{{ numero(derniere) }}</span>
      <span class="corps">
        <span class="ligne"><strong>{{ derniere.titre }}</strong><Chevron /></span>
        <small>{{ enTete(derniere) }} · {{ avancement(derniere).pct }} % acquis</small>
      </span>
    </RouterLink>
  </div>
</template>
