import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    logger.info('Testing simple recipe insert...')
    
    // Simple recipe with only essential columns
    const simpleRecipe = {
      title: 'Test Recipe',
      description: 'A simple test recipe',
      ingredients: ['Ingredient 1', 'Ingredient 2'],
      instructions: ['Step 1', 'Step 2'],
      cook_time: 30,
      prep_time: 15,
      difficulty: 'Easy',
      cuisine: 'Test',
      tags: ['Test'],
      creator_id: 'test-user-123',
      rating: 4.0,
      likes_count: 0,
      views_count: 0,
      is_public: true
    }
    
    // Try to insert without image_url and video_url
    const { data: insertedRecipe, error } = await supabase
      .from('recipes')
      .insert(simpleRecipe)
      .select('id, title')
    
    if (error) {
      logger.error('Error inserting simple recipe', error)
      return NextResponse.json(
        { error: 'Failed to insert recipe', details: error.message },
        { status: 500 }
      )
    }
    
    logger.info('Successfully inserted simple recipe', { recipe: insertedRecipe })
    
    return NextResponse.json({
      success: true,
      message: 'Simple recipe inserted successfully',
      recipe: insertedRecipe
    })
    
  } catch (error) {
    logger.error('Simple insert error', { 
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
