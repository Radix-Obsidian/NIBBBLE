-- Social Media Integration Migration
-- Run this script in your Supabase SQL editor

-- Add social media fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tiktok_handle TEXT,
ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
ADD COLUMN IF NOT EXISTS social_media_connected BOOLEAN DEFAULT FALSE;

-- Create social_media_connections table
CREATE TABLE IF NOT EXISTS social_media_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('tiktok', 'instagram')),
  platform_user_id VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure one connection per user per platform
  UNIQUE(user_id, platform)
);

-- Create imported_content table
CREATE TABLE IF NOT EXISTS imported_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('tiktok', 'instagram')),
  platform_content_id VARCHAR(255) NOT NULL,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('video', 'image', 'carousel')),
  content_url TEXT,
  thumbnail_url TEXT,
  caption TEXT,
  engagement_metrics JSONB,
  is_approved BOOLEAN DEFAULT FALSE,
  imported_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure one import per content per user
  UNIQUE(user_id, platform, platform_content_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_social_connections_user_id ON social_media_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_platform ON social_media_connections(platform);
CREATE INDEX IF NOT EXISTS idx_social_connections_active ON social_media_connections(is_active);

CREATE INDEX IF NOT EXISTS idx_imported_content_user_id ON imported_content(user_id);
CREATE INDEX IF NOT EXISTS idx_imported_content_platform ON imported_content(platform);
CREATE INDEX IF NOT EXISTS idx_imported_content_approved ON imported_content(is_approved);
CREATE INDEX IF NOT EXISTS idx_imported_content_imported_at ON imported_content(imported_at);

-- Set up Row Level Security (RLS)
ALTER TABLE social_media_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_content ENABLE ROW LEVEL SECURITY;

-- RLS policies for social_media_connections
CREATE POLICY "Users can view their own social connections" ON social_media_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own social connections" ON social_media_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social connections" ON social_media_connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social connections" ON social_media_connections
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for imported_content
CREATE POLICY "Users can view their own imported content" ON imported_content
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own imported content" ON imported_content
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own imported content" ON imported_content
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own imported content" ON imported_content
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_social_media_connections_updated_at 
  BEFORE UPDATE ON social_media_connections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE social_media_connections IS 'Stores OAuth connections to social media platforms';
COMMENT ON TABLE imported_content IS 'Stores content imported from social media platforms';
COMMENT ON COLUMN profiles.social_media_connected IS 'Indicates if user has any active social media connections';
