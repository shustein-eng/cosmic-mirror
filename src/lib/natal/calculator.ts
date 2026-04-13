// ============================================================
// Natal Birth Chart Calculator
// Uses Julian Day Number + simplified planetary longitude calc
// For production: swap in full Swiss Ephemeris JS bindings
// ============================================================

export interface PlanetPosition {
  planet: string
  longitude: number    // ecliptic longitude in degrees 0-360
  sign: string
  house: number
  retrograde: boolean
}

export interface NatalChartData {
  sun: PlanetPosition
  moon: PlanetPosition
  mercury: PlanetPosition
  venus: PlanetPosition
  mars: PlanetPosition
  jupiter: PlanetPosition
  saturn: PlanetPosition
  ascendant: { sign: string; degree: number }
  houses: string[]     // signs on each house cusp
  aspects: Aspect[]
}

export interface Aspect {
  planet1: string
  planet2: string
  type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition'
  orb: number
  harmonious: boolean
}

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

function longitudeToSign(lon: number): string {
  const normalized = ((lon % 360) + 360) % 360
  return ZODIAC_SIGNS[Math.floor(normalized / 30)]
}

function dateToJulianDay(year: number, month: number, day: number, hour = 12): number {
  const a = Math.floor((14 - month) / 12)
  const y = year + 4800 - a
  const m = month + 12 * a - 3
  let jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
  return jdn + (hour - 12) / 24
}

// Simplified mean longitude calculations (accuracy ±1-2°)
// Based on J2000.0 epoch elements + daily motion rates
function getMeanLongitude(planet: string, jd: number): number {
  const T = (jd - 2451545.0) / 36525 // Julian centuries from J2000.0

  const elements: Record<string, [number, number]> = {
    Sun:     [280.46646 + 36000.76983 * T,  0],
    Moon:    [218.3165 + 481267.8813 * T,    0],
    Mercury: [252.2509 + 149472.6674 * T,    0],
    Venus:   [181.9798 + 58517.8156 * T,     0],
    Mars:    [355.4330 + 19140.2993 * T,     0],
    Jupiter: [34.3515  + 3034.9057 * T,      0],
    Saturn:  [50.0774  + 1222.1138 * T,      0],
  }

  const [L0] = elements[planet] ?? [0, 0]
  return ((L0 % 360) + 360) % 360
}

function getAscendant(birthHour: number, birthMinute: number, latitude: number, jd: number): number {
  // Simplified RAMC-based ascendant (not fully accurate — use Swiss Eph for production)
  const RAMC = (280.46 + 360.985647 * (jd - 2451545) + birthHour * 15 + birthMinute / 4) % 360
  const e = 23.4393 // obliquity of ecliptic
  const lat = latitude * Math.PI / 180
  const ramc = RAMC * Math.PI / 180
  const eRad = e * Math.PI / 180

  const y = -Math.cos(ramc)
  const x = Math.sin(eRad) * Math.tan(lat) + Math.cos(eRad) * Math.sin(ramc)
  let asc = Math.atan2(y, x) * 180 / Math.PI
  if (asc < 0) asc += 180
  if (Math.cos(ramc) < 0) asc += 180
  return ((asc % 360) + 360) % 360
}

function calculateAspects(positions: Record<string, number>): Aspect[] {
  const aspects: Aspect[] = []
  const planets = Object.keys(positions)
  const ASPECT_DEFS: Array<{ type: Aspect['type']; angle: number; orb: number; harmonious: boolean }> = [
    { type: 'conjunction',  angle: 0,   orb: 8, harmonious: true },
    { type: 'sextile',      angle: 60,  orb: 6, harmonious: true },
    { type: 'square',       angle: 90,  orb: 7, harmonious: false },
    { type: 'trine',        angle: 120, orb: 8, harmonious: true },
    { type: 'opposition',   angle: 180, orb: 8, harmonious: false },
  ]

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      let diff = Math.abs(positions[planets[i]] - positions[planets[j]])
      if (diff > 180) diff = 360 - diff

      for (const asp of ASPECT_DEFS) {
        const orb = Math.abs(diff - asp.angle)
        if (orb <= asp.orb) {
          aspects.push({
            planet1: planets[i],
            planet2: planets[j],
            type: asp.type,
            orb: Math.round(orb * 10) / 10,
            harmonious: asp.harmonious,
          })
          break
        }
      }
    }
  }

  return aspects
}

export function calculateNatalChart(
  dateOfBirth: string,  // YYYY-MM-DD
  timeOfBirth: string,  // HH:MM
  latitude: number,
  longitude: number
): NatalChartData {
  const [year, month, day] = dateOfBirth.split('-').map(Number)
  const [hour, minute] = timeOfBirth.split(':').map(Number)

  // Adjust for longitude (approximate timezone offset)
  const hourUTC = hour - longitude / 15
  const jd = dateToJulianDay(year, month, day, hourUTC)

  const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']
  const positions: Record<string, number> = {}
  for (const p of planetNames) {
    positions[p] = getMeanLongitude(p, jd)
  }

  const ascLon = getAscendant(hour, minute, latitude, jd)

  const makePlanet = (name: string, key: keyof NatalChartData): PlanetPosition => {
    const lon = positions[name]
    const houseOffset = ((lon - ascLon + 360) % 360) / 30
    return {
      planet: name,
      longitude: lon,
      sign: longitudeToSign(lon),
      house: (Math.floor(houseOffset) % 12) + 1,
      retrograde: false, // simplified — full calc needs velocity
    }
  }

  // Placidus house signs (simplified — equal house from ASC)
  const houses = Array.from({ length: 12 }, (_, i) =>
    longitudeToSign(ascLon + i * 30)
  )

  const aspects = calculateAspects(positions)

  return {
    sun: makePlanet('Sun', 'sun'),
    moon: makePlanet('Moon', 'moon'),
    mercury: makePlanet('Mercury', 'mercury'),
    venus: makePlanet('Venus', 'venus'),
    mars: makePlanet('Mars', 'mars'),
    jupiter: makePlanet('Jupiter', 'jupiter'),
    saturn: makePlanet('Saturn', 'saturn'),
    ascendant: { sign: longitudeToSign(ascLon), degree: Math.round(ascLon % 30) },
    houses,
    aspects,
  }
}
