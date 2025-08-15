import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { 
  User, Package, Heart, MapPin, CreditCard, Bell, Settings, Shield, 
  ChevronRight, Star, Truck, Calendar, Download, Eye, MessageSquare 
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Separator } from '@/shared/ui/separator';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { Textarea } from '@/shared/ui/textarea';
import { useToast } from '@/shared/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  itemCount: number;
  vendor: string;
  trackingNumber?: string;
}

interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  comparePrice?: number;
  inStock: boolean;
  vendor: string;
}

interface Address {
  id: string;
  type: 'home' | 'office' | 'other';
  name: string;
  phone: string;
  address: string;
  city: string;
  area: string;
  postalCode: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'bkash' | 'nagad' | 'rocket' | 'card';
  name: string;
  maskedNumber: string;
  isDefault: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  joinDate: string;
  verified: boolean;
}

const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function CustomerDashboard() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  const navigate = (path: string) => setLocation(path);

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/v1/user/profile'],
    queryFn: async () => {
      const response = await fetch('/api/v1/user/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
  });

  // Fetch orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/v1/orders/my-orders'],
    queryFn: async () => {
      const response = await fetch('/api/v1/orders/my-orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
  });

  // Fetch wishlist
  const { data: wishlist = [], isLoading: wishlistLoading } = useQuery({
    queryKey: ['/api/v1/wishlist'],
    queryFn: async () => {
      const response = await fetch('/api/v1/wishlist');
      if (!response.ok) throw new Error('Failed to fetch wishlist');
      return response.json();
    },
  });

  // Fetch addresses
  const { data: addresses = [], isLoading: addressesLoading } = useQuery({
    queryKey: ['/api/v1/user/addresses'],
    queryFn: async () => {
      const response = await fetch('/api/v1/user/addresses');
      if (!response.ok) throw new Error('Failed to fetch addresses');
      return response.json();
    },
  });

  // Fetch payment methods
  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ['/api/v1/user/payment-methods'],
    queryFn: async () => {
      const response = await fetch('/api/v1/user/payment-methods');
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      return response.json();
    },
  });

  const userProfile: UserProfile = profile || {
    id: '',
    name: '',
    email: '',
    phone: '',
    joinDate: '',
    verified: false,
  };

  const recentOrders = orders.slice(0, 5);
  const recentWishlist = wishlist.slice(0, 4);

  const getOrderStatusBadge = (status: string) => (
    <Badge className={cn('text-xs', ORDER_STATUS_COLORS[status as keyof typeof ORDER_STATUS_COLORS])}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={userProfile.avatar} />
            <AvatarFallback className="text-lg">
              {userProfile.name ? userProfile.name[0].toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {userProfile.name || 'Customer'}!</h1>
            <div className="flex items-center space-x-2 text-gray-600">
              <span>Member since {new Date(userProfile.joinDate).getFullYear()}</span>
              {userProfile.verified && (
                <Badge variant="secondary" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => setActiveTab('settings')}>
          <Settings className="w-4 h-4 mr-2" />
          Account Settings
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Package className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{orders.length}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <div className="text-2xl font-bold">{wishlist.length}</div>
                <div className="text-sm text-gray-600">Wishlist Items</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">{addresses.length}</div>
                <div className="text-sm text-gray-600">Saved Addresses</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <CreditCard className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">{paymentMethods.length}</div>
                <div className="text-sm text-gray-600">Payment Methods</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('orders')}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border rounded animate-pulse">
                      <div className="w-12 h-12 bg-gray-200 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order: Order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold">#{order.orderNumber}</div>
                          <div className="text-sm text-gray-600">
                            {order.itemCount} items • {new Date(order.date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-600">from {order.vendor}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">৳{order.total.toLocaleString()}</div>
                        {getOrderStatusBadge(order.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No orders yet</p>
                  <Button variant="outline" className="mt-3" onClick={() => navigate('/')}>
                    Start Shopping
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Wishlist */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Wishlist</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('wishlist')}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {wishlistLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2 animate-pulse">
                      <div className="aspect-square bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : recentWishlist.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {recentWishlist.map((item: WishlistItem) => (
                    <div key={item.id} className="cursor-pointer hover:shadow-md transition-shadow rounded-lg overflow-hidden border">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full aspect-square object-cover"
                        onClick={() => navigate(`/product/${item.productId}`)}
                      />
                      <div className="p-3">
                        <h3 className="font-medium text-sm mb-1 line-clamp-2">{item.productName}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-blue-600">৳{item.price.toLocaleString()}</span>
                          {item.comparePrice && (
                            <span className="text-xs text-gray-500 line-through">
                              ৳{item.comparePrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">by {item.vendor}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Your wishlist is empty</p>
                  <Button variant="outline" className="mt-3" onClick={() => navigate('/')}>
                    Browse Products
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                          <div className="h-3 bg-gray-200 rounded w-48"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order: Order) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
                          <p className="text-gray-600">Ordered on {new Date(order.date).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600">{order.itemCount} items from {order.vendor}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">৳{order.total.toLocaleString()}</div>
                          {getOrderStatusBadge(order.status)}
                        </div>
                      </div>
                      
                      {order.trackingNumber && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                          <Truck className="w-4 h-4" />
                          <span>Tracking: {order.trackingNumber}</span>
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        {order.status === 'delivered' && (
                          <>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-1" />
                              Invoice
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          </>
                        )}
                        {(order.status === 'pending' || order.status === 'confirmed') && (
                          <Button variant="destructive" size="sm">
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                  <p className="text-gray-600 mb-4">Your order history will appear here</p>
                  <Button onClick={() => navigate('/')}>Start Shopping</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wishlist Tab */}
        <TabsContent value="wishlist" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Wishlist ({wishlist.length} items)</CardTitle>
            </CardHeader>
            <CardContent>
              {wishlistLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-2 animate-pulse">
                      <div className="aspect-square bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : wishlist.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {wishlist.map((item: WishlistItem) => (
                    <Card key={item.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        <div className="relative">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-full aspect-square object-cover rounded-t-lg"
                            onClick={() => navigate(`/product/${item.productId}`)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                          >
                            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                          </Button>
                          {!item.inStock && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-lg">
                              <Badge variant="destructive">Out of Stock</Badge>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-sm mb-1 line-clamp-2">{item.productName}</h3>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-bold text-blue-600">৳{item.price.toLocaleString()}</span>
                            {item.comparePrice && (
                              <span className="text-xs text-gray-500 line-through">
                                ৳{item.comparePrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 mb-3">by {item.vendor}</div>
                          <Button size="sm" className="w-full" disabled={!item.inStock}>
                            Add to Cart
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
                  <p className="text-gray-600 mb-4">Save items you love for later</p>
                  <Button onClick={() => navigate('/')}>Browse Products</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Saved Addresses</CardTitle>
              <Button>
                <MapPin className="w-4 h-4 mr-2" />
                Add New Address
              </Button>
            </CardHeader>
            <CardContent>
              {addressesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="border rounded-lg p-4 animate-pulse">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address: Address) => (
                    <Card key={address.id} className={cn("border-2", address.isDefault && "border-blue-500")}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant={address.isDefault ? "default" : "secondary"}>
                              {address.type}
                            </Badge>
                            {address.isDefault && <Badge variant="outline">Default</Badge>}
                          </div>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="font-semibold">{address.name}</div>
                          <div>{address.phone}</div>
                          <div className="text-gray-600">
                            {address.address}<br />
                            {address.area}, {address.city} - {address.postalCode}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">No addresses saved</h3>
                  <p className="text-gray-600 mb-4">Add your delivery addresses for faster checkout</p>
                  <Button>Add Your First Address</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Payment Methods</CardTitle>
              <Button>
                <CreditCard className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </CardHeader>
            <CardContent>
              {paymentMethodsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border rounded-lg p-4 animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-8 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : paymentMethods.length > 0 ? (
                <div className="space-y-4">
                  {paymentMethods.map((method: PaymentMethod) => (
                    <Card key={method.id} className={cn("border-2", method.isDefault && "border-blue-500")}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={cn(
                              "w-12 h-8 rounded flex items-center justify-center text-white text-xs font-bold",
                              method.type === 'bkash' && "bg-pink-500",
                              method.type === 'nagad' && "bg-orange-500",
                              method.type === 'rocket' && "bg-purple-500",
                              method.type === 'card' && "bg-blue-500"
                            )}>
                              {method.type.toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold">{method.name}</div>
                              <div className="text-sm text-gray-600">•••• {method.maskedNumber}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {method.isDefault && <Badge variant="outline">Default</Badge>}
                            <Button variant="ghost" size="sm">Edit</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">No payment methods</h3>
                  <p className="text-gray-600 mb-4">Add your preferred payment methods for quick checkout</p>
                  <Button>Add Payment Method</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue={userProfile.name?.split(' ')[0]} />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue={userProfile.name?.split(' ')[1]} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={userProfile.email} />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" defaultValue={userProfile.phone} />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input id="dateOfBirth" type="date" defaultValue={userProfile.dateOfBirth} />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select defaultValue={userProfile.gender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">Update Profile</Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Order Updates</Label>
                    <p className="text-sm text-gray-600">Get notified about order status changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Promotional Emails</Label>
                    <p className="text-sm text-gray-600">Receive offers and promotions</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-gray-600">Get SMS updates for important events</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Price Alerts</Label>
                    <p className="text-sm text-gray-600">Get notified when wishlist items go on sale</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Security & Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button className="w-full">Change Password</Button>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Download My Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy Settings
                </Button>
                <Separator />
                <div className="space-y-2">
                  <Label>Delete Account</Label>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone. All your data will be permanently deleted.
                  </p>
                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}