/**
 * Social Post Card - Amazon.com/Shopee.sg Level Social Post Component
 * Professional social post display with complete interaction features
 * 
 * @fileoverview Enterprise-grade social post card with Bangladesh cultural integration
 * @author GetIt Platform Team
 * @version 4.0.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  MoreHorizontal,
  Eye,
  Clock,
  MapPin,
  Tag,
  Users,
  Play,
  Volume2,
  VolumeX,
  Maximize,
  ShoppingBag,
  Star,
  TrendingUp
} from 'lucide-react';
import { Button } from '../../shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../shared/components/ui/avatar';
import { Card, CardContent, CardHeader, CardFooter } from '../../shared/components/ui/card';
import { Badge } from '../../shared/components/ui/badge';
import { Separator } from '../../shared/components/ui/separator';
import { useToast } from '../../shared/hooks/use-toast';

interface SocialPost {
  id: string;
  authorId: string;
  postType: 'text' | 'image' | 'video' | 'product_showcase' | 'story' | 'live' | 'poll' | 'review';
  content?: string;
  contentBn?: string;
  mediaUrls: string[];
  thumbnailUrl?: string;
  productTags: string[];
  userTags: string[];
  hashtags: string[];
  locationTag?: string;
  locationTagBn?: string;
  visibility: string;
  groupId?: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  saveCount: number;
  engagementScore: number;
  isSponsored: boolean;
  publishedAt: string;
  createdAt: string;
  author: {
    id: string;
    displayName: string;
    displayNameBn?: string;
    avatarUrl?: string;
    verificationStatus: string;
    profileType: string;
  };
  isLiked?: boolean;
  isSaved?: boolean;
  recentComments?: any[];
}

interface SocialPostCardProps {
  post: SocialPost;
  currentUserId?: number;
  onLike?: (postId: string) => Promise<void>;
  onUnlike?: (postId: string) => Promise<void>;
  onSave?: (postId: string) => Promise<void>;
  onShare?: (post: SocialPost) => void;
  onComment?: (postId: string) => void;
  onAuthorClick?: (authorId: string) => void;
  onProductClick?: (productId: string) => void;
  showComments?: boolean;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

const SocialPostCard: React.FC<SocialPostCardProps> = ({
  post,
  currentUserId,
  onLike,
  onUnlike,
  onSave,
  onShare,
  onComment,
  onAuthorClick,
  onProductClick,
  showComments = true,
  showActions = true,
  variant = 'default',
  className = ''
}) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [saveCount, setSaveCount] = useState(post.saveCount);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const { toast } = useToast();

  const handleLikeToggle = async () => {
    if (!currentUserId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like posts",
        variant: "destructive"
      });
      return;
    }

    setIsLikeLoading(true);
    try {
      if (isLiked) {
        await onUnlike?.(post.id);
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        await onLike?.(post.id);
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!currentUserId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save posts",
        variant: "destructive"
      });
      return;
    }

    setIsSaveLoading(true);
    try {
      await onSave?.(post.id);
      setIsSaved(!isSaved);
      setSaveCount(prev => isSaved ? prev - 1 : prev + 1);
      toast({
        title: isSaved ? "Post Unsaved" : "Post Saved",
        description: isSaved ? "Removed from saved posts" : "Added to saved posts",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save post",
        variant: "destructive"
      });
    } finally {
      setIsSaveLoading(false);
    }
  };

  const handleShare = () => {
    onShare?.(post);
    if (navigator.share && post.mediaUrls.length > 0) {
      navigator.share({
        title: `${post.author.displayName} on GetIt`,
        text: post.content || 'Check out this post',
        url: `${window.location.origin}/posts/${post.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
      toast({
        title: "Link Copied",
        description: "Post link copied to clipboard",
      });
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString();
  };

  const getPostTypeIcon = () => {
    switch (post.postType) {
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'product_showcase':
        return <ShoppingBag className="w-4 h-4" />;
      case 'live':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'poll':
        return <Users className="w-4 h-4" />;
      case 'review':
        return <Star className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const renderMedia = () => {
    if (post.mediaUrls.length === 0) return null;

    const mediaCount = post.mediaUrls.length;
    const firstMedia = post.mediaUrls[0];
    const isVideo = post.postType === 'video' || firstMedia.includes('.mp4') || firstMedia.includes('.webm');

    if (isVideo) {
      return (
        <div className="relative">
          <video
            className="w-full rounded-lg max-h-96 object-cover"
            poster={post.thumbnailUrl}
            controls={isVideoPlaying}
            muted={isMuted}
            onClick={() => setIsVideoPlaying(!isVideoPlaying)}
          >
            <source src={firstMedia} type="video/mp4" />
          </video>
          {!isVideoPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
              <Button
                size="lg"
                variant="secondary"
                className="rounded-full bg-white/90 hover:bg-white"
                onClick={() => setIsVideoPlaying(true)}
              >
                <Play className="w-6 h-6" />
              </Button>
            </div>
          )}
          <div className="absolute top-2 right-2 flex space-x-2">
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      );
    }

    if (mediaCount === 1) {
      return (
        <div className="relative">
          <img
            src={firstMedia}
            alt="Post content"
            className="w-full rounded-lg max-h-96 object-cover"
          />
          {post.postType === 'product_showcase' && (
            <div className="absolute bottom-2 left-2">
              <Badge className="bg-black/70 text-white">
                <ShoppingBag className="w-3 h-3 mr-1" />
                Product Showcase
              </Badge>
            </div>
          )}
        </div>
      );
    }

    // Multiple images grid
    return (
      <div className={`grid gap-1 rounded-lg overflow-hidden ${
        mediaCount === 2 ? 'grid-cols-2' : 
        mediaCount === 3 ? 'grid-cols-2' : 
        'grid-cols-2'
      }`}>
        {post.mediaUrls.slice(0, 4).map((url, index) => (
          <div key={index} className="relative">
            <img
              src={url}
              alt={`Post content ${index + 1}`}
              className={`w-full object-cover ${
                mediaCount === 3 && index === 0 ? 'row-span-2 h-full' : 'h-32'
              }`}
            />
            {index === 3 && mediaCount > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold">+{mediaCount - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const displayName = post.author.displayName;
  const content = post.content;
  const location = post.locationTag;

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <Avatar 
            className="w-10 h-10 cursor-pointer" 
            onClick={() => onAuthorClick?.(post.authorId)}
          >
            <AvatarImage src={post.author.avatarUrl} alt={displayName} />
            <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 
                className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:underline"
                onClick={() => onAuthorClick?.(post.authorId)}
              >
                {displayName}
              </h4>
              {post.author.verificationStatus === 'verified' && (
                <Badge variant="secondary" className="text-xs">
                  ✓
                </Badge>
              )}
              {getPostTypeIcon()}
              {post.isSponsored && (
                <Badge variant="outline" className="text-xs text-blue-600 border-blue-600">
                  Sponsored
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{formatTimeAgo(post.publishedAt)}</span>
              {location && (
                <>
                  <span>•</span>
                  <MapPin className="w-3 h-3" />
                  <span>{location}</span>
                </>
              )}
              {post.visibility !== 'public' && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">
                    {post.visibility}
                  </Badge>
                </>
              )}
            </div>
          </div>
          
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Post Content */}
        {content && (
          <div>
            <p className="text-gray-900 dark:text-white leading-relaxed">
              {content}
            </p>
            
            {/* Hashtags */}
            {post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.hashtags.map((hashtag, index) => (
                  <span key={index} className="text-blue-600 hover:underline cursor-pointer">
                    #{hashtag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Media */}
        {renderMedia()}

        {/* Product Tags */}
        {post.productTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.productTags.map((productId, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onProductClick?.(productId)}
                className="text-xs"
              >
                <Tag className="w-3 h-3 mr-1" />
                View Product
              </Button>
            ))}
          </div>
        )}

        {/* User Tags */}
        {post.userTags.length > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            with {post.userTags.map((userId, index) => (
              <span key={index} className="text-blue-600 hover:underline cursor-pointer">
                @user{userId}{index < post.userTags.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="pt-0">
          <div className="w-full space-y-3">
            {/* Engagement Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>{formatNumber(likeCount)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{formatNumber(post.commentCount)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Share2 className="w-4 h-4" />
                  <span>{formatNumber(post.shareCount)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{formatNumber(post.viewCount)}</span>
                </div>
              </div>
              {saveCount > 0 && (
                <div className="flex items-center space-x-1">
                  <Bookmark className="w-4 h-4" />
                  <span>{formatNumber(saveCount)}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLikeToggle}
                  disabled={isLikeLoading}
                  className={isLiked ? 'text-red-500 hover:text-red-600' : ''}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  {isLiked ? 'Liked' : 'Like'}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onComment?.(post.id)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Comment
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveToggle}
                disabled={isSaveLoading}
                className={isSaved ? 'text-blue-500 hover:text-blue-600' : ''}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Recent Comments Preview */}
            {showComments && post.recentComments && post.recentComments.length > 0 && (
              <div className="space-y-2">
                <Separator />
                {post.recentComments.slice(0, 2).map((comment, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={comment.author?.avatarUrl} />
                      <AvatarFallback className="text-xs">
                        {comment.author?.displayName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                        <p className="text-sm">
                          <span className="font-semibold">{comment.author?.displayName}</span>
                          {' '}{comment.content}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                        <span>{formatTimeAgo(comment.createdAt)}</span>
                        <button className="hover:underline">Like</button>
                        <button className="hover:underline">Reply</button>
                      </div>
                    </div>
                  </div>
                ))}
                {post.commentCount > 2 && (
                  <button
                    className="text-sm text-gray-500 hover:underline"
                    onClick={() => onComment?.(post.id)}
                  >
                    View all {post.commentCount} comments
                  </button>
                )}
              </div>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default SocialPostCard;