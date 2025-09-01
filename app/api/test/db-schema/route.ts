import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    logger.info('Checking database schema...')
    
    // Try to get a single recipe to see what columns exist
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
    
    // Get column information
    const { data: columns, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'recipes' })
      .catch(() => ({ data: null, error: 'RPC not available' }))
    
    return NextResponse.json({
      success: true,
      message: 'Database schema check completed',
      sampleData: data,
      columns: columns || 'RPC not available',
      error: columnError
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
