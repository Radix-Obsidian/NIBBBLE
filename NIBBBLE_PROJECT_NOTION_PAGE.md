# 🍳 NIBBBLE - The Shopify for Home Cooks

> **Project Status**: Alpha Launch Phase  
> **Last Updated**: January 2025  
> **Version**: 0.1.0  

---

## 📋 Project Overview

NIBBBLE is a comprehensive AI-powered cooking platform that serves as "The Shopify for Home Cooks." It provides intelligent recipe adaptation, success prediction, integrated commerce, and a complete creator economy for cooking enthusiasts.

### 🎯 Mission Statement
To democratize successful home cooking by providing AI-powered tools that adapt recipes to individual skill levels, kitchen setups, and preferences, while creating economic opportunities for cooking creators.

### 🏆 Key Value Propositions
- **94% Success Prediction Accuracy** - Know before you cook if you'll succeed
- **AI Recipe Adaptation** - Every recipe automatically adapts to your skill level
- **Integrated Commerce** - Seamless grocery delivery and ingredient sourcing
- **Creator Economy** - Success-based earnings for verified chefs and home cooks

---

## 🚀 Current Status & Roadmap

### ✅ **Alpha Launch (Current Phase)**
- **Status**: Active Development
- **User Limit**: 20 alpha users
- **Focus**: Core AI cooking experience
- **Features Enabled**:
  - ✅ AI Recipe Adaptation
  - ✅ Cooking Intelligence
  - ✅ Success Prediction
  - ✅ Personal Cooking Profiles
  - ✅ Basic Authentication
  - ✅ User Profiles
  - ✅ Feedback System
  - ✅ Cooking Assistant

### 🔄 **Beta Launch (Q2 2025)**
- **Target**: 500 beta users
- **Focus**: Social features and creator tools
- **Planned Features**:
  - 🔄 Social Features
  - 🔄 Nibble Collections
  - 🔄 Creator Profiles
  - 🔄 Monetization
  - 🔄 Grocery Ordering
  - 🔄 Payment Processing

### 🎯 **Public Launch (Q3 2025)**
- **Target**: 10,000+ users
- **Focus**: Full platform experience
- **Planned Features**:
  - 🔄 Collaborative Boards
  - 🔄 Social Sharing
  - 🔄 Follow System
  - 🔄 Reviews
  - 🔄 Full Commerce
  - 🔄 Creator Economy

---

## 🛠️ Technical Architecture

### **Frontend Stack**
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.0
- **Components**: Radix UI primitives
- **Icons**: Lucide React
- **Animations**: Framer Motion

### **Backend & Database**
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Security**: Row Level Security (RLS)
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage

### **AI & Machine Learning**
- **Local AI**: Ollama integration
- **Success Prediction**: Custom ML models
- **Recipe Adaptation**: AI-powered algorithms
- **Cooking Intelligence**: Smart substitutions and guidance

### **Commerce & Payments**
- **Payment Processing**: Stripe Connect
- **Grocery Integration**: Multiple provider APIs
- **Order Management**: Custom commerce system
- **Inventory**: Real-time stock tracking

### **Monitoring & Analytics**
- **Error Tracking**: Sentry
- **Analytics**: Vercel Analytics
- **Performance**: Vercel Speed Insights
- **Logging**: Custom logging system

---

## 🎨 Design System

### **Design Principles**
- **Clarity**: Clean, readable typography with proper hierarchy
- **Deference**: Content-first design with subtle visual elements
- **Depth**: Layered components with shadows and depth indicators
- **Accessibility**: WCAG 2.1 AA compliant with proper focus states

### **Color Palette**
```css
/* Primary Colors */
--orange-500: #f97316;  /* Primary brand color */
--amber-500: #d97706;   /* Secondary brand color */

/* Semantic Colors */
--green-500: #10b981;   /* Success */
--red-500: #ef4444;     /* Error */
--yellow-500: #f59e0b;  /* Warning */

/* Neutral Colors */
--gray-50: #f9fafb;     /* Background */
--gray-900: #111827;    /* Text */
```

### **Typography**
- **Font Family**: Inter (Google Fonts)
- **Scale**: 8px grid system
- **Line Height**: 1.5 for body, 1.2 for headings

---

## 🧠 AI Features & Capabilities

### **Personal Cooking Profile**
- **Skill Assessment**: Dynamic skill level tracking (1-10 scale)
- **Equipment Mapping**: Track available kitchen equipment
- **Dietary Management**: Handle restrictions, allergies, and preferences
- **Success History**: Learn from past cooking experiences
- **Learning Preferences**: Customize guidance style (video, text, step-by-step)

### **Recipe Adaptation Engine**
- **Skill-Level Adjustments**: Simplify or enhance recipes based on user skill
- **Dietary Modifications**: Automatic substitutions for restrictions and allergies
- **Equipment Adaptations**: Alternative cooking methods for available equipment
- **Portion Scaling**: Smart ingredient scaling with ratio adjustments
- **Time Optimization**: Streamline recipes for time constraints

### **Success Prediction System**
- **ML-Powered Predictions**: Predict cooking success probability (0-100%)
- **Risk Assessment**: Identify potential challenges before cooking
- **Confidence Intervals**: Provide prediction reliability metrics
- **Alternative Suggestions**: Recommend easier recipes when success probability is low
- **Historical Learning**: Improve predictions based on user outcomes

### **Smart Ingredient Substitutions**
- **Context-Aware Suggestions**: Substitutions based on cooking method and recipe type
- **Dietary Compliance**: Ensure substitutions meet dietary restrictions
- **Flavor Impact Analysis**: Assess how substitutions affect taste
- **Success Rate Tracking**: Learn from community substitution experiences
- **Multiple Options**: Provide ranked substitution alternatives

### **Real-Time Cooking Assistant**
- **Step-by-Step Guidance**: Interactive cooking with progress tracking
- **Smart Timers**: Automatic timer suggestions from recipe instructions
- **Technique Explanations**: Built-in cooking lessons for every recipe
- **Safety Alerts**: Real-time safety warnings and tips
- **Progress Tracking**: Monitor cooking progress and completion

---

## 🗄️ Database Schema

### **Core Tables**

#### **User Management**
```sql
-- Main user profiles
profiles (id, username, display_name, bio, avatar_url, ...)

-- Alpha user management
alpha_users (id, user_id, email, invite_code, status, ...)
alpha_cooking_profiles (id, user_id, skill_level, dietary_restrictions, ...)

-- Waitlist system
waitlist_entries (id, email, type, name, status, ...)
```

#### **Recipe System**
```sql
-- Recipe storage
recipes (id, title, description, creator_id, ...)
ingredients (id, recipe_id, name, amount, unit, ...)
instructions (id, recipe_id, step_number, instruction, ...)

-- AI cooking profiles
ai_cooking_profiles (id, skill_level, equipment_available, ...)
```

#### **Commerce System**
```sql
-- Grocery providers and stores
grocery_providers (id, name, api_endpoint, ...)
grocery_stores (id, provider_id, name, address, ...)

-- Shopping and orders
shopping_carts (id, user_id, store_id, status, ...)
grocery_orders (id, user_id, cart_id, total_amount, ...)
```

#### **AI & Analytics**
```sql
-- Cooking sessions and feedback
cooking_sessions (id, user_id, recipe_id, success_rating, ...)
cooking_feedback (id, user_id, recipe_id, overall_rating, ...)

-- Alpha metrics
alpha_metrics_daily (id, metric_date, active_users, ...)
```

---

## 🔧 Development Environment

### **Prerequisites**
- **Node.js**: 18.17.0 or later
- **npm**: 9.0.0 or later
- **Git**: For version control
- **Supabase Account**: For database and auth

### **Environment Variables**
```bash
# Required: Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: External APIs
SPOONACULAR_API_KEY=your_spoonacular_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
USDA_API_KEY=your_usda_api_key

# Alpha Configuration
NEXT_PUBLIC_ALPHA_MODE=true
NEXT_PUBLIC_ALPHA_USER_LIMIT=20
```

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Prettier
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

---

## 📊 Key Metrics & KPIs

### **Alpha Launch Metrics**
- **User Engagement**: Daily active users, session duration
- **Success Rate**: Recipe completion success percentage
- **AI Accuracy**: Success prediction accuracy (target: 94%+)
- **Feedback Quality**: User feedback scores and insights
- **Retention**: 7-day and 30-day user retention rates

### **Technical Metrics**
- **Performance**: Page load times, API response times
- **Reliability**: Error rates, uptime percentage
- **Scalability**: Database query performance, concurrent users

### **Business Metrics**
- **User Acquisition**: Waitlist signups, alpha invitations
- **Engagement**: Recipes viewed, cooking sessions completed
- **Feedback**: User satisfaction scores, feature requests

---

## 🚨 Current Issues & Solutions

### **Recent Fixes**
- ✅ **Database Error Fixed**: Resolved `p.email` column reference error in alpha_user_metrics view
  - **Issue**: View was trying to select email from profiles table that doesn't have email column
  - **Solution**: Added JOIN with auth.users table to access email field

### **Known Issues**
- 🔄 **Alpha User Limit**: Currently capped at 20 users for controlled testing
- 🔄 **Feature Flags**: Many beta features are disabled in alpha mode
- 🔄 **Commerce Integration**: Payment processing in development phase

### **Upcoming Fixes**
- 🔄 **Performance Optimization**: Database query optimization
- 🔄 **Error Handling**: Improved error messages and user feedback
- 🔄 **Mobile Responsiveness**: Enhanced mobile experience

---

## 📚 Documentation & Resources

### **Technical Documentation**
- **[API Documentation](docs/api.md)** - API endpoints and usage
- **[Component Library](docs/components.md)** - UI component documentation
- **[Database Schema](docs/database.md)** - Database structure and relationships
- **[Deployment Guide](docs/deployment.md)** - Production deployment instructions

### **Feature Documentation**
- **[AI Cooking Assistant](docs/AI_COOKING_ASSISTANT.md)** - AI features and capabilities
- **[Stripe Connect Integration](docs/STRIPE_CONNECT_INTEGRATION.md)** - Payment system setup
- **[Video Processing Setup](docs/video-analysis-setup.md)** - Video recipe analysis
- **[Sentry Implementation](docs/SENTRY_IMPLEMENTATION_GUIDE.md)** - Error tracking setup

### **Setup Guides**
- **[Waitlist Setup](WAITLIST_SETUP.md)** - Waitlist system configuration
- **[Commerce Testing](COMMERCE_TESTING_READY.md)** - Commerce system testing
- **[Alpha Launch Migration](scripts/alpha-launch-migration.sql)** - Database migration scripts

---

## 👥 Team & Contributors

### **Core Team**
- **Project Lead**: [Your Name]
- **Backend Developer**: [Name]
- **Frontend Developer**: [Name]
- **AI/ML Engineer**: [Name]
- **Designer**: [Name]

### **Contributors**
- **Database Architecture**: [Name]
- **Commerce Integration**: [Name]
- **AI Implementation**: [Name]

---

## 🔗 External Integrations

### **APIs & Services**
- **Supabase**: Database, authentication, real-time features
- **Stripe**: Payment processing and Connect platform
- **Spoonacular**: Recipe data and nutrition information
- **USDA**: Nutritional data
- **Kroger**: Grocery delivery integration
- **Ollama**: Local AI model hosting

### **Development Tools**
- **Vercel**: Hosting and deployment
- **Sentry**: Error tracking and monitoring
- **GitHub**: Version control and CI/CD
- **Figma**: Design and prototyping

---

## 📞 Support & Contact

### **Getting Help**
- **GitHub Issues**: [Project Issues](https://github.com/yourusername/nibbble/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/nibbble/discussions)
- **Email**: support@nibbble.com

### **Development Support**
- **Documentation**: Check docs/ folder for detailed guides
- **Code Style**: Follow established patterns in codebase
- **Testing**: Run tests before submitting changes
- **Pull Requests**: Include tests and documentation updates

---

## 📄 License & Legal

- **License**: MIT License
- **Privacy Policy**: [Privacy Policy](app/privacy/page.tsx)
- **Terms of Service**: [Terms of Service](app/terms/page.tsx)
- **Community Guidelines**: [Community Guidelines](app/community-guidelines/page.tsx)

---

## 🎯 Next Steps & Action Items

### **Immediate (This Week)**
- [ ] Complete alpha user onboarding flow testing
- [ ] Fix any remaining database migration issues
- [ ] Test AI recipe adaptation with real users
- [ ] Gather initial alpha user feedback

### **Short Term (Next Month)**
- [ ] Implement beta feature flags
- [ ] Complete commerce integration testing
- [ ] Optimize database performance
- [ ] Prepare for beta launch

### **Long Term (Next Quarter)**
- [ ] Scale to 500 beta users
- [ ] Launch creator economy features
- [ ] Implement social features
- [ ] Prepare for public launch

---

**Last Updated**: January 2025  
**Next Review**: February 2025  
**Project Status**: 🟢 Active Development

---

*This Notion page serves as the central hub for tracking all aspects of the NIBBBLE project. Update regularly to maintain accuracy and provide team visibility.*