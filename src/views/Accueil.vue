<script setup lang="ts">
import { computed } from 'vue'
import Chevron from '../components/Chevron.vue'
import Devoirs from '../components/Devoirs.vue'
import EnTete from '../components/EnTete.vue'
import JpText from '../components/JpText.vue'
import { ACTIVITES, cartesDe, derniere, lessons, numero, toutesLesCartes } from '../content/lessons'
import { dateJaponaise } from '../content/date'
import { cartesDuJour, lienTest } from '../srs/avancement'
import { ajouterJours } from '../srs/leitner'
import { aujourdhui, progression } from '../srs/store'

const REVISION = '/session?mode=jour'
const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? 's' : ''}`

const session = computed(() => progression.session)
const position = computed(() => {
  const s = session.value
  return s && `${s.index + 1} sur ${s.ids?.length ?? s.exercices?.length}`
})
const jour = computed(() => cartesDuJour())
const detail = computed(() => {
  const aRevoir = jour.value.filter((c) => progression.cartes[c.id]).length
  const nouvelles = jour.value.length - aRevoir
  return [
    aRevoir && `${aRevoir} à revoir`,
    nouvelles && pluriel(nouvelles, 'nouvelle'),
    `~${Math.max(1, Math.round(jour.value.length / 3))} min`,
  ]
    .filter(Boolean)
    .join(' · ')
})

const { annonce, devoirs } = derniere.prochainCours
const prochain = derniere.prochainCours.date ?? (derniere.date && ajouterJours(derniere.date, 7))
const dans = prochain ? Math.round((Date.parse(prochain) - Date.parse(aujourdhui())) / 86_400_000) : -1
const titrePreparer =
  prochain && dans >= 0
    ? `Préparer ${new Date(prochain).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric' })}`
    : 'Préparer le prochain cours'
const quand = dans === 0 ? 'aujourd’hui' : dans === 1 ? 'demain' : dans > 1 ? `dans ${dans} jours` : ''
const sousTitre = [`Cours ${numero(derniere) + 1}`, quand].filter(Boolean).join(' · ')

const MAX_RATES = 8
const rates = computed(() => {
  const cartes = toutesLesCartes().filter((c) => progression.cartes[c.id]?.ok === false)
  const etiquettes = [...new Set(cartes.flatMap((c) => (c.genre === 'mot' ? [c.mot.jp] : c.genre === 'exercice' ? [] : [c.kana])))]
  const exercices = cartes.filter((c) => c.genre === 'exercice').length
  return { visibles: etiquettes.slice(0, MAX_RATES), autres: Math.max(0, etiquettes.length - MAX_RATES) + exercices }
})

// Le dernier cours est en cours d'apprentissage : seuls les précédents peuvent avoir des trous.
const trous = computed(() =>
  lessons
    .filter((l) => l !== derniere)
    .flatMap((l) => {
      const jamais = ACTIVITES.filter((a) => {
        const cartes = cartesDe(l).filter((c) => c.categorie === a.type)
        return cartes.length && cartes.every((c) => !progression.cartes[c.id])
      }).map((a) => ({ cle: `${l.id}/${a.type}`, l, nom: a.nom, etat: 'jamais fait', vers: `/session?lecon=${l.id}&type=${a.type}` }))
      const note = progression.tests[`${l.id}/blanc`]?.at(-1)
      const blanc =
        note && note.note < 7
          ? [{ cle: `${l.id}/blanc`, l, nom: 'Mini-test blanc', etat: `${note.note} / 10`, vers: lienTest(l.id, 'blanc') }]
          : []
      return [...jamais, ...blanc]
    }),
)
</script>

<template>
  <EnTete :sur="dateJaponaise(new Date())" titre="Aujourd’hui" filigrane="今日" />

  <RouterLink v-if="session?.retour === REVISION" class="pilule" :to="REVISION">
    <span><small>Reprendre</small>Révision du jour, {{ position }}</span>
    <span class="fleche"><Chevron /></span>
  </RouterLink>
  <RouterLink v-else-if="jour.length" class="pilule" :to="REVISION">
    <span><small>{{ detail }}</small>Réviser · {{ pluriel(jour.length, 'carte') }}</span>
    <span class="fleche"><Chevron /></span>
  </RouterLink>
  <p v-else class="calme">Rien à réviser aujourd’hui.</p>
  <RouterLink v-if="session && session.retour !== REVISION" class="pilule secondaire" :to="session.retour">
    <span><small>Reprendre</small>{{ session.titre }}, {{ position }}</span>
    <span class="fleche"><Chevron /></span>
  </RouterLink>

  <template v-if="annonce.length || devoirs.length">
    <h2>{{ titrePreparer }}</h2>
    <p class="sous-titre">{{ sousTitre }}</p>
    <Devoirs :lesson="derniere" />
    <RouterLink class="lien-fort" :to="`/lecon/${derniere.id}/resume`">Relire le résumé du cours {{ numero(derniere) }} ›</RouterLink>
  </template>

  <h2>À consolider</h2>
  <p class="sous-titre">Ce que tu as raté ou laissé de côté</p>
  <template v-if="rates.visibles.length || rates.autres">
    <p class="calme">Ratés la dernière fois</p>
    <ul class="rates">
      <li v-for="r in rates.visibles" :key="r" lang="ja"><JpText :texte="r" /></li>
      <li v-if="rates.autres" class="autres">+{{ rates.autres }}</li>
    </ul>
  </template>
  <div v-if="trous.length" class="activites">
    <RouterLink v-for="t in trous" :key="t.cle" :to="t.vers">
      <span class="pastille">{{ numero(t.l) }}</span>
      <span class="corps">
        <span class="ligne"><strong>{{ t.nom }}</strong><span class="manque">{{ t.etat }}</span></span>
      </span>
    </RouterLink>
  </div>
  <p v-if="!trous.length && !rates.visibles.length && !rates.autres" class="calme">Rien à consolider pour l’instant.</p>
</template>
