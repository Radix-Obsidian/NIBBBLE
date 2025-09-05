# NIBBBLE Database Setup

## Production Database Schema

**Primary Schema File:** `match-supabase-schema.sql`

This file contains the complete database schema that exactly matches your current Supabase database structure.

### Key Features Included:

✅ **Core System**
- Profiles (user accounts)
- Recipes (main content)
- Recipe likes & interactions

✅ **Waitlist System** 
- Creator & cooker waitlist management
- Application approval workflow

✅ **AI Cooking System**
- AI cooking profiles with preferences
- Recipe adaptations & substitutions
- Cooking insights & outcomes
- User skill progress tracking
- Recipe embeddings (JSONB format)

✅ **Commerce System**
- Grocery providers & stores
- Product catalog & categories
- Shopping carts & items
- Full e-commerce infrastructure

✅ **Collections System**
- Recipe collections
- User-generated content organization

### Database Differences Fixed:

1. **Recipes.ingredients**: Changed from `JSONB` to `TEXT[]` to match current DB
2. **Recipe.difficulty**: Uses exact case (`Easy`, `Medium`, `Hard`) as in DB
3. **Vector types**: Replaced with `JSONB` for wider compatibility
4. **Constraint naming**: Matches exact constraint names from Supabase
5. **Column defaults**: Exact match with current database defaults

### Usage:

**For Development:**
- Your current Supabase database already has these tables
- No action needed unless adding new features

**For New Deployments:**
- Run `match-supabase-schema.sql` in new Supabase instance
- Ensure all environment variables are configured
- Test with your application endpoints

### Security:
- Row Level Security (RLS) enabled on all tables
- Proper foreign key constraints
- User isolation and data protection

**Status:** ✅ Production Ready - Matches Current Supabase 100%