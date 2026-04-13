// ============================================================
// Biorhythm Cycle Calculator
// Mathematical cycles from birth date: Physical (23d), Emotional (28d), Intellectual (33d)
// ============================================================

export interface BiorhythmPosition {
  value: number // -1.0 to 1.0
  phase: 'high' | 'low' | 'critical'
  dayOfCycle: number
  percentComplete: number
}

export interface BiorhythmData {
  birthDate: string
  currentDate: string
  daysSinceBirth: number
  physical: BiorhythmPosition
  emotional: BiorhythmPosition
  intellectual: BiorhythmPosition
  upcomingEvents: BiorhythmEvent[]
  seriesData: BiorhythmSeries[]
}

export interface BiorhythmEvent {
  date: string
  daysFromNow: number
  type: 'physical_peak' | 'physical_low' | 'physical_critical' |
        'emotional_peak' | 'emotional_low' | 'emotional_critical' |
        'intellectual_peak' | 'intellectual_low' | 'intellectual_critical' |
        'triple_critical' | 'double_critical'
  description: string
}

export interface BiorhythmSeries {
  date: string
  physical: number
  emotional: number
  intellectual: number
}

const CYCLES = { physical: 23, emotional: 28, intellectual: 33 }

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
}

function calcValue(daysSinceBirth: number, period: number): number {
  return Math.sin((2 * Math.PI * daysSinceBirth) / period)
}

function getPhase(value: number, dayOfCycle: number, period: number): 'high' | 'low' | 'critical' {
  const normalizedDay = dayOfCycle % period
  // Critical days are near zero crossings: ~day 0 and ~day period/2
  const isZeroCrossing = normalizedDay <= 1 || normalizedDay >= period - 1
  const isHalfCrossing = Math.abs(normalizedDay - period / 2) <= 1
  if (isZeroCrossing || isHalfCrossing) return 'critical'
  return value >= 0 ? 'high' : 'low'
}

function calcPosition(daysSinceBirth: number, period: number): BiorhythmPosition {
  const value = calcValue(daysSinceBirth, period)
  const dayOfCycle = daysSinceBirth % period
  const phase = getPhase(value, dayOfCycle, period)
  const percentComplete = Math.round((dayOfCycle / period) * 100)
  return { value: Math.round(value * 100) / 100, phase, dayOfCycle, percentComplete }
}

export function calculateBiorhythm(birthDate: string, currentDate?: string): BiorhythmData {
  const today = currentDate || new Date().toISOString().split('T')[0]
  const daysSinceBirth = daysBetween(birthDate, today)

  const physical = calcPosition(daysSinceBirth, CYCLES.physical)
  const emotional = calcPosition(daysSinceBirth, CYCLES.emotional)
  const intellectual = calcPosition(daysSinceBirth, CYCLES.intellectual)

  // Generate 60-day series centered on today
  const seriesData: BiorhythmSeries[] = []
  for (let offset = -7; offset <= 53; offset++) {
    const d = daysSinceBirth + offset
    const dateObj = new Date(today)
    dateObj.setDate(dateObj.getDate() + offset)
    const dateStr = dateObj.toISOString().split('T')[0]
    seriesData.push({
      date: dateStr,
      physical: Math.round(calcValue(d, CYCLES.physical) * 100) / 100,
      emotional: Math.round(calcValue(d, CYCLES.emotional) * 100) / 100,
      intellectual: Math.round(calcValue(d, CYCLES.intellectual) * 100) / 100,
    })
  }

  // Find upcoming events in next 30 days
  const upcomingEvents: BiorhythmEvent[] = []
  for (let i = 1; i <= 30; i++) {
    const d = daysSinceBirth + i
    const dateObj = new Date(today)
    dateObj.setDate(dateObj.getDate() + i)
    const dateStr = dateObj.toISOString().split('T')[0]

    const phys = calcPosition(d, CYCLES.physical)
    const emot = calcPosition(d, CYCLES.emotional)
    const intel = calcPosition(d, CYCLES.intellectual)

    const criticals = [phys, emot, intel].filter((p) => p.phase === 'critical').length
    if (criticals === 3) {
      upcomingEvents.push({ date: dateStr, daysFromNow: i, type: 'triple_critical', description: 'Triple critical day — all three cycles cross zero simultaneously' })
    } else if (criticals === 2) {
      upcomingEvents.push({ date: dateStr, daysFromNow: i, type: 'double_critical', description: 'Double critical day — two cycles cross zero. Extra self-awareness recommended.' })
    } else if (phys.phase === 'critical') {
      upcomingEvents.push({ date: dateStr, daysFromNow: i, type: 'physical_critical', description: 'Physical cycle critical — transition day, energy may be unpredictable' })
    } else if (emot.phase === 'critical') {
      upcomingEvents.push({ date: dateStr, daysFromNow: i, type: 'emotional_critical', description: 'Emotional cycle critical — heightened emotional sensitivity, practice extra patience' })
    } else if (intel.phase === 'critical') {
      upcomingEvents.push({ date: dateStr, daysFromNow: i, type: 'intellectual_critical', description: 'Intellectual cycle critical — double-check important decisions today' })
    }
  }

  return {
    birthDate,
    currentDate: today,
    daysSinceBirth,
    physical,
    emotional,
    intellectual,
    upcomingEvents: upcomingEvents.slice(0, 8),
    seriesData,
  }
}
