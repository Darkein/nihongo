import { toHiragana, toRomaji } from 'wanakana'

export type Segment = { base: string; lecture?: string }

const FURIGANA = /\{([^|{}]+)\|([^|{}]+)\}/g

export function segments(s: string): Segment[] {
  const out: Segment[] = []
  let fin = 0
  for (const m of s.matchAll(FURIGANA)) {
    if (m.index > fin) out.push({ base: s.slice(fin, m.index) })
    out.push({ base: m[1], lecture: m[2] })
    fin = m.index + m[0].length
  }
  if (fin < s.length) out.push({ base: s.slice(fin) })
  return out
}

export const lecture = (s: string) => s.replace(FURIGANA, '$2')
// Les particules は et を, suivies d'une espace dans le contenu, se lisent « wa » et « o ».
const PARTICULE_WA = /(?<=\S)は(?=[\s\u3000、。？?]|$)/g
// Le kanji seul se lit mal en synthèse vocale ({人|じん} → « hito ») : on dicte la lecture du cours.
export const aDire = (s: string) => lecture(s).replace(PARTICULE_WA, 'わ')
export const romaji = (s: string) => toRomaji(aDire(s).replace(/を/g, 'お'))

const PONCTUATION = /[\s　。、．，,.?？!！…・「」]/g

export function normaliser(s: string): string {
  return toHiragana(lecture(s), { convertLongVowelMark: false })
    .replace(PONCTUATION, '')
    .replace(/ではありません/g, 'じゃありません')
    .toLowerCase()
}

export function normaliserRomaji(s: string): string {
  return toRomaji(toHiragana(s.toLowerCase().replace(/dzu/g, 'zu'))).replace(/[\s.]/g, '')
}

export function estJuste(saisie: string, reponses: string[], attendu: 'kana' | 'romaji' = 'kana'): boolean {
  const n = attendu === 'romaji' ? normaliserRomaji : normaliser
  const s = n(saisie)
  return s !== '' && reponses.some((r) => n(r) === s)
}
