<script setup lang="ts">
import { ref } from 'vue'
import { exporter, importer, progression } from '../srs/store'

const message = ref('')

function telecharger() {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([exporter()], { type: 'application/json' }))
  a.download = `nihongo-progression-${new Date().toLocaleDateString('sv')}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

async function charger(e: Event) {
  const fichier = (e.target as HTMLInputElement).files?.[0]
  if (!fichier) return
  try {
    importer(await fichier.text())
    message.value = 'Progression importée.'
  } catch {
    message.value = 'Fichier de progression invalide.'
  }
}
</script>

<template>
  <h1>Réglages</h1>
  <section class="bloc">
    <label class="interrupteur"><input v-model="progression.romaji" type="checkbox" /> Afficher le rōmaji sous les kana</label>
  </section>
  <section class="bloc">
    <h2>Progression</h2>
    <p>Elle est enregistrée dans ce navigateur uniquement. Exporte-la pour la sauvegarder ou la transférer sur un autre appareil.</p>
    <div class="rangee">
      <button type="button" @click="telecharger">Exporter</button>
      <label class="bouton">Importer<input type="file" accept="application/json" hidden @change="charger" /></label>
    </div>
    <p role="status">{{ message }}</p>
  </section>
  <section class="bloc">
    <h2>Crédits</h2>
    <p>
      Tracés des kana : <a href="https://github.com/parsimonhi/animCJK" target="_blank" rel="noopener noreferrer">AnimCJK</a>
      (Arphic Public License). Animation : Hanzi Writer. Conversion rōmaji : WanaKana.
    </p>
  </section>
</template>
