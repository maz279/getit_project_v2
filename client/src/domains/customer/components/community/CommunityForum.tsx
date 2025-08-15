import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Reply, 
  Flag, 
  Pin, 
  Clock,
  User,
  Star,
  Filter,
  Search,
  Plus,
  Eye,
  TrendingUp,
  HelpCircle,
  ShoppingBag,
  Users,
  Award,
  CheckCircle
} from 'lucide-react';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    badge?: string;
    reputation: number;
  };
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  dislikes: number;
  replies: number;
  views: number;
  isPinned: boolean;
  isSolved: boolean;
  isLocked: boolean;
}

interface ForumReply {
  id: string;
  postId: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    badge?: string;
    reputation: number;
  };
  createdAt: Date;
  likes: number;
  dislikes: number;
  isAcceptedAnswer: boolean;
}

export const CommunityForum: React.FC = () => {
  const [activeTab, setActiveTab] = useState('recent');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  });

  const categories = [
    { id: 'all', name: 'All Categories', icon: MessageSquare, count: 1247 },
    { id: 'product_help', name: 'Product Help', icon: HelpCircle, count: 342 },
    { id: 'reviews', name: 'Reviews & Ratings', icon: Star, count: 189 },
    { id: 'shopping_tips', name: 'Shopping Tips', icon: ShoppingBag, count: 156 },
    { id: 'general', name: 'General Discussion', icon: Users, count: 298 },
    { id: 'marketplace', name: 'Marketplace Talk', icon: TrendingUp, count: 124 },
    { id: 'technical', name: 'Technical Support', icon: Award, count: 138 }
  ];

  const [forumPosts] = useState<ForumPost[]>([
    {
      id: '1',
      title: 'Best budget smartphones under ৳25,000?',
      content: 'Looking for recommendations for a good smartphone under 25k budget. Camera quality is important for me. Any suggestions?',
      author: {
        id: 'user1',
        name: 'Rahul Hassan',
        avatar: '/api/placeholder/40/40',
        badge: 'Top Contributor',
        reputation: 1250
      },
      category: 'product_help',
      tags: ['smartphones', 'budget', 'recommendations'],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000),
      likes: 24,
      dislikes: 2,
      replies: 18,
      views: 342,
      isPinned: false,
      isSolved: true,
      isLocked: false
    },
    {
      id: '2',
      title: 'How to track my order properly?',
      content: 'Ordered a laptop 3 days ago but tracking shows no updates. Is this normal? What should I do?',
      author: {
        id: 'user2',
        name: 'Fatima Ahmed',
        avatar: '/api/placeholder/40/40',
        badge: 'Verified Buyer',
        reputation: 890
      },
      category: 'technical',
      tags: ['shipping', 'tracking', 'help'],
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      likes: 15,
      dislikes: 0,
      replies: 12,
      views: 189,
      isPinned: false,
      isSolved: false,
      isLocked: false
    },
    {
      id: '3',
      title: 'Flash Sale Strategy - How to get the best deals',
      content: 'Sharing my experience on how to successfully grab items during flash sales. Here are my top tips...',
      author: {
        id: 'user3',
        name: 'Mohammad Khan',
        avatar: '/api/placeholder/40/40',
        badge: 'Deal Hunter',
        reputation: 2150
      },
      category: 'shopping_tips',
      tags: ['flash-sale', 'deals', 'tips', 'strategy'],
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 67,
      dislikes: 3,
      replies: 29,
      views: 528,
      isPinned: true,
      isSolved: false,
      isLocked: false
    },
    {
      id: '4',
      title: 'Samsung Galaxy S24 Ultra Review - 3 months later',
      content: 'After using the S24 Ultra for 3 months, here\'s my detailed review covering camera, battery, performance...',
      author: {
        id: 'user4',
        name: 'Ayesha Rahman',
        avatar: '/api/placeholder/40/40',
        badge: 'Expert Reviewer',
        reputation: 3200
      },
      category: 'reviews',
      tags: ['samsung', 'review', 'smartphone', 'long-term'],
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      likes: 156,
      dislikes: 8,
      replies: 42,
      views: 1247,
      isPinned: false,
      isSolved: false,
      isLocked: false
    }
  ]);

  const filteredPosts = forumPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const sortedPosts = filteredPosts.sort((a, b) => {
    if (activeTab === 'recent') {
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    } else if (activeTab === 'popular') {
      return b.likes - a.likes;
    } else if (activeTab === 'unanswered') {
      return a.replies - b.replies;
    }
    return 0;
  });

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    
    // Simulate post creation
    console.log('Creating new post:', newPost);
    setNewPost({ title: '', content: '', category: '', tags: '' });
    setShowNewPostForm(false);
  };

  const getAuthorBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'Top Contributor':
        return 'bg-purple-100 text-purple-800';
      case 'Expert Reviewer':
        return 'bg-blue-100 text-blue-800';
      case 'Deal Hunter':
        return 'bg-orange-100 text-orange-800';
      case 'Verified Buyer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const renderPostCard = (post: ForumPost) => (
    <Card key={post.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <img 
            src={post.author.avatar} 
            alt={post.author.name}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {post.isPinned && <Pin className="h-4 w-4 text-blue-600" />}
              {post.isSolved && <CheckCircle className="h-4 w-4 text-green-600" />}
              <h3 className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                {post.title}
              </h3>
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.content}</p>
            
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {post.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <span className="font-medium">{post.author.name}</span>
                  {post.author.badge && (
                    <Badge className={`text-xs ${getAuthorBadgeColor(post.author.badge)}`}>
                      {post.author.badge}
                    </Badge>
                  )}
                </div>
                <span>•</span>
                <span>{formatTimeAgo(post.updatedAt)}</span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.replies}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.views}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
          <p className="text-gray-600 mt-1">Connect with other shoppers, share experiences, and get help</p>
        </div>
        <Button onClick={() => setShowNewPostForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {categories.map(category => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`
                        w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors
                        ${selectedCategory === category.id ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-700'}
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className="h-4 w-4" />
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Community Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Community Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Posts</span>
                <span className="font-semibold">1,247</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active Members</span>
                <span className="font-semibold">3,892</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Solved Questions</span>
                <span className="font-semibold">89%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Today's Posts</span>
                <span className="font-semibold">24</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* New Post Form */}
          {showNewPostForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Post</CardTitle>
                <CardDescription>Share your question or start a discussion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Input
                    placeholder="Enter post title..."
                    value={newPost.title}
                    onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Select onValueChange={(value) => setNewPost(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(cat => cat.id !== 'all').map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="Tags (comma separated)"
                    value={newPost.tags}
                    onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>
                
                <Textarea
                  placeholder="Write your post content..."
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  className="min-h-[120px]"
                />
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowNewPostForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePost}>
                    Create Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filter Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
              <TabsTrigger value="solved">Solved</TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="space-y-4">
              {sortedPosts.map(renderPostCard)}
            </TabsContent>

            <TabsContent value="popular" className="space-y-4">
              {sortedPosts.map(renderPostCard)}
            </TabsContent>

            <TabsContent value="unanswered" className="space-y-4">
              {sortedPosts.filter(post => !post.isSolved).map(renderPostCard)}
            </TabsContent>

            <TabsContent value="solved" className="space-y-4">
              {sortedPosts.filter(post => post.isSolved).map(renderPostCard)}
            </TabsContent>
          </Tabs>

          {/* Load More */}
          <div className="text-center">
            <Button variant="outline">
              Load More Posts
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityForum;