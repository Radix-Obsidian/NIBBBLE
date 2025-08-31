'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  Header, 
  Footer, 
  HeroSection, 
  FeaturesSection, 
  CTASection,
  RecipeGrid
} from './components';
import { RecipeCardProps } from './components/recipe';

// Mock data for trending recipes
const trendingRecipes: RecipeCardProps[] = [
  {
    id: '1',
    title: 'Homemade Pizza Margherita',
    description: 'Classic Italian pizza with fresh mozzarella, basil, and tomato sauce',
    cookTime: 45,
    difficulty: 'Medium',
    rating: 4.8,
    creator: {
      name: 'Maria Chef',
      avatar: '/avatars/maria.jpg',
      initials: 'MC'
    },
    emoji: '🍕',
    isTrending: true,
    isLiked: false
  },
  {
    id: '2',
    title: 'Buddha Bowl',
    description: 'Healthy grain bowl with roasted vegetables and tahini dressing',
    cookTime: 25,
    difficulty: 'Easy',
    rating: 4.6,
    creator: {
      name: 'Vegan Kate',
      avatar: '/avatars/kate.jpg',
      initials: 'VK'
    },
    emoji: '🥗',
    isTrending: false,
    isLiked: true
  },
  {
    id: '3',
    title: 'Chocolate Lava Cake',
    description: 'Decadent chocolate cake with molten center, ready in minutes',
    cookTime: 20,
    difficulty: 'Easy',
    rating: 4.9,
    creator: {
      name: 'Baker Dave',
      avatar: '/avatars/dave.jpg',
      initials: 'BD'
    },
    emoji: '🍰',
    isTrending: false,
    isLiked: false
  }
];

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Check if user is authenticated and redirect to dashboard
  useEffect(() => {
    console.log('🔐 HomePage useEffect - user:', user, 'authLoading:', authLoading, 'hasRedirected:', hasRedirected)
    if (user && !authLoading && !hasRedirected) {
      console.log('🔐 HomePage redirecting to dashboard...')
      setHasRedirected(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 100)
    }
  }, [user, authLoading, hasRedirected, router])

  const handleRecipeLike = (id: string) => {
    console.log('Liked recipe:', id);
    // TODO: Implement like functionality
  };

  const handleViewAllTrending = () => {
    console.log('View all trending recipes');
    // TODO: Navigate to trending recipes page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <Header />
      
      <HeroSection />
      
      <RecipeGrid
        recipes={trendingRecipes}
        title="Trending This Week"
        subtitle="Discover what's hot in the cooking community right now"
        showViewAll={true}
        onViewAll={handleViewAllTrending}
        onLike={handleRecipeLike}
      />
      
      <FeaturesSection />
      
      <CTASection />
      
      <Footer />
    </div>
  );
}
