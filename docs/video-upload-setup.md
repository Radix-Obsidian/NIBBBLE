# Video Upload Feature Setup Guide

## Overview
The video upload feature allows users to upload cooking videos and automatically extract recipes using AI. This feature requires proper Supabase configuration to work.

## Prerequisites
- Supabase project with authentication enabled
- User authentication working properly
- Supabase storage enabled

## Required Configuration

### 1. Create Storage Bucket
In your Supabase dashboard, create a new storage bucket:

1. Go to **Storage** → **Buckets**
2. Click **New Bucket**
3. Configure the bucket:
   - **Name**: `recipe-videos`
   - **Public**: `false` (private bucket for security)
   - **File size limit**: `100MB`
   - **Allowed MIME types**: `video/*`

### 2. Set Storage Policies
Create Row Level Security (RLS) policies for the bucket:

```sql
-- Allow authenticated users to upload videos
CREATE POLICY "Users can upload videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'recipe-videos' 
  AND auth.role() = 'authenticated'
);

-- Allow users to view their own videos
CREATE POLICY "Users can view own videos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'recipe-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own videos
CREATE POLICY "Users can update own videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'recipe-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own videos
CREATE POLICY "Users can delete own videos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'recipe-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Environment Variables
Ensure these environment variables are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing the Feature

### 1. Authentication Test
- Navigate to `/dashboard/upload-video`
- If not signed in, you should see the sign-in prompt
- After signing in, you should see the upload interface

### 2. Upload Test
- Sign in with a valid account
- Try uploading a small video file (< 100MB)
- Check that the file appears in your Supabase storage bucket

### 3. Error Handling Test
- Try uploading without authentication (should redirect to login)
- Try uploading an invalid file type (should show validation error)
- Try uploading a file larger than 100MB (should show size error)

## Troubleshooting

### Common Issues

1. **"Storage bucket not configured" error**
   - Verify the `recipe-videos` bucket exists in Supabase
   - Check bucket permissions and policies

2. **"Permission denied" error**
   - Ensure user is properly authenticated
   - Check RLS policies are correctly configured
   - Verify storage bucket is accessible

3. **Upload fails silently**
   - Check browser console for errors
   - Verify file size and type constraints
   - Check network tab for failed requests

### Debug Steps

1. **Check Supabase Logs**
   - Go to Supabase dashboard → Logs
   - Look for storage-related errors

2. **Verify Authentication**
   - Check if user session is valid
   - Verify auth cookies are present

3. **Test Storage Permissions**
   - Try a simple file upload in Supabase dashboard
   - Verify bucket policies are working

## Security Considerations

- Videos are stored in private buckets
- Users can only access their own videos
- File size and type restrictions are enforced
- Authentication is required for all operations

## Performance Notes

- Large files (>50MB) may take time to upload
- Consider implementing chunked uploads for production
- Video processing is simulated in alpha (will use Ollama in production)

## Next Steps

1. **AI Integration**: Connect to local Ollama for recipe extraction
2. **Video Processing**: Add FFmpeg for video analysis
3. **Thumbnail Generation**: Auto-generate video thumbnails
4. **CDN Integration**: Use Supabase Edge Functions for global delivery
