'use client';

import { RecipeCard, RecipeCardProps } from './recipe-card';

export interface RecipeGridProps {
  recipes: RecipeCardProps[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
  onLike?: (id: string) => void;
  onView?: (id: string) => void;
}

export function RecipeGrid({
  recipes,
  title,
  subtitle,
  showViewAll = false,
  onViewAll,
  onLike,
  onView
}: RecipeGridProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="text-center mb-16">
            {title && (
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} {...recipe} onLike={onLike} onView={onView} />
          ))}
        </div>

        {showViewAll && (
          <div className="text-center mt-12">
            <button 
              onClick={onViewAll}
              className="bg-gray-100 text-gray-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors"
            >
              View All {title}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
