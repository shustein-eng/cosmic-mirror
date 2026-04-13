// ============================================================
// Chinese Zodiac & Element Calculator
// Based on Theodora Lau's Handbook of Chinese Horoscopes + Wu Xing Five Elements
// ============================================================

export interface ChineseZodiacResult {
  year: number
  animal: string
  animalChinese: string
  element: string
  elementChinese: string
  polarity: 'Yin' | 'Yang'
  innerAnimal: string // from birth month
  secretAnimal: string // from birth hour
  currentYearAnimal: string
  currentYearElement: string
}

const ANIMALS = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig']
const ANIMALS_CHINESE = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
const ELEMENTS = ['Metal', 'Water', 'Wood', 'Fire', 'Earth']
const ELEMENTS_CHINESE = ['金', '水', '木', '火', '土']

// Inner animals (birth month — lunar approximate, use solar for simplicity)
const MONTH_ANIMALS = [
  'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse',
  'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig', 'Rat'
]

// Secret animals (birth hour — 2-hour increments)
const HOUR_ANIMALS = [
  'Rat',     // 23:00-00:59
  'Ox',      // 01:00-02:59
  'Tiger',   // 03:00-04:59
  'Rabbit',  // 05:00-06:59
  'Dragon',  // 07:00-08:59
  'Snake',   // 09:00-10:59
  'Horse',   // 11:00-12:59
  'Goat',    // 13:00-14:59
  'Monkey',  // 15:00-16:59
  'Rooster', // 17:00-18:59
  'Dog',     // 19:00-20:59
  'Pig',     // 21:00-22:59
]

export function calculateChineseZodiac(
  birthYear: number,
  birthMonth: number,
  birthHour?: number // 0-23
): ChineseZodiacResult {
  // Animal: cycle of 12 starting from 1900 (Rat year)
  const animalIndex = (birthYear - 1900) % 12
  const animal = ANIMALS[((animalIndex % 12) + 12) % 12]
  const animalChinese = ANIMALS_CHINESE[((animalIndex % 12) + 12) % 12]

  // Element: 10-year heavenly stem cycle (each element rules 2 years)
  // Cycle: Metal(0,1), Water(2,3), Wood(4,5), Fire(6,7), Earth(8,9)
  const stemIndex = (birthYear - 1900) % 10
  const elementIndex = Math.floor(stemIndex / 2)
  const element = ELEMENTS[elementIndex % 5]
  const elementChinese = ELEMENTS_CHINESE[elementIndex % 5]

  // Polarity: Yang for odd years (1,3,5...), Yin for even
  const polarity: 'Yin' | 'Yang' = birthYear % 2 === 0 ? 'Yang' : 'Yin'

  // Inner animal (birth month)
  const innerAnimal = MONTH_ANIMALS[Math.max(0, Math.min(11, birthMonth - 1))]

  // Secret animal (birth hour)
  let secretAnimal = 'Rat' // default (unknown)
  if (birthHour !== undefined) {
    // 23:00-00:59 = Rat (index 0), 01:00-02:59 = Ox (index 1), etc.
    const hourIndex = birthHour === 23 ? 0 : Math.floor((birthHour + 1) / 2)
    secretAnimal = HOUR_ANIMALS[Math.min(11, hourIndex)]
  }

  // Current year
  const currentYear = new Date().getFullYear()
  const currentAnimalIdx = (currentYear - 1900) % 12
  const currentYearAnimal = ANIMALS[((currentAnimalIdx % 12) + 12) % 12]
  const currentStemIdx = (currentYear - 1900) % 10
  const currentYearElement = ELEMENTS[Math.floor(currentStemIdx / 2) % 5]

  return {
    year: birthYear,
    animal,
    animalChinese,
    element,
    elementChinese,
    polarity,
    innerAnimal,
    secretAnimal,
    currentYearAnimal,
    currentYearElement,
  }
}

export function getAnimalYear(animal: string): number[] {
  const baseIdx = ANIMALS.indexOf(animal)
  if (baseIdx === -1) return []
  const years: number[] = []
  for (let y = 1900 + baseIdx; y <= 2060; y += 12) years.push(y)
  return years
}
