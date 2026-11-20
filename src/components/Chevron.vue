<script setup lang="ts">
defineProps<{ gauche?: boolean }>()
</script>

<template>
  <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path :d="gauche ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'" />
  </svg>
</template>
