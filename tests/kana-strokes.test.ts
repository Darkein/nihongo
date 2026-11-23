import { describe, expect, it } from 'vitest'
import traces from '../src/data/kana-strokes.json'

const donnees: Record<string, { strokes: string[]; medians: number[][][] }> = traces

describe('tracés des kana', () => {
  // AnimCJK découpe les traits qui se recoupent en morceaux dont la médiane sort du cadre : ils doivent être fusionnés.
  it('garde toutes les médianes dans le cadre de hanzi-writer', () => {
    const hors = Object.entries(donnees).filter(([, t]) =>
      t.medians.flat().some(([x, y]) => x < -124 || x > 1024 || y < -124 || y > 900),
    )
    expect(hors.map(([k]) => k)).toEqual([])
  })

  // hanzi-writer mesure la distance aux points de la médiane, pas aux segments : trop espacés, même un tracé parfait est refusé (れ, わ, た…).
  it('a des points de médiane espacés de 50 au plus', () => {
    const espaces = Object.entries(donnees).filter(([, t]) =>
      t.medians.some((m) => m.slice(1).some(([x, y], i) => Math.hypot(x - m[i][0], y - m[i][1]) > 51)),
    )
    expect(espaces.map(([k]) => k)).toEqual([])
  })

  it('a autant de médianes que de traits', () => {
    for (const [k, t] of Object.entries(donnees)) expect(t.medians.length, k).toBe(t.strokes.length)
  })

  it.each([
    ['る', 1], ['の', 1], ['ゐ', 1], ['ゑ', 1], ['あ', 3], ['お', 3], ['ぬ', 2], ['ね', 2], ['め', 2],
    ['み', 2], ['す', 2], ['よ', 2], ['な', 4], ['は', 3], ['ほ', 4], ['ま', 3], ['む', 3], ['ぼ', 6],
  ])('%s se trace en %i trait(s)', (k, n) => {
    expect(donnees[k].strokes).toHaveLength(n)
  })
})
