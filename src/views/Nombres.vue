<script setup lang="ts">
import { ref, watch } from 'vue'
import Chevron from '../components/Chevron.vue'
import { numero } from '../content/lessons'
import { cleNiveau, conseille, maitrise, MODES, NIVEAUX, vuAu, type Mode, type Niveau } from '../content/nombres'
import { progression } from '../srs/store'

const CLE_MODE = 'nihongo.compter.mode'
const lu = (() => {
  try {
    return localStorage.getItem(CLE_MODE)
  } catch {
    return null
  }
})()
const mode = ref<Mode>(MODES.some((m) => m.mode === lu) ? (lu as Mode) : 'ecrire')
watch(mode, (m) => {
  try {
    localStorage.setItem(CLE_MODE, m)
  } catch {
    // stockage indisponible : le mode n'est pas retenu
  }
})

const notes = (n: Niveau) => progression.tests[cleNiveau(n)]
const aConseiller = conseille(notes)
const lien = (n: Niveau) => `/compter?niveau=${n.id}&mode=${mode.value}`

function etat(n: Niveau) {
  const cours = vuAu(n)
  const meilleure = notes(n)?.reduce((m, x) => Math.max(m, x.note), 0)
  return {
    vu: !cours ? 'Pas encore vu en cours' : n.max > n.requis ? `Ouvert avec le cours ${numero(cours)}` : `Vu au cours ${numero(cours)}`,
    score: maitrise(notes(n)) ? 'Maîtrisé' : meilleure !== undefined ? `Meilleur : ${meilleure} / 10` : '',
    nouveau: !cours,
  }
}
</script>

<template>
  <RouterLink class="retour" to="/entrainer"><Chevron gauche />S’entraîner</RouterLink>
  <h1 class="titre-page">Compter</h1>
  <p class="calme">
    Des séries de 10 nombres, tirés au hasard. Une erreur revient en fin de série. Deux séries à 9 / 10 et plus, et le niveau
    est maîtrisé.
  </p>

  <section>
    <h2 id="mode">Exercice</h2>
    <div class="segments" role="radiogroup" aria-labelledby="mode">
      <label v-for="m in MODES" :key="m.mode"><input v-model="mode" type="radio" name="mode" :value="m.mode" />{{ m.nom }}</label>
    </div>
    <p class="calme">{{ MODES.find((m) => m.mode === mode)!.detail }}.</p>
  </section>

  <RouterLink class="pilule secondaire" :to="lien(aConseiller)">
    <span><small>Niveau conseillé</small>{{ aConseiller.nom }}</span>
    <span class="fleche"><Chevron /></span>
  </RouterLink>

  <h2>Niveaux</h2>
  <div class="activites">
    <RouterLink v-for="(n, i) in NIVEAUX" :key="n.id" :to="lien(n)" :class="{ 'pas-vu': etat(n).nouveau }">
      <span class="pastille" lang="ja">{{ n.age ? '歳' : i + 1 }}</span>
      <span class="corps">
        <span class="ligne"><strong>{{ n.nom }}</strong><span>{{ etat(n).score }}</span></span>
        <small lang="ja">{{ n.detail }}</small>
        <small>{{ etat(n).vu }}</small>
      </span>
    </RouterLink>
  </div>
</template>
