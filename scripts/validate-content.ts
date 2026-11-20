import { readdirSync, readFileSync } from 'node:fs'
import { z } from 'zod'
import { LessonSchema } from '../src/content/schema.ts'

const racine = new URL('../content/lessons/', import.meta.url)
const traces = JSON.parse(readFileSync(new URL('../src/data/kana-strokes.json', import.meta.url), 'utf8'))
const erreurs: string[] = []

for (const dossier of readdirSync(racine).sort()) {
  const brut = JSON.parse(readFileSync(new URL(`${dossier}/lesson.json`, racine), 'utf8'))
  const r = LessonSchema.safeParse(brut)
  if (!r.success) {
    erreurs.push(`${dossier} :\n${z.prettifyError(r.error)}`)
    continue
  }
  const l = r.data
  if (l.id !== dossier) erreurs.push(`${dossier} : id « ${l.id} » différent du nom du dossier`)
  const sansTrace = [...l.kana.join('')].filter((k) => !traces[k])
  if (sansTrace.length) erreurs.push(`${dossier} : kana sans tracé : ${sansTrace.join(' ')}`)
  for (const [nom, ids] of [
    ['mots', l.mots.map((m) => m.id)],
    ['exercices', [...l.exercices, ...(l.miniTest ?? [])].map((e) => e.id)],
  ] as const) {
    const doublons = ids.filter((id, i) => ids.indexOf(id) !== i)
    if (doublons.length) erreurs.push(`${dossier} : id en double dans ${nom} : ${doublons.join(', ')}`)
  }
  if (/@|https?:\/\//.test(JSON.stringify({ ...l, liens: undefined })))
    erreurs.push(`${dossier} : adresse e-mail ou URL hors du champ « liens »`)
}

if (erreurs.length) {
  console.error(erreurs.join('\n\n'))
  process.exit(1)
}
console.log('Leçons valides.')
