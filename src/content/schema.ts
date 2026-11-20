import { z } from 'zod'

const slug = z.string().regex(/^[a-z0-9-]+$/)
const texte = z.string().min(1)

const Qcm = z
  .strictObject({
    type: z.literal('qcm'),
    id: slug,
    question: texte,
    choix: z.array(texte).min(2),
    reponse: z.number().int().nonnegative(),
  })
  .refine((q) => q.reponse < q.choix.length, 'reponse hors des choix')

const Saisie = z.strictObject({
  type: z.literal('saisie'),
  id: slug,
  question: texte,
  attendu: z.enum(['kana', 'romaji']).default('kana'),
  reponses: z.array(texte).min(1),
})

const Transformation = z.strictObject({
  type: z.literal('transformation'),
  id: slug,
  serie: texte,
  exemple: texte,
  enonce: texte,
  reponses: z.array(texte).min(1),
})

const Tuiles = z.strictObject({
  type: z.literal('tuiles'),
  id: slug,
  question: texte,
  tuiles: z.array(texte).min(2),
  leurres: z.array(texte).optional(),
})

export const ExerciceSchema = z.union([Qcm, Saisie, Transformation, Tuiles])

export const LessonSchema = z.strictObject({
  id: z.string().regex(/^cours-\d{2}$/),
  date: z.iso.date().optional(),
  titre: texte,
  kana: z.array(texte),
  resume: z.array(z.strictObject({ titre: texte, points: z.array(texte).min(1) })),
  liens: z.array(z.strictObject({ titre: texte, url: z.url() })).optional(),
  mots: z.array(z.strictObject({ id: slug, jp: texte, fr: texte })),
  fiches: z
    .array(
      z.strictObject({
        nom: texte,
        pays: texte,
        metier: texte,
        age: z.number().int().optional(),
        organisation: texte.optional(),
      }),
    )
    .optional(),
  exercices: z.array(ExerciceSchema),
  miniTest: z.array(ExerciceSchema).optional(),
  prochainCours: z.strictObject({ annonce: z.array(texte), devoirs: z.array(texte) }),
})

export type Exercice = z.infer<typeof ExerciceSchema>
export type Lesson = z.infer<typeof LessonSchema>
export type Mot = Lesson['mots'][number]
export type Fiche = NonNullable<Lesson['fiches']>[number]
