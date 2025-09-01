import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { contentSyncService } from '@/lib/services/content-sync'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user's social connections
    const connections = await contentSyncService.getUserConnections(user.id)

    return NextResponse.json({
      success: true,
      connections
    })

  } catch (error) {
    logger.error('Get connections error', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch connections' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { platform } = await request.json()

    if (!platform || !['tiktok', 'instagram'].includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform. Must be "tiktok" or "instagram"' },
        { status: 400 }
      )
    }

    // Get current user
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Disconnect account
    await contentSyncService.disconnectAccount(user.id, platform)

    logger.info('Account disconnected successfully', {
      userId: user.id,
      platform
    })

    return NextResponse.json({
      success: true,
      message: `${platform} account disconnected successfully`
    })

  } catch (error) {
    logger.error('Disconnect account error', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to disconnect account' },
      { status: 500 }
    )
  }
}
