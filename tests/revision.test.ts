import { expect, test } from 'vitest'
import { derniere } from '../src/content/lessons.ts'
import { cartesDuJour } from '../src/srs/avancement.ts'

test('la révision du jour propose d’abord les nouvelles cartes du dernier cours', () => {
  const cartes = cartesDuJour()
  expect(cartes.length).toBeGreaterThan(0)
  expect(cartes.every((c) => c.lesson === derniere)).toBe(true)
})
