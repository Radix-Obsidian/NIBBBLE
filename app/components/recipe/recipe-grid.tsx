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
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 shadow-soft border border-white/20">
      {(title || subtitle) && (
        <div className="mb-4 sm:mb-6 lg:mb-8">
          {title && (
            <h3 className="text-responsive-xl font-bold text-gray-900 mb-2">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-responsive text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 min-w-0">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="min-w-0 flex flex-col">
              <RecipeCard {...recipe} onLike={onLike} onView={onView} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-responsive text-gray-500 mb-4">No recipes found</p>
          <p className="text-sm text-gray-400">Start creating your first recipe to see it here!</p>
        </div>
      )}

      {showViewAll && recipes.length > 0 && (
        <div className="text-center mt-4 sm:mt-6 lg:mt-8">
          <button 
            onClick={onViewAll}
            className="btn bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold shadow-medium transition-all duration-200 hover:scale-[1.02]"
          >
            View All {title}
          </button>
        </div>
      )}
    </div>
  );
}
