import { cartesDe, derniere, devoirsDe, toutesLesCartes, type Categorie } from '../content/lessons'
import type { Lesson } from '../content/schema'
import { aReviser } from './leitner'
import { aujourdhui, cocherDevoir, progression, type Note } from './store'

// Part des cartes réussies à leur dernière révision : la maîtrise, qui peut baisser.
export function avancement(lesson: Lesson): { pct: number } {
  const cartes = cartesDe(lesson).filter((c) => c.categorie !== 'minitest')
  const acquises = cartes.filter((c) => progression.cartes[c.id]?.ok).length
  return { pct: cartes.length ? Math.round((acquises / cartes.length) * 100) : 0 }
}

// Préparation d'une activité : faite dès un passage complet, quel que soit le score, et elle le reste.
export function passage(lesson: Lesson, type: Categorie) {
  const total = cartesDe(lesson).filter((c) => c.categorie === type).length
  const dernier = progression.passages[`${lesson.id}/${type}`]
  const texte = dernier ? `${dernier.justes} / ${dernier.total} ✓` : `${total} cartes`
  return { total, dernier, texte }
}

const sur10 = (n: Note) => `${n.note} / 10`
const jour = (date: string) => new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })

export const noteDe = (cle: string) => {
  const n = progression.tests[cle]?.at(-1)
  return n ? sur10(n) : undefined
}

// Le passage qui complète les activités d'un devoir le coche ; on peut toujours le décocher ensuite.
export function cocherDevoirsFinis(lesson: Lesson, type: string) {
  for (const d of devoirsDe(lesson)) {
    const activites = d.activites as string[]
    if (activites.includes(type) && activites.every((t) => progression.passages[`${lesson.id}/${t}`])) cocherDevoir(d.cle, true)
  }
}

export const lienTest = (lessonId: string, type: 'minitest' | 'blanc') => `/session?lecon=${lessonId}&type=${type}`

// Ce qu'on affiche à côté d'un test : son état, et les notes déjà obtenues pour ne pas les perdre de vue.
export function etatTest(
  lessonId: string,
  type: 'minitest' | 'blanc',
): { etat: string; detail?: string; enCours?: boolean; note?: number } {
  const notes = progression.tests[`${lessonId}/${type}`] ?? []
  const derniere = notes.at(-1)
  if (progression.session?.retour === lienTest(lessonId, type))
    return { etat: 'En cours', enCours: true, detail: derniere && `Dernière note : ${sur10(derniere)}, le ${jour(derniere.date)}` }
  if (!derniere) return { etat: 'À passer' }
  const avant = notes.slice(0, -1).map((n) => n.note).join(' · ')
  return {
    etat: sur10(derniere),
    note: derniere.note,
    detail: `Passé le ${jour(derniere.date)}` + (avant ? `, notes précédentes : ${avant}` : ''),
  }
}

// Les cartes du dernier cours passent devant : c'est lui qu'on travaille d'ici la séance suivante.
export function cartesDuJour() {
  const cartes = toutesLesCartes()
  const ordre = [...cartes.filter((c) => c.lesson === derniere), ...cartes.filter((c) => c.lesson !== derniere)]
  return aReviser(ordre, progression.cartes, aujourdhui())
}
