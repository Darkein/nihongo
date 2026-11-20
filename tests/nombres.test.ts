import { expect, test } from 'vitest'
import type { Lesson } from '../src/content/schema.ts'
import { conseille, decomposer, decomposerAge, lectures, lireChiffres, niveauParId, NIVEAUX, serie, tirer, vuAu } from '../src/content/nombres.ts'

const lit = (n: number) => lectures(decomposer(n))
const age = (n: number) => lectures(decomposerAge(n))

test('les nombres jusqu’à 99, avec les doubles lectures du cours', () => {
  expect(lit(0)).toEqual(['ぜろ', 'れい'])
  expect(lit(4)).toEqual(['よん', 'し'])
  expect(lit(10)).toEqual(['じゅう'])
  expect(lit(17)).toEqual(['じゅうなな', 'じゅうしち'])
  expect(lit(21)).toEqual(['にじゅういち'])
  expect(lit(34)).toEqual(['さんじゅうよん', 'さんじゅうし'])
  expect(lit(50)).toEqual(['ごじゅう'])
  expect(lit(99)).toEqual(['きゅうじゅうきゅう', 'きゅうじゅうく'])
})

test('les centaines et les milliers et leurs sons modifiés', () => {
  expect(lit(100)[0]).toBe('ひゃく')
  expect(lit(300)[0]).toBe('さんびゃく')
  expect(lit(600)[0]).toBe('ろっぴゃく')
  expect(lit(800)[0]).toBe('はっぴゃく')
  expect(lit(1000)[0]).toBe('せん')
  expect(lit(3000)[0]).toBe('さんぜん')
  expect(lit(8000)[0]).toBe('はっせん')
  expect(lit(2026)[0]).toBe('にせんにじゅうろく')
})

test('au-delà de 10 000 on compte en まん', () => {
  expect(lit(10000)).toEqual(['いちまん'])
  expect(lit(12345)[0]).toBe('いちまんにせんさんびゃくよんじゅうご')
  expect(lit(1000000)).toEqual(['ひゃくまん'])
  expect(lit(10000000)).toEqual(['せんまん', 'いっせんまん'])
})

test('l’âge et ses exceptions', () => {
  expect(age(1)).toEqual(['いっさい'])
  expect(age(8)).toEqual(['はっさい'])
  expect(age(10)).toEqual(['じゅっさい', 'じっさい'])
  expect(age(20)).toEqual(['はたち', 'にじゅっさい'])
  expect(age(28)).toEqual(['にじゅうはっさい'])
  expect(age(4)).toEqual(['よんさい'])
})

test('la saisie en chiffres tolère espaces et chiffres pleine chasse', () => {
  expect(lireChiffres('12 345')).toBe(12345)
  expect(lireChiffres('１２')).toBe(12)
  expect(lireChiffres('douze')).toBeUndefined()
})

test('un tirage reste dans la plage du niveau, sans doublon', () => {
  for (const n of NIVEAUX) for (let i = 0; i < 200; i++) {
    const x = tirer(n)
    expect(x).toBeGreaterThanOrEqual(n.min)
    expect(x).toBeLessThanOrEqual(n.max)
  }
  const s = serie(niveauParId('0-10')!)
  expect(new Set(s).size).toBe(10)
})

test('le niveau suit les cours et le niveau 51-99 s’ouvre avec 50', () => {
  const cours = (nombres: Lesson['nombres']) => [{ id: 'cours-04', nombres } as Lesson]
  expect(vuAu(niveauParId('51-99')!, cours({ jusqua: 50 }))).toBeTruthy()
  expect(vuAu(niveauParId('100-999')!, cours({ jusqua: 50 }))).toBeUndefined()
  expect(vuAu(niveauParId('age')!, cours({ compteurs: ['さい'] }))).toBeTruthy()
  const ls = cours({ jusqua: 50 })
  expect(conseille(() => undefined, ls).id).toBe('0-10')
  const reussi = [{ note: 9 }, { note: 10 }]
  expect(conseille((n) => (n.id === '0-10' ? reussi : undefined), ls).id).toBe('11-50')
  expect(conseille((n) => (n.max <= 99 ? reussi : undefined), ls).id).toBe('100-999')
})
