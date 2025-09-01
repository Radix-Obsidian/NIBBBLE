// Spoonacular API Type Definitions
// Based on Spoonacular API documentation: https://spoonacular.com/food-api/docs

export interface SpoonacularSearchResponse {
  results: SpoonacularRecipeSummary[];
  offset: number;
  number: number;
  totalResults: number;
}

export interface SpoonacularRecipeSummary {
  id: number;
  title: string;
  image: string;
  imageType: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  spoonacularSourceUrl: string;
}

export interface SpoonacularRecipeDetails {
  id: number;
  title: string;
  summary: string;
  instructions: string;
  analyzedInstructions: SpoonacularAnalyzedInstruction[];
  extendedIngredients: SpoonacularIngredient[];
  readyInMinutes: number;
  preparationMinutes: number;
  cookingMinutes: number;
  servings: number;
  sourceUrl: string;
  spoonacularSourceUrl: string;
  aggregateLikes: number;
  healthScore: number;
  spoonacularScore: number;
  pricePerServing: number;
  cheap: boolean;
  creditsText: string;
  license: string;
  sourceName: string;
  image: string;
  imageType: string;
  dishTypes: string[];
  diets: string[];
  occasions: string[];
  winePairing: SpoonacularWinePairing;
  cuisines: string[];
  veryHealthy: boolean;
  veryPopular: boolean;
  sustainable: boolean;
  lowFodmap: boolean;
  weightWatcherSmartPoints: number;
  gaps: string;
  preparationMinutes: number;
  cookingMinutes: number;
  nutrition: SpoonacularNutrition;
}

export interface SpoonacularAnalyzedInstruction {
  name: string;
  steps: SpoonacularInstructionStep[];
}

export interface SpoonacularInstructionStep {
  number: number;
  step: string;
  ingredients: SpoonacularStepIngredient[];
  equipment: SpoonacularStepEquipment[];
  length?: SpoonacularStepLength;
}

export interface SpoonacularStepIngredient {
  id: number;
  name: string;
  localizedName: string;
  image: string;
}

export interface SpoonacularStepEquipment {
  id: number;
  name: string;
  localizedName: string;
  image: string;
  temperature?: SpoonacularTemperature;
}

export interface SpoonacularStepLength {
  number: number;
  unit: string;
}

export interface SpoonacularTemperature {
  number: number;
  unit: string;
}

export interface SpoonacularIngredient {
  id: number;
  aisle: string;
  image: string;
  consistency: string;
  name: string;
  nameClean: string;
  original: string;
  originalName: string;
  amount: number;
  unit: string;
  meta: string[];
  measures: SpoonacularMeasures;
}

export interface SpoonacularMeasures {
  us: SpoonacularMeasure;
  metric: SpoonacularMeasure;
}

export interface SpoonacularMeasure {
  amount: number;
  unitShort: string;
  unitLong: string;
}

export interface SpoonacularWinePairing {
  pairedWines: string[];
  pairingText: string;
  productMatches: SpoonacularWineProduct[];
}

export interface SpoonacularWineProduct {
  id: number;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  averageRating: number;
  ratingCount: number;
  score: number;
  link: string;
}

export interface SpoonacularNutrition {
  nutrients: SpoonacularNutrient[];
  properties: SpoonacularProperty[];
  flavonoids: SpoonacularFlavonoid[];
  ingredients: SpoonacularNutritionIngredient[];
  caloricBreakdown: SpoonacularCaloricBreakdown;
  weightPerServing: SpoonacularWeightPerServing;
}

export interface SpoonacularNutrient {
  name: string;
  amount: number;
  unit: string;
  percentOfDailyNeeds: number;
}

export interface SpoonacularProperty {
  name: string;
  amount: number;
  unit: string;
}

export interface SpoonacularFlavonoid {
  name: string;
  amount: number;
  unit: string;
}

export interface SpoonacularNutritionIngredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  nutrients: SpoonacularNutrient[];
}

export interface SpoonacularCaloricBreakdown {
  percentProtein: number;
  percentFat: number;
  percentCarbs: number;
}

export interface SpoonacularWeightPerServing {
  amount: number;
  unit: string;
}

// Search and filter interfaces
export interface SpoonacularSearchParams {
  query?: string;
  cuisine?: string;
  diet?: string;
  intolerances?: string;
  type?: string;
  maxReadyTime?: number;
  minReadyTime?: number;
  number?: number;
  offset?: number;
  sort?: 'popularity' | 'healthiness' | 'price' | 'time' | 'random';
  sortDirection?: 'asc' | 'desc';
  addRecipeInformation?: boolean;
  addRecipeNutrition?: boolean;
  fillIngredients?: boolean;
  includeIngredients?: string;
  excludeIngredients?: string;
  maxCalories?: number;
  minCalories?: number;
  maxCarbs?: number;
  minCarbs?: number;
  maxProtein?: number;
  minProtein?: number;
  maxFat?: number;
  minFat?: number;
  maxAlcohol?: number;
  minAlcohol?: number;
  maxCaffeine?: number;
  minCaffeine?: number;
  maxCopper?: number;
  minCopper?: number;
  maxCalcium?: number;
  minCalcium?: number;
  maxCholine?: number;
  minCholine?: number;
  maxCholesterol?: number;
  minCholesterol?: number;
  maxFluoride?: number;
  minFluoride?: number;
  maxSaturatedFat?: number;
  minSaturatedFat?: number;
  maxVitaminA?: number;
  minVitaminA?: number;
  maxVitaminC?: number;
  minVitaminC?: number;
  maxVitaminD?: number;
  minVitaminD?: number;
  maxVitaminE?: number;
  minVitaminE?: number;
  maxVitaminK?: number;
  minVitaminK?: number;
  maxVitaminB1?: number;
  minVitaminB1?: number;
  maxVitaminB2?: number;
  minVitaminB2?: number;
  maxVitaminB5?: number;
  minVitaminB5?: number;
  maxVitaminB3?: number;
  minVitaminB3?: number;
  maxVitaminB6?: number;
  minVitaminB6?: number;
  maxVitaminB12?: number;
  minVitaminB12?: number;
  maxFiber?: number;
  minFiber?: number;
  maxFolate?: number;
  minFolate?: number;
  maxFolicAcid?: number;
  minFolicAcid?: number;
  maxIodine?: number;
  minIodine?: number;
  maxIron?: number;
  minIron?: number;
  maxMagnesium?: number;
  minMagnesium?: number;
  maxManganese?: number;
  minManganese?: number;
  maxPhosphorus?: number;
  minPhosphorus?: number;
  maxPotassium?: number;
  minPotassium?: number;
  maxSelenium?: number;
  minSelenium?: number;
  maxSodium?: number;
  minSodium?: number;
  maxSugar?: number;
  minSugar?: number;
  maxZinc?: number;
  minZinc?: number;
}

// Error response interface
export interface SpoonacularErrorResponse {
  status: string;
  code: number;
  message: string;
}

// Rate limiting interface
export interface SpoonacularRateLimit {
  requestsRemaining: number;
  requestsUsed: number;
  resetTime: Date;
}
