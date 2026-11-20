<script setup lang="ts">
defineProps<{ pct: number }>()
</script>

<template>
  <span class="jauge" role="progressbar" :aria-valuenow="pct" aria-valuemin="0" aria-valuemax="100"><i :style="{ width: pct + '%' }"></i></span>
</template>
