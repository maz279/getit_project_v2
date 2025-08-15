import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Switch } from '@/shared/ui/switch';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Upload,
  Download,
  Calendar,
  User,
  Globe,
  Lock,
  Image,
  Video,
  Link,
  Tag,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  type: 'page' | 'post' | 'banner' | 'popup' | 'email' | 'notification';
  status: 'draft' | 'published' | 'archived';
  category: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  views: number;
  engagement: number;
  content: string;
  metadata: {
    seoTitle?: string;
    seoDescription?: string;
    tags: string[];
    featured: boolean;
    priority: 'low' | 'medium' | 'high';
  };
}

export const ContentManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock content data - in real app, this would come from API
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    {
      id: '1',
      title: 'Welcome to Our New E-commerce Platform',
      type: 'page',
      status: 'published',
      category: 'Marketing',
      author: 'Admin User',
      createdAt: '2024-07-10',
      updatedAt: '2024-07-15',
      publishedAt: '2024-07-12',
      views: 1247,
      engagement: 89,
      content: 'Welcome to our amazing new e-commerce platform...',
      metadata: {
        seoTitle: 'Welcome | GetIt E-commerce',
        seoDescription: 'Discover amazing products on our new platform',
        tags: ['welcome', 'new', 'platform'],
        featured: true,
        priority: 'high'
      }
    },
    {
      id: '2',
      title: 'Summer Sale Banner',
      type: 'banner',
      status: 'published',
      category: 'Promotions',
      author: 'Marketing Team',
      createdAt: '2024-07-08',
      updatedAt: '2024-07-14',
      publishedAt: '2024-07-09',
      views: 5467,
      engagement: 234,
      content: 'Summer Sale - Up to 70% Off on all items',
      metadata: {
        tags: ['sale', 'summer', 'discount'],
        featured: true,
        priority: 'high'
      }
    },
    {
      id: '3',
      title: 'Product Launch Announcement',
      type: 'post',
      status: 'draft',
      category: 'News',
      author: 'Content Writer',
      createdAt: '2024-07-14',
      updatedAt: '2024-07-15',
      views: 0,
      engagement: 0,
      content: 'We are excited to announce our new product line...',
      metadata: {
        seoTitle: 'New Product Launch | GetIt',
        seoDescription: 'Discover our exciting new product line',
        tags: ['product', 'launch', 'announcement'],
        featured: false,
        priority: 'medium'
      }
    },
    {
      id: '4',
      title: 'Newsletter Template',
      type: 'email',
      status: 'published',
      category: 'Email Marketing',
      author: 'Email Team',
      createdAt: '2024-07-12',
      updatedAt: '2024-07-13',
      publishedAt: '2024-07-13',
      views: 2341,
      engagement: 156,
      content: 'Weekly newsletter with latest updates and offers...',
      metadata: {
        tags: ['newsletter', 'email', 'weekly'],
        featured: false,
        priority: 'medium'
      }
    },
    {
      id: '5',
      title: 'Flash Sale Popup',
      type: 'popup',
      status: 'archived',
      category: 'Promotions',
      author: 'Marketing Team',
      createdAt: '2024-07-05',
      updatedAt: '2024-07-10',
      publishedAt: '2024-07-06',
      views: 8945,
      engagement: 445,
      content: 'Flash Sale - Limited time offer!',
      metadata: {
        tags: ['flash', 'sale', 'popup'],
        featured: false,
        priority: 'high'
      }
    }
  ]);

  const [newContent, setNewContent] = useState<Partial<ContentItem>>({
    title: '',
    type: 'page',
    status: 'draft',
    category: '',
    content: '',
    metadata: {
      seoTitle: '',
      seoDescription: '',
      tags: [],
      featured: false,
      priority: 'medium'
    }
  });

  const contentTypes = ['page', 'post', 'banner', 'popup', 'email', 'notification'];
  const statuses = ['draft', 'published', 'archived'];
  const categories = ['Marketing', 'Promotions', 'News', 'Email Marketing', 'Support'];
  const priorities = ['low', 'medium', 'high'];

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'page': return <FileText className="w-4 h-4" />;
      case 'post': return <FileText className="w-4 h-4" />;
      case 'banner': return <Image className="w-4 h-4" />;
      case 'popup': return <AlertTriangle className="w-4 h-4" />;
      case 'email': return <User className="w-4 h-4" />;
      case 'notification': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleAddContent = () => {
    const content: ContentItem = {
      id: (contentItems.length + 1).toString(),
      title: newContent.title || 'Untitled',
      type: newContent.type || 'page',
      status: newContent.status || 'draft',
      category: newContent.category || 'General',
      author: 'Current User',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      views: 0,
      engagement: 0,
      content: newContent.content || '',
      metadata: {
        seoTitle: newContent.metadata?.seoTitle || '',
        seoDescription: newContent.metadata?.seoDescription || '',
        tags: newContent.metadata?.tags || [],
        featured: newContent.metadata?.featured || false,
        priority: newContent.metadata?.priority || 'medium'
      }
    };
    
    setContentItems([...contentItems, content]);
    setNewContent({
      title: '',
      type: 'page',
      status: 'draft',
      category: '',
      content: '',
      metadata: {
        seoTitle: '',
        seoDescription: '',
        tags: [],
        featured: false,
        priority: 'medium'
      }
    });
    setActiveTab('list');
  };

  const handleDeleteContent = (id: string) => {
    setContentItems(contentItems.filter(item => item.id !== id));
  };

  const handleStatusChange = (id: string, newStatus: 'draft' | 'published' | 'archived') => {
    setContentItems(contentItems.map(item => 
      item.id === id ? { 
        ...item, 
        status: newStatus, 
        updatedAt: new Date().toISOString().split('T')[0],
        publishedAt: newStatus === 'published' ? new Date().toISOString().split('T')[0] : item.publishedAt
      } : item
    ));
  };

  const getContentStats = () => {
    const published = contentItems.filter(item => item.status === 'published').length;
    const drafts = contentItems.filter(item => item.status === 'draft').length;
    const archived = contentItems.filter(item => item.status === 'archived').length;
    const totalViews = contentItems.reduce((sum, item) => sum + item.views, 0);
    const totalEngagement = contentItems.reduce((sum, item) => sum + item.engagement, 0);
    
    return { published, drafts, archived, totalViews, totalEngagement };
  };

  const stats = getContentStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Manager</h1>
          <p className="text-gray-600">Manage all your website content and marketing materials</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import Content
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Content
          </Button>
          <Button onClick={() => setActiveTab('create')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Content
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentItems.length}</div>
            <p className="text-xs text-muted-foreground">All content items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
            <p className="text-xs text-muted-foreground">Live content</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Edit className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drafts}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time views</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEngagement.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total interactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Manager Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Content List</TabsTrigger>
          <TabsTrigger value="create">Create Content</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {contentTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {statuses.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button variant="outline" className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content List */}
          <Card>
            <CardHeader>
              <CardTitle>Content Items ({filteredContent.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredContent.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(item.type)}
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>By {item.author}</span>
                            <span>•</span>
                            <span>{item.category}</span>
                            <span>•</span>
                            <span>{item.updatedAt}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(item.metadata.priority)}>
                          {item.metadata.priority} priority
                        </Badge>
                        {item.metadata.featured && (
                          <Badge className="bg-blue-100 text-blue-800">Featured</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {item.views.toLocaleString()}
                          </span>
                          <span className="flex items-center">
                            <BarChart3 className="w-4 h-4 mr-1" />
                            {item.engagement}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select value={item.status} onValueChange={(value) => handleStatusChange(item.id, value as any)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map(status => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteContent(item.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Content</CardTitle>
              <CardDescription>Add new content to your website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter content title"
                      value={newContent.title}
                      onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type *</Label>
                      <Select value={newContent.type} onValueChange={(value) => setNewContent({...newContent, type: value as any})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {contentTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={newContent.status} onValueChange={(value) => setNewContent({...newContent, status: value as any})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map(status => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={newContent.category} onValueChange={(value) => setNewContent({...newContent, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      placeholder="Enter content..."
                      value={newContent.content}
                      onChange={(e) => setNewContent({...newContent, content: e.target.value})}
                      rows={6}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="seoTitle">SEO Title</Label>
                    <Input
                      id="seoTitle"
                      placeholder="Enter SEO title"
                      value={newContent.metadata?.seoTitle}
                      onChange={(e) => setNewContent({
                        ...newContent, 
                        metadata: {...newContent.metadata, seoTitle: e.target.value}
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seoDescription">SEO Description</Label>
                    <Textarea
                      id="seoDescription"
                      placeholder="Enter SEO description"
                      value={newContent.metadata?.seoDescription}
                      onChange={(e) => setNewContent({
                        ...newContent, 
                        metadata: {...newContent.metadata, seoDescription: e.target.value}
                      })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newContent.metadata?.priority} onValueChange={(value) => setNewContent({
                      ...newContent, 
                      metadata: {...newContent.metadata, priority: value as any}
                    })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map(priority => (
                          <SelectItem key={priority} value={priority}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={newContent.metadata?.featured}
                      onCheckedChange={(checked) => setNewContent({
                        ...newContent, 
                        metadata: {...newContent.metadata, featured: checked}
                      })}
                    />
                    <Label htmlFor="featured">Featured Content</Label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setActiveTab('list')}>
                  Cancel
                </Button>
                <Button onClick={handleAddContent}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Content
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Analytics</CardTitle>
              <CardDescription>Performance metrics for your content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Content analytics dashboard would be rendered here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};