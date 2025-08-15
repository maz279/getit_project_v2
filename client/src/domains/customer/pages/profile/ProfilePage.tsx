import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/common/Layout/MainLayout';
import { Button } from '@/components/common/UI/Button/Button';
import { SearchInput, EmailInput, PhoneInput } from '@/components/common/UI/Input/Input';
import { LoadingSpinner, SkeletonCard } from '@/components/common/UI/Loading/Loading';
import { Alert } from '@/components/common/UI/Alert/Alert';
import { cn } from "@/lib/utils";

// ProfilePage - Amazon.com/Shopee.sg Level User Profile Management
export const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading user data
    setTimeout(() => {
      setUserData(generateUserData());
      setLoading(false);
    }, 1000);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'personal', label: 'Personal Info', icon: '📝' },
    { id: 'addresses', label: 'Addresses', icon: '📍' },
    { id: 'payments', label: 'Payment Methods', icon: '💳' },
    { id: 'orders', label: 'Order History', icon: '📦' },
    { id: 'wishlist', label: 'Wishlist', icon: '❤️' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' }
  ];

  if (loading) {
    return (
      <MainLayout>
        <ProfileLoadingSkeleton />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Profile Header */}
        <ProfileHeader userData={userData} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <ProfileSidebar 
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                userData={userData}
              />
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              <ProfileContent 
                activeTab={activeTab}
                userData={userData}
                setUserData={setUserData}
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Generate User Data
const generateUserData = () => {
  return {
    id: 1,
    name: 'Ahmed Rahman',
    email: 'ahmed.rahman@email.com',
    phone: '+8801712345678',
    avatar: '/user-avatar.jpg',
    joinDate: '2023-06-15',
    verified: true,
    membershipLevel: 'Gold',
    totalOrders: 42,
    totalSpent: 156750,
    loyaltyPoints: 2340,
    addresses: [
      {
        id: 1,
        type: 'home',
        label: 'Home',
        name: 'Ahmed Rahman',
        phone: '+8801712345678',
        address: 'House 15, Road 8, Dhanmondi',
        city: 'Dhaka',
        district: 'Dhaka',
        division: 'Dhaka',
        postalCode: '1205',
        isDefault: true
      },
      {
        id: 2,
        type: 'office',
        label: 'Office',
        name: 'Ahmed Rahman',
        phone: '+8801712345678',
        address: 'Plot 25, Gulshan Avenue',
        city: 'Dhaka',
        district: 'Dhaka',
        division: 'Dhaka',
        postalCode: '1212',
        isDefault: false
      }
    ],
    paymentMethods: [
      {
        id: 1,
        type: 'bkash',
        label: 'bKash',
        number: '*****5678',
        isDefault: true,
        verified: true
      },
      {
        id: 2,
        type: 'nagad',
        label: 'Nagad',
        number: '*****9012',
        isDefault: false,
        verified: true
      },
      {
        id: 3,
        type: 'card',
        label: 'DBBL Credit Card',
        number: '****1234',
        expiry: '12/26',
        isDefault: false,
        verified: true
      }
    ],
    recentOrders: [
      {
        id: 'ORD-2024-001',
        date: '2024-07-03',
        total: 8500,
        status: 'delivered',
        items: 3,
        image: '/order-1.jpg'
      },
      {
        id: 'ORD-2024-002',
        date: '2024-07-01',
        total: 15600,
        status: 'shipped',
        items: 2,
        image: '/order-2.jpg'
      }
    ],
    wishlistItems: [
      {
        id: 1,
        name: 'Wireless Headphones',
        price: 4500,
        image: '/wishlist-1.jpg',
        availability: 'in-stock'
      },
      {
        id: 2,
        name: 'Smart Watch',
        price: 12000,
        image: '/wishlist-2.jpg',
        availability: 'limited'
      }
    ],
    reviews: [
      {
        id: 1,
        productName: 'Smartphone',
        rating: 5,
        comment: 'Excellent product! Fast delivery.',
        date: '2024-06-20',
        helpful: 12
      },
      {
        id: 2,
        productName: 'Laptop',
        rating: 4,
        comment: 'Good quality, value for money.',
        date: '2024-06-15',
        helpful: 8
      }
    ]
  };
};

// Profile Loading Skeleton
const ProfileLoadingSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-gray-300"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="lg:col-span-3">
            <SkeletonCard className="h-96" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Header
const ProfileHeader = ({ userData }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <img 
              src={userData.avatar} 
              alt={userData.name}
              className="w-32 h-32 rounded-full border-4 border-white/20"
            />
            {userData.verified && (
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
          
          {/* User Info */}
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{userData.name}</h1>
            <p className="text-white/90 mb-2">{userData.email}</p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                {userData.membershipLevel} Member
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                {userData.loyaltyPoints} Points
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                Member since {new Date(userData.joinDate).getFullYear()}
              </span>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="ml-auto grid grid-cols-2 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold">{userData.totalOrders}</div>
              <div className="text-white/80 text-sm">Total Orders</div>
            </div>
            <div>
              <div className="text-2xl font-bold">৳{userData.totalSpent.toLocaleString()}</div>
              <div className="text-white/80 text-sm">Total Spent</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Sidebar
const ProfileSidebar = ({ tabs, activeTab, setActiveTab, userData }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <nav className="space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "w-full flex items-center px-3 py-2 text-left text-sm font-medium rounded-lg transition-colors",
              activeTab === tab.id
                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-500"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <span className="mr-3">{tab.icon}</span>
            {tab.label}
            {tab.id === 'orders' && (
              <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {userData.totalOrders}
              </span>
            )}
            {tab.id === 'wishlist' && (
              <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {userData.wishlistItems.length}
              </span>
            )}
          </button>
        ))}
      </nav>
      
      {/* Quick Actions */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
        <div className="space-y-2">
          <Button className="w-full justify-start" variant="outline" size="sm">
            📞 Contact Support
          </Button>
          <Button className="w-full justify-start" variant="outline" size="sm">
            📋 Download Data
          </Button>
          <Button className="w-full justify-start" variant="outline" size="sm">
            🚪 Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

// Profile Content
const ProfileContent = ({ activeTab, userData, setUserData }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab userData={userData} />;
      case 'personal':
        return <PersonalInfoTab userData={userData} setUserData={setUserData} />;
      case 'addresses':
        return <AddressesTab userData={userData} setUserData={setUserData} />;
      case 'payments':
        return <PaymentMethodsTab userData={userData} setUserData={setUserData} />;
      case 'orders':
        return <OrderHistoryTab userData={userData} />;
      case 'wishlist':
        return <WishlistTab userData={userData} />;
      case 'reviews':
        return <ReviewsTab userData={userData} />;
      case 'security':
        return <SecurityTab userData={userData} />;
      case 'notifications':
        return <NotificationsTab userData={userData} />;
      default:
        return <OverviewTab userData={userData} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {renderContent()}
    </div>
  );
};

// Overview Tab
const OverviewTab = ({ userData }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Overview</h2>
      
      {/* Account Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{userData.totalOrders}</div>
          <div className="text-blue-800 font-medium">Total Orders</div>
          <div className="text-sm text-blue-600 mt-1">This year</div>
        </div>
        <div className="bg-green-50 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">৳{userData.totalSpent.toLocaleString()}</div>
          <div className="text-green-800 font-medium">Total Spent</div>
          <div className="text-sm text-green-600 mt-1">Lifetime</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{userData.loyaltyPoints}</div>
          <div className="text-purple-800 font-medium">Loyalty Points</div>
          <div className="text-sm text-purple-600 mt-1">Available</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <Button variant="outline" size="sm">View All</Button>
        </div>
        <div className="space-y-4">
          {userData.recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <img src={order.image} alt="Order" className="w-16 h-16 object-cover rounded" />
                <div>
                  <div className="font-medium text-gray-900">{order.id}</div>
                  <div className="text-sm text-gray-500">{order.items} items • {order.date}</div>
                  <div className="text-sm">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      order.status === 'delivered' ? "bg-green-100 text-green-800" :
                      order.status === 'shipped' ? "bg-blue-100 text-blue-800" :
                      "bg-yellow-100 text-yellow-800"
                    )}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">৳{order.total.toLocaleString()}</div>
                <Button variant="outline" size="sm" className="mt-2">Track Order</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="h-20 flex-col" variant="outline">
            <span className="text-2xl mb-1">📦</span>
            Track Orders
          </Button>
          <Button className="h-20 flex-col" variant="outline">
            <span className="text-2xl mb-1">❤️</span>
            Wishlist
          </Button>
          <Button className="h-20 flex-col" variant="outline">
            <span className="text-2xl mb-1">💳</span>
            Payments
          </Button>
          <Button className="h-20 flex-col" variant="outline">
            <span className="text-2xl mb-1">📍</span>
            Addresses
          </Button>
        </div>
      </div>
    </div>
  );
};

// Personal Info Tab
const PersonalInfoTab = ({ userData, setUserData }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    dateOfBirth: '1990-01-01',
    gender: 'male'
  });

  const handleSave = () => {
    setUserData(prev => ({ ...prev, ...formData }));
    setEditing(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
        <Button 
          onClick={() => editing ? handleSave() : setEditing(true)}
          variant={editing ? "default" : "outline"}
        >
          {editing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          {editing ? (
            <SearchInput
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg">{userData.name}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          {editing ? (
            <EmailInput
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email"
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg flex items-center">
              {userData.email}
              {userData.verified && (
                <span className="ml-2 text-green-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          {editing ? (
            <PhoneInput
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter your phone number"
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg">{userData.phone}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
          {editing ? (
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg">
              {new Date(formData.dateOfBirth).toLocaleDateString()}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          {editing ? (
            <select
              value={formData.gender}
              onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg capitalize">{formData.gender}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
          <div className="p-3 bg-gray-50 rounded-lg">
            {new Date(userData.joinDate).toLocaleDateString()}
          </div>
        </div>
      </div>

      {editing && (
        <div className="mt-6 flex gap-4">
          <Button onClick={handleSave}>Save Changes</Button>
          <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
        </div>
      )}
    </div>
  );
};

// Addresses Tab
const AddressesTab = ({ userData, setUserData }) => {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Delivery Addresses</h2>
        <Button onClick={() => setShowAddForm(true)}>Add New Address</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userData.addresses.map((address) => (
          <div key={address.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{address.label}</span>
                {address.isDefault && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    Default
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">Edit</Button>
                <Button variant="ghost" size="sm" className="text-red-600">Delete</Button>
              </div>
            </div>
            <div className="text-gray-600 space-y-1">
              <div className="font-medium">{address.name}</div>
              <div>{address.phone}</div>
              <div>{address.address}</div>
              <div>{address.city}, {address.district}</div>
              <div>{address.division} - {address.postalCode}</div>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="mt-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Address</h3>
          {/* Address form would go here */}
          <div className="flex gap-4">
            <Button>Save Address</Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Payment Methods Tab
const PaymentMethodsTab = ({ userData }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
        <Button>Add Payment Method</Button>
      </div>

      <div className="space-y-4">
        {userData.paymentMethods.map((method) => (
          <div key={method.id} className="flex items-center justify-between p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                {method.type === 'bkash' && <span className="text-pink-600 font-bold text-xs">bKash</span>}
                {method.type === 'nagad' && <span className="text-orange-600 font-bold text-xs">Nagad</span>}
                {method.type === 'card' && <span className="text-blue-600 font-bold text-xs">💳</span>}
              </div>
              <div>
                <div className="font-medium text-gray-900">{method.label}</div>
                <div className="text-sm text-gray-500">
                  {method.number}
                  {method.expiry && ` • Expires ${method.expiry}`}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {method.isDefault && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      Default
                    </span>
                  )}
                  {method.verified && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Edit</Button>
              <Button variant="outline" size="sm" className="text-red-600">Remove</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Order History Tab
const OrderHistoryTab = ({ userData }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
      <div className="space-y-6">
        {userData.recentOrders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{order.id}</h3>
                <p className="text-sm text-gray-500">Placed on {order.date}</p>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">৳{order.total.toLocaleString()}</div>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  order.status === 'delivered' ? "bg-green-100 text-green-800" :
                  order.status === 'shipped' ? "bg-blue-100 text-blue-800" :
                  "bg-yellow-100 text-yellow-800"
                )}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">{order.items} items</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">View Details</Button>
                <Button variant="outline" size="sm">Track Order</Button>
                {order.status === 'delivered' && (
                  <Button variant="outline" size="sm">Return/Exchange</Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Wishlist Tab
const WishlistTab = ({ userData }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userData.wishlistItems.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-gray-900">৳{item.price.toLocaleString()}</span>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  item.availability === 'in-stock' ? "bg-green-100 text-green-800" :
                  item.availability === 'limited' ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                )}>
                  {item.availability.replace('-', ' ')}
                </span>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" size="sm">Add to Cart</Button>
                <Button variant="outline" size="sm">Remove</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Reviews Tab
const ReviewsTab = ({ userData }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Reviews</h2>
      <div className="space-y-6">
        {userData.reviews.map((review) => (
          <div key={review.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{review.productName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          i < review.rating ? "text-yellow-400" : "text-gray-300"
                        )}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
              </div>
              <Button variant="outline" size="sm">Edit Review</Button>
            </div>
            <p className="text-gray-700 mb-4">{review.comment}</p>
            <div className="text-sm text-gray-500">
              {review.helpful} people found this helpful
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Security Tab
const SecurityTab = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Security & Privacy</h2>
      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Password & Authentication</h3>
          <div className="space-y-4">
            <Button variant="outline">Change Password</Button>
            <Button variant="outline">Enable Two-Factor Authentication</Button>
            <Button variant="outline">View Login Activity</Button>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
          <div className="space-y-4">
            <Button variant="outline">Download My Data</Button>
            <Button variant="outline">Privacy Policy</Button>
            <Button variant="outline" className="text-red-600">Delete Account</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notifications Tab
const NotificationsTab = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
          <div className="space-y-3">
            {[
              'Order confirmations',
              'Shipping updates',
              'Special offers',
              'Product recommendations',
              'Security alerts'
            ].map((item) => (
              <label key={item} className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <span className="text-gray-700">{item}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SMS Notifications</h3>
          <div className="space-y-3">
            {[
              'Order status updates',
              'Delivery notifications',
              'Security alerts'
            ].map((item) => (
              <label key={item} className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <span className="text-gray-700">{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;