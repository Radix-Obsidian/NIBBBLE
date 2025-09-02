import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    logger.info('Checking database schema comprehensively...')
    
    // Define what columns we expect based on our TypeScript definitions
    const expectedColumns = [
      'id',
      'title', 
      'description',
      'ingredients',
      'instructions',
      'cook_time',
      'prep_time',
      'difficulty',
      'cuisine',
      'tags',
      'image_url',
      'video_url',
      'creator_id',
      'rating',
      'likes_count',
      'views_count',
      'is_public',
      'created_at',
      'updated_at'
    ]
    
    // Try to select all columns to see which ones exist
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .limit(1)
    
    if (error) {
      logger.error('Error checking schema', error)
      return NextResponse.json(
        { error: 'Failed to check schema', details: error.message },
        { status: 500 }
      )
    }
    
    // Get the actual columns from the data
    const actualColumns = data && data.length > 0 ? Object.keys(data[0]) : []
    
    // Find missing columns
    const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col))
    const extraColumns = actualColumns.filter(col => !expectedColumns.includes(col))
    
    // Check RLS status by trying to insert a test record
    const testInsert = {
      title: 'Schema Test Recipe',
      description: 'Testing schema',
      cook_time: 30,
      prep_time: 15,
      difficulty: 'Easy',
      creator_id: '00000000-0000-0000-0000-000000000000'
    }
    
    const { error: insertError } = await supabase
      .from('recipes')
      .insert(testInsert)
    
    const rlsEnabled = insertError && insertError.message.includes('row-level security')
    
    return NextResponse.json({
      success: true,
      message: 'Database schema analysis completed',
      expectedColumns,
      actualColumns,
      missingColumns,
      extraColumns,
      rlsEnabled,
      sampleData: data && data.length > 0 ? data[0] : null,
      insertError: insertError ? insertError.message : null
    })
    
  } catch (error) {
    logger.error('Schema check error', { 
      error: error instanceof Error ? error.message : String(error)
    })
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
