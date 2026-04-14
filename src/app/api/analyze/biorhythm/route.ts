import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { BIORHYTHM_SYSTEM_PROMPT } from '@/lib/claude/prompts'
import { calculateBiorhythm } from '@/lib/biorhythm/calculator'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { lens_input_id, profile_id, date_of_birth } = await req.json()
    if (!date_of_birth) return NextResponse.json({ error: 'Date of birth required' }, { status: 400 })

    // Verify profile ownership (IDOR prevention)
    const { data: ownedProfile } = await supabase
      .from('personality_profiles')
      .select('id')
      .eq('id', profile_id)
      .eq('user_id', user.id)
      .single()
    if (!ownedProfile) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const today = new Date().toISOString().split('T')[0]
    const biorhythmData = calculateBiorhythm(date_of_birth, today)

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system: BIORHYTHM_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Please interpret the following biorhythm cycle data and produce a personality analysis.

BIRTH DATE: ${date_of_birth}
CURRENT DATE: ${today}
DAYS SINCE BIRTH: ${biorhythmData.daysSinceBirth}

CURRENT CYCLE POSITIONS:
- Physical (23-day cycle): ${Math.round(biorhythmData.physical.value * 100)}% (Phase: ${biorhythmData.physical.phase}, Day ${biorhythmData.physical.dayOfCycle} of 23)
- Emotional (28-day cycle): ${Math.round(biorhythmData.emotional.value * 100)}% (Phase: ${biorhythmData.emotional.phase}, Day ${biorhythmData.emotional.dayOfCycle} of 28)
- Intellectual (33-day cycle): ${Math.round(biorhythmData.intellectual.value * 100)}% (Phase: ${biorhythmData.intellectual.phase}, Day ${biorhythmData.intellectual.dayOfCycle} of 33)

UPCOMING NOTABLE EVENTS (next 30 days):
${biorhythmData.upcomingEvents.map((e) => `- ${e.date} (in ${e.daysFromNow} days): ${e.description}`).join('\n') || 'No critical days in next 30 days'}

Focus on: (1) What these current cycle positions suggest about today and the coming weeks, (2) What this person's overall biorhythm pattern reveals about their natural rhythm and personality tendencies, (3) Practical insights for optimizing their natural cycles. Respond as JSON.`,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    let analysisResult
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
      analysisResult = { ...parsed, biorhythm_data: biorhythmData }
    } catch {
      analysisResult = { summary: responseText, traits: [], biorhythm_data: biorhythmData, methodology_note: 'Biorhythm cycle analysis.' }
    }

    const { error: saveError } = await supabase
      .from('lens_inputs')
      .update({
        input_data: { date_of_birth },
        analysis_result: analysisResult,
      })
      .eq('id', lens_input_id)
      .eq('profile_id', profile_id)

    if (saveError) throw saveError

    return NextResponse.json({ success: true, analysis: analysisResult })
  } catch (error) {
    console.error('Biorhythm analysis error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Analysis failed' }, { status: 500 })
  }
}
