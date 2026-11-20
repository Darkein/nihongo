import { reactive, watch } from 'vue'
import { noter, type Etat } from './leitner'

const CLE = 'nihongo.progression.v1'

type Donnees = { version: 1; cartes: Record<string, Etat>; romaji: boolean }

function valider(d: unknown): Donnees {
  const o = d as Donnees
  const ok =
    o?.version === 1 &&
    typeof o.romaji === 'boolean' &&
    typeof o.cartes === 'object' &&
    Object.values(o.cartes).every((e) => Number.isInteger(e?.boite) && /^\d{4}-\d{2}-\d{2}$/.test(e?.echeance))
  if (!ok) throw new Error('Fichier de progression invalide')
  return { version: 1, cartes: o.cartes, romaji: o.romaji }
}

function charger(): Donnees {
  try {
    return valider(JSON.parse(localStorage.getItem(CLE) ?? ''))
  } catch {
    return { version: 1, cartes: {}, romaji: true }
  }
}

export const progression = reactive(charger())

watch(progression, (p) => {
  try {
    localStorage.setItem(CLE, JSON.stringify(p))
  } catch {
    // stockage indisponible (navigation privée) : la progression reste en mémoire
  }
})

export const aujourdhui = () => new Date().toLocaleDateString('sv')

export function enregistrer(id: string, juste: boolean) {
  progression.cartes[id] = noter(progression.cartes[id], juste, aujourdhui())
}

export const exporter = () => JSON.stringify(progression, null, 2)

export function importer(json: string) {
  Object.assign(progression, valider(JSON.parse(json)))
}
