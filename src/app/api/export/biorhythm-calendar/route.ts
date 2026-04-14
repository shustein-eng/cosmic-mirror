import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateBiorhythm } from '@/lib/biorhythm/calculator'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { date_of_birth } = await req.json()
    if (!date_of_birth) return NextResponse.json({ error: 'Date of birth required' }, { status: 400 })

    const today = new Date().toISOString().split('T')[0]
    const allEvents = calculateBiorhythm(date_of_birth, today)

    // Generate iCal format for upcoming 90 days of notable events
    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Cosmic Mirror//Biorhythm Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Cosmic Mirror Biorhythms',
      'X-WR-CALDESC:Your personal biorhythm cycle events',
    ]

    for (const event of allEvents.upcomingEvents) {
      const dateStr = event.date.replace(/-/g, '')
      const uid = `biorhythm-${dateStr}-${event.type}@cosmic-mirror`

      const title = event.type === 'triple_critical' ? '⚠ Triple Critical Biorhythm Day'
        : event.type === 'double_critical' ? '⚡ Double Critical Biorhythm Day'
        : event.type.includes('physical') ? '💪 Physical Biorhythm Event'
        : event.type.includes('emotional') ? '💙 Emotional Biorhythm Event'
        : '🧠 Intellectual Biorhythm Event'

      lines.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTART;VALUE=DATE:${dateStr}`,
        `DTEND;VALUE=DATE:${dateStr}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${event.description}`,
        'END:VEVENT'
      )
    }

    lines.push('END:VCALENDAR')

    const icsContent = lines.join('\r\n')

    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="cosmic-mirror-biorhythms.ics"',
      },
    })
  } catch (error) {
    console.error('Calendar export error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Export failed' }, { status: 500 })
  }
}
