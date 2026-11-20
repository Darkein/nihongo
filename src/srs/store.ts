import { reactive, watch } from 'vue'
import type { Exercice } from '../content/schema'
import { noter, type Etat } from './leitner'

const CLE = 'nihongo.progression.v1'

export type SessionEnCours = {
  cle: string
  titre: string
  retour: string
  ids?: string[]
  exercices?: Exercice[]
  index: number
  justes: number
}
export type Theme = 'auto' | 'clair' | 'sombre'
export type Note = { note: number; date: string }

type Donnees = {
  version: 1
  cartes: Record<string, Etat>
  romaji: boolean
  theme: Theme
  vocabulaire: 'saisie' | 'cartes'
  // Notes de chaque test, de la plus ancienne à la plus récente.
  tests: Record<string, Note[]>
  // Clés des devoirs cochés.
  devoirs: string[]
  session: SessionEnCours | null
}

const NOTES_GARDEES = 10
const estNote = (n: unknown): n is Note =>
  typeof (n as Note)?.note === 'number' && typeof (n as Note)?.date === 'string'

function valider(d: unknown): Donnees {
  const o = d as Partial<Donnees>
  const ok =
    o?.version === 1 &&
    typeof o.romaji === 'boolean' &&
    typeof o.cartes === 'object' &&
    Object.values(o.cartes!).every((e) => Number.isInteger(e?.boite) && /^\d{4}-\d{2}-\d{2}$/.test(e?.echeance))
  if (!ok) throw new Error('Fichier de progression invalide')
  // Les anciennes sauvegardes ne gardaient qu'une note par test, sans tableau.
  const tests = Object.fromEntries(
    Object.entries((o.tests ?? {}) as Record<string, unknown>)
      .map(([cle, v]) => [cle, [v].flat().filter(estNote).slice(-NOTES_GARDEES)] as const)
      .filter(([, notes]) => notes.length),
  )
  const theme = o.theme === 'clair' || o.theme === 'sombre' ? o.theme : 'auto'
  const vocabulaire = o.vocabulaire === 'cartes' ? 'cartes' : 'saisie'
  const devoirs = Array.isArray(o.devoirs) ? o.devoirs.filter((d) => typeof d === 'string') : []
  return { version: 1, cartes: o.cartes!, romaji: o.romaji!, theme, vocabulaire, tests, devoirs, session: null }
}

function charger(): Donnees {
  try {
    const brut = JSON.parse(localStorage.getItem(CLE) ?? '')
    return { ...valider(brut), session: brut.session ?? null }
  } catch {
    return { version: 1, cartes: {}, romaji: true, theme: 'auto', vocabulaire: 'saisie', tests: {}, devoirs: [], session: null }
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

export function noterTest(cle: string, note: number) {
  progression.tests[cle] = [...(progression.tests[cle] ?? []), { note, date: aujourdhui() }].slice(-NOTES_GARDEES)
}

export function cocherDevoir(cle: string, fait: boolean) {
  progression.devoirs = fait ? [...new Set([...progression.devoirs, cle])] : progression.devoirs.filter((d) => d !== cle)
}

export const exporter = () => JSON.stringify({ ...progression, session: null }, null, 2)

export function importer(json: string) {
  Object.assign(progression, valider(JSON.parse(json)))
}
