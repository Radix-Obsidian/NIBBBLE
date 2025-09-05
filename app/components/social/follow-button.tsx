'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { UserPlus, UserMinus, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface FollowButtonProps {
  creatorId: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function FollowButton({ 
  creatorId, 
  variant = 'default', 
  size = 'md', 
  showIcon = true,
  className 
}: FollowButtonProps) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Don't show follow button if user is viewing their own profile
  if (user?.id === creatorId) {
    return null;
  }

  useEffect(() => {
    if (user?.id && creatorId) {
      checkFollowStatus();
    }
  }, [user?.id, creatorId]);

  const checkFollowStatus = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `/api/social/follow?followerId=${user.id}&creatorId=${creatorId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to follow creators.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/social/follow', {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followerId: user.id,
          creatorId: creatorId,
        }),
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        toast({
          title: isFollowing ? "Unfollowed" : "Following",
          description: isFollowing 
            ? "You unfollowed this creator." 
            : "You are now following this creator!",
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
      console.error('Follow error:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : variant}
      size={size}
      onClick={handleFollow}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <>
          {showIcon && (
            <>
              {isFollowing ? (
                <Heart className="w-4 h-4 mr-2 fill-current" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
            </>
          )}
          {isFollowing ? 'Following' : 'Follow'}
        </>
      )}
    </Button>
  );
}