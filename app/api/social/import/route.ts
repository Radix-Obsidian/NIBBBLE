import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { contentSyncService } from '@/lib/services/content-sync'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const { platform, maxCount = 10 } = await request.json()

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

    // Import content based on platform
    let importedContent
    if (platform === 'tiktok') {
      importedContent = await contentSyncService.importTikTokContent(user.id, maxCount)
    } else {
      importedContent = await contentSyncService.importInstagramContent(user.id, maxCount)
    }

    logger.info('Content import successful', {
      userId: user.id,
      platform,
      importedCount: importedContent.length
    })

    return NextResponse.json({
      success: true,
      importedCount: importedContent.length,
      content: importedContent
    })

  } catch (error) {
    logger.error('Content import error', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')

    // Get current user
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get imported content
    const content = await contentSyncService.getUserImportedContent(
      user.id,
      platform as 'tiktok' | 'instagram' | undefined
    )

    return NextResponse.json({
      success: true,
      content
    })

  } catch (error) {
    logger.error('Get imported content error', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch content' },
      { status: 500 }
    )
  }
}
