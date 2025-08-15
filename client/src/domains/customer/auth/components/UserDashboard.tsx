import { useState, useEffect } from 'react';
import { User, Settings, ShoppingBag, Heart, MapPin, Bell, Shield, CreditCard, LogOut, Edit3, Phone, Mail, Calendar, MapPin as Location } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Separator } from '@/shared/ui/separator';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useToast } from '@/shared/hooks/use-toast';
import { useLanguage } from '@/contexts/SimpleLanguageContext';

interface UserDashboardProps {
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    city?: string;
    dateOfBirth?: string;
    gender?: string;
    preferences?: {
      language: string;
      subscribeNewsletter: boolean;
    };
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    createdAt: string;
  };
  onLogout?: () => void;
  onUpdateProfile?: (data: any) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  onLogout,
  onUpdateProfile
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
  });

  const { toast } = useToast();
  const { language } = useLanguage();

  const [orderStats] = useState({
    totalOrders: 12,
    pendingOrders: 2,
    completedOrders: 10,
    totalSpent: 45250,
  });

  const [recentOrders] = useState([
    { id: 'ORD-001', date: '2025-07-15', total: 2850, status: 'delivered', items: 3 },
    { id: 'ORD-002', date: '2025-07-10', total: 1200, status: 'shipped', items: 1 },
    { id: 'ORD-003', date: '2025-07-05', total: 4500, status: 'delivered', items: 2 },
  ]);

  const [wishlistCount] = useState(8);
  const [addressCount] = useState(3);

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Profile update failed');
      }

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: language === 'bn' ? 'প্রোফাইল আপডেট সফল' : 'Profile Updated',
          description: language === 'bn' ? 'আপনার তথ্য সফলভাবে আপডেট হয়েছে' : 'Your profile has been updated successfully',
          variant: 'default',
        });
        
        setIsEditing(false);
        onUpdateProfile?.(result.data.user);
      } else {
        throw new Error(result.error || 'Update failed');
      }
    } catch (error) {
      toast({
        title: language === 'bn' ? 'আপডেট ব্যর্থ' : 'Update Failed',
        description: language === 'bn' ? 'আবার চেষ্টা করুন' : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    if (language === 'bn') {
      switch (status) {
        case 'delivered': return 'ডেলিভার হয়েছে';
        case 'shipped': return 'পাঠানো হয়েছে';
        case 'processing': return 'প্রক্রিয়াকরণে';
        case 'pending': return 'অপেক্ষায়';
        default: return status;
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-gray-500">
            {language === 'bn' ? 'ব্যবহারকারীর তথ্য লোড হচ্ছে...' : 'Loading user information...'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-4">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-bold">
                  {getUserInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {language === 'bn' ? 'গ্রাহক' : 'Customer'}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                    {user.isEmailVerified && <Badge variant="outline" className="text-green-600 border-green-200">✓</Badge>}
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>{user.phone}</span>
                      {user.isPhoneVerified && <Badge variant="outline" className="text-green-600 border-green-200">✓</Badge>}
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-500">
                  {language === 'bn' ? 'যোগ দিয়েছেন' : 'Member since'} {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="hover:bg-blue-50"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                {language === 'bn' ? 'সম্পাদনা' : 'Edit'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="w-4 h-4 mr-1" />
                {language === 'bn' ? 'লগআউট' : 'Logout'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center space-x-1">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'bn' ? 'সংক্ষিপ্ত' : 'Overview'}</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center space-x-1">
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'bn' ? 'অর্ডার' : 'Orders'}</span>
          </TabsTrigger>
          <TabsTrigger value="wishlist" className="flex items-center space-x-1">
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'bn' ? 'পছন্দ' : 'Wishlist'}</span>
          </TabsTrigger>
          <TabsTrigger value="addresses" className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'bn' ? 'ঠিকানা' : 'Addresses'}</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-1">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'bn' ? 'সেটিংস' : 'Settings'}</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{language === 'bn' ? 'মোট অর্ডার' : 'Total Orders'}</p>
                    <p className="text-2xl font-bold text-blue-600">{orderStats.totalOrders}</p>
                  </div>
                  <ShoppingBag className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{language === 'bn' ? 'মোট খরচ' : 'Total Spent'}</p>
                    <p className="text-2xl font-bold text-green-600">৳{orderStats.totalSpent.toLocaleString()}</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{language === 'bn' ? 'পছন্দের তালিকা' : 'Wishlist Items'}</p>
                    <p className="text-2xl font-bold text-purple-600">{wishlistCount}</p>
                  </div>
                  <Heart className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{language === 'bn' ? 'ঠিকানা' : 'Addresses'}</p>
                    <p className="text-2xl font-bold text-orange-600">{addressCount}</p>
                  </div>
                  <MapPin className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{language === 'bn' ? 'সাম্প্রতিক অর্ডার' : 'Recent Orders'}</span>
                <Button variant="outline" size="sm">
                  {language === 'bn' ? 'সব দেখুন' : 'View All'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-gray-600">{new Date(order.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">{order.items} {language === 'bn' ? 'আইটেম' : 'items'}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-medium">৳{order.total.toLocaleString()}</p>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'bn' ? 'আপনার অর্ডার' : 'Your Orders'}</CardTitle>
              <CardDescription>
                {language === 'bn' ? 'আপনার সমস্ত অর্ডারের ইতিহাস দেখুন' : 'View your complete order history'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                {language === 'bn' ? 'অর্ডার তালিকা লোড হচ্ছে...' : 'Loading orders...'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wishlist Tab */}
        <TabsContent value="wishlist">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'bn' ? 'পছন্দের তালিকা' : 'Wishlist'}</CardTitle>
              <CardDescription>
                {language === 'bn' ? 'আপনার পছন্দের পণ্যগুলি দেখুন' : 'View your saved favorite products'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                {language === 'bn' ? 'পছন্দের তালিকা লোড হচ্ছে...' : 'Loading wishlist...'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'bn' ? 'ঠিকানা' : 'Delivery Addresses'}</CardTitle>
              <CardDescription>
                {language === 'bn' ? 'আপনার ডেলিভারি ঠিকানা পরিচালনা করুন' : 'Manage your delivery addresses'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                {language === 'bn' ? 'ঠিকানা তালিকা লোড হচ্ছে...' : 'Loading addresses...'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'bn' ? 'প্রোফাইল সেটিংস' : 'Profile Settings'}</CardTitle>
              <CardDescription>
                {language === 'bn' ? 'আপনার ব্যক্তিগত তথ্য আপডেট করুন' : 'Update your personal information'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'bn' ? 'নাম' : 'Full Name'}</Label>
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{language === 'bn' ? 'ইমেইল' : 'Email'}</Label>
                      <Input
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        type="email"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{language === 'bn' ? 'ফোন' : 'Phone'}</Label>
                      <Input
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>{language === 'bn' ? 'শহর' : 'City'}</Label>
                      <Input
                        value={profileData.city}
                        onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-4">
                    <Button onClick={handleProfileUpdate} disabled={isLoading}>
                      {isLoading ? (
                        language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'
                      ) : (
                        language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes'
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                    >
                      {language === 'bn' ? 'বাতিল' : 'Cancel'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">{language === 'bn' ? 'নাম' : 'Full Name'}</Label>
                      <p className="font-medium">{user.name}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">{language === 'bn' ? 'ইমেইল' : 'Email'}</Label>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    
                    {user.phone && (
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">{language === 'bn' ? 'ফোন' : 'Phone'}</Label>
                        <p className="font-medium">{user.phone}</p>
                      </div>
                    )}
                    
                    {user.city && (
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">{language === 'bn' ? 'শহর' : 'City'}</Label>
                        <p className="font-medium">{user.city}</p>
                      </div>
                    )}
                  </div>
                  
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit3 className="w-4 h-4 mr-2" />
                    {language === 'bn' ? 'প্রোফাইল সম্পাদনা' : 'Edit Profile'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};