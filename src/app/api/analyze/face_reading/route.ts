import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { FACE_READING_SYSTEM_PROMPT } from '@/lib/claude/prompts'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { lens_input_id, profile_id, image_path, image_bucket, delete_after = true } = await req.json()

    if (!image_path || !image_bucket) {
      return NextResponse.json({ error: 'Image path and bucket are required' }, { status: 400 })
    }

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(image_bucket)
      .createSignedUrl(image_path, 300)

    if (signedUrlError || !signedUrlData?.signedUrl) {
      return NextResponse.json({ error: 'Failed to access image' }, { status: 500 })
    }

    const imageRes = await fetch(signedUrlData.signedUrl)
    const imageBuffer = await imageRes.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const mediaType = (imageRes.headers.get('content-type') || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: FACE_READING_SYSTEM_PROMPT,
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
              text: 'Please analyze this face using Jean Haner\'s Chinese face reading framework and Mac Fulfer\'s face feature analysis. Focus on face shape, forehead, eye spacing, nose shape, mouth, jaw, and overall proportions. Use thoughtful, respectful language. Produce a detailed personality analysis as structured JSON.',
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
      analysisResult = { summary: responseText, traits: [], notable_features: [], growth_indicators: [], methodology_note: 'Physiognomy analysis.' }
    }

    const { error: saveError } = await supabase
      .from('lens_inputs')
      .update({
        input_data: { image_path: delete_after ? null : image_path, image_bucket, delete_after },
        image_path: delete_after ? null : image_path,
        analysis_result: analysisResult,
      })
      .eq('id', lens_input_id)
      .eq('profile_id', profile_id)

    if (saveError) throw saveError

    // Auto-delete face image (privacy)
    if (delete_after) {
      await supabase.storage.from(image_bucket).remove([image_path])
    }

    return NextResponse.json({ success: true, analysis: analysisResult })
  } catch (error) {
    console.error('Face reading error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}
