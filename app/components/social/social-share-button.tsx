'use client';

import { useState } from 'react';
import { Share2, Twitter, Facebook, Instagram, Link as LinkIcon, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface SocialShareButtonProps {
  contentType: 'recipe' | 'review' | 'thread';
  contentId: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function SocialShareButton({ 
  contentType, 
  contentId, 
  title = 'Check this out!',
  description = 'Found something great on NIBBBLE',
  variant = 'ghost',
  size = 'sm',
  showText = false,
  className 
}: SocialShareButtonProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateShareUrl = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/social/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id || 'anonymous',
          content_type: contentType,
          content_id: contentId,
          platform: 'link'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setShareUrl(data.shareUrl);
        return data.shareUrl;
      }
      
      // Fallback URL generation
      const baseUrl = window.location.origin;
      const fallbackUrl = `${baseUrl}/${contentType}/${contentId}`;
      setShareUrl(fallbackUrl);
      return fallbackUrl;
    } catch (error) {
      console.error('Generate share URL error:', error);
      const fallbackUrl = `${window.location.origin}/${contentType}/${contentId}`;
      setShareUrl(fallbackUrl);
      return fallbackUrl;
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!shareUrl) {
      await generateShareUrl();
    }
    setIsOpen(!isOpen);
  };

  const trackShare = async (platform: string, url?: string) => {
    if (!user) return;

    try {
      await fetch('/api/social/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          content_type: contentType,
          content_id: contentId,
          platform: platform,
          share_url: url || shareUrl
        }),
      });
    } catch (error) {
      console.error('Track share error:', error);
    }
  };

  const shareToTwitter = async () => {
    const url = shareUrl || await generateShareUrl();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}&via=NIBBBLE`;
    window.open(twitterUrl, '_blank', 'width=550,height=400');
    trackShare('twitter', url);
    setIsOpen(false);
  };

  const shareToFacebook = async () => {
    const url = shareUrl || await generateShareUrl();
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=400');
    trackShare('facebook', url);
    setIsOpen(false);
  };

  const copyLink = async () => {
    const url = shareUrl || await generateShareUrl();
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackShare('link', url);
      toast({
        title: "Link Copied!",
        description: "The link has been copied to your clipboard.",
      });
      
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Copy link error:', error);
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  // Native Web Share API for mobile
  const nativeShare = async () => {
    const url = shareUrl || await generateShareUrl();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: url,
        });
        trackShare('native', url);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Native share error:', error);
        }
      }
    } else {
      // Fallback to copy link
      copyLink();
    }
  };

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        onClick={handleShare}
        disabled={isLoading}
        className={className}
      >
        {isLoading ? (
          <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
        {showText && <span className="ml-2">Share</span>}
      </Button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Share Options */}
          <Card className="absolute top-full mt-2 right-0 z-50 w-64 shadow-lg border border-gray-200">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-semibold text-gray-900 text-sm">Share this {contentType}</h4>
              
              <div className="grid grid-cols-2 gap-2">
                {/* Twitter */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareToTwitter}
                  className="flex items-center justify-start space-x-2 h-10"
                >
                  <Twitter className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Twitter</span>
                </Button>

                {/* Facebook */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareToFacebook}
                  className="flex items-center justify-start space-x-2 h-10"
                >
                  <Facebook className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Facebook</span>
                </Button>

                {/* Instagram (placeholder) */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="flex items-center justify-start space-x-2 h-10 opacity-50"
                >
                  <Instagram className="w-4 h-4 text-pink-500" />
                  <span className="text-sm">Instagram</span>
                </Button>

                {/* Copy Link */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyLink}
                  className="flex items-center justify-start space-x-2 h-10"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Copy Link</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Native Share (Mobile) */}
              {navigator.share && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={nativeShare}
                  className="w-full bg-gradient-to-r from-[#f97316] to-[#d97706]"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share via...
                </Button>
              )}

              {/* Share URL Display */}
              {shareUrl && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600 break-all">
                  {shareUrl}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}