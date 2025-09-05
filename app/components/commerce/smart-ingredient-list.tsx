'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Store, 
  DollarSign, 
  Leaf, 
  Star, 
  ShoppingCart, 
  AlertCircle,
  TrendingDown,
  MapPin,
  Clock
} from 'lucide-react';

interface SmartProduct {
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
}

interface SmartAlternative {
  id: string;
  name: string;
  substitutionReason: string;
  priceComparison: number;
}

interface SmartIngredientSuggestion {
  ingredient: string;
  suggestedProducts: SmartProduct[];
  alternatives: SmartAlternative[];
}

interface SmartIngredientListProps {
  userId: string;
  recipeId?: string;
  ingredients: string[];
  preferences?: {
    maxBudget?: number;
    preferOrganic?: boolean;
    preferLocal?: boolean;
    dietaryRestrictions?: string[];
    preferredStores?: string[];
  };
  onAddToCart?: (productId: string, quantity: number) => void;
}

export function SmartIngredientList({ 
  userId, 
  recipeId, 
  ingredients, 
  preferences = {},
  onAddToCart 
}: SmartIngredientListProps) {
  const [suggestions, setSuggestions] = useState<SmartIngredientSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Map<string, SmartProduct>>(new Map());
  const [showAlternatives, setShowAlternatives] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (ingredients.length > 0) {
      generateSmartList();
    }
  }, [ingredients, preferences]);

  const generateSmartList = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/commerce/ingredients/smart-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          recipeId,
          ingredients,
          preferences
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSuggestions(result.data.optimizedSuggestions);
        
        // Pre-select the best product for each ingredient
        const newSelections = new Map<string, SmartProduct>();
        result.data.optimizedSuggestions.forEach((suggestion: SmartIngredientSuggestion) => {
          if (suggestion.suggestedProducts.length > 0) {
            newSelections.set(suggestion.ingredient, suggestion.suggestedProducts[0]);
          }
        });
        setSelectedProducts(newSelections);
      } else {
        setError(result.error || 'Failed to generate smart ingredient list');
      }
    } catch (err) {
      setError('Failed to generate smart ingredient list');
      console.error('Smart list error:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectProduct = (ingredient: string, product: SmartProduct) => {
    setSelectedProducts(prev => new Map(prev.set(ingredient, product)));
  };

  const toggleAlternatives = (ingredient: string) => {
    setShowAlternatives(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ingredient)) {
        newSet.delete(ingredient);
      } else {
        newSet.add(ingredient);
      }
      return newSet;
    });
  };

  const addSelectedToCart = async (ingredient: string) => {
    const selectedProduct = selectedProducts.get(ingredient);
    if (selectedProduct && onAddToCart) {
      await onAddToCart(selectedProduct.id, 1);
    }
  };

  const addAllToCart = async () => {
    for (const [ingredient, product] of selectedProducts) {
      if (onAddToCart) {
        await onAddToCart(product.id, 1);
      }
    }
  };

  const calculateTotalCost = (): number => {
    return Array.from(selectedProducts.values()).reduce((sum, product) => sum + product.price, 0);
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-[#FF375F]" />
          <h2 className="text-xl font-bold">Smart Ingredient List</h2>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF375F]"></div>
          <span className="ml-3 text-gray-600">Optimizing your ingredient list...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-bold">Smart Ingredient List</h2>
        </div>
        
        <div className="text-red-600 text-center py-4">
          {error}
        </div>
        
        <button
          onClick={generateSmartList}
          className="w-full mt-4 bg-[#FF375F] text-white py-2 rounded-lg hover:bg-[#E62E54] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-[#FF375F]" />
            <h2 className="text-xl font-bold">Smart Ingredient List</h2>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">Estimated Total</p>
            <p className="text-2xl font-bold text-[#FF375F]">
              ${calculateTotalCost().toFixed(2)}
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{suggestions.length}</p>
            <p className="text-sm text-gray-600">Ingredients</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {Array.from(selectedProducts.values()).filter(p => p.organic).length}
            </p>
            <p className="text-sm text-gray-600">Organic</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {new Set(Array.from(selectedProducts.values()).map(p => p.store)).size}
            </p>
            <p className="text-sm text-gray-600">Stores</p>
          </div>
        </div>

        {/* Add All to Cart Button */}
        <button
          onClick={addAllToCart}
          className="w-full mt-4 bg-[#FF375F] text-white py-3 rounded-lg hover:bg-[#E62E54] transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          Add All to Cart (${calculateTotalCost().toFixed(2)})
        </button>
      </div>

      {/* Ingredient List */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {suggestions.map((suggestion) => {
          const selectedProduct = selectedProducts.get(suggestion.ingredient);
          const showAlt = showAlternatives.has(suggestion.ingredient);
          
          return (
            <div key={suggestion.ingredient} className="p-4">
              {/* Ingredient Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg capitalize">
                  {suggestion.ingredient}
                </h3>
                
                <div className="flex items-center gap-2">
                  {suggestion.alternatives.length > 0 && (
                    <button
                      onClick={() => toggleAlternatives(suggestion.ingredient)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {showAlt ? 'Hide' : 'Show'} Alternatives
                    </button>
                  )}
                  
                  <button
                    onClick={() => addSelectedToCart(suggestion.ingredient)}
                    disabled={!selectedProduct}
                    className="bg-[#FF375F] text-white px-3 py-1 rounded-lg hover:bg-[#E62E54] transition-colors disabled:opacity-50"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>

              {/* Main Suggestions */}
              <div className="space-y-2">
                {suggestion.suggestedProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedProduct?.id === product.id
                        ? 'border-[#FF375F] bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => selectProduct(suggestion.ingredient, product)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">
                            {product.brand} {product.name}
                          </h4>
                          
                          {/* Confidence Badge */}
                          <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(product.confidence)}`}>
                            {Math.round(product.confidence * 100)}% match
                          </span>
                          
                          {product.organic && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1">
                              <Leaf className="w-3 h-3" />
                              Organic
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Store className="w-4 h-4" />
                            {product.store}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            ${product.price.toFixed(2)}
                          </div>
                          
                          <div className={`flex items-center gap-1 ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                            <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </div>
                        </div>

                        {/* Reasoning */}
                        <p className="text-sm text-gray-500 mt-1">
                          {product.reasoning}
                        </p>

                        {/* Nutritional Benefit */}
                        {product.nutritionalBenefit && (
                          <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {product.nutritionalBenefit}
                          </p>
                        )}
                      </div>

                      {/* Selection Indicator */}
                      {selectedProduct?.id === product.id && (
                        <div className="w-6 h-6 bg-[#FF375F] rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Alternatives */}
              {showAlt && suggestion.alternatives.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">
                    Alternative Options
                  </h4>
                  
                  {suggestion.alternatives.map((alt) => (
                    <div key={alt.id} className="flex items-center justify-between py-2 text-sm">
                      <div>
                        <p className="font-medium">{alt.name}</p>
                        <p className="text-gray-600">{alt.substitutionReason}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          ${alt.priceComparison.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}