# 🍳 PantryPals - Recipe Sharing Platform

A modern, social recipe sharing platform built with Next.js 15, React 19, and TypeScript. Learn to cook like a pro with step-by-step video guides from home cooks and professional chefs.

## ✨ Features

- **Recipe Discovery**: Browse thousands of recipes with advanced filtering
- **Social Cooking**: Follow creators, like recipes, and build your cooking community
- **Video Guides**: Step-by-step video tutorials for every skill level
- **Smart Search**: Find recipes by ingredients, time, difficulty, and cuisine
- **Collections**: Save and organize your favorite recipes
- **Mobile First**: Responsive design that works on all devices

## 🏗️ Project Structure

```
pantrypals/
├── app/                          # Next.js 15 App Router
│   ├── components/               # Shared components
│   │   ├── ui/                  # Basic UI components
│   │   │   ├── button.tsx       # Reusable Button component
│   │   │   ├── input.tsx        # Reusable Input component
│   │   │   ├── card.tsx         # Reusable Card component
│   │   │   └── index.ts         # UI components export
│   │   ├── layout/              # Layout components
│   │   │   ├── header.tsx       # Site header with navigation
│   │   │   ├── footer.tsx       # Site footer
│   │   │   └── index.ts         # Layout components export
│   │   ├── recipe/              # Recipe-specific components
│   │   │   ├── recipe-card.tsx  # Individual recipe display
│   │   │   ├── recipe-grid.tsx  # Grid of recipe cards
│   │   │   └── index.ts         # Recipe components export
│   │   ├── common/              # Common page sections
│   │   │   ├── hero-section.tsx # Landing hero section
│   │   │   ├── features-section.tsx # Platform features
│   │   │   ├── cta-section.tsx  # Call-to-action section
│   │   │   └── index.ts         # Common components export
│   │   └── index.ts             # Main components export
│   ├── (routes)/                # Route groups (future)
│   ├── globals.css              # Global styles and design tokens
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── lib/                         # Utility functions and hooks
│   └── utils.ts                 # Common utility functions
├── types/                       # TypeScript type definitions
│   └── index.ts                 # Main types and interfaces
├── public/                      # Static assets
└── package.json                 # Dependencies and scripts
```

## 🎨 Design System

### **Apple HIG Principles**
- **Clarity**: Clean, readable typography with proper hierarchy
- **Deference**: Content-first design with subtle visual elements
- **Depth**: Layered components with shadows and depth indicators
- **Accessibility**: Proper focus states, semantic HTML, and ARIA considerations

### **Color Palette**
- **Primary**: Orange (#f97316) to Amber (#d97706) gradients
- **Success**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Error**: Red (#ef4444)
- **Neutral**: Gray scale for text and backgrounds

### **Typography**
- **Font**: Inter (Google Fonts)
- **Scale**: Consistent 8px grid system
- **Hierarchy**: Clear heading levels and body text

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd pantrypals

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🧩 Component Architecture

### **UI Components** (`/components/ui/`)
Reusable, atomic components that form the building blocks of the interface:
- **Button**: Multiple variants (default, outline, ghost, link) and sizes
- **Input**: Search inputs with icon support and error handling
- **Card**: Container components with elevation variants

### **Layout Components** (`/components/layout/`)
Page structure and navigation components:
- **Header**: Sticky navigation with search and user actions
- **Footer**: Site footer with organized links and branding

### **Recipe Components** (`/components/recipe/`)
Recipe-specific functionality:
- **RecipeCard**: Individual recipe display with interactions
- **RecipeGrid**: Responsive grid layout for recipe collections

### **Common Components** (`/components/common/`)
Reusable page sections:
- **HeroSection**: Landing page hero with call-to-action
- **FeaturesSection**: Platform benefits and features
- **CTASection**: Conversion-focused call-to-action

## 🔧 Development Guidelines

### **Component Structure**
```typescript
// 1. Imports
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// 2. Interface definition
export interface ComponentProps {
  // Props with proper types
}

// 3. Component implementation
const Component = forwardRef<HTMLElement, ComponentProps>(
  ({ className, ...props }, ref) => {
    return (
      <element ref={ref} className={cn('base-styles', className)} {...props}>
        {/* Component content */}
      </element>
    );
  }
);

// 4. Display name for debugging
Component.displayName = 'Component';

// 5. Export
export { Component };
```

### **Styling Guidelines**
- Use Tailwind CSS utility classes
- Leverage the `cn()` utility for conditional classes
- Follow mobile-first responsive design
- Maintain consistent spacing using the 8px grid system

### **TypeScript Best Practices**
- Define interfaces for all component props
- Use proper type annotations for functions and variables
- Leverage TypeScript's type inference where possible
- Export types from dedicated type files

## 📱 Responsive Design

The platform is built with a mobile-first approach:
- **Mobile**: Single column layouts, touch-friendly interactions
- **Tablet**: Two-column grids, enhanced navigation
- **Desktop**: Multi-column layouts, hover effects, advanced features

## ♿ Accessibility

- Semantic HTML structure
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Screen reader optimization

## 🚧 Future Enhancements

### **Phase 1: Core Platform** ✅
- [x] Component architecture setup
- [x] Home page design and layout
- [x] Basic UI component library
- [x] TypeScript type definitions

### **Phase 2: Authentication & Database** 🔄
- [ ] Supabase integration
- [ ] User authentication system
- [ ] Recipe database schema
- [ ] User profiles and following

### **Phase 3: Recipe Management** 📋
- [ ] Recipe creation and editing
- [ ] Image and video upload
- [ ] Recipe search and filtering
- [ ] Collections and bookmarks

### **Phase 4: Social Features** 👥
- [ ] Comments and reviews
- [ ] Recipe sharing
- [ ] Community challenges
- [ ] Notifications system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **SideChef** for recipe discovery inspiration
- **TikTok** for social engagement patterns
- **Apple HIG** for design principles
- **Next.js Team** for the amazing framework
- **Tailwind CSS** for utility-first styling

---

**Built with ❤️ by the PantryPals Team**
