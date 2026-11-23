<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import Son from './Son.vue'

const props = withDefaults(defineProps<{ juste?: boolean; libelle: string; inactif?: boolean; audio?: string }>(), {
  juste: undefined,
})
defineEmits<{ action: [] }>()

const bouton = ref<HTMLButtonElement>()
watch(
  () => props.juste,
  async (j) => {
    if (j === undefined) return
    await nextTick()
    bouton.value?.focus()
  },
)
</script>

<template>
  <div class="barre-action" :class="juste === undefined ? '' : juste ? 'juste' : 'faux'">
    <div class="retour-reponse" role="status">
      <span class="marque" aria-hidden="true">{{ juste === undefined ? '' : juste ? '✓' : '✕' }}</span>
      <strong v-if="juste !== undefined" class="titre-retour">{{ juste ? 'Bonne réponse' : 'Pas tout à fait' }}</strong>
      <span v-else class="aide"><slot name="aide" /></span>
      <span class="cellule-son"><Son v-if="audio" :texte="audio" /></span>
      <div class="correction"><slot v-if="juste !== undefined" /></div>
    </div>
    <div class="actions">
      <slot name="secondaire" />
      <!-- Garder le focus dans le champ : sinon, clavier mobile ouvert, le premier appui ne fait que le fermer et la page bouge sous le doigt. -->
      <button ref="bouton" class="primaire" type="button" :disabled="inactif" @pointerdown.prevent @click="$emit('action')">{{ libelle }}</button>
    </div>
  </div>
</template>
