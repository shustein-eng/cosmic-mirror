import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { CHINESE_ZODIAC_SYSTEM_PROMPT } from '@/lib/claude/prompts'
import { calculateChineseZodiac } from '@/lib/chinese-zodiac/calculator'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { lens_input_id, profile_id, date_of_birth, birth_hour } = await req.json()
    if (!date_of_birth) return NextResponse.json({ error: 'Date of birth required' }, { status: 400 })

    // Verify profile ownership (IDOR prevention)
    const { data: ownedProfile } = await supabase
      .from('personality_profiles')
      .select('id')
      .eq('id', profile_id)
      .eq('user_id', user.id)
      .single()
    if (!ownedProfile) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const dob = new Date(date_of_birth)
    const birthYear = dob.getFullYear()
    const birthMonth = dob.getMonth() + 1
    const zodiacData = calculateChineseZodiac(birthYear, birthMonth, birth_hour)
    const currentYear = new Date().getFullYear()

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system: CHINESE_ZODIAC_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Please provide a detailed personality analysis for this Chinese zodiac profile.

BIRTH YEAR: ${birthYear}
BIRTH MONTH: ${birthMonth}
BIRTH HOUR: ${birth_hour !== undefined ? `${birth_hour}:00` : 'Unknown'}
CURRENT YEAR: ${currentYear}

CALCULATED PROFILE:
- Animal Sign: ${zodiacData.animal} (${zodiacData.animalChinese})
- Element: ${zodiacData.element} (${zodiacData.elementChinese})
- Polarity: ${zodiacData.polarity}
- Inner Animal (birth month): ${zodiacData.innerAnimal}
- Secret Animal (birth hour): ${zodiacData.secretAnimal}
- Current Year Animal: ${zodiacData.currentYearAnimal} ${zodiacData.currentYearElement}

Use Theodora Lau's framework for the ${zodiacData.animal} sign and incorporate how ${zodiacData.element} element modifies the base personality. Include inner animal (private self) and secret animal (hidden self) analysis. Discuss how the ${zodiacData.currentYearAnimal} year interacts with this sign. Respond as JSON.`,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    let analysisResult
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
      analysisResult = { ...parsed, zodiac_data: zodiacData }
    } catch {
      analysisResult = { summary: responseText, traits: [], zodiac_data: zodiacData, methodology_note: 'Chinese zodiac analysis.' }
    }

    const { error: saveError } = await supabase
      .from('lens_inputs')
      .update({
        input_data: { date_of_birth, birth_hour },
        analysis_result: analysisResult,
      })
      .eq('id', lens_input_id)
      .eq('profile_id', profile_id)

    if (saveError) throw saveError

    return NextResponse.json({ success: true, analysis: analysisResult })
  } catch (error) {
    console.error('Chinese zodiac analysis error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Analysis failed' }, { status: 500 })
  }
}
