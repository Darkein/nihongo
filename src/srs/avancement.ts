import { cartesDe, derniere, toutesLesCartes, type Categorie } from '../content/lessons'
import type { Lesson } from '../content/schema'
import { aReviser } from './leitner'
import { aujourdhui, progression, type Note } from './store'

export type Avancement = { fait: number; total: number; pct: number; texte: string }

export function avancement(lesson: Lesson, categorie?: Categorie): Avancement {
  const cartes = cartesDe(lesson).filter((c) => (categorie ? c.categorie === categorie : c.categorie !== 'minitest'))
  const fait = cartes.filter((c) => progression.cartes[c.id]?.ok).length
  const total = cartes.length
  return {
    fait,
    total,
    pct: total ? Math.round((fait / total) * 100) : 0,
    texte: total && fait === total ? 'Fait' : `${fait} / ${total}`,
  }
}

const sur10 = (n: Note) => `${n.note} / 10`
const jour = (date: string) => new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })

export const noteDe = (cle: string) => {
  const n = progression.tests[cle]?.at(-1)
  return n ? sur10(n) : undefined
}

export const lienTest = (lessonId: string, type: 'minitest' | 'blanc') => `/session?lecon=${lessonId}&type=${type}`

// Ce qu'on affiche à côté d'un test : son état, et les notes déjà obtenues pour ne pas les perdre de vue.
export function etatTest(lessonId: string, type: 'minitest' | 'blanc'): { etat: string; detail?: string } {
  const notes = progression.tests[`${lessonId}/${type}`] ?? []
  const derniere = notes.at(-1)
  if (progression.session?.retour === lienTest(lessonId, type))
    return { etat: 'En cours', detail: derniere && `Dernière note : ${sur10(derniere)}, le ${jour(derniere.date)}` }
  if (!derniere) return { etat: 'À passer' }
  const avant = notes.slice(0, -1).map((n) => n.note).join(' · ')
  return { etat: sur10(derniere), detail: `Passé le ${jour(derniere.date)}` + (avant ? `, notes précédentes : ${avant}` : '') }
}

// Les cartes du dernier cours passent devant : c'est lui qu'on travaille d'ici la séance suivante.
export function cartesDuJour() {
  const cartes = toutesLesCartes()
  const ordre = [...cartes.filter((c) => c.lesson === derniere), ...cartes.filter((c) => c.lesson !== derniere)]
  return aReviser(ordre, progression.cartes, aujourdhui())
}
