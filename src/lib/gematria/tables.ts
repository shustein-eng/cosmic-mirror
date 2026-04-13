// ============================================================
// Gematria Letter Tables
// All classical Hebrew gematria methods
// ============================================================

export const ALEPH_BET = [
  'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י',
  'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת',
]

export const FINAL_LETTERS: Record<string, string> = {
  'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ',
}

export const FINAL_TO_REGULAR: Record<string, string> = {
  'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ',
}

// Standard (Mispar Hechrachi) — finals same as regular
export const STANDARD_VALUES: Record<string, number> = {
  'א': 1,  'ב': 2,  'ג': 3,  'ד': 4,  'ה': 5,
  'ו': 6,  'ז': 7,  'ח': 8,  'ט': 9,  'י': 10,
  'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60,
  'ע': 70, 'פ': 80, 'צ': 90, 'ק': 100,'ר': 200,
  'ש': 300,'ת': 400,
  // Finals (same as regular in Hechrachi)
  'ך': 20, 'ם': 40, 'ן': 50, 'ף': 80, 'ץ': 90,
}

// Mispar Gadol — finals get extended values
export const GADOL_VALUES: Record<string, number> = {
  ...STANDARD_VALUES,
  'ך': 500, 'ם': 600, 'ן': 700, 'ף': 800, 'ץ': 900,
}

// Mispar Siduri — ordinal position 1-22 (finals same as regular)
export const ORDINAL_VALUES: Record<string, number> = {
  'א': 1,  'ב': 2,  'ג': 3,  'ד': 4,  'ה': 5,
  'ו': 6,  'ז': 7,  'ח': 8,  'ט': 9,  'י': 10,
  'כ': 11, 'ל': 12, 'מ': 13, 'נ': 14, 'ס': 15,
  'ע': 16, 'פ': 17, 'צ': 18, 'ק': 19, 'ר': 20,
  'ש': 21, 'ת': 22,
  'ך': 11, 'ם': 13, 'ן': 14, 'ף': 17, 'ץ': 18,
}

// Mispar HaKavim (stroke count per letter)
export const STROKE_VALUES: Record<string, number> = {
  'א': 3, 'ב': 2, 'ג': 2, 'ד': 2, 'ה': 3,
  'ו': 1, 'ז': 2, 'ח': 3, 'ט': 2, 'י': 1,
  'כ': 2, 'ל': 2, 'מ': 3, 'נ': 2, 'ס': 2,
  'ע': 2, 'פ': 2, 'צ': 3, 'ק': 2, 'ר': 1,
  'ש': 3, 'ת': 3,
  'ך': 2, 'ם': 3, 'ן': 2, 'ף': 2, 'ץ': 3,
}

// Atbash cipher: first ↔ last
const ALEPH_BET_ORDERED = ['א','ב','ג','ד','ה','ו','ז','ח','ט','י','כ','ל','מ','נ','ס','ע','פ','צ','ק','ר','ש','ת']
export const ATBASH_MAP: Record<string, string> = {}
for (let i = 0; i < ALEPH_BET_ORDERED.length; i++) {
  ATBASH_MAP[ALEPH_BET_ORDERED[i]] = ALEPH_BET_ORDERED[ALEPH_BET_ORDERED.length - 1 - i]
}
// Finals → mapped to their non-final equivalent first
for (const [final, regular] of Object.entries(FINAL_TO_REGULAR)) {
  ATBASH_MAP[final] = ATBASH_MAP[regular]
}

// Albam cipher: first half ↔ second half
export const ALBAM_MAP: Record<string, string> = {}
for (let i = 0; i < 11; i++) {
  ALBAM_MAP[ALEPH_BET_ORDERED[i]] = ALEPH_BET_ORDERED[i + 11]
  ALBAM_MAP[ALEPH_BET_ORDERED[i + 11]] = ALEPH_BET_ORDERED[i]
}
ALBAM_MAP['ת'] = 'ת' // ת maps to itself (22 letters, 11 pairs)
for (const [final, regular] of Object.entries(FINAL_TO_REGULAR)) {
  ALBAM_MAP[final] = ALBAM_MAP[regular] || regular
}

// Milui (letter spelling) traditions
// Arizal spellings
export const MILUI_ARIZAL: Record<string, string> = {
  'א': 'אלף',  'ב': 'בית',  'ג': 'גימל', 'ד': 'דלת',  'ה': 'הא',
  'ו': 'ואו',  'ז': 'זין',  'ח': 'חית',  'ט': 'טית',  'י': 'יוד',
  'כ': 'כף',   'ל': 'למד',  'מ': 'מם',   'נ': 'נון',  'ס': 'סמך',
  'ע': 'עין',  'פ': 'פא',   'צ': 'צדי',  'ק': 'קוף',  'ר': 'ריש',
  'ש': 'שין',  'ת': 'תו',
  // Finals use their regular form for milui
  'ך': 'כף',   'ם': 'מם',   'ן': 'נון',  'ף': 'פא',   'ץ': 'צדי',
}

// Western numerology table (Pythagorean)
export const ENGLISH_NUMEROLOGY: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
}

export const ENGLISH_VOWELS = new Set(['A', 'E', 'I', 'O', 'U'])

// Small Torah dictionary for similar-gematria lookup
// Key: gematria value → array of Hebrew words/phrases
export const TORAH_GEMATRIA_DICT: Record<number, string[]> = {
  26: ['יהוה', 'אהבה'], // YHVH, Love
  72: ['חסד', 'אלהים'], // Chesed, Elohim
  86: ['אלהים'],        // Elohim
  137: ['קבלה'],        // Kabbalah
  148: ['נצח'],         // Netzach
  157: ['כבוד'],        // Kavod
  203: ['ברא'],         // Created
  207: ['אור'],         // Or (Light)
  248: ['אברהם'],       // Avraham
  270: ['רע'],          // Evil
  358: ['משיח', 'נחש'], // Mashiach, Nachash
  365: ['השמים'],       // HaShamayim
  400: ['תורה'],        // Torah (without vav)
  406: ['תורה'],        // Torah (with vav)
  430: ['נפש'],         // Nefesh
  480: ['ישראל'],       // Israel (katan)
  541: ['ישראל'],       // Israel
  611: ['תורה'],        // Torah
  903: ['ברא שית'],     // Beginning of creation
  936: ['שלום'],        // Shalom
}
