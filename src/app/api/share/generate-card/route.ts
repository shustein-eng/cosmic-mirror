import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { profile_id, report_type = 'full_cosmic' } = await req.json()

    // Verify ownership
    const { data: profile } = await supabase
      .from('personality_profiles')
      .select('*')
      .eq('id', profile_id)
      .eq('user_id', user.id)
      .single()
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    // Get report
    const { data: report } = await supabase
      .from('reports')
      .select('*')
      .eq('profile_id', profile_id)
      .eq('report_type', report_type)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!report) return NextResponse.json({ error: 'Report not found — generate a report first' }, { status: 404 })

    const content = report.report_content as Record<string, unknown>
    const topStrengths = (content?.top_strengths as Array<{ name: string }> || []).slice(0, 3).map((s) => s.name)
    const cosmicSignature = (content?.cosmic_signature as string) || ''

    // Generate card as SVG data URL (no Satori dependency needed for a clean card)
    const cardSvg = generateCardSvg({
      profileName: profile.profile_name,
      cosmicSignature,
      topStrengths,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'cosmic-mirror.app',
    })

    const base64 = Buffer.from(cardSvg).toString('base64')
    const dataUrl = `data:image/svg+xml;base64,${base64}`

    return NextResponse.json({
      success: true,
      card_data_url: dataUrl,
      profile_name: profile.profile_name,
      cosmic_signature: cosmicSignature,
      top_strengths: topStrengths,
    })
  } catch (error) {
    console.error('Card generation error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Card generation failed' }, { status: 500 })
  }
}

function generateCardSvg({
  profileName,
  cosmicSignature,
  topStrengths,
  appUrl,
}: {
  profileName: string
  cosmicSignature: string
  topStrengths: string[]
  appUrl: string
}) {
  // Truncate long text
  const sig = cosmicSignature.length > 120 ? cosmicSignature.slice(0, 117) + '...' : cosmicSignature
  const name = profileName.length > 30 ? profileName.slice(0, 27) + '...' : profileName

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1A0A3E"/>
      <stop offset="100%" stop-color="#0A0E27"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="35%" r="40%">
      <stop offset="0%" stop-color="#C9A84C" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#C9A84C" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="1080" height="1080" fill="url(#bg)"/>
  <rect width="1080" height="1080" fill="url(#glow)"/>

  <!-- Star particles -->
  ${Array.from({ length: 60 }, (_, i) => {
    const x = (i * 137 + 50) % 1060 + 10
    const y = (i * 251 + 80) % 1060 + 10
    const r = i % 3 === 0 ? 2 : 1
    const opacity = 0.2 + (i % 5) * 0.1
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="white" opacity="${opacity}"/>`
  }).join('\n  ')}

  <!-- Gold border -->
  <rect x="40" y="40" width="1000" height="1000" rx="20" fill="none" stroke="#C9A84C" stroke-width="1" stroke-opacity="0.4"/>
  <rect x="50" y="50" width="980" height="980" rx="16" fill="none" stroke="#C9A84C" stroke-width="0.5" stroke-opacity="0.2"/>

  <!-- Star ornament top -->
  <text x="540" y="140" text-anchor="middle" font-size="48" fill="#C9A84C" opacity="0.8">✦</text>

  <!-- App name -->
  <text x="540" y="180" text-anchor="middle" font-size="22" fill="#C9A84C" opacity="0.6" font-family="Georgia, serif" letter-spacing="6">COSMIC MIRROR</text>

  <!-- Divider -->
  <line x1="200" y1="205" x2="880" y2="205" stroke="#C9A84C" stroke-width="0.5" opacity="0.3"/>

  <!-- Profile name -->
  <text x="540" y="300" text-anchor="middle" font-size="52" fill="white" font-family="Georgia, serif">${escapeXml(name)}</text>

  <!-- Cosmic signature -->
  <foreignObject x="120" y="330" width="840" height="160">
    <div xmlns="http://www.w3.org/1999/xhtml" style="color: rgba(184,196,212,0.75); font-size: 26px; font-family: Georgia, serif; text-align: center; line-height: 1.5; font-style: italic;">
      "${escapeXml(sig)}"
    </div>
  </foreignObject>

  <!-- Divider -->
  <line x1="200" y1="510" x2="880" y2="510" stroke="#C9A84C" stroke-width="0.5" opacity="0.3"/>

  <!-- Top strengths label -->
  <text x="540" y="560" text-anchor="middle" font-size="18" fill="#C9A84C" opacity="0.7" font-family="Georgia, serif" letter-spacing="4">TOP STRENGTHS</text>

  <!-- Strengths -->
  ${topStrengths.slice(0, 3).map((s, i) => `
  <text x="540" y="${620 + i * 70}" text-anchor="middle" font-size="30" fill="white" font-family="Georgia, serif">${escapeXml(s)}</text>
  `).join('')}

  <!-- Bottom ornament -->
  <line x1="200" y1="870" x2="880" y2="870" stroke="#C9A84C" stroke-width="0.5" opacity="0.3"/>
  <text x="540" y="920" text-anchor="middle" font-size="22" fill="#C9A84C" opacity="0.5" font-family="Georgia, serif" letter-spacing="3">${escapeXml(appUrl)}</text>
  <text x="540" y="970" text-anchor="middle" font-size="18" fill="rgba(184,196,212,0.3)" font-family="Georgia, serif">Know Yourself — דע את עצמך</text>
</svg>`
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}
