<script setup lang="ts">
import { computed } from 'vue'
import { romaji as versRomaji, segments } from '../content/text'
import { progression } from '../srs/store'

const props = defineProps<{ texte: string; romaji?: boolean }>()
const segs = computed(() => segments(props.texte))
</script>

<template>
  <span
    ><template v-for="(s, i) in segs" :key="i"
      ><ruby v-if="s.lecture">{{ s.base }}<rt>{{ s.lecture }}</rt></ruby
      ><template v-else>{{ s.base }}</template></template
    ></span
  >
  <span v-if="romaji && progression.romaji" class="romaji">{{ versRomaji(texte) }}</span>
</template>
