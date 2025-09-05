import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface SmartIngredientSuggestion {
  ingredient: string;
  suggestedProducts: Array<{
    id: string;
    name: string;
    brand: string;
    price: number;
    store: string;
    confidence: number;
    reasoning: string;
    nutritionalBenefit?: string;
    organic?: boolean;
    inStock: boolean;
  }>;
  alternatives: Array<{
    id: string;
    name: string;
    substitutionReason: string;
    priceComparison: number;
  }>;
}

// POST - Generate smart ingredient list with procurement optimization
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, recipeId, ingredients, preferences = {} } = body;

    if (!userId || !ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { success: false, error: 'userId and ingredients array are required' },
        { status: 400 }
      );
    }

    const {
      maxBudget,
      preferOrganic = false,
      preferLocal = false,
      dietaryRestrictions = [],
      preferredStores = []
    } = preferences;

    const smartSuggestions: SmartIngredientSuggestion[] = [];

    for (const ingredient of ingredients) {
      const suggestion = await generateIngredientSuggestion(
        ingredient,
        preferences,
        userId
      );
      smartSuggestions.push(suggestion);
    }

    // Apply procurement optimization
    const optimizedSuggestions = await optimizeProcurement(
      smartSuggestions,
      preferences
    );

    // Store suggestions in database for tracking
    for (const suggestion of optimizedSuggestions) {
      for (const product of suggestion.suggestedProducts) {
        await supabase
          .from('ingredient_suggestions')
          .insert({
            id: uuidv4(),
            user_id: userId,
            original_ingredient: suggestion.ingredient,
            suggested_product_id: product.id,
            confidence_score: product.confidence,
            reasoning: product.reasoning,
            price_comparison: {
              stores: [{ name: product.store, price: product.price }],
              averagePrice: product.price,
              savingsPercent: 0
            },
            nutritional_impact: product.nutritionalBenefit ? {
              benefit: product.nutritionalBenefit
            } : null
          });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        optimizedSuggestions,
        summary: {
          totalItems: optimizedSuggestions.length,
          estimatedCost: calculateTotalCost(optimizedSuggestions),
          organicItems: countOrganicItems(optimizedSuggestions),
          storesNeeded: getUniqueStores(optimizedSuggestions),
          potentialSavings: calculatePotentialSavings(optimizedSuggestions)
        }
      }
    });

  } catch (error) {
    console.error('Smart ingredient list error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Generate smart suggestions for a single ingredient
async function generateIngredientSuggestion(
  ingredient: string,
  preferences: any,
  userId: string
): Promise<SmartIngredientSuggestion> {
  // Search for matching products
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      store_products (
        id,
        price,
        sale_price,
        in_stock,
        grocery_stores (
          name,
          provider_id,
          grocery_providers (
            name,
            slug
          )
        )
      )
    `)
    .ilike('name', `%${ingredient}%`)
    .limit(10);

  const suggestedProducts = [];
  const alternatives = [];

  if (products) {
    for (const product of products) {
      if (product.store_products && product.store_products.length > 0) {
        const storeProduct = product.store_products[0];
        const store = storeProduct.grocery_stores;
        
        const confidence = calculateConfidenceScore(ingredient, product);
        const price = storeProduct.sale_price || storeProduct.price;

        // Apply dietary restriction filters
        if (preferences.dietaryRestrictions.includes('vegetarian') && !product.vegetarian) {
          continue;
        }
        if (preferences.dietaryRestrictions.includes('vegan') && !product.vegan) {
          continue;
        }
        if (preferences.dietaryRestrictions.includes('gluten_free') && !product.gluten_free) {
          continue;
        }

        suggestedProducts.push({
          id: product.id,
          name: product.name,
          brand: product.brand || 'Generic',
          price: price,
          store: store?.grocery_providers?.name || 'Unknown Store',
          confidence: confidence,
          reasoning: generateReasoning(ingredient, product, confidence),
          nutritionalBenefit: product.nutrition ? extractNutritionalBenefit(product.nutrition) : undefined,
          organic: product.organic,
          inStock: storeProduct.in_stock
        });

        // Generate alternatives if this is a good match
        if (confidence > 0.7) {
          alternatives.push({
            id: product.id,
            name: `${product.brand} ${product.name}`,
            substitutionReason: generateSubstitutionReason(product),
            priceComparison: price * 0.85 // Mock price comparison
          });
        }
      }
    }
  }

  // Sort by confidence and price optimization
  suggestedProducts.sort((a, b) => {
    if (preferences.preferOrganic && a.organic !== b.organic) {
      return a.organic ? -1 : 1;
    }
    return b.confidence - a.confidence;
  });

  return {
    ingredient,
    suggestedProducts: suggestedProducts.slice(0, 3),
    alternatives: alternatives.slice(0, 2)
  };
}

// Apply procurement optimization algorithms
async function optimizeProcurement(
  suggestions: SmartIngredientSuggestion[],
  preferences: any
): Promise<SmartIngredientSuggestion[]> {
  // Group by store for bulk optimization
  const storeGroups = new Map();
  
  suggestions.forEach(suggestion => {
    suggestion.suggestedProducts.forEach(product => {
      if (!storeGroups.has(product.store)) {
        storeGroups.set(product.store, []);
      }
      storeGroups.get(product.store).push({ suggestion, product });
    });
  });

  // Apply store consolidation optimization
  const optimizedSuggestions = suggestions.map(suggestion => {
    if (preferences.preferredStores && preferences.preferredStores.length > 0) {
      // Prioritize preferred stores
      const preferredProducts = suggestion.suggestedProducts.filter(
        product => preferences.preferredStores.includes(product.store)
      );
      
      if (preferredProducts.length > 0) {
        return {
          ...suggestion,
          suggestedProducts: [
            ...preferredProducts,
            ...suggestion.suggestedProducts.filter(
              product => !preferences.preferredStores.includes(product.store)
            )
          ]
        };
      }
    }

    return suggestion;
  });

  return optimizedSuggestions;
}

// Helper functions
function calculateConfidenceScore(ingredient: string, product: any): number {
  let score = 0.5; // Base score
  
  const ingredientLower = ingredient.toLowerCase();
  const productNameLower = product.name.toLowerCase();
  
  if (productNameLower.includes(ingredientLower)) {
    score += 0.3;
  }
  
  if (product.organic) score += 0.1;
  if (product.nutrition) score += 0.1;
  
  return Math.min(score, 1.0);
}

function generateReasoning(ingredient: string, product: any, confidence: number): string {
  const reasons = [];
  
  if (product.name.toLowerCase().includes(ingredient.toLowerCase())) {
    reasons.push('Direct name match');
  }
  if (product.organic) {
    reasons.push('Organic option');
  }
  if (product.nutrition) {
    reasons.push('Rich nutritional profile');
  }
  if (confidence > 0.8) {
    reasons.push('High confidence match');
  }
  
  return reasons.join(', ') || 'Basic match';
}

function generateSubstitutionReason(product: any): string {
  if (product.organic) return 'Organic alternative with better nutritional value';
  if (product.gluten_free) return 'Gluten-free alternative';
  if (product.vegan) return 'Plant-based alternative';
  return 'Cost-effective alternative with similar nutritional profile';
}

function extractNutritionalBenefit(nutrition: any): string {
  if (nutrition.protein > 10) return 'High protein content';
  if (nutrition.fiber > 5) return 'High fiber content';
  if (nutrition.vitamin_c > 50) return 'Rich in Vitamin C';
  return 'Good nutritional value';
}

function calculateTotalCost(suggestions: SmartIngredientSuggestion[]): number {
  return suggestions.reduce((total, suggestion) => {
    const firstProduct = suggestion.suggestedProducts[0];
    return total + (firstProduct?.price || 0);
  }, 0);
}

function countOrganicItems(suggestions: SmartIngredientSuggestion[]): number {
  return suggestions.filter(suggestion => 
    suggestion.suggestedProducts[0]?.organic
  ).length;
}

function getUniqueStores(suggestions: SmartIngredientSuggestion[]): string[] {
  const stores = new Set<string>();
  suggestions.forEach(suggestion => {
    suggestion.suggestedProducts.forEach(product => {
      stores.add(product.store);
    });
  });
  return Array.from(stores);
}

function calculatePotentialSavings(suggestions: SmartIngredientSuggestion[]): number {
  return suggestions.reduce((savings, suggestion) => {
    if (suggestion.suggestedProducts.length > 1) {
      const highest = Math.max(...suggestion.suggestedProducts.map(p => p.price));
      const lowest = Math.min(...suggestion.suggestedProducts.map(p => p.price));
      return savings + (highest - lowest);
    }
    return savings;
  }, 0);
}