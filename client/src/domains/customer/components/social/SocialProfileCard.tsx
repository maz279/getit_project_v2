/**
 * Social Profile Card - Amazon.com/Shopee.sg Level Social Profile Component
 * Professional social profile display with Bangladesh cultural integration
 * 
 * @fileoverview Enterprise-grade social profile card with complete feature set
 * @author GetIt Platform Team
 * @version 4.0.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Users, 
  Star, 
  MapPin, 
  Calendar,
  Badge,
  Camera,
  Settings,
  UserPlus,
  UserMinus,
  Gift,
  Award,
  Globe,
  Shield
} from 'lucide-react';
import { Button } from '../../../shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../shared/components/ui/avatar';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/card';
import { Badge as BadgeComponent } from '../../../shared/components/ui/badge';
import { Separator } from '../../../shared/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';
import { useToast } from '../../../shared/hooks/use-toast';

interface SocialProfile {
  id: string;
  userId: number;
  displayName: string;
  displayNameBn?: string;
  bio?: string;
  bioBn?: string;
  avatarUrl?: string;
  coverUrl?: string;
  followerCount: number;
  followingCount: number;
  totalLikes: number;
  totalShares: number;
  totalPosts: number;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  profileType: 'customer' | 'influencer' | 'vendor' | 'admin';
  location?: string;
  locationBn?: string;
  language: string;
  interests: string[];
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    twitter?: string;
    website?: string;
  };
  isFollowing?: boolean;
  mutualFollowers?: number;
  recentPosts?: any[];
  createdAt: string;
}

interface SocialProfileCardProps {
  profile: SocialProfile;
  currentUserId?: number;
  onFollow?: (profileId: string) => Promise<void>;
  onUnfollow?: (profileId: string) => Promise<void>;
  onMessage?: (profileId: string) => void;
  onShare?: (profile: SocialProfile) => void;
  variant?: 'compact' | 'detailed' | 'mini';
  showActions?: boolean;
  showStats?: boolean;
  showBio?: boolean;
  showInterests?: boolean;
  showSocialLinks?: boolean;
  className?: string;
}

const SocialProfileCard: React.FC<SocialProfileCardProps> = ({
  profile,
  currentUserId,
  onFollow,
  onUnfollow,
  onMessage,
  onShare,
  variant = 'detailed',
  showActions = true,
  showStats = true,
  showBio = true,
  showInterests = true,
  showSocialLinks = true,
  className = ''
}) => {
  const [isFollowing, setIsFollowing] = useState(profile.isFollowing || false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(profile.followerCount);
  const { toast } = useToast();

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!currentUserId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to follow users",
        variant: "destructive"
      });
      return;
    }

    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await onUnfollow?.(profile.id);
        setIsFollowing(false);
        setFollowerCount(prev => prev - 1);
        toast({
          title: "Unfollowed",
          description: `You unfollowed ${profile.displayName}`,
        });
      } else {
        await onFollow?.(profile.id);
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
        toast({
          title: "Following",
          description: `You are now following ${profile.displayName}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleShare = () => {
    onShare?.(profile);
    // Implement share functionality (social media, copy link, etc.)
    if (navigator.share) {
      navigator.share({
        title: `${profile.displayName} on GetIt`,
        text: profile.bio || `Check out ${profile.displayName}'s profile`,
        url: `${window.location.origin}/profiles/${profile.id}`
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/profiles/${profile.id}`);
      toast({
        title: "Link Copied",
        description: "Profile link copied to clipboard",
      });
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getVerificationIcon = () => {
    switch (profile.verificationStatus) {
      case 'verified':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <Badge className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getProfileTypeColor = () => {
    switch (profile.profileType) {
      case 'influencer':
        return 'bg-gradient-to-r from-pink-500 to-violet-500';
      case 'vendor':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'admin':
        return 'bg-gradient-to-r from-red-500 to-orange-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-700';
    }
  };

  // Language-aware display
  const displayName = profile.language === 'bn' && profile.displayNameBn 
    ? profile.displayNameBn 
    : profile.displayName;
  
  const bio = profile.language === 'bn' && profile.bioBn 
    ? profile.bioBn 
    : profile.bio;
  
  const location = profile.language === 'bn' && profile.locationBn 
    ? profile.locationBn 
    : profile.location;

  if (variant === 'mini') {
    return (
      <div className={`flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border ${className}`}>
        <Avatar className="w-10 h-10">
          <AvatarImage src={profile.avatarUrl} alt={displayName} />
          <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {displayName}
            </h4>
            {getVerificationIcon()}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatNumber(followerCount)} followers
          </p>
        </div>
        {showActions && currentUserId !== profile.userId && (
          <Button
            size="sm"
            variant={isFollowing ? "outline" : "default"}
            onClick={handleFollowToggle}
            disabled={isFollowLoading}
            className="text-xs"
          >
            {isFollowing ? <UserMinus className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={`w-full max-w-sm ${className}`}>
        <CardHeader className="pb-3">
          <div className="relative">
            {profile.coverUrl && (
              <div 
                className={`h-20 w-full rounded-t-lg ${getProfileTypeColor()}`}
                style={{
                  backgroundImage: `url(${profile.coverUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            )}
            <Avatar className="w-16 h-16 border-4 border-white dark:border-gray-800 absolute -bottom-8 left-4">
              <AvatarImage src={profile.avatarUrl} alt={displayName} />
              <AvatarFallback className="text-lg">{displayName.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="space-y-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {displayName}
                </h3>
                {getVerificationIcon()}
                <BadgeComponent variant="secondary" className="text-xs">
                  {profile.profileType}
                </BadgeComponent>
              </div>
              {location && (
                <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="w-3 h-3" />
                  <span>{location}</span>
                </div>
              )}
            </div>

            {showBio && bio && (
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {bio}
              </p>
            )}

            {showStats && (
              <div className="flex justify-between text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatNumber(followerCount)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Followers</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatNumber(profile.followingCount)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Following</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatNumber(profile.totalPosts)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Posts</div>
                </div>
              </div>
            )}

            {showActions && currentUserId !== profile.userId && (
              <div className="flex space-x-2">
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  className="flex-1"
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4 mr-2" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => onMessage?.(profile.id)}>
                  <MessageCircle className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Detailed variant
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="relative">
          <div 
            className={`h-32 w-full rounded-t-lg ${getProfileTypeColor()}`}
            style={{
              backgroundImage: profile.coverUrl ? `url(${profile.coverUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <Avatar className="w-20 h-20 border-4 border-white dark:border-gray-800 absolute -bottom-10 left-6">
            <AvatarImage src={profile.avatarUrl} alt={displayName} />
            <AvatarFallback className="text-2xl">{displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          {currentUserId === profile.userId && (
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90"
            >
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-10">
        <div className="space-y-6">
          {/* Profile Info */}
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {displayName}
              </h1>
              {getVerificationIcon()}
              <BadgeComponent variant="secondary">
                {profile.profileType}
              </BadgeComponent>
              {profile.profileType === 'influencer' && (
                <BadgeComponent variant="outline" className="text-pink-600 border-pink-600">
                  <Award className="w-3 h-3 mr-1" />
                  Influencer
                </BadgeComponent>
              )}
            </div>
            
            {location && (
              <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 mb-2">
                <MapPin className="w-4 h-4" />
                <span>{location}</span>
                <Globe className="w-4 h-4 ml-2" />
                <span className="uppercase text-xs">{profile.language}</span>
              </div>
            )}

            {profile.mutualFollowers && profile.mutualFollowers > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Followed by {profile.mutualFollowers} people you follow
              </p>
            )}
          </div>

          {/* Bio */}
          {showBio && bio && (
            <div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {bio}
              </p>
            </div>
          )}

          {/* Stats */}
          {showStats && (
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(followerCount)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(profile.followingCount)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Following</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(profile.totalPosts)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Posts</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(profile.totalLikes)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Likes</div>
              </div>
            </div>
          )}

          {/* Interests */}
          {showInterests && profile.interests.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <BadgeComponent key={index} variant="outline" className="text-xs">
                    {interest}
                  </BadgeComponent>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {showSocialLinks && profile.socialLinks && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Social Links
              </h3>
              <div className="flex space-x-3">
                {profile.socialLinks.facebook && (
                  <a 
                    href={profile.socialLinks.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Facebook
                  </a>
                )}
                {profile.socialLinks.instagram && (
                  <a 
                    href={profile.socialLinks.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-800"
                  >
                    Instagram
                  </a>
                )}
                {profile.socialLinks.youtube && (
                  <a 
                    href={profile.socialLinks.youtube} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-800"
                  >
                    YouTube
                  </a>
                )}
                {profile.socialLinks.website && (
                  <a 
                    href={profile.socialLinks.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Website
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && currentUserId !== profile.userId && (
            <div className="flex space-x-3">
              <Button
                variant={isFollowing ? "outline" : "default"}
                onClick={handleFollowToggle}
                disabled={isFollowLoading}
                className="flex-1"
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4 mr-2" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => onMessage?.(profile.id)}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="icon">
                <Gift className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Member Since */}
          <Separator />
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>
              Member since {new Date(profile.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialProfileCard;