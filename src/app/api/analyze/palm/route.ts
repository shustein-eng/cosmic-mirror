import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { PALM_SYSTEM_PROMPT } from '@/lib/claude/prompts'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { lens_input_id, profile_id, image_path, image_bucket, delete_after = false } = await req.json()

    if (!image_path || !image_bucket) {
      return NextResponse.json({ error: 'Image path and bucket are required' }, { status: 400 })
    }

    // Verify profile ownership (IDOR prevention)
    const { data: ownedProfile } = await supabase
      .from('personality_profiles')
      .select('id')
      .eq('id', profile_id)
      .eq('user_id', user.id)
      .single()
    if (!ownedProfile) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    // Get signed URL for the image
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(image_bucket)
      .createSignedUrl(image_path, 300) // 5 min expiry

    if (signedUrlError || !signedUrlData?.signedUrl) {
      return NextResponse.json({ error: 'Failed to access image' }, { status: 500 })
    }

    // Fetch image as base64
    const imageRes = await fetch(signedUrlData.signedUrl)
    const imageBuffer = await imageRes.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const mediaType = (imageRes.headers.get('content-type') || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1800,
      system: PALM_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64Image },
            },
            {
              type: 'text',
              text: 'Please analyze this palm image using Cheiro\'s chirology framework and William Benham\'s mount analysis system. Identify the major lines (heart, head, life, fate), secondary lines, and mount prominences. Produce a detailed personality analysis as structured JSON.',
            },
          ],
        },
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    let analysisResult
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      analysisResult = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: responseText, traits: [] }
    } catch {
      analysisResult = { summary: responseText, traits: [], notable_features: [], growth_indicators: [], methodology_note: 'Palm chirology analysis.' }
    }

    // Save to lens_inputs
    const { error: saveError } = await supabase
      .from('lens_inputs')
      .update({
        input_data: { image_path, image_bucket, delete_after },
        image_path,
        analysis_result: analysisResult,
      })
      .eq('id', lens_input_id)
      .eq('profile_id', profile_id)

    if (saveError) throw saveError

    // Optionally delete image after analysis
    if (delete_after) {
      await supabase.storage.from(image_bucket).remove([image_path])
    }

    return NextResponse.json({ success: true, analysis: analysisResult })
  } catch (error) {
    console.error('Palm analysis error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}
