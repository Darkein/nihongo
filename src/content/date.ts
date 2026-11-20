const CHIFFRES = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']
const kanji = (n: number) => (n >= 20 ? CHIFFRES[Math.floor(n / 10)] : '') + (n >= 10 ? '十' : '') + CHIFFRES[n % 10]

const MOIS = ['いち', 'に', 'さん', 'し', 'ご', 'ろく', 'しち', 'はち', 'く', 'じゅう', 'じゅういち', 'じゅうに']
// Lectures irrégulières des jours du mois ; les autres se lisent « nombre + にち ».
const JOURS: Record<number, string> = {
  1: 'ついたち', 2: 'ふつか', 3: 'みっか', 4: 'よっか', 5: 'いつか', 6: 'むいか', 7: 'なのか', 8: 'ようか',
  9: 'ここのか', 10: 'とおか', 14: 'じゅうよっか', 20: 'はつか', 24: 'にじゅうよっか',
}
const NOMBRES = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'しち', 'はち', 'く']
const lectureNombre = (n: number) =>
  (n >= 20 ? NOMBRES[Math.floor(n / 10)] : '') + (n >= 10 ? 'じゅう' : '') + (n % 10 === 4 ? 'よ' : NOMBRES[n % 10])
const SEMAINE = [['日', 'にち'], ['月', 'げつ'], ['火', 'か'], ['水', 'すい'], ['木', 'もく'], ['金', 'きん'], ['土', 'ど']]

// Au format des furigana du contenu : {kanji|lecture}.
export function dateJaponaise(d: Date): string {
  const mois = d.getMonth() + 1
  const jour = d.getDate()
  const [semaine, lecture] = SEMAINE[d.getDay()]
  return (
    `{${kanji(mois)}月|${MOIS[mois - 1]}がつ}` +
    `{${kanji(jour)}日|${JOURS[jour] ?? `${lectureNombre(jour)}にち`}}・` +
    `{${semaine}曜日|${lecture}ようび}`
  )
}
