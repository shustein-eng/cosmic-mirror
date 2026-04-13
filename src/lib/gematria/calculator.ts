// ============================================================
// Gematria Calculation Engine
// Implements all classical methods from the חישוב תורני system
// ============================================================

import {
  STANDARD_VALUES,
  GADOL_VALUES,
  ORDINAL_VALUES,
  STROKE_VALUES,
  ATBASH_MAP,
  ALBAM_MAP,
  MILUI_ARIZAL,
  ENGLISH_NUMEROLOGY,
  ENGLISH_VOWELS,
  TORAH_GEMATRIA_DICT,
  FINAL_TO_REGULAR,
} from './tables'

// ── Helpers ──────────────────────────────────────────────────

function reduceToDigit(n: number): number {
  while (n > 9) {
    n = String(n).split('').reduce((a, d) => a + parseInt(d), 0)
  }
  return n
}

function triangular(n: number): number {
  return (n * (n + 1)) / 2
}

function isHebrew(char: string): boolean {
  const code = char.charCodeAt(0)
  return code >= 0x05D0 && code <= 0x05EA
}

function normalizeHebrew(text: string): string {
  // Strip nikud (vowel points) — keep only Hebrew letters
  return text.replace(/[\u05B0-\u05C7]/g, '').replace(/\s+/g, '')
}

function getStandardValue(ch: string): number {
  return STANDARD_VALUES[ch] ?? 0
}

function getGadolValue(ch: string): number {
  return GADOL_VALUES[ch] ?? 0
}

// ── Core Methods ─────────────────────────────────────────────

export function misparHechrachi(text: string): number {
  return normalizeHebrew(text)
    .split('')
    .filter(isHebrew)
    .reduce((sum, ch) => sum + getStandardValue(ch), 0)
}

export function misparGadol(text: string): number {
  return normalizeHebrew(text)
    .split('')
    .filter(isHebrew)
    .reduce((sum, ch) => sum + getGadolValue(ch), 0)
}

export function misparKatan(text: string, useGadol = false): number {
  const getValue = useGadol ? getGadolValue : getStandardValue
  return normalizeHebrew(text)
    .split('')
    .filter(isHebrew)
    .reduce((sum, ch) => sum + reduceToDigit(getValue(ch)), 0)
}

export function misparSiduri(text: string): number {
  return normalizeHebrew(text)
    .split('')
    .filter(isHebrew)
    .reduce((sum, ch) => sum + (ORDINAL_VALUES[ch] ?? 0), 0)
}

export function misparMeshulash(text: string, useGadol = false): number {
  const getValue = useGadol ? getGadolValue : getStandardValue
  return normalizeHebrew(text)
    .split('')
    .filter(isHebrew)
    .reduce((sum, ch) => sum + triangular(getValue(ch)), 0)
}

export function misparHaPerud(text: string): number {
  return normalizeHebrew(text)
    .split('')
    .filter(isHebrew)
    .reduce((sum, ch) => {
      const val = getStandardValue(ch)
      const digits = String(val).split('').reduce((a, d) => a + parseInt(d), 0)
      return sum + digits
    }, 0)
}

export function misparBoneeh(text: string): number {
  const letters = normalizeHebrew(text).split('').filter(isHebrew)
  let running = 0
  let total = 0
  for (const ch of letters) {
    running += getStandardValue(ch)
    total += running
  }
  return total
}

export function misparHaKavim(text: string): number {
  return normalizeHebrew(text)
    .split('')
    .filter(isHebrew)
    .reduce((sum, ch) => sum + (STROKE_VALUES[ch] ?? 0), 0)
}

export function misparHakfala(text: string, useGadol = false): number {
  const getValue = useGadol ? getGadolValue : getStandardValue
  const letters = normalizeHebrew(text).split('').filter(isHebrew)
  return letters.reduce((sum, ch, idx) => sum + getValue(ch) * (idx + 1), 0)
}

export function misparHakfalaKfula(text: string, useGadol = false): number {
  const getValue = useGadol ? getGadolValue : getStandardValue
  return normalizeHebrew(text)
    .split('')
    .filter(isHebrew)
    .reduce((sum, ch) => {
      const v = getValue(ch)
      return sum + v * v
    }, 0)
}

// ── Ciphers ──────────────────────────────────────────────────

export function applyAtbash(text: string): string {
  return normalizeHebrew(text)
    .split('')
    .map((ch) => (isHebrew(ch) ? (ATBASH_MAP[ch] ?? ch) : ch))
    .join('')
}

export function applyAlbam(text: string): string {
  return normalizeHebrew(text)
    .split('')
    .map((ch) => (isHebrew(ch) ? (ALBAM_MAP[ch] ?? ch) : ch))
    .join('')
}

export function atbashGematria(text: string): number {
  return misparHechrachi(applyAtbash(text))
}

export function albamGematria(text: string): number {
  return misparHechrachi(applyAlbam(text))
}

// ── Milui (Letter Expansion) ─────────────────────────────────

export function milui(text: string, tradition = MILUI_ARIZAL): string {
  return normalizeHebrew(text)
    .split('')
    .filter(isHebrew)
    .map((ch) => tradition[ch] ?? ch)
    .join(' ')
}

export function miluiGematria(text: string): number {
  const expanded = milui(text)
  return misparHechrachi(expanded)
}

export function miluiOnly(text: string): number {
  const letters = normalizeHebrew(text).split('').filter(isHebrew)
  const original = misparHechrachi(text)
  const expanded = milui(text)
  return misparHechrachi(expanded) - original
}

// ── Roshei/Sofei Teivos ──────────────────────────────────────

export function rosheiTeivos(text: string): { letters: string; value: number } {
  const words = text.trim().split(/\s+/)
  const letters = words
    .map((w) => {
      const clean = normalizeHebrew(w)
      return clean[0] || ''
    })
    .filter(isHebrew)
    .join('')
  return { letters, value: misparHechrachi(letters) }
}

export function sofeiTeivos(text: string): { letters: string; value: number } {
  const words = text.trim().split(/\s+/)
  const letters = words
    .map((w) => {
      const clean = normalizeHebrew(w)
      return clean[clean.length - 1] || ''
    })
    .filter(isHebrew)
    .join('')
  return { letters, value: misparHechrachi(letters) }
}

// ── Similar Gematria Search ──────────────────────────────────

export function findSimilarGematria(value: number): string[] {
  const results: string[] = []
  for (const [numStr, words] of Object.entries(TORAH_GEMATRIA_DICT)) {
    if (Math.abs(parseInt(numStr) - value) <= 1) {
      results.push(...words)
    }
  }
  return [...new Set(results)]
}

// ── Western Numerology ───────────────────────────────────────

function reduceNumerology(n: number, keepMaster = false): number {
  if (keepMaster && (n === 11 || n === 22 || n === 33)) return n
  while (n > 9) {
    n = String(n).split('').reduce((a, d) => a + parseInt(d), 0)
  }
  return n
}

export function lifePath(dateOfBirth: string): number {
  // dateOfBirth: YYYY-MM-DD
  const digits = dateOfBirth.replace(/-/g, '')
  const sum = digits.split('').reduce((a, d) => a + parseInt(d), 0)
  return reduceNumerology(sum)
}

export function expressionNumber(name: string): number {
  const upper = name.toUpperCase().replace(/[^A-Z]/g, '')
  const sum = upper.split('').reduce((a, ch) => a + (ENGLISH_NUMEROLOGY[ch] ?? 0), 0)
  return reduceNumerology(sum)
}

export function soulUrgeNumber(name: string): number {
  const upper = name.toUpperCase().replace(/[^A-Z]/g, '')
  const vowels = upper.split('').filter((ch) => ENGLISH_VOWELS.has(ch))
  const sum = vowels.reduce((a, ch) => a + (ENGLISH_NUMEROLOGY[ch] ?? 0), 0)
  return reduceNumerology(sum)
}

export function personalityNumber(name: string): number {
  const upper = name.toUpperCase().replace(/[^A-Z]/g, '')
  const consonants = upper.split('').filter((ch) => !ENGLISH_VOWELS.has(ch))
  const sum = consonants.reduce((a, ch) => a + (ENGLISH_NUMEROLOGY[ch] ?? 0), 0)
  return reduceNumerology(sum)
}

export function birthdayNumber(dateOfBirth: string): number {
  const day = parseInt(dateOfBirth.split('-')[2])
  return reduceNumerology(day)
}

// ── Full Calculation Suite ───────────────────────────────────

export interface GematriaResults {
  hebrew_name: string
  english_name: string
  date_of_birth: string

  // Standard methods
  standard_hechrachi: number
  standard_no_sofiot: number
  mispar_gadol: number
  mispar_katan: number
  mispar_katan_gadol: number
  mispar_siduri: number
  mispar_meshulash: number
  mispar_meshulash_gadol: number
  mispar_haPerud: number
  mispar_boneeh: number
  mispar_haKavim: number
  mispar_hakfala: number
  mispar_hakfala_gadol: number
  mispar_hakfala_kfula: number
  mispar_hakfala_kfula_gadol: number

  // Ciphers
  atbash_value: number
  atbash_letters: string
  albam_value: number
  albam_letters: string

  // Milui
  milui_arizal: number
  milui_only_arizal: number

  // Roshei/Sofei (for multi-word names)
  roshei_teivos: { letters: string; value: number }
  sofei_teivos: { letters: string; value: number }

  // Similar gematria
  similar_gematria_matches: string[]

  // Western numerology
  life_path_number: number
  expression_number: number
  soul_urge_number: number
  personality_number: number
  birthday_number: number
}

export function calculateAll(
  hebrewName: string,
  englishName: string,
  dateOfBirth: string
): GematriaResults {
  const atbashLetters = applyAtbash(hebrewName)
  const albamLetters = applyAlbam(hebrewName)
  const standardVal = misparHechrachi(hebrewName)
  const similar = findSimilarGematria(standardVal)

  return {
    hebrew_name: hebrewName,
    english_name: englishName,
    date_of_birth: dateOfBirth,

    standard_hechrachi: standardVal,
    standard_no_sofiot: misparHechrachi(
      hebrewName
        .split('')
        .filter((ch) => !Object.keys(FINAL_TO_REGULAR).includes(ch))
        .join('')
    ),
    mispar_gadol: misparGadol(hebrewName),
    mispar_katan: misparKatan(hebrewName),
    mispar_katan_gadol: misparKatan(hebrewName, true),
    mispar_siduri: misparSiduri(hebrewName),
    mispar_meshulash: misparMeshulash(hebrewName),
    mispar_meshulash_gadol: misparMeshulash(hebrewName, true),
    mispar_haPerud: misparHaPerud(hebrewName),
    mispar_boneeh: misparBoneeh(hebrewName),
    mispar_haKavim: misparHaKavim(hebrewName),
    mispar_hakfala: misparHakfala(hebrewName),
    mispar_hakfala_gadol: misparHakfala(hebrewName, true),
    mispar_hakfala_kfula: misparHakfalaKfula(hebrewName),
    mispar_hakfala_kfula_gadol: misparHakfalaKfula(hebrewName, true),

    atbash_value: misparHechrachi(atbashLetters),
    atbash_letters: atbashLetters,
    albam_value: misparHechrachi(albamLetters),
    albam_letters: albamLetters,

    milui_arizal: miluiGematria(hebrewName),
    milui_only_arizal: miluiOnly(hebrewName),

    roshei_teivos: rosheiTeivos(hebrewName),
    sofei_teivos: sofeiTeivos(hebrewName),

    similar_gematria_matches: similar,

    life_path_number: lifePath(dateOfBirth),
    expression_number: expressionNumber(englishName),
    soul_urge_number: soulUrgeNumber(englishName),
    personality_number: personalityNumber(englishName),
    birthday_number: birthdayNumber(dateOfBirth),
  }
}
