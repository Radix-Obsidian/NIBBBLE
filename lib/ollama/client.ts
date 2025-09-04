export interface OllamaModel {
  name: string;
  path: string;
  fallback: boolean;
}

export interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
  error?: string;
}

export interface RecipeExtractionPrompt {
  videoTranscript: string;
  userDescription: string;
  videoDuration: number;
}

export interface ExtractedRecipe {
  title: string;
  description: string;
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
    notes?: string;
  }>;
  instructions: string[];
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber?: number;
    perServing: boolean;
  };
}

class OllamaClient {
  private baseUrl: string;
  private primaryModel: string;
  private fallbackModel: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434';
    this.primaryModel = 'openbmb/minicpm-o2.6:latest';
    this.fallbackModel = 'openbmb/minicpm-o2.6:latest'; // Same model as fallback
    this.apiKey = process.env.NEXT_PUBLIC_OLLAMA_API_KEY || '';
  }

  private async makeRequest(endpoint: string, data: any): Promise<Response> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
    }

    return response;
  }

  async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await this.makeRequest('/api/tags', {});
      const data = await response.json();
      
      return data.models?.map((model: any) => ({
        name: model.name,
        path: model.path,
        fallback: model.name === this.fallbackModel
      })) || [];
    } catch (error) {
      console.error('Failed to list Ollama models:', error);
      return [];
    }
  }

  async generateRecipe(prompt: RecipeExtractionPrompt, useFallback: boolean = false): Promise<ExtractedRecipe> {
    const model = useFallback ? this.fallbackModel : this.primaryModel;
    
    const systemPrompt = `You are an expert chef and recipe analyzer. Your task is to extract a complete recipe from a cooking video transcript and description.

IMPORTANT: You must respond with ONLY valid JSON. No additional text, explanations, or formatting outside the JSON structure.

CRITICAL TITLE REQUIREMENTS:
- FIRST: Look for the actual recipe name/title mentioned in the video transcript
- If the transcript mentions a specific dish name (e.g., "Cobb Salad", "Pasta Carbonara"), use that EXACTLY
- If no specific dish name is found, create a descriptive title based on the main ingredients or technique shown
- NEVER use generic titles like "Styling the Salad" or "Cooking Video"
- Keep titles SHORT and specific (max 8-10 words)
- Examples of GOOD titles: "Cobb Salad with Avocado", "Homemade Pasta Carbonara", "Grilled Salmon with Herbs"
- Examples of BAD titles: "Styling the Salad", "Cooking Video", "Recipe Tutorial"

The JSON must follow this exact structure:
{
  "title": "Short, descriptive recipe title",
  "description": "Brief description of the dish",
  "ingredients": [
    {
      "name": "ingredient name",
      "amount": number,
      "unit": "unit of measurement",
      "notes": "optional preparation notes"
    }
  ],
  "instructions": [
    "Step 1 instruction",
    "Step 2 instruction"
  ],
  "servings": number,
  "prepTime": number (in minutes),
  "cookTime": number (in minutes),
  "difficulty": "Beginner|Intermediate|Advanced",
  "tags": ["tag1", "tag2"],
  "nutrition": {
    "calories": number,
    "protein": number (in grams),
    "fat": number (in grams),
    "carbs": number (in grams),
    "fiber": number (in grams),
    "perServing": true
  }
}

Video Transcript: ${prompt.videoTranscript}
User Description: ${prompt.userDescription}
Video Duration: ${prompt.videoDuration} seconds

Extract the recipe and return ONLY the JSON:`;

    try {
      const response = await this.makeRequest('/api/generate', {
        model,
        prompt: systemPrompt,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
          max_tokens: 2000
        }
      });

      const data: OllamaResponse = await response.json();
      
      if (data.error) {
        throw new Error(`Ollama generation error: ${data.error}`);
      }

      // Parse the AI response
      let recipeData: ExtractedRecipe;
      try {
        // Clean the response to extract just the JSON
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No valid JSON found in response');
        }
        
        recipeData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('Failed to parse Ollama response:', parseError);
        console.log('Raw response:', data.response);
        throw new Error('Failed to parse AI response into recipe format');
      }

      // Validate the extracted recipe
      if (!this.validateRecipe(recipeData)) {
        throw new Error('Extracted recipe is missing required fields');
      }

      return recipeData;

    } catch (error) {
      console.error(`Failed to generate recipe with ${model}:`, error);
      
      // If primary model fails and we haven't tried fallback yet, try fallback
      if (!useFallback) {
        console.log('Trying fallback model...');
        return this.generateRecipe(prompt, true);
      }
      
      throw error;
    }
  }

  private validateRecipe(recipe: any): recipe is ExtractedRecipe {
    const requiredFields = ['title', 'ingredients', 'instructions', 'servings', 'prepTime', 'cookTime'];
    const hasRequiredFields = requiredFields.every(field => recipe[field] !== undefined);
    
    const hasIngredients = Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0;
    const hasInstructions = Array.isArray(recipe.instructions) && recipe.instructions.length > 0;
    
    return hasRequiredFields && hasIngredients && hasInstructions;
  }

  async testConnection(): Promise<boolean> {
    try {
      const models = await this.listModels();
      return models.length > 0;
    } catch (error) {
      console.error('Ollama connection test failed:', error);
      return false;
    }
  }

  async getModelInfo(modelName: string): Promise<any> {
    try {
      const response = await this.makeRequest('/api/show', { name: modelName });
      return await response.json();
    } catch (error) {
      console.error(`Failed to get model info for ${modelName}:`, error);
      return null;
    }
  }
}

export const ollamaClient = new OllamaClient();
