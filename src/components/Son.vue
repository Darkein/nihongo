<script setup lang="ts">
import { parler, voixDisponible } from '../audio'

defineProps<{ texte: string }>()
</script>

<template>
  <button v-if="voixDisponible" class="son" type="button" aria-label="Écouter" @click.stop="parler(texte)">
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" />
    </svg>
  </button>
</template>
