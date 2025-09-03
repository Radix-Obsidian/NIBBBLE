'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RecipePlaceholderProps {
  title: string;
  cuisine?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  className?: string;
}

const CUISINE_STYLES = {
  'Italian': {
    gradient: 'from-red-500 via-orange-500 to-red-600',
    emoji: '🍝',
    accent: 'text-red-600',
    border: 'border-red-200/30',
    glow: 'shadow-red-500/20'
  },
  'Mexican': {
    gradient: 'from-green-500 via-emerald-500 to-green-600',
    emoji: '🌮',
    accent: 'text-green-600',
    border: 'border-green-200/30',
    glow: 'shadow-green-500/20'
  },
  'Chinese': {
    gradient: 'from-red-600 via-red-500 to-yellow-500',
    emoji: '🥢',
    accent: 'text-red-600',
    border: 'border-red-200/30',
    glow: 'shadow-red-500/20'
  },
  'Indian': {
    gradient: 'from-purple-600 via-pink-500 to-orange-500',
    emoji: '🍛',
    accent: 'text-purple-600',
    border: 'border-purple-200/30',
    glow: 'shadow-purple-500/20'
  },
  'French': {
    gradient: 'from-blue-500 via-indigo-500 to-blue-600',
    emoji: '🥖',
    accent: 'text-blue-600',
    border: 'border-blue-200/30',
    glow: 'shadow-blue-500/20'
  },
  'Mediterranean': {
    gradient: 'from-cyan-500 via-blue-500 to-cyan-600',
    emoji: '🌊',
    accent: 'text-cyan-600',
    border: 'border-cyan-200/30',
    glow: 'shadow-cyan-500/20'
  },
  'Thai': {
    gradient: 'from-blue-600 via-purple-500 to-pink-500',
    emoji: '🍜',
    accent: 'text-blue-600',
    border: 'border-blue-200/30',
    glow: 'shadow-blue-500/20'
  },
  'Japanese': {
    gradient: 'from-red-500 via-pink-500 to-red-600',
    emoji: '🍱',
    accent: 'text-red-600',
    border: 'border-red-200/30',
    glow: 'shadow-red-500/20'
  }
};

const DIFFICULTY_COLORS = {
  'Easy': 'text-green-500',
  'Medium': 'text-yellow-500',
  'Hard': 'text-red-500'
};

export function RecipePlaceholder({ 
  title, 
  cuisine = 'International', 
  difficulty = 'Medium',
  className 
}: RecipePlaceholderProps) {
  const style = CUISINE_STYLES[cuisine as keyof typeof CUISINE_STYLES] || CUISINE_STYLES['Italian'];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'relative w-full aspect-video rounded-t-2xl overflow-hidden',
        'bg-gradient-to-br',
        style.gradient,
        className
      )}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center">
        {/* Cuisine emoji */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-6xl mb-4 drop-shadow-lg"
        >
          {style.emoji}
        </motion.div>
        
        {/* Recipe title */}
        <motion.h3
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-lg font-bold text-white mb-2 leading-tight drop-shadow-lg"
        >
          {title}
        </motion.h3>
        
        {/* Cuisine badge */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium',
            'bg-white/20 backdrop-blur-sm border',
            style.border,
            'text-white'
          )}
        >
          {cuisine} Cuisine
        </motion.div>
        
        {/* Difficulty indicator */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className={cn(
            'absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium',
            'bg-white/90 backdrop-blur-sm',
            DIFFICULTY_COLORS[difficulty]
          )}
        >
          {difficulty}
        </motion.div>
      </div>
      
      {/* Subtle glow effect */}
      <div className={cn(
        'absolute inset-0 rounded-t-2xl',
        style.glow,
        'opacity-0 hover:opacity-100 transition-opacity duration-300'
      )} />
    </motion.div>
  );
}

// Fallback placeholder for when no cuisine is specified
export function RecipePlaceholderFallback({ 
  title, 
  className 
}: { title: string; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'relative w-full aspect-video rounded-t-2xl overflow-hidden',
        'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600',
        className
      )}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center">
        {/* Generic food emoji */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-6xl mb-4 drop-shadow-lg"
        >
          🍽️
        </motion.div>
        
        {/* Recipe title */}
        <motion.h3
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-lg font-bold text-white mb-2 leading-tight drop-shadow-lg"
        >
          {title}
        </motion.h3>
        
        {/* Generic badge */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm border border-white/30 text-white"
        >
          Delicious Recipe
        </motion.div>
      </div>
    </motion.div>
  );
}
