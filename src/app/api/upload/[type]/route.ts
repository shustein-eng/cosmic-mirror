import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_TYPES = ['palm', 'handwriting', 'face_reading', 'iridology'] as const
const BUCKET_MAP: Record<string, string> = {
  palm: 'palm-images',
  handwriting: 'handwriting-samples',
  face_reading: 'face-images',
  iridology: 'iris-images',
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params
    if (!ALLOWED_TYPES.includes(type as (typeof ALLOWED_TYPES)[number])) {
      return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, or WebP images are accepted' }, { status: 400 })
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 2MB' }, { status: 400 })
    }

    const bucket = BUCKET_MAP[type]
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${user.id}/${Date.now()}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) throw uploadError

    return NextResponse.json({ path, bucket })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
