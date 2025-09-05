# AI-Powered Cooking Assistant

## Overview

NIBBBLE now includes a comprehensive AI-powered cooking assistant system that personalizes the cooking experience based on individual user profiles, preferences, and skill levels. The system provides intelligent recipe adaptation, success prediction, smart ingredient substitutions, and real-time cooking guidance.

## Features

### 🧠 Personal Cooking Profile
- **Skill Assessment**: Dynamic skill level tracking (1-10 scale)
- **Equipment Mapping**: Track available kitchen equipment
- **Dietary Management**: Handle restrictions, allergies, and preferences
- **Success History**: Learn from past cooking experiences
- **Learning Preferences**: Customize guidance style (video, text, step-by-step)

### 🎯 Recipe Adaptation
- **Skill-Level Adjustments**: Simplify or enhance recipes based on user skill
- **Dietary Modifications**: Automatic substitutions for restrictions and allergies
- **Equipment Adaptations**: Alternative cooking methods for available equipment
- **Portion Scaling**: Smart ingredient scaling with ratio adjustments
- **Time Optimization**: Streamline recipes for time constraints

### 🔮 Success Prediction
- **ML-Powered Predictions**: Predict cooking success probability (0-100%)
- **Risk Assessment**: Identify potential challenges before cooking
- **Confidence Intervals**: Provide prediction reliability metrics
- **Alternative Suggestions**: Recommend easier recipes when success probability is low
- **Historical Learning**: Improve predictions based on user outcomes

### 🧪 Smart Ingredient Substitutions
- **Context-Aware Suggestions**: Substitutions based on cooking method and recipe type
- **Dietary Compliance**: Ensure substitutions meet dietary restrictions
- **Flavor Impact Analysis**: Assess how substitutions affect taste
- **Success Rate Tracking**: Learn from community substitution experiences
- **Multiple Options**: Provide ranked substitution alternatives

### 🍳 Real-Time Cooking Assistant
- **Step-by-Step Guidance**: Interactive cooking with progress tracking
- **Smart Timers**: Automatic timer suggestions from recipe instructions
- **Safety Warnings**: Context-aware safety reminders for dangerous steps
- **Technique Explanations**: On-demand cooking technique tutorials
- **Issue Resolution**: Report and resolve cooking problems in real-time

### 🔍 AI-Powered Search
- **Semantic Recipe Matching**: Find recipes based on natural language queries
- **Personalized Rankings**: Score recipes based on user preferences and success probability
- **Context-Aware Results**: Consider available time, ingredients, and mood
- **Smart Filters**: Intelligent filtering based on user profile
- **Explanation Engine**: Understand why recipes were recommended

## Architecture

### Database Schema

The AI system extends the existing NIBBBLE database with the following tables:

#### ai_cooking_profiles
Stores personalized cooking information for each user:
```sql
- skill_level (1-10)
- cooking_experience_years
- preferred_cooking_time
- equipment_available (array)
- dietary_restrictions (array)
- allergies (array)
- spice_tolerance (1-5)
- success_history (JSON)
- ingredient_preferences (JSON)
```

#### recipe_adaptations
Tracks AI-generated recipe modifications:
```sql
- original_recipe_id
- adapted_recipe (JSON)
- adaptation_type
- confidence_score
- user_feedback
```

#### ingredient_substitutions
Database of ingredient substitution options:
```sql
- original_ingredient
- substitute_ingredient
- substitution_ratio
- context_tags
- success_rate
- flavor_impact (1-5)
```

#### cooking_outcomes
Machine learning training data from user cooking experiences:
```sql
- predicted_success_score
- actual_outcome
- user_rating
- issues_encountered
- feature_vector
```

### Service Architecture

#### AICookingService
Core service managing AI cooking profiles and recipe adaptation:
- Profile management (create, read, update)
- Recipe adaptation logic
- Smart search functionality
- Success prediction integration

#### CookingIntelligenceService
Advanced cooking intelligence and substitution engine:
- Smart ingredient substitutions
- Skill-level instruction adjustments
- Cooking technique explanations
- Safety and technique insights

#### MLPredictionService
Machine learning service for success prediction:
- Feature extraction from user and recipe data
- Success probability calculation
- Model training from cooking outcomes
- Performance metric tracking

#### AIRecipeAdapter
High-level service combining all AI features:
- End-to-end recipe adaptation
- Real-time cooking guidance
- Outcome recording and learning

## API Endpoints

### Profile Management
```typescript
GET    /api/ai/profile          // Get user's AI cooking profile
PUT    /api/ai/profile          // Update AI cooking profile
POST   /api/ai/profile/setup    // Initial profile setup wizard
```

### Recipe Intelligence
```typescript
POST   /api/ai/adapt-recipe     // Get adapted recipe for user
POST   /api/ai/predict-success  // Predict cooking success probability
GET    /api/ai/substitutions    // Get ingredient substitutions
POST   /api/ai/cooking-guidance // Get real-time cooking guidance
```

### Search and Discovery
```typescript
POST   /api/ai/smart-search     // AI-powered recipe search
GET    /api/ai/recommendations  // Get personalized recipe recommendations
POST   /api/ai/analyze-recipe   // Analyze recipe difficulty for user
```

### Learning and Analytics
```typescript
POST   /api/ai/record-outcome   // Record cooking outcome for learning
GET    /api/ai/metrics          // Get ML model performance metrics
GET    /api/ai/insights         // Get personalized cooking insights
```

## UI Components

### SmartSearchInterface
AI-powered search component with natural language queries and contextual filters.

```typescript
<SmartSearchInterface 
  onRecipeSelect={handleRecipeSelect}
  className="w-full"
/>
```

### AdaptiveRecipeCard
Recipe card that displays AI adaptations, success predictions, and personalized insights.

```typescript
<AdaptiveRecipeCard 
  recipe={recipe}
  onStartCooking={handleStartCooking}
/>
```

### CookingAssistant
Real-time cooking guidance with step-by-step instructions and smart features.

```typescript
<CookingAssistant 
  recipe={recipe}
  adaptations={adaptations}
  onComplete={handleCookingComplete}
/>
```

## Configuration

### Environment Variables
```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Services (Optional)
NUTRITION_API_KEY=your_nutrition_api_key
EMBEDDING_API_KEY=your_embedding_api_key
EMBEDDING_API_URL=your_embedding_service_url

# Analytics (Optional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

### Feature Flags
Configure AI features in `lib/config/ai-config.ts`:

```typescript
features: {
  enableMLPrediction: true,
  enableRealTimeAdaptation: true,
  enableSmartSearch: true,
  enableAdvancedSubstitutions: true,
  enableCookingAssistant: true,
  enableSkillTracking: true
}
```

## Deployment

### Database Setup
1. Run the AI schema migration:
   ```bash
   # Apply the AI database schema
   psql -h your-supabase-url -U postgres -d postgres -f scripts/create-ai-schema.sql
   ```

2. Verify table creation and sample data insertion.

### Application Deployment
1. Install dependencies:
   ```bash
   npm install
   ```

2. Run tests:
   ```bash
   npm run test -- --testPathPattern="__tests__/ai/"
   ```

3. Build and deploy:
   ```bash
   ./scripts/deploy-ai-services.sh production
   ```

### Post-Deployment Verification
1. **Profile Creation**: Verify users can create AI cooking profiles
2. **Recipe Adaptation**: Test recipe adaptation functionality  
3. **Success Prediction**: Validate prediction accuracy
4. **Smart Search**: Check search results quality
5. **Cooking Assistant**: Test real-time guidance features

## Usage Examples

### Creating an AI Cooking Profile
```typescript
const profileData = {
  skillLevel: 3,
  cookingExperienceYears: 1,
  equipmentAvailable: ['oven', 'stovetop', 'microwave'],
  dietaryRestrictions: ['vegetarian'],
  allergies: ['nuts'],
  spiceTolerance: 2,
  cookingGoals: ['healthy_eating', 'skill_development']
};

const profile = await aiCookingService.createOrUpdateAICookingProfile(
  userId, 
  profileData
);
```

### Adapting a Recipe
```typescript
const adaptationRequest = {
  recipeId: 'recipe-123',
  userId: 'user-456',
  adaptationReasons: ['skill_adjustment', 'dietary_modification'],
  targetSkillLevel: 2
};

const adaptedRecipe = await aiCookingService.adaptRecipe(adaptationRequest);
```

### Predicting Cooking Success
```typescript
const prediction = await mlPredictionService.predictCookingSuccess({
  userId: 'user-456',
  recipeId: 'recipe-123',
  cookingContext: {
    timeOfDay: 'evening',
    availableTime: 45,
    stressLevel: 2
  }
});

console.log(`Success probability: ${prediction.successScore * 100}%`);
```

### Smart Recipe Search
```typescript
const searchResults = await aiCookingService.smartSearch({
  userProfile: aiProfile,
  context: {
    timeAvailable: 30,
    mood: 'comfort',
    ingredientsOnHand: ['chicken', 'rice', 'vegetables']
  }
});
```

## Performance Considerations

### Caching
- AI predictions are cached for 15 minutes
- User profiles cached for 1 hour
- Substitution data cached for 24 hours

### Rate Limiting
- Predictions: 100/hour per user
- Adaptations: 50/hour per user
- Search: 200/hour per user
- Profile updates: 10/hour per user

### Response Time Targets
- Prediction: < 2 seconds
- Adaptation: < 3 seconds
- Search: < 1.5 seconds
- Substitution: < 1 second

## Monitoring and Analytics

### Key Metrics
- **Prediction Accuracy**: Track success prediction vs actual outcomes
- **User Engagement**: Monitor AI feature usage and retention
- **Adaptation Usage**: Track which adaptations are most helpful
- **Search Quality**: Measure search result relevance and clicks
- **Cooking Success**: Overall improvement in user cooking success rates

### Alerts
- High error rates in AI services
- Degradation in prediction accuracy
- Unusual patterns in user behavior
- Performance threshold breaches

## Privacy and Data Protection

### Data Collection
- User interactions are anonymized for ML training
- Personal dietary information is encrypted
- Cooking outcomes are aggregated for model improvement
- Users can export or delete their AI data

### Compliance
- GDPR compliant data handling
- User consent for AI feature usage
- Transparent data usage policies
- Right to explanation for AI decisions

## Future Enhancements

### Phase 2 Features
- **Voice Assistant**: Voice-controlled cooking guidance
- **Computer Vision**: Recipe recognition from photos
- **Nutrition Optimization**: AI-powered nutritional improvements
- **Social Learning**: Learn from community cooking successes

### Phase 3 Features
- **Advanced Personalization**: Deep learning user preferences
- **Predictive Meal Planning**: AI meal plan generation
- **Inventory Management**: Smart pantry tracking and suggestions
- **Cultural Cuisine Exploration**: Guided exploration of world cuisines

## Troubleshooting

### Common Issues

#### Low Prediction Accuracy
- Ensure sufficient historical data (minimum 10 outcomes)
- Check feature extraction correctness
- Validate user profile completeness

#### Slow Response Times
- Monitor database query performance
- Check cache hit rates
- Verify API endpoint efficiency

#### Incorrect Substitutions
- Review substitution database quality
- Check dietary restriction matching
- Validate context-aware filtering

#### UI Component Errors
- Verify proper error boundaries
- Check TypeScript type compatibility
- Validate API response handling

### Debug Mode
Enable debug mode in development:
```typescript
// In ai-config.ts
features: {
  debugMode: true,
  logPredictions: true,
  enableTestData: true
}
```

## Contributing

### Development Setup
1. Clone repository and install dependencies
2. Set up local Supabase instance
3. Apply AI database schema
4. Configure environment variables
5. Run development server with AI features enabled

### Testing
- Unit tests for all AI services
- Integration tests for end-to-end workflows
- Performance tests for response times
- Accuracy tests for ML predictions

### Code Standards
- TypeScript strict mode
- Comprehensive error handling
- JSDoc documentation for public APIs
- Performance monitoring integration

---

For additional support or questions about the AI cooking assistant system, please refer to the development team or create an issue in the repository.