import { sansFurigana } from './content/text'

export const voixDisponible = 'speechSynthesis' in globalThis

export function parler(texte: string) {
  if (!voixDisponible) return
  const u = new SpeechSynthesisUtterance(sansFurigana(texte))
  u.lang = 'ja-JP'
  u.rate = 0.85
  speechSynthesis.cancel()
  speechSynthesis.speak(u)
}
