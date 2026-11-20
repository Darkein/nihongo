<script setup lang="ts">
import { onMounted, ref } from 'vue'

defineProps<{ juste: boolean }>()
defineEmits<{ suite: [] }>()

const bouton = ref<HTMLButtonElement>()
onMounted(() => bouton.value?.focus())
</script>

<template>
  <div class="verdict" :class="juste ? 'juste' : 'faux'" role="status">
    <strong>{{ juste ? 'Juste' : 'À revoir' }}</strong>
    <div class="correction"><slot /></div>
    <button ref="bouton" class="primaire" type="button" @click="$emit('suite')">Continuer</button>
  </div>
</template>
