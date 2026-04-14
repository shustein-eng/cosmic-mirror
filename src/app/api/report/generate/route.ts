import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import {
  CONVERGENCE_SYSTEM_PROMPT,
  CAREER_REPORT_PROMPT,
  RELATIONSHIPS_REPORT_PROMPT,
  GROWTH_REPORT_PROMPT,
  CREATIVE_REPORT_PROMPT,
  WELLNESS_REPORT_PROMPT,
  LEADERSHIP_REPORT_PROMPT,
} from '@/lib/claude/prompts'
import { LENS_CARDS } from '@/types'

const REPORT_PROMPTS: Record<string, string> = {
  full_cosmic: CONVERGENCE_SYSTEM_PROMPT,
  career: CAREER_REPORT_PROMPT,
  relationships: RELATIONSHIPS_REPORT_PROMPT,
  growth: GROWTH_REPORT_PROMPT,
  creative: CREATIVE_REPORT_PROMPT,
  wellness: WELLNESS_REPORT_PROMPT,
  leadership: LEADERSHIP_REPORT_PROMPT,
}

const PREMIUM_REPORTS = ['career', 'relationships', 'growth', 'creative', 'wellness', 'leadership']

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { profile_id, report_type = 'full_cosmic' } = await req.json()

    // Verify profile ownership
    const { data: profile } = await supabase
      .from('personality_profiles')
      .select('*')
      .eq('id', profile_id)
      .eq('user_id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    // Premium gating for specialized reports
    if (PREMIUM_REPORTS.includes(report_type)) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()
      if (!userProfile || userProfile.subscription_tier === 'free') {
        return NextResponse.json({ error: 'Premium subscription required for this report type', upgrade_required: true }, { status: 403 })
      }
    }

    // Fetch all analyzed lens inputs
    const { data: lensInputs } = await supabase
      .from('lens_inputs')
      .select('*')
      .eq('profile_id', profile_id)
      .not('analysis_result', 'is', null)

    if (!lensInputs || lensInputs.length === 0) {
      return NextResponse.json({ error: 'No analyzed lenses found' }, { status: 400 })
    }

    const lensesUsed = lensInputs.map((li) => li.lens_type)

    // Build the synthesis input — all lens analyses together
    // Strip to essentials only — reduces tokens significantly
    const lensAnalysesSummary = lensInputs.map((li) => {
      const card = LENS_CARDS.find((c) => c.type === li.lens_type)
      const result = li.analysis_result as Record<string, unknown>
      const traits = (result?.traits as Array<{ trait_name: string; confidence: string; category: string }>) || []
      return {
        lens: li.lens_type,
        lens_name: card?.name || li.lens_type,
        summary: result?.summary || '',
        top_traits: traits.slice(0, 5).map((t) => `${t.trait_name} (${t.confidence}, ${t.category})`),
        notable: (result?.notable_features as string[] || []).slice(0, 3),
        growth: (result?.growth_indicators as string[] || []).slice(0, 2),
      }
    })

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const systemPrompt = REPORT_PROMPTS[report_type] || CONVERGENCE_SYSTEM_PROMPT

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Synthesize these lens analyses into a ${report_type} report for "${profile.profile_name}".

LENS DATA:
${JSON.stringify(lensAnalysesSummary, null, 1)}

REPORT TYPE: ${report_type}

STYLE: Write like a sharp analyst — direct, specific, evidence-based. No poetic filler. No metaphors. Each section: 3-5 sentences max, dense with specific insight grounded in the lens data. Where lenses agree, say so. Where they diverge, note the nuance briefly.`,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    let reportContent
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      reportContent = jsonMatch ? JSON.parse(jsonMatch[0]) : { title: 'Your Cosmic Profile', cosmic_signature: '', sections: [], top_strengths: [], growth_opportunities: [], closing_reflection: '' }
    } catch {
      reportContent = {
        title: 'Your Cosmic Profile',
        cosmic_signature: 'A unique constellation of traits that defies easy categorization.',
        sections: [{ heading: 'Your Profile', content: responseText, convergence_score: 0.7, contributing_lenses: lensesUsed, key_insight: '' }],
        top_strengths: [],
        growth_opportunities: [],
        closing_reflection: '',
      }
    }

    // Build convergence data
    const convergenceData = buildConvergenceData(lensInputs)

    // Save report
    const { data: savedReport, error: saveError } = await supabase
      .from('reports')
      .insert({
        profile_id,
        report_type,
        lenses_used: lensesUsed,
        report_content: reportContent,
        convergence_data: convergenceData,
      })
      .select()
      .single()

    if (saveError) throw saveError

    return NextResponse.json({ success: true, report: savedReport })
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Report generation failed' },
      { status: 500 }
    )
  }
}

function buildConvergenceData(lensInputs: Array<{ lens_type: string; analysis_result: unknown }>) {
  const traitMap: Record<string, string[]> = {}

  for (const li of lensInputs) {
    const result = li.analysis_result as Record<string, unknown>
    const traits = (result?.traits as Array<{ trait_name: string }>) || []
    for (const trait of traits) {
      if (!traitMap[trait.trait_name]) traitMap[trait.trait_name] = []
      traitMap[trait.trait_name].push(li.lens_type)
    }
  }

  const traitConvergence: Record<string, number> = {}
  const highConfidenceTraits: string[] = []
  const nuancedAreas: string[] = []

  for (const [trait, lenses] of Object.entries(traitMap)) {
    const score = lenses.length / lensInputs.length
    traitConvergence[trait] = score
    if (score >= 0.6) highConfidenceTraits.push(trait)
    else if (score <= 0.3) nuancedAreas.push(trait)
  }

  return { trait_convergence: traitConvergence, high_confidence_traits: highConfidenceTraits, nuanced_areas: nuancedAreas }
}
