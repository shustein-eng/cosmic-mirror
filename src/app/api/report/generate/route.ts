import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { CONVERGENCE_SYSTEM_PROMPT } from '@/lib/claude/prompts'
import { LENS_CARDS } from '@/types'

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
    const lensAnalysesSummary = lensInputs.map((li) => {
      const card = LENS_CARDS.find((c) => c.type === li.lens_type)
      const result = li.analysis_result as Record<string, unknown>
      return {
        lens: li.lens_type,
        lens_name: card?.name || li.lens_type,
        tier: card?.tier || 2,
        tier_label: card?.tierLabel || 'Established Practice',
        summary: result?.summary || '',
        traits: result?.traits || [],
        notable_features: result?.notable_features || [],
        growth_indicators: result?.growth_indicators || [],
        // Lens-specific enrichments
        ...(li.lens_type === 'gematria' && {
          key_numbers: result?.key_numbers,
          torah_connections: result?.torah_connections,
        }),
        ...(li.lens_type === 'natal_chart' && {
          planetary_insights: result?.planetary_insights,
          key_aspects: result?.key_aspects,
        }),
        ...(li.lens_type === 'middos_assessment' && {
          middos_scores: result?.scores,
          dominant_middos: result?.dominant_middos,
          growth_middos: result?.growth_middos,
        }),
        ...(li.lens_type === 'color_psychology' && {
          dominant_themes: result?.dominant_themes,
          suppressed_traits: result?.suppressed_traits,
        }),
      }
    })

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: CONVERGENCE_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Please synthesize the following lens analyses into a Full Cosmic Profile report for "${profile.profile_name}".

LENS ANALYSES:
${JSON.stringify(lensAnalysesSummary, null, 2)}

REPORT TYPE: ${report_type}

Cross-reference all lenses for convergence. Where multiple lenses agree on the same trait, highlight that as high confidence. Where they diverge, present it as nuanced complexity. Create a report that feels like the most insightful personality analysis this person has ever received — specific, grounded in the actual inputs, and deeply illuminating.

Organize sections thematically (not by lens) — e.g., "Your Emotional Architecture", "How You Think and Communicate", "Your Relationship with Others", "Your Drive and Ambition", "Your Inner World and Spiritual Orientation".`,
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
