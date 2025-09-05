'use client';

import { MessageCircle, Eye, Pin, Lock, Clock, Tag, User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import type { DiscussionThread } from '@/lib/services/social-service';

interface DiscussionThreadCardProps {
  thread: DiscussionThread;
  onClick?: (thread: DiscussionThread) => void;
  className?: string;
}

export function DiscussionThreadCard({ thread, onClick, className }: DiscussionThreadCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'general': 'bg-blue-100 text-blue-800',
      'recipe-help': 'bg-[#f97316]/10 text-[#f97316]',
      'techniques': 'bg-purple-100 text-purple-800',
      'ingredients': 'bg-green-100 text-green-800',
      'equipment': 'bg-gray-100 text-gray-800',
      'dietary': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'general': 'General',
      'recipe-help': 'Recipe Help',
      'techniques': 'Techniques',
      'ingredients': 'Ingredients',
      'equipment': 'Equipment',
      'dietary': 'Dietary'
    };
    return labels[category] || category;
  };

  return (
    <Card 
      className={`cursor-pointer hover:border-[#f97316]/30 transition-all duration-200 hover:shadow-md ${className}`}
      onClick={() => onClick?.(thread)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            {thread.is_pinned && (
              <Pin className="w-4 h-4 text-[#f97316] flex-shrink-0" />
            )}
            {thread.is_locked && (
              <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />
            )}
            <Badge className={`${getCategoryColor(thread.category)} text-xs px-2 py-1 flex-shrink-0`}>
              {getCategoryLabel(thread.category)}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-3 text-sm text-gray-500 flex-shrink-0">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{thread.view_count}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span>{thread.reply_count}</span>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 hover:text-[#f97316] transition-colors">
          {thread.title}
        </h3>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Thread Content Preview */}
        <p className="text-gray-700 line-clamp-2 text-sm leading-relaxed">
          {thread.content}
        </p>

        {/* Associated Recipe */}
        {thread.recipe && (
          <div className="flex items-center space-x-2 p-2 bg-[#f97316]/5 rounded-lg">
            <div className="w-8 h-8 bg-gray-200 rounded overflow-hidden flex-shrink-0">
              {thread.recipe.image_url ? (
                <img 
                  src={thread.recipe.image_url} 
                  alt={thread.recipe.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#f97316]/20 flex items-center justify-center">
                  <span className="text-[#f97316] text-xs font-bold">R</span>
                </div>
              )}
            </div>
            <span className="text-sm text-gray-700 font-medium">
              Related to: {thread.recipe.title}
            </span>
          </div>
        )}

        {/* Tags */}
        {thread.tags && thread.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {thread.tags.slice(0, 3).map((tag, index) => (
              <div
                key={index}
                className="inline-flex items-center space-x-1 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
              >
                <Tag className="w-3 h-3" />
                <span>{tag}</span>
              </div>
            ))}
            {thread.tags.length > 3 && (
              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs text-gray-500">
                +{thread.tags.length - 3} more
              </div>
            )}
          </div>
        )}

        {/* Author and Timing */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-[#f97316] to-[#d97706] rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-xs">
                {thread.author_profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {thread.author_profile?.display_name || 'Anonymous'}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatDate(thread.created_at)}</span>
            </div>
            {thread.last_reply_at && (
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-3 h-3" />
                <span>Last reply {formatDate(thread.last_reply_at)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}