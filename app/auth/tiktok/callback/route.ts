import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { tiktokAPI } from '@/lib/services/tiktok-api'
import { contentSyncService } from '@/lib/services/content-sync'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      logger.error('TikTok OAuth error', { error })
      return NextResponse.redirect(new URL('/dashboard/settings?error=tiktok_auth_failed', request.url))
    }

    if (!code) {
      logger.error('TikTok OAuth missing code')
      return NextResponse.redirect(new URL('/dashboard/settings?error=tiktok_missing_code', request.url))
    }

    // Get current user
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      logger.error('TikTok OAuth user not authenticated', userError)
      return NextResponse.redirect(new URL('/signin?error=not_authenticated', request.url))
    }

    // Exchange code for token
    const tokenData = await tiktokAPI.exchangeCodeForToken(code)
    
    // Get user info from TikTok
    const tiktokUser = await tiktokAPI.getUserInfo(tokenData.access_token)

    // Connect TikTok account
    await contentSyncService.connectTikTok(
      user.id,
      tokenData.access_token,
      tokenData.refresh_token,
      tiktokUser.id
    )

    logger.info('TikTok OAuth successful', { userId: user.id, tiktokUserId: tiktokUser.id })

    // Redirect back to settings with success message
    return NextResponse.redirect(new URL('/dashboard/settings?success=tiktok_connected', request.url))

  } catch (error) {
    logger.error('TikTok OAuth callback error', error)
    return NextResponse.redirect(new URL('/dashboard/settings?error=tiktok_connection_failed', request.url))
  }
}
