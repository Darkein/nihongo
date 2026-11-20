<script setup lang="ts">
import { ref } from 'vue'
import JpText from './JpText.vue'
import Son from './Son.vue'

defineProps<{ recto: string; verso: string; rectoJp?: boolean; versoJp?: boolean; audio?: string }>()
defineEmits<{ fini: [juste: boolean] }>()

const retournee = ref(false)
</script>

<template>
  <div class="carte">
    <p class="recto" :class="{ grand: rectoJp }"><JpText :texte="recto" :romaji="rectoJp && retournee" /></p>
    <template v-if="retournee">
      <p class="verso" :class="{ grand: versoJp }">
        <JpText :texte="verso" :romaji="versoJp" />
        <Son v-if="audio" :texte="audio" />
      </p>
    </template>
  </div>
  <button v-if="!retournee" class="primaire" type="button" @click="retournee = true">Afficher la réponse</button>
  <div v-else class="rangee">
    <button type="button" @click="$emit('fini', false)">À revoir</button>
    <button class="primaire" type="button" @click="$emit('fini', true)">Je savais</button>
  </div>
</template>
