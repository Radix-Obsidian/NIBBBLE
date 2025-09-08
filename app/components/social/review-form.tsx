'use client';

import { useState } from 'react';
import { Star, Clock, TrendingUp, Camera, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';

interface ReviewFormProps {
  recipeId: string;
  recipeName: string;
  onReviewSubmitted?: (review: any) => void;
  onCancel?: () => void;
}

export function ReviewForm({ 
  recipeId, 
  recipeName, 
  onReviewSubmitted, 
  onCancel 
}: ReviewFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    rating: 0,
    review_text: '',
    success_rate: '',
    cooking_time_actual: '',
    difficulty_experienced: 0,
    would_make_again: false,
    modifications: [] as string[],
    images: [] as string[]
  });
  const [newModification, setNewModification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-600 mb-4">Please sign in to leave a review.</p>
          <Button onClick={() => window.location.href = '/signin?direct=true'}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/social/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipe_id: recipeId,
          user_id: user.id,
          rating: formData.rating,
          review_text: formData.review_text || undefined,
          success_rate: formData.success_rate ? parseInt(formData.success_rate) : undefined,
          cooking_time_actual: formData.cooking_time_actual ? parseInt(formData.cooking_time_actual) : undefined,
          difficulty_experienced: formData.difficulty_experienced || undefined,
          would_make_again: formData.would_make_again,
          modifications: formData.modifications.length > 0 ? formData.modifications : undefined,
          images: formData.images.length > 0 ? formData.images : undefined
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Review Submitted!",
          description: "Thank you for sharing your cooking experience.",
        });
        onReviewSubmitted?.(data.review);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to submit review.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Review submission error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = (currentRating: number, onRatingChange: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-6 h-6 cursor-pointer transition-colors ${
                star <= currentRating
                  ? 'fill-[#f97316] text-[#f97316]'
                  : 'text-gray-300 hover:text-[#f97316]'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const renderDifficultyRating = (currentDifficulty: number, onDifficultyChange: (difficulty: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onDifficultyChange(level)}
            className="focus:outline-none"
          >
            <div
              className={`w-3 h-6 rounded-sm cursor-pointer transition-colors ${
                level <= currentDifficulty
                  ? 'bg-[#f97316]'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="text-sm text-gray-500 ml-2">
          {currentDifficulty > 0 ? `(${currentDifficulty}/5)` : ''}
        </span>
      </div>
    );
  };

  const addModification = () => {
    if (newModification.trim()) {
      setFormData(prev => ({
        ...prev,
        modifications: [...prev.modifications, newModification.trim()]
      }));
      setNewModification('');
    }
  };

  const removeModification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      modifications: prev.modifications.filter((_, i) => i !== index)
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">
          Review: {recipeName}
        </CardTitle>
        <p className="text-gray-600">Share your cooking experience to help others succeed!</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Overall Rating *</Label>
            <div className="flex items-center space-x-3">
              {renderStarRating(formData.rating, (rating) => 
                setFormData(prev => ({ ...prev, rating }))
              )}
              <span className="text-sm text-gray-500">
                {formData.rating > 0 ? `${formData.rating}/5` : 'Click to rate'}
              </span>
            </div>
          </div>

          {/* Written Review */}
          <div className="space-y-2">
            <Label htmlFor="review_text" className="text-base font-semibold">
              Your Experience
            </Label>
            <textarea
              id="review_text"
              value={formData.review_text}
              onChange={(e) => setFormData(prev => ({ ...prev, review_text: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent min-h-[100px] resize-y"
              placeholder="Tell us about your cooking experience... What worked well? Any challenges?"
            />
          </div>

          {/* Success Rate & Cooking Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="success_rate" className="text-base font-semibold flex items-center space-x-1">
                <TrendingUp className="w-4 h-4" />
                <span>Success Rate</span>
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="success_rate"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.success_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, success_rate: e.target.value }))}
                  placeholder="0-100"
                  className="w-20"
                />
                <span className="text-sm text-gray-600">% (How close to the expected result?)</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cooking_time" className="text-base font-semibold flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Actual Cooking Time</span>
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="cooking_time"
                  type="number"
                  min="0"
                  value={formData.cooking_time_actual}
                  onChange={(e) => setFormData(prev => ({ ...prev, cooking_time_actual: e.target.value }))}
                  placeholder="Minutes"
                  className="w-24"
                />
                <span className="text-sm text-gray-600">minutes</span>
              </div>
            </div>
          </div>

          {/* Difficulty Rating */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">How difficult was it for you?</Label>
            <div className="flex items-center space-x-3">
              {renderDifficultyRating(formData.difficulty_experienced, (difficulty) =>
                setFormData(prev => ({ ...prev, difficulty_experienced: difficulty }))
              )}
              <span className="text-sm text-gray-500">
                {formData.difficulty_experienced === 0 ? 'Click to rate difficulty' : 
                 formData.difficulty_experienced === 1 ? 'Very Easy' :
                 formData.difficulty_experienced === 2 ? 'Easy' :
                 formData.difficulty_experienced === 3 ? 'Medium' :
                 formData.difficulty_experienced === 4 ? 'Hard' : 'Very Hard'}
              </span>
            </div>
          </div>

          {/* Would Make Again */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, would_make_again: !prev.would_make_again }))}
                className="focus:outline-none"
              >
                <CheckCircle2 
                  className={`w-6 h-6 ${
                    formData.would_make_again 
                      ? 'text-[#f97316] fill-current' 
                      : 'text-gray-300 hover:text-[#f97316]'
                  }`}
                />
              </button>
              <Label className="text-base font-semibold cursor-pointer">
                I would make this recipe again
              </Label>
            </div>
          </div>

          {/* Modifications */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Modifications Made</Label>
            <div className="flex space-x-2">
              <Input
                value={newModification}
                onChange={(e) => setNewModification(e.target.value)}
                placeholder="e.g., Added extra garlic, Used olive oil instead of butter"
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={addModification}
                variant="outline"
                size="sm"
              >
                Add
              </Button>
            </div>
            {formData.modifications.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.modifications.map((mod, index) => (
                  <div
                    key={index}
                    className="bg-[#f97316]/10 text-[#f97316] px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>{mod}</span>
                    <button
                      type="button"
                      onClick={() => removeModification(index)}
                      className="text-[#f97316]/60 hover:text-[#f97316]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Photo Upload Placeholder */}
          <div className="space-y-2">
            <Label className="text-base font-semibold flex items-center space-x-1">
              <Camera className="w-4 h-4" />
              <span>Photos (Coming Soon)</span>
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
              <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>Photo uploads will be available soon!</p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting || formData.rating === 0}
              className="bg-gradient-to-r from-[#f97316] to-[#d97706] hover:from-[#f97316]/90 hover:to-[#d97706]/90"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              ) : null}
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}