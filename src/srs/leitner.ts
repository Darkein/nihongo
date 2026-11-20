export type Etat = { boite: number; echeance: string; ok?: boolean }

const INTERVALLES = [1, 2, 4, 8, 16]
export const NB_BOITES = INTERVALLES.length

export function ajouterJours(jour: string, n: number): string {
  const d = new Date(jour + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

export function noter(etat: Etat | undefined, juste: boolean, jour: string): Etat {
  const boite = juste ? Math.min((etat?.boite ?? 0) + 1, INTERVALLES.length) : 1
  return { boite, echeance: ajouterJours(jour, INTERVALLES[boite - 1]), ok: juste }
}

export function aReviser<T extends { id: string }>(
  cartes: T[],
  etats: Record<string, Etat>,
  jour: string,
  maxNouvelles = 10,
  max = 30,
): T[] {
  const dues = cartes.filter((c) => etats[c.id] && etats[c.id].echeance <= jour)
  const nouvelles = cartes.filter((c) => !etats[c.id]).slice(0, maxNouvelles)
  return [...dues, ...nouvelles].slice(0, max)
}
