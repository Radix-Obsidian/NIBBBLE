import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    logger.info('Testing minimal recipe insert...')
    
    // Try with only the most basic columns
    const minimalRecipe = {
      title: 'Minimal Test Recipe',
      description: 'A minimal test recipe',
      cook_time: 30,
      prep_time: 15,
      difficulty: 'Easy',
      creator_id: '00000000-0000-0000-0000-000000000000' // Use a valid UUID format
    }
    
    const { data: insertedRecipe, error } = await supabase
      .from('recipes')
      .insert(minimalRecipe)
      .select('*')
    
    if (error) {
      logger.error('Error inserting minimal recipe', error)
      return NextResponse.json(
        { error: 'Failed to insert recipe', details: error.message },
        { status: 500 }
      )
    }
    
    logger.info('Successfully inserted minimal recipe', { recipe: insertedRecipe })
    
    return NextResponse.json({
      success: true,
      message: 'Minimal recipe inserted successfully',
      recipe: insertedRecipe
    })
    
  } catch (error) {
    logger.error('Minimal insert error', { 
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
