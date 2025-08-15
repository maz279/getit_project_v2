// SocialCommerce.tsx - Amazon.com/Shopee.sg-Level Social Shopping Experience
import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Users, Heart, Share2, MessageCircle, Star, TrendingUp, Award, Crown, Gift, Zap, Clock, Eye, ShoppingCart, UserPlus } from 'lucide-react';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

interface SocialPost {
  id: string;
  user: {
    name: string;
    avatar: string;
    verified: boolean;
    followers: number;
    level: 'bronze' | 'silver' | 'gold' | 'platinum';
  };
  content: {
    text: string;
    images: string[];
    products: SocialProduct[];
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  timestamp: string;
  isSponsored: boolean;
  tags: string[];
}

interface SocialProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  discount?: number;
  inStock: boolean;
}

interface GroupBuy {
  id: string;
  title: string;
  product: {
    name: string;
    image: string;
    price: number;
    originalPrice: number;
  };
  progress: {
    current: number;
    target: number;
    discount: number;
  };
  timeLeft: string;
  participants: {
    count: number;
    avatars: string[];
  };
  creator: {
    name: string;
    avatar: string;
  };
}

interface Influencer {
  id: string;
  name: string;
  avatar: string;
  category: string;
  followers: number;
  engagement: number;
  verified: boolean;
  bio: string;
  recentPosts: number;
}

const SocialCommerce: React.FC = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [groupBuys, setGroupBuys] = useState<GroupBuy[]>([]);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [selectedTab, setSelectedTab] = useState<'feed' | 'group-buy' | 'influencers'>('feed');
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Social Commerce - Shop with Friends | GetIt Bangladesh',
    description: 'Discover products through social shopping, group buying, and influencer recommendations. Shop together, save together!',
    keywords: 'social commerce, group buying, influencer shopping, social shopping, community shopping, collaborative shopping'
  });

  useEffect(() => {
    // Mock data
    const mockPosts: SocialPost[] = [
      {
        id: '1',
        user: {
          name: 'FashionistaBD',
          avatar: '/users/fashionista.jpg',
          verified: true,
          followers: 45000,
          level: 'gold'
        },
        content: {
          text: 'Just got this amazing kurti set! The quality is incredible and the price is unbeatable. Perfect for Eid celebrations! 🌙✨ #EidFashion #KurtiLove',
          images: ['/posts/kurti-post-1.jpg', '/posts/kurti-post-2.jpg'],
          products: [
            {
              id: '1',
              name: 'Designer Eid Kurti Set',
              price: 2500,
              originalPrice: 3500,
              image: '/products/kurti-set.jpg',
              rating: 4.8,
              discount: 29,
              inStock: true
            }
          ]
        },
        engagement: {
          likes: 1240,
          comments: 89,
          shares: 56,
          views: 8500
        },
        timestamp: '2 hours ago',
        isSponsored: false,
        tags: ['Fashion', 'Eid', 'Kurti']
      },
      {
        id: '2',
        user: {
          name: 'TechReviewerBD',
          avatar: '/users/techreviewer.jpg',
          verified: true,
          followers: 125000,
          level: 'platinum'
        },
        content: {
          text: 'Unboxing the new Galaxy S24! The camera quality is mind-blowing 📱✨ Check out my full review link in bio. Amazing deal going on right now!',
          images: ['/posts/galaxy-unbox-1.jpg'],
          products: [
            {
              id: '2',
              name: 'Samsung Galaxy S24 Ultra',
              price: 115000,
              originalPrice: 135000,
              image: '/products/galaxy-s24.jpg',
              rating: 4.9,
              discount: 15,
              inStock: true
            }
          ]
        },
        engagement: {
          likes: 3450,
          comments: 234,
          shares: 189,
          views: 25000
        },
        timestamp: '4 hours ago',
        isSponsored: true,
        tags: ['Tech', 'Review', 'Samsung']
      }
    ];

    const mockGroupBuys: GroupBuy[] = [
      {
        id: '1',
        title: 'Eid Special: Premium Headphones',
        product: {
          name: 'Sony WH-1000XM5 Headphones',
          image: '/products/sony-headphones.jpg',
          price: 28000,
          originalPrice: 35000
        },
        progress: {
          current: 45,
          target: 100,
          discount: 20
        },
        timeLeft: '2 days 5 hours',
        participants: {
          count: 45,
          avatars: ['/users/user1.jpg', '/users/user2.jpg', '/users/user3.jpg']
        },
        creator: {
          name: 'AudioLover',
          avatar: '/users/audiolover.jpg'
        }
      },
      {
        id: '2',
        title: 'Home Fitness Equipment Bundle',
        product: {
          name: 'Complete Home Gym Set',
          image: '/products/gym-set.jpg',
          price: 15000,
          originalPrice: 20000
        },
        progress: {
          current: 23,
          target: 50,
          discount: 25
        },
        timeLeft: '5 days 12 hours',
        participants: {
          count: 23,
          avatars: ['/users/user4.jpg', '/users/user5.jpg']
        },
        creator: {
          name: 'FitnessGuru',
          avatar: '/users/fitness.jpg'
        }
      }
    ];

    const mockInfluencers: Influencer[] = [
      {
        id: '1',
        name: 'StyleIcon BD',
        avatar: '/influencers/styleicon.jpg',
        category: 'Fashion',
        followers: 250000,
        engagement: 8.5,
        verified: true,
        bio: 'Fashion enthusiast sharing daily style inspiration',
        recentPosts: 24
      },
      {
        id: '2',
        name: 'TechMaster',
        avatar: '/influencers/techmaster.jpg',
        category: 'Technology',
        followers: 180000,
        engagement: 12.3,
        verified: true,
        bio: 'Latest tech reviews and unboxings',
        recentPosts: 18
      }
    ];

    setPosts(mockPosts);
    setGroupBuys(mockGroupBuys);
    setInfluencers(mockInfluencers);
    setLoading(false);
  }, []);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'platinum': return <Crown className="h-4 w-4 text-purple-600" />;
      case 'gold': return <Award className="h-4 w-4 text-yellow-600" />;
      case 'silver': return <Star className="h-4 w-4 text-gray-500" />;
      default: return <Users className="h-4 w-4 text-orange-600" />;
    }
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, engagement: { ...post.engagement, likes: post.engagement.likes + 1 } }
        : post
    ));
  };

  const handleJoinGroupBuy = (groupBuyId: string) => {
    setGroupBuys(prev => prev.map(gb => 
      gb.id === groupBuyId 
        ? { 
            ...gb, 
            progress: { ...gb.progress, current: gb.progress.current + 1 },
            participants: { ...gb.participants, count: gb.participants.count + 1 }
          }
        : gb
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Loading social feed...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Social Commerce
          </h1>
          <p className="text-xl md:text-2xl mb-6 opacity-90">
            Shop with friends, discover through community, save together
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <Users className="h-4 w-4" />
              <span>50K+ Community Members</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <TrendingUp className="h-4 w-4" />
              <span>Group Discounts up to 40%</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <Award className="h-4 w-4" />
              <span>Verified Influencers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setSelectedTab('feed')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                selectedTab === 'feed'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Social Feed
            </button>
            <button
              onClick={() => setSelectedTab('group-buy')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                selectedTab === 'group-buy'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Group Buying
            </button>
            <button
              onClick={() => setSelectedTab('influencers')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                selectedTab === 'influencers'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Influencers
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Social Feed Tab */}
        {selectedTab === 'feed' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Post Header */}
                <div className="p-6 pb-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={post.user.avatar} 
                        alt={post.user.name}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `/api/placeholder/48/48?text=${post.user.name[0]}`;
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{post.user.name}</h3>
                          {post.user.verified && <Award className="h-4 w-4 text-blue-500" />}
                          {getLevelIcon(post.user.level)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{post.user.followers.toLocaleString()} followers</span>
                          <span>•</span>
                          <span>{post.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    {post.isSponsored && (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        Sponsored
                      </span>
                    )}
                  </div>

                  {/* Post Content */}
                  <p className="text-gray-900 mb-4">{post.content.text}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-purple-600 text-sm font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Post Images */}
                {post.content.images.length > 0 && (
                  <div className="px-6 pb-4">
                    <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
                      {post.content.images.map((image, index) => (
                        <img 
                          key={index}
                          src={image} 
                          alt={`Post image ${index + 1}`}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `/api/placeholder/300/200?text=Image`;
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Featured Products */}
                {post.content.products.length > 0 && (
                  <div className="px-6 pb-4">
                    <h4 className="font-medium text-gray-900 mb-3">Featured Products</h4>
                    <div className="space-y-3">
                      {post.content.products.map(product => (
                        <div key={product.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `/api/placeholder/64/64?text=${product.name}`;
                            }}
                          />
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 mb-1">{product.name}</h5>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg font-bold text-purple-600">৳{product.price.toLocaleString()}</span>
                              {product.originalPrice && (
                                <>
                                  <span className="text-sm text-gray-500 line-through">৳{product.originalPrice.toLocaleString()}</span>
                                  {product.discount && (
                                    <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs">
                                      -{product.discount}%
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-gray-600">{product.rating}</span>
                            </div>
                          </div>
                          <button 
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              product.inStock
                                ? 'bg-purple-600 text-white hover:bg-purple-700'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                            disabled={!product.inStock}
                          >
                            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Post Actions */}
                <div className="px-6 py-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <Heart className="h-5 w-5" />
                        <span>{post.engagement.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <MessageCircle className="h-5 w-5" />
                        <span>{post.engagement.comments}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                        <Share2 className="h-5 w-5" />
                        <span>{post.engagement.shares}</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Eye className="h-4 w-4" />
                      <span>{post.engagement.views.toLocaleString()} views</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Group Buying Tab */}
        {selectedTab === 'group-buy' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Group Buying</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Join with friends and community members to unlock amazing group discounts. The more people join, the bigger the savings!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupBuys.map(groupBuy => (
                <div key={groupBuy.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="relative">
                    <img 
                      src={groupBuy.product.image} 
                      alt={groupBuy.product.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `/api/placeholder/300/200?text=${groupBuy.product.name}`;
                      }}
                    />
                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      -{groupBuy.progress.discount}% OFF
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-2">{groupBuy.title}</h3>
                    <p className="text-gray-600 mb-4">{groupBuy.product.name}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-2xl font-bold text-purple-600">৳{groupBuy.product.price.toLocaleString()}</span>
                        <span className="text-sm text-gray-500 line-through ml-2">৳{groupBuy.product.originalPrice.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Time left</div>
                        <div className="font-medium text-red-600">{groupBuy.timeLeft}</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>{groupBuy.progress.current} joined</span>
                        <span>{groupBuy.progress.target} needed</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                          style={{ width: `${(groupBuy.progress.current / groupBuy.progress.target) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-center mt-2 text-sm text-gray-600">
                        {Math.round((groupBuy.progress.current / groupBuy.progress.target) * 100)}% completed
                      </div>
                    </div>

                    {/* Participants */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex -space-x-2">
                        {groupBuy.participants.avatars.slice(0, 3).map((avatar, index) => (
                          <img 
                            key={index}
                            src={avatar} 
                            alt={`Participant ${index + 1}`}
                            className="w-6 h-6 rounded-full border-2 border-white"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `/api/placeholder/24/24?text=U`;
                            }}
                          />
                        ))}
                        {groupBuy.participants.count > 3 && (
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium">
                            +{groupBuy.participants.count - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">
                        {groupBuy.participants.count} participants
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>Created by {groupBuy.creator.name}</span>
                    </div>

                    <button 
                      onClick={() => handleJoinGroupBuy(groupBuy.id)}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Join Group Buy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Influencers Tab */}
        {selectedTab === 'influencers' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Top Influencers</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Follow your favorite content creators and discover products through their authentic reviews and recommendations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {influencers.map(influencer => (
                <div key={influencer.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="p-6 text-center">
                    <div className="relative mb-4">
                      <img 
                        src={influencer.avatar} 
                        alt={influencer.name}
                        className="w-20 h-20 rounded-full object-cover mx-auto"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `/api/placeholder/80/80?text=${influencer.name[0]}`;
                        }}
                      />
                      {influencer.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full">
                          <Award className="h-3 w-3" />
                        </div>
                      )}
                    </div>

                    <h3 className="font-bold text-gray-900 mb-1">{influencer.name}</h3>
                    <p className="text-purple-600 text-sm font-medium mb-2">{influencer.category}</p>
                    <p className="text-gray-600 text-sm mb-4">{influencer.bio}</p>

                    <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                      <div>
                        <div className="font-bold text-lg">{(influencer.followers / 1000).toFixed(0)}K</div>
                        <div className="text-xs text-gray-600">Followers</div>
                      </div>
                      <div>
                        <div className="font-bold text-lg">{influencer.engagement}%</div>
                        <div className="text-xs text-gray-600">Engagement</div>
                      </div>
                      <div>
                        <div className="font-bold text-lg">{influencer.recentPosts}</div>
                        <div className="text-xs text-gray-600">Posts</div>
                      </div>
                    </div>

                    <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Follow
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SocialCommerce;