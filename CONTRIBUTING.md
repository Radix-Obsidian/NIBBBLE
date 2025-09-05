# Contributing to NIBBBLE

Thank you for your interest in contributing to NIBBBLE! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### **Before You Start**
- Read this entire document
- Check existing [issues](https://github.com/yourusername/nibbble/issues) to avoid duplicates
- Join our [Discussions](https://github.com/yourusername/nibbble/discussions) to connect with the community

### **Types of Contributions**
- 🐛 **Bug Reports**: Report issues you find
- ✨ **Feature Requests**: Suggest new features
- �� **Documentation**: Improve docs and comments
- 🎨 **UI/UX**: Design improvements and accessibility
- �� **Code**: Fix bugs, add features, improve performance
- 🧪 **Testing**: Add tests or improve test coverage

## 🚀 Development Setup

### **Prerequisites**
- Node.js 18.17.0 or later
- npm 9.0.0 or later
- Git

### **Local Development**
1. **Fork and clone**
   ```bash
   git clone https://github.com/yourusername/nibbble.git
   cd nibbble
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Run quality checks**
   ```bash
   npm run lint          # Check code style
   npm run type-check    # Check TypeScript types
   npm run format:check  # Check formatting
   ```

## 📝 Code Standards

### **TypeScript**
- Use TypeScript for all new code
- Define proper interfaces for all props and data structures
- Avoid `any` type - use proper typing
- Use type inference where appropriate

### **React Components**
```typescript
// ✅ Good component structure
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ComponentProps {
  className?: string
  children: React.ReactNode
}

const Component = forwardRef<HTMLElement, ComponentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <element ref={ref} className={cn('base-styles', className)} {...props}>
        {children}
      </element>
    )
  }
)

Component.displayName = 'Component'
export { Component }
```

### **Styling**
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use the `cn()` utility for conditional classes
- Maintain consistent spacing (8px grid system)

### **File Naming**
- **Components**: PascalCase (`RecipeCard.tsx`)
- **Files**: kebab-case (`recipe-card.tsx`)
- **Directories**: kebab-case (`recipe-components/`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS`)

### **Imports Order**
1. React and Next.js imports
2. Third-party libraries
3. Internal utilities and hooks
4. Components and types
5. Relative imports

## 🔄 Git Workflow

### **Branch Naming**
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions

### **Commit Messages**
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: type(scope): description
feat(auth): add social login with Google
fix(ui): resolve button alignment issue
docs(readme): update installation instructions
refactor(components): extract reusable button component
test(api): add tests for recipe endpoints
```

**Types:**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### **Pull Request Process**
1. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes**
   - Write clean, documented code
   - Add tests for new functionality
   - Update documentation if needed

3. **Run quality checks**
   ```bash
   npm run lint
   npm run type-check
   npm run format
   npm run test
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Create a Pull Request**
   - Use the PR template
   - Describe your changes clearly
   - Link related issues
   - Request reviews from maintainers

## 🧪 Testing

### **Test Structure**
```typescript
// Component test example
import { render, screen } from '@testing-library/react'
import { RecipeCard } from './recipe-card'

describe('RecipeCard', () => {
  it('renders recipe title', () => {
    render(<RecipeCard recipe={mockRecipe} />)
    expect(screen.getByText(mockRecipe.title)).toBeInTheDocument()
  })
})
```

### **Testing Guidelines**
- Write tests for all new functionality
- Test user interactions and edge cases
- Maintain good test coverage (>80%)
- Use meaningful test descriptions
- Mock external dependencies

## �� Documentation

### **Code Documentation**
- Add JSDoc comments for complex functions
- Document component props with TypeScript interfaces
- Include usage examples for reusable components
- Update README.md for new features

### **API Documentation**
- Document all API endpoints
- Include request/response examples
- Specify error codes and messages
- Keep documentation up to date

## 🐛 Bug Reports

### **Before Reporting**
- Check existing issues
- Try to reproduce the bug
- Check browser console for errors
- Test in different browsers/devices

### **Bug Report Template**
```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g. macOS, Windows]
- Browser: [e.g. Chrome, Safari]
- Version: [e.g. 22]

## Additional Context
Screenshots, console logs, etc.
```

## ✨ Feature Requests

### **Feature Request Template**
```markdown
## Feature Description
Brief description of the feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this work?

## Alternatives Considered
Other approaches you've considered

## Additional Context
Screenshots, mockups, etc.
```

## 🎨 Design Contributions

### **Design Guidelines**
- Follow Apple HIG principles
- Maintain consistency with existing design
- Consider accessibility (WCAG 2.1 AA)
- Test on multiple screen sizes
- Use the established color palette

### **Design Assets**
- Provide high-quality mockups
- Include responsive breakpoints
- Specify interaction states
- Document design decisions

## 🔒 Security

### **Security Guidelines**
- Never commit sensitive data (API keys, passwords)
- Use environment variables for configuration
- Validate all user inputs
- Follow OWASP security guidelines
- Report security issues privately

## 📞 Getting Help

### **Resources**
- [GitHub Issues](https://github.com/yourusername/nibbble/issues)
- [GitHub Discussions](https://github.com/yourusername/nibbble/discussions)
- [Documentation](https://nibbble.com/docs)
- [Discord Community](https://discord.gg/nibbble)

### **Contact**
- **Email**: contributors@nibbble.com
- **Twitter**: [@NIBBBLE](https://twitter.com/NIBBBLE)

## 🙏 Recognition

Contributors will be recognized in:
- Project README.md
- Release notes
- Contributor hall of fame
- Social media acknowledgments

## 📄 License

By contributing to NIBBBLE, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to NIBBBLE! 🍳**

Your contributions help us build the future of AI-powered home cooking.
