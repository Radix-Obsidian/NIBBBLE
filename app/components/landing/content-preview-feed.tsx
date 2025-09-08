'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, Play, Clock, Users } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';

interface PreviewRecipe {
  id: string;
  title: string;
  description: string;
  cook_time: number;
  difficulty: string;
  rating: number;
  cuisine: string;
  likes_count: number;
  comments_count: number;
  image_url: string;
  creator: {
    display_name: string;
    username: string;
    avatar_url?: string;
    verified: boolean;
  };
  nutrition: {
    calories: number;
    protein: number;
  };
}

interface ContextualSignupProps {
  action: string;
  onSignup: () => void;
  onDismiss: () => void;
}

const ContextualSignupPrompt = ({ action, onSignup, onDismiss }: ContextualSignupProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={onDismiss}
  >
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Love what you see?
        </h3>
        
        <p className="text-gray-600 mb-6">
          Join NIBBBLE to {action} and access thousands of delicious recipes from top creators.
        </p>
        
        <div className="space-y-3">
          <Button
            onClick={onSignup}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-3 rounded-2xl"
          >
            Join NIBBBLE Free
          </Button>
          
          <button
            onClick={onDismiss}
            className="w-full text-gray-500 hover:text-gray-700 text-sm py-2"
          >
            Continue browsing
          </button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

export function ContentPreviewFeed() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<PreviewRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [signupAction, setSignupAction] = useState('');

  // Load preview recipes (public access)
  useEffect(() => {
    const loadPreviewRecipes = async () => {
      try {
        // Fetch recipes without authentication requirement
        const { data, error } = await supabase
          .from('recipes')
          .select(`
            id, title, description, cook_time, difficulty, rating, cuisine, 
            likes_count, comments_count,
            profiles:creator_id (
              display_name, username, avatar_url
            )
          `)
          .order('likes_count', { ascending: false })
          .limit(6);

        if (error) {
          logger.error('Error fetching preview recipes', error);
          // Fallback to demo data if DB fails
          setRecipes(generateDemoRecipes());
          return;
        }

        // Transform data with enhanced visuals
        const transformedRecipes: PreviewRecipe[] = (data || []).map((recipe: any, index: number) => {
          const profile = recipe.profiles || {};
          
          return {
            id: recipe.id,
            title: recipe.title || generateDemoTitle(index),
            description: recipe.description || generateDemoDescription(index),
            cook_time: recipe.cook_time || 20 + (index * 5),
            difficulty: recipe.difficulty || ['Easy', 'Medium', 'Hard'][index % 3],
            rating: recipe.rating || 4.2 + (Math.random() * 0.8),
            cuisine: recipe.cuisine || ['Italian', 'Asian', 'Mexican', 'American', 'Mediterranean'][index % 5],
            likes_count: recipe.likes_count || Math.floor(Math.random() * 5000) + 1000,
            comments_count: recipe.comments_count || Math.floor(Math.random() * 200) + 50,
            image_url: generateHighQualityImage(index),
            creator: {
              display_name: profile.display_name || generateCreatorName(index),
              username: profile.username || `chef${index + 1}`,
              avatar_url: profile.avatar_url || generateCreatorAvatar(index),
              verified: index < 3 // First 3 are verified
            },
            nutrition: {
              calories: 300 + (index * 50),
              protein: 15 + (index * 2)
            }
          };
        });

        setRecipes(transformedRecipes.length > 0 ? transformedRecipes : generateDemoRecipes());
      } catch (error) {
        logger.error('Preview recipes load error', error);
        setRecipes(generateDemoRecipes());
      } finally {
        setLoading(false);
      }
    };

    loadPreviewRecipes();
  }, []);

  // Generate demo data for fallback
  const generateDemoRecipes = (): PreviewRecipe[] => {
    return [
      {
        id: 'demo-1',
        title: 'Creamy Garlic Tuscan Chicken',
        description: 'Tender chicken breast in a rich, creamy sauce with sun-dried tomatoes and spinach',
        cook_time: 25,
        difficulty: 'Easy',
        rating: 4.8,
        cuisine: 'Italian',
        likes_count: 3200,
        comments_count: 127,
        image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=800&fit=crop&q=80',
        creator: {
          display_name: 'Sarah Chen',
          username: 'sarahcooks',
          avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b5c18c0b?w=150&h=150&fit=crop&q=80',
          verified: true
        },
        nutrition: { calories: 420, protein: 32 }
      },
      {
        id: 'demo-2',
        title: 'Korean BBQ Bowls',
        description: 'Marinated beef bulgogi with jasmine rice, pickled vegetables, and spicy gochujang sauce',
        cook_time: 30,
        difficulty: 'Medium',
        rating: 4.6,
        cuisine: 'Korean',
        likes_count: 2850,
        comments_count: 203,
        image_url: 'https://images.unsplash.com/photo-1555939594-58e22ba0c4d1?w=600&h=800&fit=crop&q=80',
        creator: {
          display_name: 'David Kim',
          username: 'koreanfusion',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80',
          verified: true
        },
        nutrition: { calories: 580, protein: 28 }
      },
      {
        id: 'demo-3',
        title: 'Mediterranean Quinoa Salad',
        description: 'Fresh quinoa with cucumber, cherry tomatoes, feta cheese, and lemon herb dressing',
        cook_time: 15,
        difficulty: 'Easy',
        rating: 4.4,
        cuisine: 'Mediterranean',
        likes_count: 1950,
        comments_count: 89,
        image_url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=800&fit=crop&q=80',
        creator: {
          display_name: 'Maria Lopez',
          username: 'healthycravings',
          verified: false
        },
        nutrition: { calories: 350, protein: 18 }
      }
    ];
  };

  const generateHighQualityImage = (index: number): string => {
    const images = [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555939594-58e22ba0c4d1?w=600&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=600&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1563379091339-03246963d29b?w=600&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551782450-17144efb5c50?w=600&h=800&fit=crop&q=80'
    ];
    return images[index % images.length];
  };

  const generateCreatorName = (index: number): string => {
    const names = ['Chef Maria', 'David Kim', 'Sarah Chen', 'Chef Antonio', 'Lisa Park', 'Chef Marcus'];
    return names[index % names.length];
  };

  const generateCreatorAvatar = (index: number): string => {
    const avatars = [
      'https://images.unsplash.com/photo-1494790108755-2616b5c18c0b?w=150&h=150&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&q=80'
    ];
    return avatars[index % avatars.length];
  };

  const generateDemoTitle = (index: number): string => {
    const titles = [
      'Creamy Garlic Tuscan Chicken',
      'Korean BBQ Bowls',
      'Mediterranean Quinoa Salad',
      'Thai Green Curry',
      'Classic Caesar Salad',
      'Beef Stroganoff'
    ];
    return titles[index % titles.length];
  };

  const generateDemoDescription = (index: number): string => {
    const descriptions = [
      'Tender chicken in rich, creamy sauce with sun-dried tomatoes',
      'Marinated beef with rice and pickled vegetables',
      'Fresh quinoa with cucumber, tomatoes, and feta cheese',
      'Aromatic curry with coconut milk and fresh herbs',
      'Crisp romaine with homemade dressing and croutons',
      'Classic comfort food with tender beef and egg noodles'
    ];
    return descriptions[index % descriptions.length];
  };

  // Handle engagement actions (triggers signup prompt)
  const handleEngagementAction = (action: string) => {
    setSignupAction(action);
    setShowSignupPrompt(true);
  };

  const handleSignup = () => {
    // Redirect to streamlined signup with action context
    router.push('/signin?trigger=content_preview&action=' + encodeURIComponent(signupAction));
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse mx-auto mb-4"></div>
            <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
            <div className="w-64 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Heart className="w-4 h-4" />
              Featured Recipes
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Amazing Recipes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get inspired by thousands of recipes from passionate home cooks and professional chefs
            </p>
          </motion.div>

          {/* Recipe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.slice(0, 6).map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
              >
                {/* Recipe Image */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={recipe.image_url}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEngagementAction('watch recipe video')}
                      className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Play className="w-6 h-6 text-gray-900 ml-1" />
                    </motion.button>
                  </div>

                  {/* Recipe Stats Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {recipe.cook_time}min
                    </div>
                  </div>

                  {/* Difficulty Badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
                    recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                    recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {recipe.difficulty}
                  </div>
                </div>

                {/* Recipe Content */}
                <div className="p-6">
                  {/* Creator Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={recipe.creator.avatar_url || '/placeholder-avatar.png'}
                      alt={recipe.creator.display_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-900 truncate">
                          {recipe.creator.display_name}
                        </span>
                        {recipe.creator.verified && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">@{recipe.creator.username}</span>
                    </div>
                  </div>

                  {/* Recipe Info */}
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                    {recipe.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {recipe.description}
                  </p>

                  {/* Nutrition Info */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span>{recipe.nutrition.calories} cal</span>
                    <span>{recipe.nutrition.protein}g protein</span>
                    <span className="capitalize">{recipe.cuisine}</span>
                  </div>

                  {/* Engagement Stats */}
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {recipe.likes_count.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {recipe.comments_count}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-orange-500">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`w-3 h-3 ${i < Math.floor(recipe.rating) ? 'text-orange-400' : 'text-gray-300'}`}>
                            ⭐
                          </div>
                        ))}
                      </div>
                      <span className="text-xs ml-1">{recipe.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEngagementAction('save recipe')}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold rounded-2xl"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Save Recipe
                    </Button>
                    <Button
                      onClick={() => handleEngagementAction('share recipe')}
                      variant="outline"
                      className="px-4 border-gray-200 hover:bg-gray-50 rounded-2xl"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Explore More CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-12"
          >
            <Button
              onClick={() => handleEngagementAction('explore more recipes')}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Users className="w-5 h-5 mr-2" />
              Join NIBBBLE & Explore More
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              Join thousands of home cooks sharing amazing recipes
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contextual Signup Prompt */}
      {showSignupPrompt && (
        <ContextualSignupPrompt
          action={signupAction}
          onSignup={handleSignup}
          onDismiss={() => setShowSignupPrompt(false)}
        />
      )}
    </>
  );
}