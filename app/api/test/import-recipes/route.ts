import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

export const maxDuration = 60 // 1 minute

export async function POST(request: NextRequest) {
  try {
    logger.info('Starting test recipe import...')
    
    // Sample recipe data for testing
    const sampleRecipes = [
      {
        title: 'Classic Margherita Pizza',
        description: 'A traditional Italian pizza with tomato sauce, mozzarella, and fresh basil.',
        ingredients: ['Pizza dough', 'Tomato sauce', 'Fresh mozzarella', 'Fresh basil', 'Olive oil'],
        instructions: [
          'Preheat oven to 450°F (230°C).',
          'Roll out the pizza dough on a floured surface.',
          'Spread tomato sauce evenly over the dough.',
          'Add slices of fresh mozzarella.',
          'Bake for 12-15 minutes until crust is golden.',
          'Top with fresh basil leaves and drizzle with olive oil.'
        ],
        cook_time: 15,
        prep_time: 20,
        difficulty: 'Medium',
        cuisine: 'Italian',
        tags: ['Pizza', 'Italian', 'Vegetarian'],
        image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400',
        video_url: null,
        creator_id: 'test-user-123',
        rating: 4.5,
        likes_count: 150,
        views_count: 1200,
        is_public: true
      },
      {
        title: 'Spaghetti Carbonara',
        description: 'A creamy Italian pasta dish with eggs, cheese, pancetta, and black pepper.',
        ingredients: ['Spaghetti', 'Eggs', 'Parmesan cheese', 'Pancetta', 'Black pepper', 'Salt'],
        instructions: [
          'Cook spaghetti in salted water until al dente.',
          'In a separate pan, cook pancetta until crispy.',
          'Beat eggs with grated parmesan cheese.',
          'Drain pasta and immediately mix with egg mixture.',
          'Add crispy pancetta and black pepper.',
          'Serve immediately while hot.'
        ],
        cook_time: 20,
        prep_time: 10,
        difficulty: 'Medium',
        cuisine: 'Italian',
        tags: ['Pasta', 'Italian', 'Creamy'],
        image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
        video_url: null,
        creator_id: 'test-user-123',
        rating: 4.8,
        likes_count: 200,
        views_count: 1800,
        is_public: true
      },
      {
        title: 'Chicken Tacos',
        description: 'Delicious Mexican tacos with seasoned chicken, fresh vegetables, and salsa.',
        ingredients: ['Chicken breast', 'Tortillas', 'Onion', 'Tomato', 'Lettuce', 'Cheese', 'Salsa'],
        instructions: [
          'Season chicken breast with Mexican spices.',
          'Cook chicken in a pan until fully cooked.',
          'Warm tortillas in a dry pan.',
          'Shred the cooked chicken.',
          'Assemble tacos with chicken, vegetables, and salsa.',
          'Serve with lime wedges and hot sauce.'
        ],
        cook_time: 25,
        prep_time: 15,
        difficulty: 'Easy',
        cuisine: 'Mexican',
        tags: ['Tacos', 'Mexican', 'Chicken'],
        image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
        video_url: null,
        creator_id: 'test-user-123',
        rating: 4.3,
        likes_count: 120,
        views_count: 950,
        is_public: true
      },
      {
        title: 'Beef Stir Fry',
        description: 'Quick and healthy Asian stir fry with tender beef and fresh vegetables.',
        ingredients: ['Beef strips', 'Broccoli', 'Carrots', 'Soy sauce', 'Garlic', 'Ginger', 'Rice'],
        instructions: [
          'Cook rice according to package instructions.',
          'Heat oil in a wok or large pan.',
          'Stir fry beef until browned.',
          'Add vegetables and stir fry until tender.',
          'Add soy sauce, garlic, and ginger.',
          'Serve hot over rice.'
        ],
        cook_time: 15,
        prep_time: 10,
        difficulty: 'Easy',
        cuisine: 'Asian',
        tags: ['Stir Fry', 'Asian', 'Beef'],
        image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
        video_url: null,
        creator_id: 'test-user-123',
        rating: 4.6,
        likes_count: 180,
        views_count: 1400,
        is_public: true
      },
      {
        title: 'Classic Burger',
        description: 'Juicy American burger with all the traditional toppings.',
        ingredients: ['Ground beef', 'Burger buns', 'Lettuce', 'Tomato', 'Onion', 'Cheese', 'Pickles'],
        instructions: [
          'Form ground beef into patties.',
          'Season with salt and pepper.',
          'Grill or pan-fry until desired doneness.',
          'Add cheese during last minute of cooking.',
          'Toast burger buns.',
          'Assemble burger with all toppings.'
        ],
        cook_time: 12,
        prep_time: 8,
        difficulty: 'Easy',
        cuisine: 'American',
        tags: ['Burger', 'American', 'Beef'],
        image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        video_url: null,
        creator_id: 'test-user-123',
        rating: 4.4,
        likes_count: 160,
        views_count: 1100,
        is_public: true
      }
    ]
    
    // Insert recipes into database
    const { data: insertedRecipes, error } = await supabase
      .from('recipes')
      .insert(sampleRecipes)
      .select('id, title')
    
    if (error) {
      logger.error('Error inserting test recipes', error)
      return NextResponse.json(
        { error: 'Failed to insert recipes', details: error.message },
        { status: 500 }
      )
    }
    
    logger.info('Successfully inserted test recipes', { count: insertedRecipes.length })
    
    return NextResponse.json({
      success: true,
      message: `Successfully imported ${insertedRecipes.length} test recipes`,
      recipes: insertedRecipes
    })
    
  } catch (error) {
    logger.error('Test import API error', { 
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
