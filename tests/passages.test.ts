import { expect, test } from 'vitest'
import { cartesDe, derniere, lessonParId } from '../src/content/lessons.ts'
import { cocherDevoirsFinis } from '../src/srs/avancement.ts'
import { importer, progression } from '../src/srs/store.ts'

const sauvegarde = (extra: object) => {
  const kana = cartesDe(derniere).filter((c) => c.categorie === 'kana')
  const cartes = Object.fromEntries(kana.map((c, i) => [c.id, { boite: 1, echeance: '2026-11-24', ok: i > 0 }]))
  return { kana, json: JSON.stringify({ version: 1, romaji: true, cartes, ...extra }) }
}

test('une ancienne sauvegarde compte comme passées les activités dont toutes les cartes sont planifiées', () => {
  const { kana, json } = sauvegarde({})
  importer(json)
  expect(progression.passages[`${derniere.id}/kana`]).toEqual({ justes: kana.length - 1, total: kana.length })
  expect(progression.passages[`${derniere.id}/vocabulaire`]).toBeUndefined()
})

test('les passages enregistrés sont gardés tels quels', () => {
  const { json } = sauvegarde({ passages: { [`${derniere.id}/kana`]: { justes: 3, total: 16 } } })
  importer(json)
  expect(progression.passages).toEqual({ [`${derniere.id}/kana`]: { justes: 3, total: 16 } })
})

test('le passage qui complète les activités d’un devoir le coche, et seulement celui-là', () => {
  importer(JSON.stringify({ version: 1, romaji: true, cartes: {}, passages: {} }))
  const lesson = lessonParId('cours-05')!
  progression.passages['cours-05/kana'] = { justes: 16, total: 16 }
  cocherDevoirsFinis(lesson, 'kana')
  expect(progression.devoirs).toEqual([])
  progression.passages['cours-05/trace'] = { justes: 14, total: 16 }
  cocherDevoirsFinis(lesson, 'trace')
  expect(progression.devoirs).toEqual(['cours-05/0'])
})
