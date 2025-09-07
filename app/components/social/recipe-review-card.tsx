'use client';

import { useState } from 'react';
import { Star, ThumbsUp, Clock, TrendingUp, CheckCircle2, ImageIcon } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import type { RecipeReview } from '@/lib/services/social-service';

interface RecipeReviewCardProps {
  review: RecipeReview;
  onHelpfulClick?: (reviewId: string, isHelpful: boolean) => void;
}

export function RecipeReviewCard({ review, onHelpfulClick }: RecipeReviewCardProps) {
  const { user } = useAuth();
  const [helpfulLoading, setHelpfulLoading] = useState(false);

  const handleHelpfulClick = async (isHelpful: boolean) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to mark reviews as helpful.",
        variant: "destructive",
      });
      return;
    }

    setHelpfulLoading(true);

    try {
      const response = await fetch('/api/social/reviews/helpful', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId: review.id,
          userId: user.id,
          isHelpful,
        }),
      });

      if (response.ok) {
        onHelpfulClick?.(review.id, isHelpful);
        toast({
          title: "Thank you!",
          description: `Review marked as ${isHelpful ? 'helpful' : 'not helpful'}.`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Helpful click error:', error);
      toast({
        title: "Error",
        description: "Failed to update review helpfulness.",
        variant: "destructive",
      });
    } finally {
      setHelpfulLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-[#f97316] text-[#f97316]'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="mb-4 border border-gray-200 hover:border-[#f97316]/30 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#f97316] to-[#d97706] rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {review.user_profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                {review.user_profile?.display_name || 'Anonymous Cook'}
              </h4>
              <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {renderStars(review.rating)}
            <span className="text-sm font-medium text-gray-700">
              {review.rating}/5
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Success Rate & Timing */}
        <div className="flex items-center space-x-4 text-sm">
          {review.success_rate !== null && review.success_rate !== undefined && (
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-gray-600">
                {review.success_rate}% success rate
              </span>
            </div>
          )}
          {review.cooking_time_actual && (
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-gray-600">
                {review.cooking_time_actual} min actual
              </span>
            </div>
          )}
          {review.would_make_again && (
            <div className="flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-[#f97316]" />
              <span className="text-gray-600">Would make again</span>
            </div>
          )}
        </div>

        {/* Difficulty */}
        {review.difficulty_experienced && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Difficulty:</span>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`w-2 h-4 rounded-sm ${
                    level <= review.difficulty_experienced!
                      ? 'bg-[#f97316]'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              ({review.difficulty_experienced}/5)
            </span>
          </div>
        )}

        {/* Review Text */}
        {review.review_text && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed">{review.review_text}</p>
          </div>
        )}

        {/* Modifications */}
        {review.modifications && review.modifications.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-800">Modifications made:</h5>
            <div className="flex flex-wrap gap-2">
              {review.modifications.map((mod, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {mod}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Images */}
        {review.images && review.images.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-800 flex items-center space-x-1">
              <ImageIcon className="w-4 h-4" />
              <span>Photos</span>
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {review.images.map((image, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                >
                  <img
                    src={image}
                    alt={`Review photo ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <ThumbsUp className="w-4 h-4" />
          <span>{review.helpful_count} found helpful</span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleHelpfulClick(true)}
            disabled={helpfulLoading || user?.id === review.user_id}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <ThumbsUp className="w-4 h-4 mr-1" />
            Helpful
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleHelpfulClick(false)}
            disabled={helpfulLoading || user?.id === review.user_id}
            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
          >
            Not helpful
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}