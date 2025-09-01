# Spoonacular API Integration

This document describes the Spoonacular API integration for PantryPals, which allows importing high-quality recipes from the Spoonacular database.

## Overview

The Spoonacular integration provides:
- Recipe search by cuisine, diet, meal type, and other filters
- Detailed recipe information including ingredients, instructions, and nutrition
- Automatic data transformation to match PantryPals database schema
- Bulk import functionality with progress tracking
- Rate limiting and error handling
- CLI and API interfaces for importing recipes

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Spoonacular   │    │  PantryPals API  │    │   Supabase DB   │
│      API        │◄──►│   Services       │◄──►│                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  Import Scripts  │
                       │  & CLI Tools     │
                       └──────────────────┘
```

## Components

### 1. API Service (`lib/services/spoonacular-api.ts`)
- Handles all Spoonacular API communication
- Implements rate limiting (5,000 requests/month)
- Provides request caching and retry logic
- Error handling and logging

### 2. Data Transformation (`lib/services/recipe-transform.ts`)
- Maps Spoonacular data to PantryPals schema
- Handles ingredient formatting and instruction parsing
- Determines difficulty levels and cuisine mapping
- Validates transformed data

### 3. Import Service (`lib/services/recipe-import.ts`)
- Manages database insertion
- Handles batch processing and transactions
- Provides progress tracking
- Duplicate detection and cleanup

### 4. CLI Script (`scripts/import-recipes.js`)
- Command-line interface for bulk imports
- Supports multiple cuisines and specific recipe IDs
- Dry-run mode for testing
- Progress reporting and error handling

### 5. API Route (`app/api/recipes/import/route.ts`)
- REST API endpoint for recipe imports
- Supports both cuisine-based and ID-based imports
- Returns import statistics and rate limit status

## Usage

### CLI Import

```bash
# Import 20 Italian recipes
node scripts/import-recipes.js --cuisine=italian --count=20 --creator-id=user123

# Import recipes by specific IDs
node scripts/import-recipes.js --ids=123,456,789 --creator-id=user123

# Test import without saving (dry run)
node scripts/import-recipes.js --cuisine=mexican --count=5 --dry-run --creator-id=user123

# Import multiple cuisines
node scripts/import-recipes.js --cuisine=italian,mexican,asian --count=10 --creator-id=user123
```

### API Import

```javascript
// Import by cuisine
const response = await fetch('/api/recipes/import', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'cuisine',
    cuisines: ['italian', 'mexican'],
    count: 20,
    creatorId: 'user123',
    dryRun: false
  })
})

// Import by IDs
const response = await fetch('/api/recipes/import', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'ids',
    ids: [123, 456, 789],
    creatorId: 'user123'
  })
})
```

### Testing

```bash
# Run integration tests
node scripts/test-spoonacular.js
```

## Configuration

### Environment Variables

```env
SPOONACULAR_API_KEY=your_api_key_here
SPOONACULAR_BASE_URL=https://api.spoonacular.com/recipes
SPOONACULAR_RATE_LIMIT=5000
SPOONACULAR_REQUESTS_PER_DAY=150
```

### Rate Limits

- **Monthly Limit**: 5,000 requests
- **Daily Limit**: 150 requests (recommended)
- **Request Caching**: 5 minutes
- **Batch Size**: 10 recipes per batch (configurable)

## Data Mapping

### Spoonacular → PantryPals

| Spoonacular Field | PantryPals Field | Transformation |
|------------------|------------------|----------------|
| `title` | `title` | Direct mapping |
| `summary` | `description` | HTML stripped, truncated to 500 chars |
| `extendedIngredients` | `ingredients` | Formatted as strings with amounts |
| `analyzedInstructions` | `instructions` | Extracted and cleaned steps |
| `cookingMinutes` | `cook_time` | Direct mapping |
| `preparationMinutes` | `prep_time` | Direct mapping |
| `cuisines` | `cuisine` | Mapped to standard names |
| `diets` | `tags` | Added as dietary tags |
| `dishTypes` | `tags` | Added as meal type tags |
| `image` | `image_url` | Direct mapping |
| `spoonacularScore` | `rating` | Converted from 0-100 to 0-5 scale |
| `aggregateLikes` | `likes_count` | Direct mapping |

### Difficulty Calculation

```javascript
function determineDifficulty(prepTime, cookTime, instructionCount, ingredientCount) {
  const totalTime = prepTime + cookTime
  const complexity = instructionCount + (ingredientCount * 0.5)
  
  if (totalTime <= 30 && complexity <= 8) return 'Easy'
  if (totalTime <= 60 && complexity <= 15) return 'Medium'
  return 'Hard'
}
```

## Error Handling

### API Errors
- Rate limit exceeded (429)
- Invalid API key (401)
- Recipe not found (404)
- Server errors (500+)

### Import Errors
- Validation failures
- Database constraint violations
- Duplicate recipes (if skipDuplicates enabled)
- Network timeouts

### Retry Logic
- Exponential backoff for transient errors
- Maximum 3 retry attempts
- No retry for rate limit errors

## Monitoring

### Logging
All operations are logged with structured data:
- API requests and responses
- Import progress and results
- Error details and stack traces
- Rate limit status

### Metrics
- Requests per day/month
- Import success/failure rates
- Cache hit rates
- Average processing time

## Best Practices

### 1. Rate Limiting
- Monitor API usage regularly
- Use batch processing for large imports
- Implement request caching
- Respect daily limits

### 2. Data Quality
- Validate all imported data
- Handle missing or malformed fields
- Implement duplicate detection
- Regular data cleanup

### 3. Error Handling
- Implement comprehensive error handling
- Provide meaningful error messages
- Log all errors for debugging
- Graceful degradation

### 4. Performance
- Use batch processing
- Implement request caching
- Optimize database queries
- Monitor memory usage

## Troubleshooting

### Common Issues

1. **Rate Limit Exceeded**
   - Check current usage: `getRateLimitStatus()`
   - Reduce batch size or wait for reset
   - Implement request queuing

2. **Import Failures**
   - Check recipe validation errors
   - Verify database constraints
   - Review Spoonacular API responses

3. **Data Quality Issues**
   - Review transformation logic
   - Check ingredient formatting
   - Validate instruction parsing

### Debug Mode

Enable verbose logging:
```bash
node scripts/import-recipes.js --verbose --dry-run
```

## Future Enhancements

1. **Advanced Filtering**
   - Nutrition-based filtering
   - Ingredient-based search
   - Cooking method filtering

2. **Batch Optimization**
   - Parallel processing
   - Smart batching
   - Progress persistence

3. **Data Enrichment**
   - Image optimization
   - Nutrition analysis
   - Recipe recommendations

4. **Monitoring Dashboard**
   - Real-time import status
   - Rate limit monitoring
   - Error tracking

## Support

For issues or questions:
1. Check the logs for error details
2. Review the API documentation
3. Test with dry-run mode
4. Contact the development team
