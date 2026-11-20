import { isHiragana, toHiragana } from 'wanakana'
import type { Exercice, Lesson, Mot } from './schema'
import { lecture } from './text'

const fichiers = import.meta.glob<Lesson>('/content/lessons/*/lesson.json', { eager: true, import: 'default' })

export const lessons: Lesson[] = Object.values(fichiers).sort((a, b) => a.id.localeCompare(b.id))
export const derniere = lessons[lessons.length - 1]
export const lessonParId = (id: string) => lessons.find((l) => l.id === id)

export const numero = (l: Lesson) => Number(l.id.slice(-2))
export const dateDe = (l: Lesson) =>
  l.date ? new Date(l.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : ''
export const enTete = (l: Lesson) => [`Cours ${numero(l)}`, dateDe(l)].filter(Boolean).join(', ')

export const vedette = (l: Lesson) => {
  const hiragana = l.kana.filter((k) => isHiragana(k))
  return l.vedette ?? ((hiragana.length ? hiragana : l.kana).join(' ') || l.mots.slice(0, 3).map((m) => m.jp).join('・'))
}
export const filigrane = (l: Lesson) => l.filigrane ?? l.kana[0]?.[0] ?? ''

export const ACTIVITES: { type: Categorie; nom: string; repere: string }[] = [
  { type: 'kana', nom: 'Kana', repere: 'あ' },
  { type: 'trace', nom: 'Tracé', repere: '筆' },
  { type: 'vocabulaire', nom: 'Vocabulaire', repere: '語' },
  { type: 'exercices', nom: 'Exercices', repere: '問' },
]

export type Categorie = 'kana' | 'trace' | 'vocabulaire' | 'exercices' | 'minitest'

export const devoirsDe = (l: Lesson) =>
  l.prochainCours.devoirs.map((d, i) => ({
    cle: `${l.id}/${i}`,
    ...(typeof d === 'string' ? { texte: d, activites: [] } : d),
  }))

export type Carte = { id: string; categorie: Categorie; lesson: Lesson } & (
  | { genre: 'kana'; kana: string }
  | { genre: 'trace'; kana: string }
  | { genre: 'mot'; mot: Mot; sens: 'jp-fr' | 'fr-jp' }
  | { genre: 'exercice'; exercice: Exercice }
)

export const kanaDe = (lesson: Lesson) => [...lesson.kana.join('')]

export function cartesDe(lesson: Lesson): Carte[] {
  const kana = kanaDe(lesson)
  return [
    ...kana.map((k): Carte => ({ id: `kana/${k}`, categorie: 'kana', lesson, genre: 'kana', kana: k })),
    ...lesson.mots.flatMap((mot): Carte[] => [
      { id: `${lesson.id}/mot/${mot.id}/jp-fr`, categorie: 'vocabulaire', lesson, genre: 'mot', mot, sens: 'jp-fr' },
      { id: `${lesson.id}/mot/${mot.id}/fr-jp`, categorie: 'vocabulaire', lesson, genre: 'mot', mot, sens: 'fr-jp' },
    ]),
    ...lesson.exercices.map(
      (exercice): Carte => ({ id: `${lesson.id}/ex/${exercice.id}`, categorie: 'exercices', lesson, genre: 'exercice', exercice }),
    ),
    ...(lesson.miniTest ?? []).map(
      (exercice): Carte => ({ id: `${lesson.id}/ex/${exercice.id}`, categorie: 'minitest', lesson, genre: 'exercice', exercice }),
    ),
    ...kana.map((k): Carte => ({ id: `trace/${k}`, categorie: 'trace', lesson, genre: 'trace', kana: k })),
  ]
}

export function toutesLesCartes(): Carte[] {
  const vues = new Set<string>()
  return lessons.flatMap(cartesDe).filter((c) => !vues.has(c.id) && vues.add(c.id))
}

export function melanger<T>(xs: T[]): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Même format que les mini-tests de début de cours : kana → rōmaji, katakana → hiragana, mots → rōmaji, vocabulaire.
export function miniTestBlanc(lesson: Lesson): Exercice[] {
  const kana = kanaDe(lesson)
  const hira = melanger(kana.filter((k) => isHiragana(k))).slice(0, 5)
  const kata = melanger(kana.filter((k) => !isHiragana(k))).slice(0, 5)
  const mots = melanger(lesson.mots)
  const lisibles = mots.filter((m) => isHiragana(lecture(m.jp).replace(/\s/g, ''))).slice(0, 3)
  return [
    ...hira.map((k, i): Exercice => ({ type: 'saisie', id: `blanc-h${i}`, question: `Écris la prononciation en rōmaji : ${k}`, attendu: 'romaji', reponses: [k] })),
    ...kata.map((k, i): Exercice => ({ type: 'saisie', id: `blanc-k${i}`, question: `Écris le hiragana correspondant : ${k}`, attendu: 'kana', reponses: [toHiragana(k)] })),
    ...lisibles.map((m, i): Exercice => ({ type: 'saisie', id: `blanc-m${i}`, question: `Écris en rōmaji : ${m.jp} (${m.fr})`, attendu: 'romaji', reponses: [m.jp] })),
    ...mots.slice(0, 3).map((m, i): Exercice => {
      const choix = melanger([m, ...melanger(lesson.mots.filter((x) => x.id !== m.id)).slice(0, 3)])
      return { type: 'qcm', id: `blanc-v${i}`, question: `Comment dit-on « ${m.fr} » ?`, choix: choix.map((c) => c.jp), reponse: choix.indexOf(m) }
    }),
  ]
}
