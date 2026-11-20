<script setup lang="ts">
import type { Fiche } from '../content/schema'
import JpText from './JpText.vue'

defineProps<{ fiches: Fiche[] }>()
</script>

<template>
  <details class="fiches" open>
    <summary>Personnages</summary>
    <div class="defile">
      <table>
        <tr v-for="f in fiches" :key="f.nom">
          <th><JpText :texte="f.nom" /></th>
          <td><JpText :texte="f.pays" /></td>
          <td><JpText :texte="f.metier" /></td>
          <td v-if="f.organisation"><JpText :texte="f.organisation" /></td>
          <td v-if="f.age">{{ f.age }}</td>
        </tr>
      </table>
    </div>
  </details>
</template>
