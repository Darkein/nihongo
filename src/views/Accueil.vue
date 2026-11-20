<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Chevron from '../components/Chevron.vue'
import Devoirs from '../components/Devoirs.vue'
import EnTete from '../components/EnTete.vue'
import JpText from '../components/JpText.vue'
import { ACTIVITES, cartesDe, derniere, filigrane, lessons, numero, toutesLesCartes, type Categorie } from '../content/lessons'
import { dateJaponaise } from '../content/date'
import type { Lesson } from '../content/schema'
import { lecture } from '../content/text'
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

// Un aperçu de ce que l'activité fait travailler, pour savoir à quoi on s'attaque avant de l'ouvrir.
const apercu = (l: Lesson, type: Categorie) =>
  type === 'vocabulaire'
    ? l.mots.slice(0, 4).map((m) => lecture(m.jp)).join('・')
    : type === 'exercices'
      ? pluriel(l.exercices.length, 'question')
      : l.kana.join(' ')

// Le dernier cours est en cours d'apprentissage : seuls les précédents peuvent avoir des trous.
const rattrapages = computed(() =>
  lessons
    .filter((l) => l !== derniere)
    .map((l) => {
      const presentes = ACTIVITES.filter((a) => cartesDe(l).some((c) => c.categorie === a.type))
      const jamais = presentes
        .filter((a) => cartesDe(l).every((c) => c.categorie !== a.type || !progression.cartes[c.id]))
        .map((a) => ({
          cle: a.type,
          repere: a.repere,
          nom: a.nom,
          apercu: apercu(l, a.type),
          ja: a.type !== 'exercices',
          vers: `/session?lecon=${l.id}&type=${a.type}`,
        }))
      const note = progression.tests[`${l.id}/blanc`]?.at(-1)
      const blanc =
        note && note.note < 7
          ? [{ cle: 'blanc', repere: '試', nom: 'Mini-test blanc', apercu: `Dernière note : ${note.note} / 10`, ja: false, vers: lienTest(l.id, 'blanc') }]
          : []
      const etat = jamais.length === presentes.length ? 'Pas commencé' : jamais.length ? `Reste ${jamais.length}` : ''
      return { l, etat, trous: [...jamais, ...blanc] }
    })
    .filter((r) => r.trous.length),
)

// Sans écran tactile ni trackpad, rien ne fait défiler la frise : des flèches prennent le relais.
const frise = ref<HTMLElement>()
const bords = ref({ debut: true, fin: true })
const mesurer = () => {
  const f = frise.value
  if (f) bords.value = { debut: f.scrollLeft < 8, fin: f.scrollLeft + f.clientWidth > f.scrollWidth - 8 }
}
const defiler = (sens: number) => {
  const f = frise.value
  const carte = f?.firstElementChild as HTMLElement | undefined
  if (f && carte) f.scrollBy({ left: sens * (carte.offsetWidth + 12), behavior: 'smooth' })
}
onMounted(mesurer)
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
  <div v-if="rattrapages.length" class="cadre-frise">
    <ul ref="frise" class="frise" @scroll.passive="mesurer">
      <li v-for="r in rattrapages" :key="r.l.id">
        <span class="geant" lang="ja" aria-hidden="true">{{ filigrane(r.l) }}</span>
        <p class="ligne"><strong>Cours {{ numero(r.l) }}</strong><span>{{ r.etat }}</span></p>
        <p class="titre">{{ r.l.titre }}</p>
        <RouterLink v-for="t in r.trous" :key="t.cle" :to="t.vers">
          <span class="repere" lang="ja" aria-hidden="true">{{ t.repere }}</span>
          <span class="corps"><strong>{{ t.nom }}</strong><small :lang="t.ja ? 'ja' : undefined">{{ t.apercu }}</small></span>
          <Chevron />
        </RouterLink>
      </li>
    </ul>
    <button v-if="!bords.debut" class="defiler" aria-label="Cours précédents" @click="defiler(-1)"><Chevron gauche /></button>
    <button v-if="!bords.fin" class="defiler suivant" aria-label="Cours suivants" @click="defiler(1)"><Chevron /></button>
  </div>
  <p v-if="!rattrapages.length && !rates.visibles.length && !rates.autres" class="calme">Rien à consolider pour l’instant.</p>
</template>
