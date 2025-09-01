import { 
  SpoonacularRecipeDetails, 
  SpoonacularIngredient, 
  SpoonacularAnalyzedInstruction 
} from '@/types/spoonacular'
import { logger } from '@/lib/logger'

// PantryPals recipe interface (matching database schema)
export interface PantryPalsRecipe {
  title: string
  description: string | null
  ingredients: string[]
  instructions: string[]
  cook_time: number
  prep_time: number
  difficulty: string
  cuisine: string | null
  tags: string[]
  image_url: string | null
  video_url: string | null
  creator_id: string
  rating: number | null
  likes_count: number
  views_count: number
  is_public: boolean
}

// Cuisine mapping from Spoonacular to PantryPals
const CUISINE_MAPPING: Record<string, string> = {
  'italian': 'Italian',
  'mexican': 'Mexican',
  'chinese': 'Chinese',
  'japanese': 'Japanese',
  'indian': 'Indian',
  'thai': 'Thai',
  'french': 'French',
  'mediterranean': 'Mediterranean',
  'american': 'American',
  'greek': 'Greek',
  'spanish': 'Spanish',
  'korean': 'Korean',
  'vietnamese': 'Vietnamese',
  'middle eastern': 'Middle Eastern',
  'caribbean': 'Caribbean',
  'latin american': 'Latin American',
  'african': 'African',
  'british': 'British',
  'german': 'German',
  'russian': 'Russian',
  'eastern european': 'Eastern European'
}

// Diet mapping
const DIET_MAPPING: Record<string, string> = {
  'vegetarian': 'Vegetarian',
  'vegan': 'Vegan',
  'gluten free': 'Gluten-Free',
  'dairy free': 'Dairy-Free',
  'ketogenic': 'Keto',
  'paleo': 'Paleo',
  'whole30': 'Whole30',
  'low carb': 'Low-Carb',
  'low fat': 'Low-Fat',
  'low sodium': 'Low-Sodium',
  'high protein': 'High-Protein',
  'pescetarian': 'Pescetarian',
  'primal': 'Primal'
}

// Dish type mapping to meal types
const MEAL_TYPE_MAPPING: Record<string, string> = {
  'breakfast': 'Breakfast',
  'lunch': 'Lunch',
  'dinner': 'Dinner',
  'snack': 'Snack',
  'dessert': 'Dessert',
  'appetizer': 'Appetizer',
  'side dish': 'Side Dish',
  'main course': 'Main Course',
  'soup': 'Soup',
  'salad': 'Salad',
  'beverage': 'Beverage'
}

/**
 * Determine difficulty level based on cooking time and complexity
 */
function determineDifficulty(
  prepTime: number, 
  cookTime: number, 
  instructionCount: number,
  ingredientCount: number
): string {
  const totalTime = prepTime + cookTime
  const complexity = instructionCount + (ingredientCount * 0.5)
  
  if (totalTime <= 30 && complexity <= 8) {
    return 'Easy'
  } else if (totalTime <= 60 && complexity <= 15) {
    return 'Medium'
  } else {
    return 'Hard'
  }
}

/**
 * Extract cuisine from Spoonacular data
 */
function extractCuisine(cuisines: string[], dishTypes: string[]): string | null {
  // First, try to find a cuisine from the cuisines array
  for (const cuisine of cuisines) {
    const normalizedCuisine = cuisine.toLowerCase()
    if (CUISINE_MAPPING[normalizedCuisine]) {
      return CUISINE_MAPPING[normalizedCuisine]
    }
  }
  
  // If no cuisine found, try to infer from dish types
  for (const dishType of dishTypes) {
    const normalizedDish = dishType.toLowerCase()
    if (CUISINE_MAPPING[normalizedDish]) {
      return CUISINE_MAPPING[normalizedDish]
    }
  }
  
  return null
}

/**
 * Extract meal type from dish types
 */
function extractMealType(dishTypes: string[]): string | null {
  for (const dishType of dishTypes) {
    const normalizedDish = dishType.toLowerCase()
    if (MEAL_TYPE_MAPPING[normalizedDish]) {
      return MEAL_TYPE_MAPPING[normalizedDish]
    }
  }
  return null
}

/**
 * Extract dietary tags from diets array
 */
function extractDietaryTags(diets: string[]): string[] {
  return diets
    .map(diet => diet.toLowerCase())
    .filter(diet => DIET_MAPPING[diet])
    .map(diet => DIET_MAPPING[diet])
}

/**
 * Format ingredient for PantryPals format
 */
function formatIngredient(ingredient: SpoonacularIngredient): string {
  const amount = ingredient.amount
  const unit = ingredient.unit
  const name = ingredient.nameClean || ingredient.name
  
  // Handle fractional amounts
  let formattedAmount = amount.toString()
  if (amount < 1 && amount > 0) {
    const fraction = Math.round(amount * 4) / 4
    if (fraction === 0.25) formattedAmount = '1/4'
    else if (fraction === 0.5) formattedAmount = '1/2'
    else if (fraction === 0.75) formattedAmount = '3/4'
    else if (fraction === 0.33) formattedAmount = '1/3'
    else if (fraction === 0.67) formattedAmount = '2/3'
  }
  
  // Format unit
  let formattedUnit = unit
  if (unit === 'cups') formattedUnit = 'cup'
  else if (unit === 'tablespoons') formattedUnit = 'tbsp'
  else if (unit === 'teaspoons') formattedUnit = 'tsp'
  else if (unit === 'pounds') formattedUnit = 'lb'
  else if (unit === 'ounces') formattedUnit = 'oz'
  
  // Combine amount, unit, and name
  if (amount === 1) {
    return `${formattedAmount} ${formattedUnit} ${name}`
  } else if (unit && unit !== '') {
    return `${formattedAmount} ${formattedUnit} ${name}`
  } else {
    return `${formattedAmount} ${name}`
  }
}

/**
 * Extract and format instructions from analyzed instructions
 */
function extractInstructions(analyzedInstructions: SpoonacularAnalyzedInstruction[]): string[] {
  const instructions: string[] = []
  
  for (const instructionGroup of analyzedInstructions) {
    for (const step of instructionGroup.steps) {
      if (step.step && step.step.trim()) {
        // Clean up the instruction text
        let cleanStep = step.step.trim()
        
        // Remove HTML tags if any
        cleanStep = cleanStep.replace(/<[^>]*>/g, '')
        
        // Capitalize first letter
        cleanStep = cleanStep.charAt(0).toUpperCase() + cleanStep.slice(1)
        
        // Add period if not present
        if (!cleanStep.endsWith('.') && !cleanStep.endsWith('!') && !cleanStep.endsWith('?')) {
          cleanStep += '.'
        }
        
        instructions.push(cleanStep)
      }
    }
  }
  
  return instructions
}

/**
 * Generate tags for the recipe
 */
function generateTags(
  dishTypes: string[],
  diets: string[],
  occasions: string[],
  veryHealthy: boolean,
  veryPopular: boolean,
  cheap: boolean
): string[] {
  const tags: string[] = []
  
  // Add meal type tags
  const mealType = extractMealType(dishTypes)
  if (mealType) {
    tags.push(mealType)
  }
  
  // Add dietary tags
  tags.push(...extractDietaryTags(diets))
  
  // Add occasion tags
  occasions.forEach(occasion => {
    const normalizedOccasion = occasion.toLowerCase()
    if (normalizedOccasion === 'christmas' || normalizedOccasion === 'thanksgiving' || 
        normalizedOccasion === 'halloween' || normalizedOccasion === 'easter') {
      tags.push(occasion)
    }
  })
  
  // Add special tags
  if (veryHealthy) tags.push('Healthy')
  if (veryPopular) tags.push('Popular')
  if (cheap) tags.push('Budget-Friendly')
  
  // Add cooking method tags
  dishTypes.forEach(dishType => {
    const normalizedDish = dishType.toLowerCase()
    if (normalizedDish.includes('grilled') || normalizedDish.includes('roasted') || 
        normalizedDish.includes('baked') || normalizedDish.includes('fried') ||
        normalizedDish.includes('steamed') || normalizedDish.includes('boiled')) {
      tags.push(dishType)
    }
  })
  
  return [...new Set(tags)] // Remove duplicates
}

/**
 * Transform Spoonacular recipe to PantryPals format
 */
export function transformSpoonacularRecipe(
  spoonacularRecipe: SpoonacularRecipeDetails,
  creatorId: string
): PantryPalsRecipe {
  try {
    logger.info('Transforming Spoonacular recipe', { 
      id: spoonacularRecipe.id, 
      title: spoonacularRecipe.title 
    })
    
    // Extract basic information
    const title = spoonacularRecipe.title.trim()
    const description = spoonacularRecipe.summary 
      ? spoonacularRecipe.summary.replace(/<[^>]*>/g, '').trim().substring(0, 500)
      : null
    
    // Calculate times
    const prepTime = spoonacularRecipe.preparationMinutes || 0
    const cookTime = spoonacularRecipe.cookingMinutes || spoonacularRecipe.readyInMinutes - prepTime || 0
    
    // Format ingredients
    const ingredients = spoonacularRecipe.extendedIngredients.map(formatIngredient)
    
    // Extract instructions
    const instructions = extractInstructions(spoonacularRecipe.analyzedInstructions)
    
    // Determine difficulty
    const difficulty = determineDifficulty(
      prepTime, 
      cookTime, 
      instructions.length, 
      ingredients.length
    )
    
    // Extract cuisine
    const cuisine = extractCuisine(spoonacularRecipe.cuisines, spoonacularRecipe.dishTypes)
    
    // Generate tags
    const tags = generateTags(
      spoonacularRecipe.dishTypes,
      spoonacularRecipe.diets,
      spoonacularRecipe.occasions || [],
      spoonacularRecipe.veryHealthy,
      spoonacularRecipe.veryPopular,
      spoonacularRecipe.cheap
    )
    
    // Get image URL
    const imageUrl = spoonacularRecipe.image || null
    
    // Calculate rating (convert from 0-100 to 0-5 scale)
    const rating = spoonacularRecipe.spoonacularScore 
      ? Math.round((spoonacularRecipe.spoonacularScore / 100) * 5 * 10) / 10
      : null
    
    const transformedRecipe: PantryPalsRecipe = {
      title,
      description,
      ingredients,
      instructions,
      cook_time: cookTime,
      prep_time: prepTime,
      difficulty,
      cuisine,
      tags,
      image_url: imageUrl,
      video_url: null, // Spoonacular doesn't provide video URLs
      creator_id: creatorId,
      rating,
      likes_count: spoonacularRecipe.aggregateLikes || 0,
      views_count: 0, // Will be updated as users view the recipe
      is_public: true
    }
    
    logger.info('Successfully transformed recipe', { 
      id: spoonacularRecipe.id,
      title: transformedRecipe.title,
      ingredientsCount: transformedRecipe.ingredients.length,
      instructionsCount: transformedRecipe.instructions.length,
      difficulty: transformedRecipe.difficulty,
      cuisine: transformedRecipe.cuisine
    })
    
    return transformedRecipe
    
  } catch (error) {
    logger.error('Error transforming Spoonacular recipe', { 
      id: spoonacularRecipe.id,
      error: error.message 
    })
    throw new Error(`Failed to transform recipe: ${error.message}`)
  }
}

/**
 * Validate transformed recipe before database insertion
 */
export function validateTransformedRecipe(recipe: PantryPalsRecipe): string[] {
  const errors: string[] = []
  
  if (!recipe.title || recipe.title.trim().length === 0) {
    errors.push('Recipe title is required')
  }
  
  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    errors.push('Recipe must have at least one ingredient')
  }
  
  if (!recipe.instructions || recipe.instructions.length === 0) {
    errors.push('Recipe must have at least one instruction')
  }
  
  if (recipe.cook_time < 0) {
    errors.push('Cook time cannot be negative')
  }
  
  if (recipe.prep_time < 0) {
    errors.push('Prep time cannot be negative')
  }
  
  if (!['Easy', 'Medium', 'Hard'].includes(recipe.difficulty)) {
    errors.push('Difficulty must be Easy, Medium, or Hard')
  }
  
  if (!recipe.creator_id || recipe.creator_id.trim().length === 0) {
    errors.push('Creator ID is required')
  }
  
  return errors
}

/**
 * Batch transform multiple recipes
 */
export function transformMultipleRecipes(
  spoonacularRecipes: SpoonacularRecipeDetails[],
  creatorId: string
): PantryPalsRecipe[] {
  const transformedRecipes: PantryPalsRecipe[] = []
  const errors: string[] = []
  
  for (const recipe of spoonacularRecipes) {
    try {
      const transformed = transformSpoonacularRecipe(recipe, creatorId)
      const validationErrors = validateTransformedRecipe(transformed)
      
      if (validationErrors.length === 0) {
        transformedRecipes.push(transformed)
      } else {
        errors.push(`Recipe ${recipe.id} (${recipe.title}): ${validationErrors.join(', ')}`)
      }
    } catch (error) {
      errors.push(`Recipe ${recipe.id} (${recipe.title}): ${error.message}`)
    }
  }
  
  if (errors.length > 0) {
    logger.warn('Some recipes failed transformation', { errors })
  }
  
  logger.info('Batch transformation completed', {
    total: spoonacularRecipes.length,
    successful: transformedRecipes.length,
    failed: errors.length
  })
  
  return transformedRecipes
}
