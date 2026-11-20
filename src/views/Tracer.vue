<script setup lang="ts">
import { computed, ref } from 'vue'
import Son from '../components/Son.vue'
import Trace from '../components/Trace.vue'

defineProps<{ kana: string }>()

// Le modèle s'estompe à chaque tracé réussi, jusqu'à disparaître.
const CONTOURS = [1, 0.5, 0.2, 0]
const essais = ref<{ juste: boolean; erreurs: number }[]>([])
const tour = ref(0)
const trace = ref<InstanceType<typeof Trace>>()
const reussis = computed(() => essais.value.filter((e) => e.juste).length)
const contour = computed(() => CONTOURS[Math.min(reussis.value, CONTOURS.length - 1)])
const dernier = computed(() => (essais.value.length > tour.value ? essais.value.at(-1) : undefined))

function fini(juste: boolean, erreurs: number) {
  essais.value.push({ juste, erreurs })
  setTimeout(() => tour.value++, 900)
}
</script>

<template>
  <div class="session">
    <header class="barre-session">
      <button class="fermer" type="button" aria-label="Retour" @click="$router.back()">✕</button>
      <span class="ou-titre">Tracé libre</span>
    </header>
    <section class="exercice">
      <Trace ref="trace" :key="tour" :kana="kana" :contour="contour" libre @fini="fini" />
      <div class="barre-action" :class="dernier ? (dernier.juste ? 'juste' : 'faux') : ''">
        <div class="retour-reponse" role="status">
          <span class="marque" aria-hidden="true">{{ dernier ? (dernier.juste ? '✓' : '✕') : '' }}</span>
          <strong v-if="dernier" class="titre-retour">
            {{ dernier.erreurs ? `${dernier.erreurs} trait${dernier.erreurs > 1 ? 's' : ''} raté${dernier.erreurs > 1 ? 's' : ''}` : 'Sans faute' }}
          </strong>
          <span v-else class="aide">{{ contour ? 'Le modèle s’efface à chaque réussite.' : 'Sans modèle.' }}</span>
          <span class="cellule-son"><Son :texte="kana" /></span>
          <div v-if="essais.length" class="correction">{{ reussis }} réussi{{ reussis > 1 ? 's' : '' }} sur {{ essais.length }}</div>
        </div>
        <div class="actions">
          <button type="button" :disabled="!!dernier" @click="trace?.montrer()">Montrer le tracé</button>
        </div>
      </div>
    </section>
  </div>
</template>
