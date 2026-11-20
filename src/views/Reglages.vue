<script setup lang="ts">
import { ref } from 'vue'
import EnTete from '../components/EnTete.vue'
import { exporter, importer, progression } from '../srs/store'

const message = ref('')
const VERSION = __VERSION__

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
  <EnTete sur="L’app, à ta façon" titre="Réglages" filigrane="設定" />
  <section>
    <h2 id="theme">Apparence</h2>
    <div class="segments" role="radiogroup" aria-labelledby="theme">
      <label v-for="[valeur, nom] in [['auto', 'Automatique'], ['clair', 'Clair'], ['sombre', 'Sombre']]" :key="valeur">
        <input v-model="progression.theme" type="radio" name="theme" :value="valeur" />{{ nom }}
      </label>
    </div>
  </section>
  <section>
    <h2 id="vocabulaire">Cartes de vocabulaire</h2>
    <div class="segments" role="radiogroup" aria-labelledby="vocabulaire">
      <label v-for="[valeur, nom] in [['saisie', 'Réponse à donner'], ['cartes', 'Auto-évaluation']]" :key="valeur">
        <input v-model="progression.vocabulaire" type="radio" name="vocabulaire" :value="valeur" />{{ nom }}
      </label>
    </div>
    <p class="calme">
      {{
        progression.vocabulaire === 'saisie'
          ? 'Du français vers le japonais, tu tapes le mot. Du japonais vers le français, tu choisis parmi quatre réponses.'
          : 'La carte se retourne et tu indiques toi-même si tu savais.'
      }}
    </p>
  </section>
  <section>
    <h2>Aides</h2>
    <label class="interrupteur"><input v-model="progression.romaji" type="checkbox" /> Afficher le rōmaji sous les kana</label>
  </section>
  <section>
    <h2>Progression</h2>
    <p>Elle est enregistrée dans ce navigateur uniquement. Exporte-la pour la sauvegarder ou la transférer sur un autre appareil.</p>
    <div class="rangee">
      <button type="button" @click="telecharger">Exporter</button>
      <label class="bouton">Importer<input type="file" accept="application/json" hidden @change="charger" /></label>
    </div>
    <p role="status">{{ message }}</p>
  </section>
  <section>
    <h2>Crédits</h2>
    <p>
      Tracés des kana : <a href="https://github.com/parsimonhi/animCJK" target="_blank" rel="noopener noreferrer">AnimCJK</a>
      (Arphic Public License). Animation : Hanzi Writer. Conversion rōmaji : WanaKana.
    </p>
  </section>
  <p class="version">Version {{ VERSION }}</p>
</template>
