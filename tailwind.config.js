/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './types/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom breakpoints for mobile-first design
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Custom breakpoints for better mobile experience
        'mobile': '320px',
        'mobile-lg': '425px',
        'tablet': '768px',
        'tablet-lg': '1024px',
        'desktop': '1280px',
        'desktop-lg': '1536px',
      },
      
      // Responsive typography scale
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        // Responsive text sizes
        'responsive-xs': ['clamp(0.75rem, 1.5vw, 0.875rem)', { lineHeight: '1.25rem' }],
        'responsive-sm': ['clamp(0.875rem, 2vw, 1rem)', { lineHeight: '1.5rem' }],
        'responsive': ['clamp(1rem, 2.5vw, 1.125rem)', { lineHeight: '1.6rem' }],
        'responsive-lg': ['clamp(1.125rem, 3vw, 1.5rem)', { lineHeight: '1.75rem' }],
        'responsive-xl': ['clamp(1.5rem, 4vw, 2.25rem)', { lineHeight: '1.2' }],
        'responsive-2xl': ['clamp(1.875rem, 5vw, 3rem)', { lineHeight: '1.1' }],
        'responsive-3xl': ['clamp(2.25rem, 6vw, 4rem)', { lineHeight: '1' }],
      },
      
      // Responsive spacing scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
        // Responsive spacing
        'responsive-xs': 'clamp(0.25rem, 1vw, 0.5rem)',
        'responsive-sm': 'clamp(0.5rem, 2vw, 1rem)',
        'responsive': 'clamp(1rem, 3vw, 1.5rem)',
        'responsive-lg': 'clamp(1.5rem, 4vw, 2rem)',
        'responsive-xl': 'clamp(2rem, 5vw, 3rem)',
        'responsive-2xl': 'clamp(3rem, 6vw, 4rem)',
      },
      
      // Container max widths
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
        '10xl': '104rem',
      },
      
      // Custom colors
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        secondary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
      },
      
      // Custom shadows
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'large': '0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 2px 10px -2px rgba(0, 0, 0, 0.04)',
      },
      
      // Custom animations
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-in': 'slideIn 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      
      // Custom grid templates
      gridTemplateColumns: {
        'auto-fit-sm': 'repeat(auto-fit, minmax(280px, 1fr))',
        'auto-fit-md': 'repeat(auto-fit, minmax(320px, 1fr))',
        'auto-fit-lg': 'repeat(auto-fit, minmax(350px, 1fr))',
        'auto-fill-sm': 'repeat(auto-fill, minmax(280px, 1fr))',
        'auto-fill-md': 'repeat(auto-fill, minmax(320px, 1fr))',
        'auto-fill-lg': 'repeat(auto-fill, minmax(350px, 1fr))',
      },
    },
  },
  plugins: [
    // Add custom utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Responsive container
        '.container-responsive': {
          width: '100%',
          margin: '0 auto',
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4'),
          '@screen sm': {
            paddingLeft: theme('spacing.6'),
            paddingRight: theme('spacing.6'),
          },
          '@screen lg': {
            paddingLeft: theme('spacing.8'),
            paddingRight: theme('spacing.8'),
          },
        },
        
        // Touch-friendly interactive elements
        '.touch-target': {
          minHeight: '44px',
          minWidth: '44px',
          touchAction: 'manipulation',
        },
        
        // Responsive text truncation
        '.truncate-responsive': {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          '@screen sm': {
            whiteSpace: 'normal',
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
          },
        },
        
        // Responsive aspect ratios
        '.aspect-responsive': {
          aspectRatio: '16/9',
          '@screen sm': {
            aspectRatio: '4/3',
          },
          '@screen lg': {
            aspectRatio: '16/9',
          },
        },
        
        // Responsive visibility
        '.mobile-only': {
          display: 'block',
          '@screen sm': {
            display: 'none',
          },
        },
        '.tablet-up': {
          display: 'none',
          '@screen sm': {
            display: 'block',
          },
        },
        '.desktop-up': {
          display: 'none',
          '@screen lg': {
            display: 'block',
          },
        },
      }
      
      addUtilities(newUtilities)
    }
  ],
}
