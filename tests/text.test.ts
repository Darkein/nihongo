import { expect, test } from 'vitest'
import { estJuste, lecture, romaji, segments } from '../src/content/text.ts'

test('le balisage furigana se découpe en segments', () => {
  expect(segments('ミラーさんは {会社員|かいしゃいん}です')).toEqual([
    { base: 'ミラーさんは ' },
    { base: '会社員', lecture: 'かいしゃいん' },
    { base: 'です' },
  ])
  expect(lecture('{山田|やまだ}さん')).toBe('やまださん')
  expect(romaji('{先生|せんせい}')).toBe('sensei')
})

test('une réponse en kana ignore espaces, ponctuation, katakana et furigana', () => {
  const reponses = ['ワットさんは イギリス{人|じん}です。']
  expect(estJuste('わっとさんはいぎりすじんです', reponses)).toBe(true)
  expect(estJuste('wattosanhaigirisujindesu', reponses)).toBe(true)
  expect(estJuste('わっとさんはどいつじんです', reponses)).toBe(false)
  expect(estJuste('', reponses)).toBe(false)
})

test('la voyelle longue des katakana se saisit avec un tiret', () => {
  expect(estJuste('mira-sanha kaishaindesu', ['ミラーさんは かいしゃいんです。'])).toBe(true)
})

test('では et じゃ sont équivalents dans la négation', () => {
  expect(estJuste('がくせいではありません', ['がくせいじゃ ありません'])).toBe(true)
})

test('une réponse en romaji accepte les variantes de transcription', () => {
  expect(estJuste('tsu', ['つ'], 'romaji')).toBe(true)
  expect(estJuste('tu', ['つ'], 'romaji')).toBe(true)
  expect(estJuste('dzu', ['づ'], 'romaji')).toBe(true)
  expect(estJuste('Sakana', ['さかな'], 'romaji')).toBe(true)
  expect(estJuste('su', ['つ'], 'romaji')).toBe(false)
})

test('le rōmaji lit la particule は « wa » sans toucher aux mots', () => {
  expect(romaji('わたしは がくせいです。')).toBe('watashiwa gakuseidesu.')
  expect(romaji('こんにちは')).toBe('konnichiwa')
  expect(romaji('はな')).toBe('hana')
})
