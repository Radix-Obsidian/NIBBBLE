import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { instagramAPI } from '@/lib/services/instagram-api'
import { contentSyncService } from '@/lib/services/content-sync'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      logger.error('Instagram OAuth error', { error })
      return NextResponse.redirect(new URL('/dashboard/settings?error=instagram_auth_failed', request.url))
    }

    if (!code) {
      logger.error('Instagram OAuth missing code')
      return NextResponse.redirect(new URL('/dashboard/settings?error=instagram_missing_code', request.url))
    }

    // Get current user
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      logger.error('Instagram OAuth user not authenticated', userError)
      return NextResponse.redirect(new URL('/signin?error=not_authenticated', request.url))
    }

    // Exchange code for token
    const tokenData = await instagramAPI.exchangeCodeForToken(code)
    
    // Get user info from Instagram
    const instagramUser = await instagramAPI.getUserInfo(tokenData.access_token)

    // Connect Instagram account
    await contentSyncService.connectInstagram(
      user.id,
      tokenData.access_token,
      instagramUser.id
    )

    logger.info('Instagram OAuth successful', { userId: user.id, instagramUserId: instagramUser.id })

    // Redirect back to settings with success message
    return NextResponse.redirect(new URL('/dashboard/settings?success=instagram_connected', request.url))

  } catch (error) {
    logger.error('Instagram OAuth callback error', error)
    return NextResponse.redirect(new URL('/dashboard/settings?error=instagram_connection_failed', request.url))
  }
}
