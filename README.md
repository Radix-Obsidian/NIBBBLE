# 🍳 NIBBBLE - The Shopify for Home Cooks

NIBBBLE is the complete infrastructure for successful home cooking. Built with Next.js 15, React 19, TypeScript, and Supabase, we're creating AI-powered cooking experiences that adapt to your kitchen, skill level, and preferences.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- **🤖 AI Recipe Adaptation**: Every recipe automatically adapts to your skill level and kitchen setup
- **🎯 Success Prediction**: Know before you cook if you'll succeed with 94% accuracy
- **🛒 Integrated Commerce**: Seamless grocery delivery and ingredient sourcing
- **👨‍🍳 Technique Instruction**: Built-in cooking lessons for every recipe
- **👥 Creator Economy**: Success-based earnings for verified chefs and home cooks
- **📱 Complete Experience**: From recipe discovery to ingredient delivery
- **🎨 Modern UI**: Beautiful interface built with Tailwind CSS and Radix UI
- **🔐 Secure Platform**: Enterprise-grade security with Supabase Auth

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.17.0 or later
- **npm** 9.0.0 or later
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nibbble.git
   cd nibbble
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

### **Frontend**
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library with latest features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Accessible UI primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful icons

### **Backend & Database**
- **[Supabase](https://supabase.com/)** - Open source Firebase alternative
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)** - Data security

### **Development Tools**
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[TypeScript](https://www.typescriptlang.org/)** - Static type checking

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

## 🔧 Development

### **Available Scripts**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Prettier
```

### **Code Style Guidelines**

#### **Component Structure**
```typescript
// 1. Imports (external libraries first, then internal)
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

// 2. Type definitions
interface ComponentProps {
  className?: string
  children: React.ReactNode
}

// 3. Component implementation
const Component = forwardRef<HTMLElement, ComponentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <element ref={ref} className={cn('base-styles', className)} {...props}>
        {children}
      </element>
    )
  }
)

// 4. Display name for debugging
Component.displayName = 'Component'

// 5. Export
export { Component }
```

#### **Naming Conventions**
- **Components**: PascalCase (`RecipeCard`, `UserProfile`)
- **Files**: kebab-case (`recipe-card.tsx`, `user-profile.tsx`)
- **Functions**: camelCase (`handleSubmit`, `formatTime`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RECIPES`, `API_ENDPOINTS`)
- **Types/Interfaces**: PascalCase (`RecipeProps`, `UserData`)

#### **File Organization**
- One component per file
- Export components as named exports
- Group related components in directories
- Use index files for clean imports

### **Database Schema**

#### **Core Tables**
```sql
-- Users and profiles
profiles (id, username, display_name, bio, avatar_url, ...)

-- Recipe management
recipes (id, title, description, creator_id, ...)
ingredients (id, recipe_id, name, amount, unit, ...)
instructions (id, recipe_id, step_number, instruction, ...)

-- Social features
recipe_likes (id, recipe_id, user_id, ...)
recipe_reviews (id, recipe_id, user_id, rating, comment, ...)
user_follows (id, follower_id, following_id, ...)

-- Collections
collections (id, name, description, user_id, ...)
collection_recipes (id, collection_id, recipe_id, ...)
```

## 🧪 Testing

### **Testing Strategy**
- **Unit Tests**: Component logic and utility functions
- **Integration Tests**: API routes and database operations
- **E2E Tests**: Critical user journeys
- **Accessibility Tests**: Screen reader and keyboard navigation

### **Running Tests**
```bash
npm run test           # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report
```

## 📚 Documentation

- **[API Documentation](docs/api.md)** - API endpoints and usage
- **[Component Library](docs/components.md)** - UI component documentation
- **[Database Schema](docs/database.md)** - Database structure and relationships
- **[Deployment Guide](docs/deployment.md)** - Production deployment instructions

## 🐛 Troubleshooting

### **Common Issues**

#### **Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### **Database Connection Issues**
- Verify Supabase credentials in `.env.local`
- Check Supabase project status
- Ensure Row Level Security policies are configured

#### **Authentication Problems**
- Clear browser storage and cookies
- Check Supabase Auth settings
- Verify redirect URLs in Supabase dashboard

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Supabase](https://supabase.com/)** for the amazing backend platform
- **[Vercel](https://vercel.com/)** for seamless deployment
- **[Tailwind CSS](https://tailwindcss.com/)** for the utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** for accessible UI primitives
- **[Next.js Team](https://nextjs.org/)** for the incredible React framework

## 📞 Support

- **Discussions**: [GitHub Discussions](https://github.com/yourusername/nibbble/discussions)
- **Issues**: [GitHub Issues](https://github.com/yourusername/nibbble/issues)
- **Email**: support@nibbble.com

---

**Built with ❤️ by the NIBBBLE Team**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/nibbble?style=social)](https://github.com/yourusername/nibbble)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/nibbble?style=social)](https://github.com/yourusername/nibbble)
[![GitHub issues](https://img.shields.io/github/issues/yourusername/nibbble)](https://github.com/yourusername/nibbble/issues)
