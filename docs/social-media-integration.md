# Social Media Integration

This document describes the TikTok and Instagram integration features for PantryPals.

## Overview

The social media integration allows users to:
- Connect their TikTok and Instagram accounts via OAuth
- Import food-related content from these platforms
- Manage and approve imported content
- View engagement metrics

## Features

### 1. OAuth Integration
- **TikTok OAuth**: Uses TikTok for Developers API
- **Instagram OAuth**: Uses Instagram Basic Display API
- Secure token storage and refresh handling
- Automatic token expiration management

### 2. Content Import
- Automatic filtering for food-related content
- Support for videos, images, and carousel posts
- Engagement metrics tracking (likes, comments, views, shares)
- Duplicate content prevention

### 3. Content Management
- Manual approval workflow for imported content
- Content status tracking (pending/approved)
- User-friendly content preview with thumbnails
- Bulk import capabilities

## Setup Instructions

### 1. Environment Variables

Add the following to your `.env.local` file:

```env
# TikTok API Configuration
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
TIKTOK_REDIRECT_URI=http://localhost:3000/auth/tiktok/callback

# Instagram API Configuration
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/auth/instagram/callback
```

### 2. Database Migration

Run the migration script in your Supabase SQL editor:

```sql
-- Run the contents of scripts/migrate-social-media.sql
```

### 3. API Setup

#### TikTok for Developers
1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Create a new app
3. Configure OAuth settings:
   - Redirect URI: `https://yourdomain.com/auth/tiktok/callback`
   - Scopes: `user.info.basic`, `video.list`
4. Copy the Client Key and Client Secret

#### Instagram Basic Display API
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Instagram Basic Display product
4. Configure OAuth settings:
   - Redirect URI: `https://yourdomain.com/auth/instagram/callback`
   - Scopes: `user_profile`, `user_media`
5. Copy the Client ID and Client Secret

## API Endpoints

### OAuth Callbacks
- `GET /auth/tiktok/callback` - TikTok OAuth callback
- `GET /auth/instagram/callback` - Instagram OAuth callback

### Content Management
- `POST /api/social/import` - Import content from social platforms
- `GET /api/social/import` - Get user's imported content
- `GET /api/social/connections` - Get user's social connections
- `DELETE /api/social/connections` - Disconnect social account

## Database Schema

### social_media_connections
Stores OAuth connections and tokens:
- `user_id`: Reference to auth.users
- `platform`: 'tiktok' or 'instagram'
- `access_token`: OAuth access token
- `refresh_token`: OAuth refresh token (TikTok only)
- `token_expires_at`: Token expiration timestamp
- `is_active`: Connection status

### imported_content
Stores imported social media content:
- `user_id`: Reference to auth.users
- `platform`: Source platform
- `platform_content_id`: Original content ID
- `content_type`: 'video', 'image', or 'carousel'
- `content_url`: Direct content URL
- `thumbnail_url`: Content thumbnail
- `caption`: Content caption
- `engagement_metrics`: JSON with likes, comments, etc.
- `is_approved`: Content approval status

## Usage

### Connecting Accounts
1. Navigate to Settings > Social Connections
2. Click "Connect TikTok" or "Connect Instagram"
3. Complete OAuth flow
4. Account will be connected and ready for content import

### Importing Content
1. Go to Social Connections tab
2. Click "Import Latest Videos/Posts" for connected platforms
3. Review imported content
4. Approve content you want to share

### Managing Content
- View all imported content in the Social Connections tab
- Approve or reject content manually
- Track engagement metrics
- Disconnect accounts when needed

## Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Token Encryption**: Access tokens stored securely
- **Automatic Token Refresh**: Handles token expiration
- **Content Filtering**: Only food-related content is imported
- **Duplicate Prevention**: Prevents importing the same content twice

## Error Handling

The system handles various error scenarios:
- OAuth failures
- Token expiration
- API rate limits
- Network errors
- Invalid content

## Monitoring

Logs are generated for:
- OAuth flows
- Content imports
- API errors
- User actions

## Future Enhancements

- Automated content scheduling
- Advanced content filtering
- Cross-platform content analytics
- Social media posting capabilities
- Content performance tracking
