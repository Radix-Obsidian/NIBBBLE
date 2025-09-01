'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { tiktokAPI } from '@/lib/services/tiktok-api'
import { instagramAPI } from '@/lib/services/instagram-api'
import { contentSyncService, SocialConnection, ImportedContent } from '@/lib/services/content-sync'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { logger } from '@/lib/logger'
import { 
  ExternalLink, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Video,
  Image,
  Heart,
  MessageCircle,
  Eye,
  Share2
} from 'lucide-react'

interface SocialConnectionsProps {
  onContentImported?: (content: ImportedContent[]) => void
}

export function SocialConnections({ onContentImported }: SocialConnectionsProps) {
  const { user } = useAuth()
  const [connections, setConnections] = useState<SocialConnection[]>([])
  const [importedContent, setImportedContent] = useState<ImportedContent[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (user) {
      loadConnections()
      loadImportedContent()
    }
  }, [user])

  const loadConnections = async () => {
    try {
      setLoading(true)
      const userConnections = await contentSyncService.getUserConnections(user!.id)
      setConnections(userConnections)
    } catch (error) {
      logger.error('Error loading connections', error)
      setMessage({ type: 'error', text: 'Failed to load connections' })
    } finally {
      setLoading(false)
    }
  }

  const loadImportedContent = async () => {
    try {
      const content = await contentSyncService.getUserImportedContent(user!.id)
      setImportedContent(content)
    } catch (error) {
      logger.error('Error loading imported content', error)
    }
  }

  const handleConnectTikTok = () => {
    if (!user) return

    const state = `tiktok_${user.id}_${Date.now()}`
    const authUrl = tiktokAPI.getAuthUrl(state)
    
    // Store state in localStorage for verification
    localStorage.setItem('tiktok_oauth_state', state)
    
    // Redirect to TikTok OAuth
    window.location.href = authUrl
  }

  const handleConnectInstagram = () => {
    if (!user) return

    const state = `instagram_${user.id}_${Date.now()}`
    const authUrl = instagramAPI.getAuthUrl(state)
    
    // Store state in localStorage for verification
    localStorage.setItem('instagram_oauth_state', state)
    
    // Redirect to Instagram OAuth
    window.location.href = authUrl
  }

  const handleImportContent = async (platform: 'tiktok' | 'instagram') => {
    try {
      setImporting(platform)
      setMessage(null)

      const response = await fetch('/api/social/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform, maxCount: 10 }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Import failed')
      }

      setMessage({ 
        type: 'success', 
        text: `Successfully imported ${result.importedCount} items from ${platform}` 
      })

      // Reload imported content
      await loadImportedContent()

      // Notify parent component
      if (onContentImported && result.content) {
        onContentImported(result.content)
      }

    } catch (error) {
      logger.error(`Error importing ${platform} content`, error)
      setMessage({ 
        type: 'error', 
        text: `Failed to import from ${platform}: ${error instanceof Error ? error.message : 'Unknown error'}` 
      })
    } finally {
      setImporting(null)
    }
  }

  const handleDisconnect = async (platform: 'tiktok' | 'instagram') => {
    try {
      const response = await fetch('/api/social/connections', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform }),
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect account')
      }

      setMessage({ 
        type: 'success', 
        text: `${platform} account disconnected successfully` 
      })

      // Reload connections
      await loadConnections()

    } catch (error) {
      logger.error(`Error disconnecting ${platform}`, error)
      setMessage({ 
        type: 'error', 
        text: `Failed to disconnect ${platform} account` 
      })
    }
  }

  const handleApproveContent = async (contentId: string) => {
    try {
      await contentSyncService.approveContent(contentId)
      
      // Update local state
      setImportedContent(prev => 
        prev.map(content => 
          content.id === contentId 
            ? { ...content, is_approved: true }
            : content
        )
      )

      setMessage({ type: 'success', text: 'Content approved successfully' })
    } catch (error) {
      logger.error('Error approving content', error)
      setMessage({ type: 'error', text: 'Failed to approve content' })
    }
  }

  const getConnectionStatus = (platform: 'tiktok' | 'instagram') => {
    const connection = connections.find(c => c.platform === platform)
    if (!connection) return 'disconnected'
    if (!connection.is_active) return 'inactive'
    if (connection.token_expires_at && new Date(connection.token_expires_at) < new Date()) {
      return 'expired'
    }
    return 'connected'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'expired':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'inactive':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected'
      case 'expired':
        return 'Token Expired'
      case 'inactive':
        return 'Disconnected'
      default:
        return 'Not Connected'
    }
  }

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return <Video className="w-4 h-4" />
      case 'image':
        return <Image className="w-4 h-4" />
      case 'carousel':
        return <Image className="w-4 h-4" />
      default:
        return <Image className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="ml-2">Loading connections...</span>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Platform Connections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TikTok Connection */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Tik</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">TikTok</h3>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(getConnectionStatus('tiktok'))}
                  <span className="text-sm text-gray-600">
                    {getStatusText(getConnectionStatus('tiktok'))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {getConnectionStatus('tiktok') === 'connected' ? (
              <>
                <Button
                  onClick={() => handleImportContent('tiktok')}
                  disabled={importing === 'tiktok'}
                  className="w-full"
                >
                  {importing === 'tiktok' ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  Import Latest Videos
                </Button>
                <Button
                  onClick={() => handleDisconnect('tiktok')}
                  variant="outline"
                  className="w-full"
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                onClick={handleConnectTikTok}
                className="w-full bg-black hover:bg-gray-800"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Connect TikTok
              </Button>
            )}
          </div>
        </Card>

        {/* Instagram Connection */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IG</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Instagram</h3>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(getConnectionStatus('instagram'))}
                  <span className="text-sm text-gray-600">
                    {getStatusText(getConnectionStatus('instagram'))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {getConnectionStatus('instagram') === 'connected' ? (
              <>
                <Button
                  onClick={() => handleImportContent('instagram')}
                  disabled={importing === 'instagram'}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {importing === 'instagram' ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  Import Latest Posts
                </Button>
                <Button
                  onClick={() => handleDisconnect('instagram')}
                  variant="outline"
                  className="w-full"
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                onClick={handleConnectInstagram}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Connect Instagram
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Imported Content */}
      {importedContent.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Imported Content</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {importedContent.map((content) => (
              <div key={content.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getContentIcon(content.content_type)}
                    <span className="text-sm font-medium capitalize">
                      {content.platform}
                    </span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    content.is_approved 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {content.is_approved ? 'Approved' : 'Pending'}
                  </div>
                </div>

                {content.thumbnail_url && (
                  <img 
                    src={content.thumbnail_url} 
                    alt="Content thumbnail"
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {content.caption || 'No caption'}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
                      <span>{content.engagement_metrics?.likes || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{content.engagement_metrics?.comments || 0}</span>
                    </div>
                    {content.engagement_metrics?.views && (
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{content.engagement_metrics.views}</span>
                      </div>
                    )}
                  </div>
                </div>

                {!content.is_approved && (
                  <Button
                    onClick={() => handleApproveContent(content.id)}
                    size="sm"
                    className="w-full"
                  >
                    Approve Content
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
