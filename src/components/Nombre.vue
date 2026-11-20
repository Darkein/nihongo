<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { bind, unbind } from 'wanakana'
import { parler, voixDisponible } from '../audio'
import { decomposition, enChiffres, lectures, lireChiffres, type Mode, type Niveau } from '../content/nombres'
import { estJuste } from '../content/text'
import Barre from './Barre.vue'

const props = defineProps<{ n: number; niveau: Niveau; mode: Mode }>()
const emit = defineEmits<{ fini: [juste: boolean] }>()

const parties = decomposition(props.niveau, props.n)
const lecture = parties.map((p) => p.lectures[0]).join('')
const chiffres = enChiffres(props.n) + (props.niveau.age ? ' ans' : '')
// 28 → 20 + 8 · にじゅう · はっ · さい ; rien à détailler pour un nombre d'un seul morceau.
const nombres = parties.filter((p) => p.valeur)
const detail = parties.length > 1 ? `${nombres.map((p) => enChiffres(p.valeur)).join(' + ')} → ${parties.map((p) => p.lectures[0]).join(' · ')}` : ''
const variantes = lectures(parties).filter((l) => l !== lecture)

const enKana = props.mode === 'ecrire'
const champ = ref<HTMLInputElement>()
const juste = ref<boolean>()

onMounted(() => {
  if (enKana) bind(champ.value!, { IMEMode: true })
  champ.value!.focus()
  if (props.mode === 'ecouter') parler(lecture)
})
onBeforeUnmount(() => {
  if (enKana) unbind(champ.value!)
})

function valider() {
  if (juste.value !== undefined) return emit('fini', juste.value)
  const saisie = champ.value!.value.trim()
  if (!saisie) return
  juste.value = enKana ? estJuste(saisie, lectures(parties), 'kana') : lireChiffres(saisie) === props.n
}
</script>

<template>
  <template v-if="mode === 'ecrire'">
    <p class="serie">Écris en hiragana</p>
    <p class="carte grand">{{ chiffres }}</p>
  </template>
  <template v-else-if="mode === 'lire'">
    <p class="serie">Écris en chiffres</p>
    <p class="carte grand nombre-kana" lang="ja">{{ lecture }}</p>
  </template>
  <template v-else>
    <p class="serie">Écris en chiffres ce que tu entends</p>
    <div class="carte">
      <button v-if="voixDisponible" class="ecouter" type="button" aria-label="Réécouter" @click="parler(lecture)">
        <svg viewBox="0 0 24 24" width="56" height="56" aria-hidden="true">
          <path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" />
        </svg>
      </button>
      <p v-else>La synthèse vocale n’est pas disponible sur ce navigateur.</p>
      <small v-if="voixDisponible">Touche pour réécouter</small>
    </div>
  </template>

  <form @submit.prevent="valider">
    <input
      ref="champ"
      class="saisie"
      type="text"
      :inputmode="enKana ? 'text' : 'numeric'"
      :readonly="juste !== undefined"
      :placeholder="enKana ? 'tape en rōmaji → かな' : 'en chiffres'"
      aria-label="Ta réponse"
      autocomplete="off"
      autocapitalize="off"
      autocorrect="off"
      spellcheck="false"
    />
  </form>

  <Barre :juste="juste" :libelle="juste === undefined ? 'Vérifier' : 'Suivant'" :audio="juste !== undefined ? lecture : undefined" @action="valider">
    <template #aide>{{ enKana ? 'Tape en rōmaji : « ni ju u » donne にじゅう.' : 'Les espaces sont acceptés : 12 345.' }}</template>
    <span class="reponse-nombre">
      <strong>{{ chiffres }}</strong> <span lang="ja">{{ lecture }}</span>
      <small v-if="detail" lang="ja">{{ detail }}</small>
      <small v-if="enKana && variantes.length" lang="ja">Aussi accepté : {{ variantes.join(', ') }}</small>
    </span>
  </Barre>
</template>
