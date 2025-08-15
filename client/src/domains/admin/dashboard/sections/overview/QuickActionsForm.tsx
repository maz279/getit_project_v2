
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Upload, 
  Download,
  Settings,
  Users,
  Package,
  ShoppingCart,
  Send,
  Save
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

export const QuickActionsForm: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const quickActions = [
    { icon: Plus, label: 'Add Product', color: 'bg-green-500' },
    { icon: Users, label: 'Add User', color: 'bg-blue-500' },
    { icon: ShoppingCart, label: 'View Orders', color: 'bg-purple-500' },
    { icon: Package, label: 'Inventory', color: 'bg-orange-500' },
    { icon: Upload, label: 'Import Data', color: 'bg-indigo-500' },
    { icon: Download, label: 'Export Reports', color: 'bg-pink-500' },
    { icon: Settings, label: 'Settings', color: 'bg-gray-500' },
    { icon: Search, label: 'Advanced Search', color: 'bg-teal-500' }
  ];

  const handleAddProduct = () => {
    console.log('Adding product:', { name: productName, price: productPrice });
    // Reset form
    setProductName('');
    setProductPrice('');
  };

  const handleAddUser = () => {
    console.log('Adding user:', { name: userName, email: userEmail });
    // Reset form
    setUserName('');
    setUserEmail('');
  };

  const handleSendAnnouncement = () => {
    console.log('Sending announcement:', announcement);
    setAnnouncement('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-8 h-8 ${action.color} rounded-full flex items-center justify-center`}>
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data Entry Forms */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Data Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="product" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="product">Product</TabsTrigger>
              <TabsTrigger value="user">User</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="announce">Announce</TabsTrigger>
            </TabsList>

            <TabsContent value="product" className="space-y-4">
              <div>
                <Label htmlFor="product-name">Product Name</Label>
                <Input
                  id="product-name"
                  placeholder="Enter product name..."
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="product-price">Price (৳)</Label>
                <Input
                  id="product-price"
                  type="number"
                  placeholder="0.00"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="product-category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="fashion">Fashion</SelectItem>
                    <SelectItem value="home">Home & Garden</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddProduct} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </TabsContent>

            <TabsContent value="user" className="space-y-4">
              <div>
                <Label htmlFor="user-name">Full Name</Label>
                <Input
                  id="user-name"
                  placeholder="Enter user name..."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="user-email">Email</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="user@example.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="user-role">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddUser} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </TabsContent>

            <TabsContent value="search" className="space-y-4">
              <div>
                <Label htmlFor="global-search">Global Search</Label>
                <div className="flex space-x-2">
                  <Input
                    id="global-search"
                    placeholder="Search users, products, orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="search-type">Search In</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="products">Products</SelectItem>
                    <SelectItem value="orders">Orders</SelectItem>
                    <SelectItem value="vendors">Vendors</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="announce" className="space-y-4">
              <div>
                <Label htmlFor="announcement">Platform Announcement</Label>
                <Textarea
                  id="announcement"
                  placeholder="Enter announcement for all users..."
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="announce-type">Announcement Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Information</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSendAnnouncement} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Send Announcement
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
