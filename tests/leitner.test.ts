import { expect, test } from 'vitest'
import { aReviser, noter } from '../src/srs/leitner.ts'

test('une carte juste monte de boîte et s’espace', () => {
  const a = noter(undefined, true, '2026-11-20')
  expect(a).toEqual({ boite: 1, echeance: '2026-11-21' })
  expect(noter(a, true, '2026-11-21')).toEqual({ boite: 2, echeance: '2026-11-23' })
})

test('une carte fausse retombe en boîte 1', () => {
  expect(noter({ boite: 4, echeance: '2026-11-20' }, false, '2026-11-20')).toEqual({ boite: 1, echeance: '2026-11-21' })
})

test('la boîte est plafonnée à 5', () => {
  expect(noter({ boite: 5, echeance: '2026-11-20' }, true, '2026-11-30')).toEqual({ boite: 5, echeance: '2026-12-16' })
})

test('la révision du jour prend les cartes échues puis un nombre limité de nouvelles', () => {
  const cartes = ['a', 'b', 'c', 'd'].map((id) => ({ id }))
  const etats = { a: { boite: 1, echeance: '2026-11-20' }, b: { boite: 2, echeance: '2026-11-25' } }
  expect(aReviser(cartes, etats, '2026-11-20', 1).map((c) => c.id)).toEqual(['a', 'c'])
})
