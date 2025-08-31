'use client';

import { 
  Header, 
  Footer, 
  HeroSection, 
  FeaturesSection, 
  CTASection,
  RecipeGrid,
  SupabaseTest
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
      <SupabaseTest />
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
