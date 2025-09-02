import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    logger.info('Checking recipe_likes table...')
    
    // Try to select from recipe_likes table
    const { data, error } = await supabase
      .from('recipe_likes')
      .select('*')
      .limit(1)
    
    if (error) {
      logger.error('Error checking recipe_likes table', error)
      return NextResponse.json(
        { 
          error: 'recipe_likes table not found or error accessing it', 
          details: error.message 
        },
        { status: 500 }
      )
    }
    
    // Try to get table structure
    const { data: sampleData } = await supabase
      .from('recipe_likes')
      .select('*')
      .limit(5)
    
    return NextResponse.json({
      success: true,
      message: 'recipe_likes table exists and is accessible',
      sampleData: sampleData || [],
      tableExists: true
    })
    
  } catch (error) {
    logger.error('Check likes table error', { 
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
