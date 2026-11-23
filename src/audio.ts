import { aDire } from './content/text'

export const voixDisponible = 'speechSynthesis' in globalThis

// Sans voix explicite, Chrome sur macOS prend la première voix ja-JP (Eddy, une voix « Eloquence » robotique).
const PREFERENCES = [/natural|neural/i, /premium/i, /enhanced|amélioré|拡張/i, /google/i, /kyoko|o-ren|otoya|hattori|nanami|haruka|ayumi|sayaka/i]
const ELOQUENCE = /eloquence|eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley/i

let voix: SpeechSynthesisVoice | undefined

function choisirVoix() {
  const japonaises = speechSynthesis.getVoices().filter((v) => /^ja[-_]/i.test(v.lang))
  const rang = (v: SpeechSynthesisVoice) => {
    const nom = `${v.name} ${v.voiceURI}`
    const i = PREFERENCES.findIndex((p) => p.test(nom))
    return i >= 0 ? i : ELOQUENCE.test(nom) ? PREFERENCES.length + 1 : PREFERENCES.length
  }
  voix = japonaises.sort((a, b) => rang(a) - rang(b))[0]
}

if (voixDisponible) {
  choisirVoix()
  speechSynthesis.addEventListener('voiceschanged', choisirVoix)
}

export function parler(texte: string) {
  if (!voixDisponible) return
  const u = new SpeechSynthesisUtterance(aDire(texte))
  u.lang = 'ja-JP'
  if (voix) u.voice = voix
  u.rate = 0.85
  speechSynthesis.cancel()
  speechSynthesis.speak(u)
}
