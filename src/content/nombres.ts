import { lessons } from './lessons'

// Une partie d'un nombre lu : sa valeur (30), ses lectures (la première est celle qu'on enseigne).
export type Partie = { valeur: number; lectures: string[] }

const CHIFFRES: string[][] = [
  [],
  ['いち'],
  ['に'],
  ['さん'],
  ['よん', 'し'],
  ['ご'],
  ['ろく'],
  ['なな', 'しち'],
  ['はち'],
  ['きゅう', 'く'],
]
// Lecture du chiffre devant じゅう : くじゅう ne se dit pas.
const DEVANT_DIX: string[][] = [[], [''], ['に'], ['さん'], ['よん'], ['ご'], ['ろく'], ['なな', 'しち'], ['はち'], ['きゅう']]
const CENTAINES = ['', 'ひゃく', 'にひゃく', 'さんびゃく', 'よんひゃく', 'ごひゃく', 'ろっぴゃく', 'ななひゃく', 'はっぴゃく', 'きゅうひゃく']
const MILLIERS = ['', 'せん', 'にせん', 'さんぜん', 'よんせん', 'ごせん', 'ろくせん', 'ななせん', 'はっせん', 'きゅうせん']

// Découpe un nombre de 1 à 9 999 : 2 034 → 2 000 + 30 + 4.
function groupe(n: number): Partie[] {
  const [m, c, d, u] = [Math.floor(n / 1000), Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, n % 10]
  const parties: Partie[] = []
  if (m) parties.push({ valeur: m * 1000, lectures: [MILLIERS[m]] })
  if (c) parties.push({ valeur: c * 100, lectures: [CENTAINES[c]] })
  if (d) parties.push({ valeur: d * 10, lectures: DEVANT_DIX[d].map((x) => x + 'じゅう') })
  if (u) parties.push({ valeur: u, lectures: CHIFFRES[u] })
  return parties
}

export function decomposer(n: number): Partie[] {
  if (!Number.isInteger(n) || n < 0 || n >= 1e8) throw new RangeError(`Nombre non pris en charge : ${n}`)
  if (n === 0) return [{ valeur: 0, lectures: ['ぜろ', 'れい'] }]
  const man = Math.floor(n / 10000)
  const reste = groupe(n % 10000)
  if (!man) return reste
  // 10 000 se dit いちまん, 10 000 000 せんまん ou いっせんまん.
  const avant = man === 1 ? ['いち'] : produit(groupe(man).map((p) => p.lectures))
  const lectures = avant.flatMap((a) => (a === 'せん' ? ['せんまん', 'いっせんまん'] : [a + 'まん']))
  return [{ valeur: man * 10000, lectures }, ...reste]
}

function produit(listes: string[][]): string[] {
  return listes.reduce<string[]>((acc, l) => acc.flatMap((a) => l.map((x) => a + x)), [''])
}

export const lectures = (parties: Partie[]) => produit(parties.map((p) => p.lectures))

// L'âge : いっさい, はっさい, じゅっさい, はたち. Les autres prennent さい tel quel.
export function decomposerAge(n: number): Partie[] {
  if (!Number.isInteger(n) || n < 1 || n > 99) throw new RangeError(`Âge non pris en charge : ${n}`)
  if (n === 20) return [{ valeur: 20, lectures: ['はたち', 'にじゅっさい'] }]
  const parties = groupe(n)
  const der = parties[parties.length - 1]
  const age: Partie = { valeur: 0, lectures: ['さい'] }
  if (der.valeur === 1) der.lectures = ['いっ']
  else if (der.valeur === 8) der.lectures = ['はっ']
  else if (der.valeur === 4) der.lectures = ['よん']
  else if (der.valeur === 9) der.lectures = ['きゅう']
  else if (der.valeur >= 10) der.lectures = der.lectures.flatMap((l) => [l.replace(/じゅう$/, 'じゅっ'), l.replace(/じゅう$/, 'じっ')])
  return [...parties, age]
}

// ———————————————————————— Niveaux

export type Mode = 'ecrire' | 'lire' | 'ecouter'
export const MODES: { mode: Mode; nom: string; detail: string }[] = [
  { mode: 'ecrire', nom: 'Écrire', detail: 'Un nombre en chiffres, tu l’écris en hiragana' },
  { mode: 'lire', nom: 'Lire', detail: 'Un nombre en hiragana, tu l’écris en chiffres' },
  { mode: 'ecouter', nom: 'Écouter', detail: 'Tu entends un nombre, tu l’écris en chiffres' },
]

export type Niveau = {
  id: string
  nom: string
  detail: string
  min: number
  max: number
  age?: true
  // Le niveau est vu en cours dès qu'une leçon enseigne les nombres jusque-là.
  requis: number
}

export const NIVEAUX: Niveau[] = [
  { id: '0-10', nom: 'De 0 à 10', detail: 'よん / し, なな / しち, きゅう / く', min: 0, max: 10, requis: 10 },
  { id: '11-50', nom: 'De 11 à 50', detail: 'Dix + unité, chiffre + dix', min: 11, max: 50, requis: 50 },
  // Même mécanique que jusqu'à 50 : ouvert dès que 50 est vu.
  { id: '51-99', nom: 'De 51 à 99', detail: 'Toutes les dizaines', min: 51, max: 99, requis: 50 },
  { id: '100-999', nom: 'De 100 à 999', detail: 'ひゃく, さんびゃく, ろっぴゃく, はっぴゃく', min: 100, max: 999, requis: 999 },
  { id: '1000-9999', nom: 'De 1 000 à 9 999', detail: 'せん, さんぜん, はっせん', min: 1000, max: 9999, requis: 9999 },
  { id: '10000', nom: '10 000 et plus', detail: 'まん, on compte par 4 chiffres', min: 10000, max: 99_999_999, requis: 99_999_999 },
  { id: 'age', nom: 'L’âge', detail: 'いっさい, はっさい, じゅっさい, はたち', min: 1, max: 99, age: true, requis: Infinity },
]
export const niveauParId = (id: string) => NIVEAUX.find((n) => n.id === id)

// Le cours où le niveau a été vu, s'il l'a été.
export function vuAu(niveau: Niveau, ls = lessons) {
  return ls.find((l) => (niveau.age ? l.nombres?.compteurs?.includes('さい') : (l.nombres?.jusqua ?? -1) >= niveau.requis))
}

export const decomposition = (niveau: Niveau, n: number) => (niveau.age ? decomposerAge(n) : decomposer(n))

// Un tirage plus serré au-delà de 10 000 : au plus quatre chiffres significatifs, sinon c'est illisible.
export function tirer(niveau: Niveau, alea = Math.random): number {
  const entre = (a: number, b: number) => a + Math.floor(alea() * (b - a + 1))
  if (niveau.id !== '10000') return entre(niveau.min, niveau.max)
  const chiffres = entre(5, 8)
  const significatifs = entre(1, 4)
  const tete = entre(10 ** (significatifs - 1), 10 ** significatifs - 1)
  return tete * 10 ** (chiffres - significatifs)
}

// Dix nombres sans doublon quand la plage le permet.
export function serie(niveau: Niveau, taille = 10, alea = Math.random): number[] {
  const vus = new Set<number>()
  const plage = niveau.max - niveau.min + 1
  while (vus.size < Math.min(taille, plage)) vus.add(tirer(niveau, alea))
  const out = [...vus]
  while (out.length < taille) out.push(tirer(niveau, alea))
  return out
}

export const enChiffres = (n: number) => n.toLocaleString('fr-FR')
export const lireChiffres = (s: string) => {
  const brut = s.replace(/[\s  .,'’]/g, '').replace(/[０-９]/g, (c) => String(c.charCodeAt(0) - 0xff10))
  return /^\d+$/.test(brut) ? Number(brut) : undefined
}

// ———————————————————————— Progression

export const cleNiveau = (n: Niveau) => `nombres/${n.id}`
// Maîtrisé : au moins 9/10 aux deux dernières séries.
export const maitrise = (notes: { note: number }[] = []) => notes.length >= 2 && notes.slice(-2).every((n) => n.note >= 9)

// Le premier niveau vu en cours et pas encore maîtrisé ; tout est maîtrisé : le premier qu'on n'a pas vu.
export function conseille(notesDe: (n: Niveau) => { note: number }[] | undefined, ls = lessons): Niveau {
  const echelle = NIVEAUX.filter((n) => !n.age)
  return (
    echelle.find((n) => vuAu(n, ls) && !maitrise(notesDe(n))) ??
    echelle.find((n) => !vuAu(n, ls)) ??
    echelle[echelle.length - 1]
  )
}

export const suivant = (n: Niveau) => (n.age ? undefined : NIVEAUX.filter((x) => !x.age)[NIVEAUX.indexOf(n) + 1])
