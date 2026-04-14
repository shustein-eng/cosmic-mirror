import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify ownership before deleting
  const { data: profile } = await supabase
    .from('personality_profiles')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const { error } = await supabase
    .from('personality_profiles')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Profile delete error:', error)
    return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
