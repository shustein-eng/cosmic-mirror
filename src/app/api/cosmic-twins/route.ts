import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: fetch matches for current user's primary profile
// POST: toggle opt-in

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get user's opt-in status
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('subscription_tier, opt_in_cosmic_twins')
      .eq('id', user.id)
      .single()

    if (!userProfile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    if (!userProfile.opt_in_cosmic_twins) {
      return NextResponse.json({ opted_in: false, matches: [] })
    }

    // Get the user's primary profile with its convergence data (from latest report)
    const { data: myProfile } = await supabase
      .from('personality_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()

    if (!myProfile) return NextResponse.json({ opted_in: true, matches: [], message: 'No primary profile yet' })

    const { data: myReport } = await supabase
      .from('reports')
      .select('convergence_data')
      .eq('profile_id', myProfile.id)
      .eq('report_type', 'full_cosmic')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!myReport?.convergence_data) {
      return NextResponse.json({ opted_in: true, matches: [], message: 'Generate a full report first to find twins.' })
    }

    const myTraits = (myReport.convergence_data as { high_confidence_traits: string[] }).high_confidence_traits || []

    // Find other opted-in users with reports
    const { data: otherReports } = await supabase
      .from('reports')
      .select(`
        profile_id,
        convergence_data,
        personality_profiles!inner(
          id,
          profile_name,
          user_id,
          profiles!inner(opt_in_cosmic_twins, subscription_tier)
        )
      `)
      .eq('report_type', 'full_cosmic')
      .neq('personality_profiles.user_id', user.id)

    if (!otherReports) return NextResponse.json({ opted_in: true, matches: [] })

    // Score similarity
    const scored = otherReports
      .filter((r) => {
        const p = r.personality_profiles as unknown as { profiles: { opt_in_cosmic_twins: boolean } }
        return p?.profiles?.opt_in_cosmic_twins === true
      })
      .map((r) => {
        const theirTraits = ((r.convergence_data as { high_confidence_traits: string[] })?.high_confidence_traits) || []
        const shared = myTraits.filter((t) => theirTraits.includes(t))
        const score = myTraits.length > 0 ? (shared.length / Math.max(myTraits.length, theirTraits.length)) : 0
        const p = r.personality_profiles as unknown as { profile_name: string }
        return {
          profile_name: p.profile_name,
          similarity_score: Math.round(score * 100),
          shared_traits: shared.slice(0, 5),
        }
      })
      .filter((m) => m.similarity_score >= 40)
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, 10)

    return NextResponse.json({ opted_in: true, matches: scored })
  } catch (error) {
    console.error('Cosmic twins error:', error)
    return NextResponse.json({ error: 'Failed to fetch twins' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { opt_in } = await req.json()

    const { error } = await supabase
      .from('profiles')
      .update({ opt_in_cosmic_twins: !!opt_in })
      .eq('id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true, opted_in: !!opt_in })
  } catch (error) {
    console.error('Cosmic twins opt-in error:', error)
    return NextResponse.json({ error: 'Failed to update preference' }, { status: 500 })
  }
}
