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

// Torah (Chumash only) gematria lookup dictionary
// Key: gematria value → array of Hebrew words with context
// Words drawn exclusively from the Five Books of Moses and their direct concepts
export const TORAH_GEMATRIA_DICT: Record<number, string[]> = {
  7:   ['גד'],                         // Gad (tribe)
  13:  ['אחד', 'אהבה'],               // Echad (One), Ahavah (Love) — the famous pair
  14:  ['יד', 'זהב'],                  // Yad (hand), Zahav (gold)
  15:  ['יה', 'הוד'],                  // Yah (divine name), Hod (glory)
  17:  ['טוב'],                        // Tov (good) — "ki tov" / it was good
  18:  ['חי'],                         // Chai (life/living) — the most famous gematria
  19:  ['חוה'],                        // Chavah (Eve)
  21:  ['אהיה'],                       // Ehyeh (I Will Be — divine name, Shemot 3:14)
  26:  ['יהוה', 'אהבה'],              // YHVH (divine name), Ahavah (love) — 2 × 13
  30:  ['יהודה'],                      // Yehudah (Judah)
  31:  ['אל'],                         // El (God)
  32:  ['לב'],                         // Lev (heart)
  36:  ['לאה', 'אלה'],                 // Leah, Eleh (these)
  37:  ['הבל'],                        // Hevel (Abel)
  45:  ['אדם'],                        // Adam
  46:  ['לוי'],                        // Levi
  50:  ['ים', 'כל'],                   // Yam (sea), Kol (all)
  52:  ['כלב'],                        // Kalev (Caleb)
  54:  ['דן'],                         // Dan (tribe)
  56:  ['יום'],                        // Yom (day)
  58:  ['נח'],                         // Noach (Noah)
  65:  ['אדני', 'מכה'],               // Adonai (divine name), Makkah (plague)
  67:  ['בינה'],                       // Binah (understanding)
  68:  ['חיים'],                       // Chayyim (life)
  72:  ['חסד'],                        // Chesed (loving-kindness)
  73:  ['חכמה'],                       // Chochmah (wisdom)
  75:  ['כהן'],                        // Kohen (priest)
  80:  ['יסוד'],                       // Yesod (foundation)
  86:  ['אלהים'],                      // Elohim (divine name)
  90:  ['מים', 'מן', 'מלך'],          // Mayim (water), Man (manna), Melech (king)
  91:  ['מלאך', 'סוכה'],              // Malach (angel), Sukkah (Vayikra 23:42)
  95:  ['זבולן'],                      // Zevulun (tribe)
  102: ['אמונה', 'בנים'],             // Emunah (faith), Banim (sons)
  103: ['מנחה'],                       // Minchah (meal offering/gift)
  110: ['עם'],                         // Am (people/nation)
  130: ['סיני', 'עין'],               // Sinai, Ayin (eye/spring)
  131: ['ענוה'],                       // Anavah (humility)
  135: ['מצה'],                        // Matzah (unleavened bread)
  141: ['מצוה'],                       // Mitzvah (commandment)
  146: ['עולם'],                       // Olam (world/eternity)
  148: ['נצח', 'פסח'],               // Netzach (eternity), Pesach (Passover)
  156: ['יוסף'],                       // Yosef (Joseph)
  160: ['קין', 'עץ'],                 // Kayin (Cain), Etz (tree)
  162: ['בנימין'],                     // Binyamin (Benjamin)
  170: ['ענן'],                        // Anan (cloud — pillar of cloud)
  182: ['יעקב'],                       // Yaakov (Jacob)
  190: ['כנען'],                       // Kna'an (Canaan)
  199: ['צדקה'],                       // Tzedakah (righteousness/charity)
  203: ['ברא'],                        // Bara (He created — first verb in Torah)
  204: ['צדיק'],                       // Tzaddik (righteous person)
  207: ['אור'],                        // Or (light — first creation)
  208: ['יצחק', 'פינחס'],            // Yitzchak (Isaac), Pinchas
  214: ['רוח'],                        // Ruach (spirit/wind — Bereishit 1:2)
  216: ['גבורה', 'יראה'],            // Gevurah (strength), Yirah (awe) — same value
  218: ['ירח'],                        // Yareach (moon)
  227: ['ברכה'],                       // Bracha (blessing)
  228: ['בכור'],                       // Bechor (firstborn)
  238: ['רחל'],                        // Rachel
  246: ['מדבר'],                       // Midbar (wilderness — the fourth book)
  248: ['אברהם'],                      // Avraham — equals 248 limbs, 248 positive mitzvot
  255: ['נהר'],                        // Nahar (river)
  256: ['אהרן'],                       // Aharon (Aaron)
  259: ['ראובן'],                      // Reuven (Reuben)
  264: ['ירדן'],                       // Yarden (Jordan River)
  270: ['רע'],                         // Ra (evil)
  290: ['מרים'],                       // Miriam
  291: ['ארץ'],                        // Eretz (land/earth)
  298: ['רחמים'],                      // Rachamim (compassion)
  301: ['אש'],                         // Esh (fire)
  307: ['רבקה'],                       // Rivkah (Rebekah)
  314: ['שדי'],                        // Shaddai (divine name — Shemot 6:3)
  345: ['משה'],                        // Moshe (Moses)
  352: ['קרבן'],                       // Korban (offering/sacrifice)
  355: ['פרעה'],                       // Pharaoh
  376: ['שלום', 'עשו'],              // Shalom (peace), Esav (Esau) — famous equivalence
  380: ['מצרים'],                      // Mitzrayim (Egypt)
  390: ['שמים'],                       // Shamayim (heavens)
  395: ['נשמה', 'השמים'],            // Neshamah (soul), HaShamayim (the heavens) — same value
  404: ['קדש'],                        // Kodesh (holiness)
  407: ['תבה'],                        // Tevah (ark — Noah's ark, Bereishit 6:14)
  409: ['אבות'],                       // Avot (forefathers)
  430: ['נפש'],                        // Nefesh (soul — the lowest soul level)
  441: ['אמת'],                        // Emet (truth)
  446: ['מרור'],                       // Maror (bitter herbs — Shemot 12:8)
  466: ['שמעון'],                      // Shimon (Simeon)
  474: ['דעת'],                        // Da'at (knowledge)
  496: ['מלכות'],                      // Malchut (kingship — Devarim 17)
  501: ['אשר'],                        // Asher (tribe)
  505: ['שרה'],                        // Sarah
  541: ['ישראל'],                      // Yisrael
  570: ['נפתלי', 'רשע'],             // Naphtali, Rasha (wicked) — same value
  586: ['שופר'],                       // Shofar (Vayikra 25:9, Bemidbar 10:10)
  611: ['תורה'],                       // Torah
  612: ['ברית'],                       // Brit (covenant) — one more than Torah
  620: ['כתר'],                        // Keter (crown)
  702: ['שבת'],                        // Shabbat
  713: ['תשובה'],                      // Teshuvah (repentance)
  800: ['קשת'],                        // Keshet (rainbow — sign of covenant, Bereishit 9:13)
  830: ['יששכר'],                      // Issachar (tribe)
  913: ['בראשית'],                     // Bereishit (In the beginning — first word of Torah)
}
