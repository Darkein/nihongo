import { cartesDe, type Categorie } from '../content/lessons'
import type { Lesson } from '../content/schema'
import { progression } from './store'

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

export const noteDe = (cle: string) => {
  const n = progression.tests[cle]
  return n ? `${n.note} / 10` : undefined
}
