/**
 * Phase 3: Advocate Stage - Community Builder
 * Amazon.com 5 A's Framework Implementation
 * Social Community Platform with Cultural Integration
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Share2,
  Trophy,
  Star,
  Crown,
  ThumbsUp,
  Eye,
  Calendar,
  MapPin,
  Award,
  Target,
  Gift,
  Zap,
  TrendingUp,
  Camera,
  Video,
  Mic,
  Send,
  Flag,
  CheckCircle,
  Clock,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommunityBuilderProps {
  userId?: string;
  className?: string;
}

interface CommunityData {
  user: CommunityUser;
  communities: Community[];
  posts: CommunityPost[];
  events: CommunityEvent[];
  challenges: CommunityChallenge[];
  leaderboard: CommunityLeader[];
  culturalGroups: CulturalGroup[];
  notifications: CommunityNotification[];
}

interface CommunityUser {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  location: string;
  joinDate: string;
  reputation: number;
  level: number;
  badges: UserBadge[];
  following: number;
  followers: number;
  postsCount: number;
  communitiesJoined: number;
}

interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  members: number;
  posts: number;
  image: string;
  isJoined: boolean;
  moderators: string[];
  tags: string[];
  culturalFocus?: string;
  language: string;
  privacy: 'public' | 'private' | 'invite-only';
}

interface CommunityPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    badges: string[];
    verified: boolean;
  };
  community: string;
  content: string;
  images?: string[];
  video?: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  tags: string[];
  liked: boolean;
  saved: boolean;
  type: 'text' | 'image' | 'video' | 'poll' | 'event';
  engagement: {
    views: number;
    reactions: number;
    discussions: number;
  };
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  organizer: string;
  community: string;
  startDate: string;
  endDate: string;
  location: string;
  type: 'online' | 'offline' | 'hybrid';
  attendees: number;
  maxAttendees?: number;
  isAttending: boolean;
  category: 'cultural' | 'shopping' | 'educational' | 'social';
  tags: string[];
  image: string;
}

interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  participants: number;
  prize: string;
  rules: string[];
  progress: number;
  maxProgress: number;
  isParticipating: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface CommunityLeader {
  rank: number;
  user: {
    id: string;
    name: string;
    avatar: string;
    badges: string[];
  };
  points: number;
  contributions: number;
  category: string;
  isCurrentUser?: boolean;
}

interface CulturalGroup {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  members: number;
  category: 'regional' | 'religious' | 'ethnic' | 'linguistic';
  location: string;
  language: string;
  moderators: string[];
  recentActivity: string;
  isJoined: boolean;
}

interface CommunityNotification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'event' | 'achievement';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const CommunityBuilder: React.FC<CommunityBuilderProps> = ({
  userId,
  className,
}) => {
  const [communityData, setCommunityData] = useState<CommunityData | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'communities' | 'events' | 'challenges'>('feed');
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load community data
    const loadCommunityData = () => {
      const mockData: CommunityData = {
        user: {
          id: userId || 'user1',
          name: 'Ahmed Rahman',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
          bio: 'Tech enthusiast and community builder from Dhaka. Love exploring new gadgets and sharing experiences!',
          location: 'Dhaka, Bangladesh',
          joinDate: '2023-05-15',
          reputation: 1450,
          level: 7,
          badges: [
            {
              id: 'early-adopter',
              name: 'Early Adopter',
              description: 'Joined in the first month',
              icon: '🚀',
              earnedDate: '2023-05-15',
              rarity: 'rare'
            },
            {
              id: 'helpful-contributor',
              name: 'Helpful Contributor',
              description: 'Received 100+ helpful votes',
              icon: '🤝',
              earnedDate: '2024-03-20',
              rarity: 'epic'
            },
            {
              id: 'community-builder',
              name: 'Community Builder',
              description: 'Created 5 successful community posts',
              icon: '🏗️',
              earnedDate: '2024-08-10',
              rarity: 'legendary'
            }
          ],
          following: 156,
          followers: 234,
          postsCount: 47,
          communitiesJoined: 12
        },
        communities: [
          {
            id: 'tech-enthusiasts',
            name: 'Tech Enthusiasts BD',
            description: 'Discuss latest technology trends, gadgets, and innovations in Bangladesh',
            category: 'Technology',
            members: 12500,
            posts: 3450,
            image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300',
            isJoined: true,
            moderators: ['tech_guru_bd', 'gadget_expert'],
            tags: ['technology', 'gadgets', 'innovation', 'bangladesh'],
            language: 'Bengali/English',
            privacy: 'public'
          },
          {
            id: 'dhaka-shoppers',
            name: 'Dhaka Smart Shoppers',
            description: 'Best deals, shopping tips, and product recommendations for Dhaka residents',
            category: 'Shopping',
            members: 8900,
            posts: 2150,
            image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300',
            isJoined: true,
            moderators: ['shopping_expert', 'deal_hunter'],
            tags: ['shopping', 'deals', 'dhaka', 'recommendations'],
            language: 'Bengali/English',
            privacy: 'public'
          },
          {
            id: 'bengali-culture',
            name: 'Bengali Cultural Heritage',
            description: 'Celebrating and preserving Bengali culture, traditions, and festivals',
            category: 'Culture',
            members: 15600,
            posts: 5200,
            image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300',
            isJoined: false,
            moderators: ['culture_keeper', 'heritage_lover'],
            tags: ['culture', 'bengali', 'traditions', 'festivals'],
            culturalFocus: 'Bengali',
            language: 'Bengali',
            privacy: 'public'
          },
          {
            id: 'gaming-community',
            name: 'Bangladesh Gaming Hub',
            description: 'Connect with fellow gamers, discuss latest games, and organize tournaments',
            category: 'Gaming',
            members: 7800,
            posts: 1890,
            image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300',
            isJoined: true,
            moderators: ['game_master', 'esports_pro'],
            tags: ['gaming', 'esports', 'tournaments', 'bangladesh'],
            language: 'English',
            privacy: 'public'
          }
        ],
        posts: [
          {
            id: 'post1',
            author: {
              id: 'tech_guru_bd',
              name: 'Rashid Hassan',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50',
              badges: ['Tech Expert', 'Community Leader'],
              verified: true
            },
            community: 'Tech Enthusiasts BD',
            content: 'Just got my hands on the new gaming headset! The sound quality is absolutely incredible. Perfect for both gaming and music. Highly recommend for fellow tech enthusiasts! 🎧',
            images: ['https://images.unsplash.com/photo-1599669454699-248893623440?w=400'],
            likes: 89,
            comments: 23,
            shares: 12,
            timestamp: '2 hours ago',
            tags: ['gaming', 'headset', 'review'],
            liked: false,
            saved: false,
            type: 'image',
            engagement: {
              views: 1250,
              reactions: 89,
              discussions: 23
            }
          },
          {
            id: 'post2',
            author: {
              id: 'shopping_expert',
              name: 'Fatima Begum',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c371?w=50',
              badges: ['Shopping Guru', 'Deal Hunter'],
              verified: true
            },
            community: 'Dhaka Smart Shoppers',
            content: 'Flash sale alert! 🚨 Amazing discounts on electronics this weekend. I already grabbed a smartphone at 40% off. Don\'t miss out!',
            likes: 156,
            comments: 45,
            shares: 28,
            timestamp: '4 hours ago',
            tags: ['deals', 'flash-sale', 'electronics'],
            liked: true,
            saved: true,
            type: 'text',
            engagement: {
              views: 2100,
              reactions: 156,
              discussions: 45
            }
          },
          {
            id: 'post3',
            author: {
              id: 'culture_keeper',
              name: 'Aminul Islam',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50',
              badges: ['Cultural Ambassador', 'Heritage Keeper'],
              verified: false
            },
            community: 'Bengali Cultural Heritage',
            content: 'Beautiful celebration of Pohela Boishakh in Old Dhaka! The traditional procession was amazing. Sharing some photos from the event. 🎊',
            images: [
              'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
              'https://images.unsplash.com/photo-1583743089695-4b816a340f82?w=400'
            ],
            likes: 234,
            comments: 67,
            shares: 34,
            timestamp: '1 day ago',
            tags: ['pohela-boishakh', 'culture', 'celebration'],
            liked: false,
            saved: false,
            type: 'image',
            engagement: {
              views: 3400,
              reactions: 234,
              discussions: 67
            }
          }
        ],
        events: [
          {
            id: 'event1',
            title: 'Tech Meetup Dhaka 2025',
            description: 'Join fellow tech enthusiasts for networking, talks, and latest technology demonstrations',
            organizer: 'Tech Enthusiasts BD',
            community: 'tech-enthusiasts',
            startDate: '2025-01-15',
            endDate: '2025-01-15',
            location: 'Dhaka University Campus',
            type: 'offline',
            attendees: 89,
            maxAttendees: 150,
            isAttending: true,
            category: 'educational',
            tags: ['technology', 'networking', 'meetup'],
            image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300'
          },
          {
            id: 'event2',
            title: 'Bengali New Year Celebration',
            description: 'Virtual celebration of Pohela Boishakh with cultural performances and traditional activities',
            organizer: 'Bengali Cultural Heritage',
            community: 'bengali-culture',
            startDate: '2025-04-14',
            endDate: '2025-04-14',
            location: 'Online Event',
            type: 'online',
            attendees: 234,
            isAttending: false,
            category: 'cultural',
            tags: ['pohela-boishakh', 'culture', 'celebration'],
            image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300'
          },
          {
            id: 'event3',
            title: 'Gaming Tournament 2025',
            description: 'Competitive gaming tournament with prizes for winners. Multiple game categories.',
            organizer: 'Bangladesh Gaming Hub',
            community: 'gaming-community',
            startDate: '2025-02-20',
            endDate: '2025-02-22',
            location: 'Hybrid Event',
            type: 'hybrid',
            attendees: 156,
            maxAttendees: 200,
            isAttending: true,
            category: 'social',
            tags: ['gaming', 'tournament', 'competition'],
            image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300'
          }
        ],
        challenges: [
          {
            id: 'challenge1',
            title: 'Community Contributor Challenge',
            description: 'Share 10 helpful posts this month and earn exclusive badges',
            category: 'engagement',
            startDate: '2024-12-01',
            endDate: '2024-12-31',
            participants: 234,
            prize: 'Exclusive Community Leader badge + 1000 points',
            rules: [
              'Post must be helpful and relevant',
              'Minimum 50 words per post',
              'Must receive at least 5 likes',
              'Posts in any joined community count'
            ],
            progress: 7,
            maxProgress: 10,
            isParticipating: true,
            difficulty: 'medium'
          },
          {
            id: 'challenge2',
            title: 'Cultural Heritage Week',
            description: 'Share stories about Bengali culture and traditions',
            category: 'cultural',
            startDate: '2024-12-10',
            endDate: '2024-12-16',
            participants: 156,
            prize: 'Cultural Ambassador badge + Feature on homepage',
            rules: [
              'Share authentic cultural content',
              'Include photos or videos',
              'Write in Bengali or English',
              'Respect cultural sensitivity'
            ],
            progress: 2,
            maxProgress: 5,
            isParticipating: false,
            difficulty: 'easy'
          }
        ],
        leaderboard: [
          {
            rank: 1,
            user: {
              id: 'top_contributor',
              name: 'Rashida Khanom',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c371?w=50',
              badges: ['Community Leader', 'Expert Contributor']
            },
            points: 5670,
            contributions: 89,
            category: 'Overall'
          },
          {
            rank: 2,
            user: {
              id: 'tech_expert',
              name: 'Karim Hassan',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50',
              badges: ['Tech Expert', 'Helpful Member']
            },
            points: 4890,
            contributions: 76,
            category: 'Technology'
          },
          {
            rank: 8,
            user: {
              id: 'user1',
              name: 'Ahmed Rahman',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50',
              badges: ['Active Member', 'Helpful Contributor']
            },
            points: 1450,
            contributions: 47,
            category: 'Overall',
            isCurrentUser: true
          }
        ],
        culturalGroups: [
          {
            id: 'dhaka-cultural',
            name: 'ঢাকা সাংস্কৃতিক গোষ্ঠী',
            nameEn: 'Dhaka Cultural Group',
            description: 'Preserving and promoting Dhaka\'s rich cultural heritage',
            members: 3456,
            category: 'regional',
            location: 'Dhaka',
            language: 'Bengali',
            moderators: ['cultural_admin', 'heritage_keeper'],
            recentActivity: '2 hours ago',
            isJoined: true
          },
          {
            id: 'islamic-community',
            name: 'ইসলামিক সম্প্রদায়',
            nameEn: 'Islamic Community',
            description: 'Islamic discussions, events, and community support',
            members: 8900,
            category: 'religious',
            location: 'Bangladesh',
            language: 'Bengali/Arabic',
            moderators: ['imam_saheb', 'community_leader'],
            recentActivity: '1 hour ago',
            isJoined: false
          }
        ],
        notifications: [
          {
            id: 'notif1',
            type: 'like',
            title: 'New Like',
            message: 'Rashid Hassan liked your post about gaming headsets',
            timestamp: '5 minutes ago',
            read: false
          },
          {
            id: 'notif2',
            type: 'comment',
            title: 'New Comment',
            message: 'Fatima Begum commented on your shopping post',
            timestamp: '1 hour ago',
            read: false
          },
          {
            id: 'notif3',
            type: 'achievement',
            title: 'Achievement Unlocked',
            message: 'You earned the "Helpful Contributor" badge!',
            timestamp: '2 hours ago',
            read: true
          }
        ]
      };

      setTimeout(() => {
        setCommunityData(mockData);
        setLoading(false);
      }, 1000);
    };

    loadCommunityData();
  }, [userId]);

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    
    // Simulate post creation
    setTimeout(() => {
      alert('Post created successfully!');
      setNewPostContent('');
    }, 1000);
  };

  const handleJoinCommunity = (communityId: string) => {
    // Simulate joining community
    setTimeout(() => {
      alert('Successfully joined the community!');
    }, 500);
  };

  const handleLikePost = (postId: string) => {
    // Simulate liking post
    console.log('Liked post:', postId);
  };

  if (loading) {
    return (
      <div className={cn('max-w-6xl mx-auto p-6', className)}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!communityData) {
    return (
      <div className={cn('max-w-6xl mx-auto p-6', className)}>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Community Unavailable</h3>
            <p className="text-muted-foreground">
              Unable to load community information.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('max-w-6xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-500" />
          Community Hub
        </h1>
        <p className="text-muted-foreground">
          Connect with fellow shoppers, share experiences, and build meaningful relationships
        </p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {communityData.user.reputation.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Reputation Points</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {communityData.user.followers}
            </div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {communityData.user.postsCount}
            </div>
            <div className="text-sm text-muted-foreground">Posts Created</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-50 to-red-50">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {communityData.user.badges.length}
            </div>
            <div className="text-sm text-muted-foreground">Badges Earned</div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          {(['feed', 'communities', 'events', 'challenges'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm capitalize',
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {/* Create Post */}
            <Card>
              <CardHeader>
                <CardTitle>Share with Community</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={communityData.user.avatar} />
                    <AvatarFallback>{communityData.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="What's on your mind? Share your thoughts, experiences, or questions..."
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="min-h-20"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-1" />
                      Photo
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="h-4 w-4 mr-1" />
                      Video
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      Event
                    </Button>
                  </div>
                  <Button 
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim()}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Post
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Community Posts */}
            <div className="space-y-6">
              {communityData.posts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{post.author.name}</h4>
                          {post.author.verified && (
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          )}
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{post.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-sm text-blue-600">{post.community}</span>
                          {post.author.badges.slice(0, 2).map((badge) => (
                            <Badge key={badge} variant="outline" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm leading-relaxed">{post.content}</p>
                      {post.images && (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {post.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt="Post image"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {post.engagement.views}
                        </span>
                        <span>{post.likes} likes</span>
                        <span>{post.comments} comments</span>
                        <span>{post.shares} shares</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikePost(post.id)}
                        className={post.liked ? 'text-red-500' : ''}
                      >
                        <Heart className={cn('h-4 w-4 mr-1', post.liked && 'fill-current')} />
                        Like
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Comment
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Flag className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {/* User Profile Summary */}
            <Card>
              <CardContent className="p-6 text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={communityData.user.avatar} />
                  <AvatarFallback>{communityData.user.name[0]}</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">{communityData.user.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">Level {communityData.user.level} Member</p>
                <p className="text-xs text-muted-foreground mb-4">{communityData.user.bio}</p>
                <div className="flex items-center justify-center gap-1 mb-4">
                  <MapPin className="h-3 w-3" />
                  <span className="text-xs">{communityData.user.location}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="font-semibold">{communityData.user.following}</div>
                    <div className="text-xs text-muted-foreground">Following</div>
                  </div>
                  <div>
                    <div className="font-semibold">{communityData.user.followers}</div>
                    <div className="text-xs text-muted-foreground">Followers</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Communities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Popular Communities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {communityData.communities.slice(0, 3).map((community) => (
                    <div key={community.id} className="flex items-center gap-3">
                      <img
                        src={community.image}
                        alt={community.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{community.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {community.members.toLocaleString()} members
                        </p>
                      </div>
                      {!community.isJoined && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleJoinCommunity(community.id)}
                        >
                          Join
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cultural Groups */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cultural Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {communityData.culturalGroups.map((group) => (
                    <div key={group.id} className="p-3 bg-muted/50 rounded-lg">
                      <h4 className="font-medium text-sm">{group.nameEn}</h4>
                      <p className="text-xs text-muted-foreground">{group.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {group.members.toLocaleString()} members
                        </span>
                        {!group.isJoined && (
                          <Button size="sm" variant="outline">
                            Join
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'communities' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Discover Communities</h2>
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Create Community
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityData.communities.map((community) => (
              <Card key={community.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <img
                    src={community.image}
                    alt={community.name}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{community.name}</h3>
                      <Badge variant="outline">{community.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{community.description}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span>{community.members.toLocaleString()} members</span>
                      <span>{community.posts} posts</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {community.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      className="w-full"
                      variant={community.isJoined ? 'secondary' : 'default'}
                      onClick={() => !community.isJoined && handleJoinCommunity(community.id)}
                    >
                      {community.isJoined ? 'Joined' : 'Join Community'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Community Events</h2>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {communityData.events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={event.type === 'online' ? 'default' : 'secondary'}>
                        {event.type}
                      </Badge>
                      <Badge variant="outline">{event.category}</Badge>
                    </div>
                    <h3 className="font-semibold mb-2">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                    <div className="space-y-2 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{event.startDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{event.attendees} attending</span>
                        {event.maxAttendees && <span>/ {event.maxAttendees} max</span>}
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      variant={event.isAttending ? 'secondary' : 'default'}
                    >
                      {event.isAttending ? 'Attending' : 'Attend Event'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold mb-2">Community Challenges</h2>
            <p className="text-muted-foreground">
              Participate in challenges to earn badges, points, and recognition
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {communityData.challenges.map((challenge) => (
              <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{challenge.title}</h3>
                    <Badge variant={
                      challenge.difficulty === 'easy' ? 'secondary' :
                      challenge.difficulty === 'medium' ? 'default' : 'destructive'
                    }>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{challenge.description}</p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{challenge.progress}/{challenge.maxProgress}</span>
                    </div>
                    <Progress value={(challenge.progress / challenge.maxProgress) * 100} />
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{challenge.participants} participants</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Ends {challenge.endDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span>{challenge.prize}</span>
                    </div>
                  </div>
                  
                  <Button
                    className="w-full"
                    variant={challenge.isParticipating ? 'secondary' : 'default'}
                  >
                    {challenge.isParticipating ? 'Participating' : 'Join Challenge'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityBuilder;