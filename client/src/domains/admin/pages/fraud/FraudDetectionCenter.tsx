// FraudDetectionCenter.tsx - Amazon.com/Shopee.sg-Level Fraud Detection System
import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Eye, Ban, CheckCircle, TrendingUp, Users, CreditCard, Package, MapPin, Clock, Filter, Search, Download } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

interface FraudAlert {
  id: string;
  type: 'payment' | 'account' | 'transaction' | 'identity' | 'behavioral';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: Date;
  status: 'pending' | 'investigating' | 'resolved' | 'false_positive';
  score: number;
  userId?: string;
  orderId?: string;
  amount?: number;
  location?: string;
  indicators: string[];
}

interface FraudMetrics {
  totalAlerts: number;
  highRiskAlerts: number;
  resolvedToday: number;
  preventedLoss: number;
  detectionRate: number;
  falsePositiveRate: number;
  trends: { date: string; alerts: number; prevented: number }[];
  typeDistribution: { type: string; count: number; percentage: number }[];
}

const FraudDetectionCenter: React.FC = () => {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [metrics, setMetrics] = useState<FraudMetrics | null>(null);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Fraud Detection Center - AI-Powered Security | GetIt Bangladesh',
    description: 'Advanced fraud detection system with real-time monitoring, AI-powered analysis, and comprehensive security analytics for enterprise protection.',
    keywords: 'fraud detection, security analytics, AI monitoring, financial security, Bangladesh fraud prevention'
  });

  useEffect(() => {
    // Mock fraud detection data
    setTimeout(() => {
      const mockAlerts: FraudAlert[] = [
        {
          id: 'FRD-2025-001',
          type: 'payment',
          severity: 'high',
          title: 'Suspicious Payment Pattern Detected',
          description: 'Multiple failed payment attempts from different cards but same device fingerprint',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          status: 'pending',
          score: 95,
          userId: 'USER-12345',
          orderId: 'ORD-67890',
          amount: 45000,
          location: 'Dhaka, Bangladesh',
          indicators: ['Multiple card attempts', 'Device fingerprint mismatch', 'Velocity check failed', 'IP reputation poor']
        },
        {
          id: 'FRD-2025-002',
          type: 'account',
          severity: 'high',
          title: 'Account Takeover Attempt',
          description: 'Login from unusual location with password spray pattern',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          status: 'investigating',
          score: 88,
          userId: 'USER-54321',
          location: 'Unknown VPN',
          indicators: ['Unusual location', 'Password spray pattern', 'No previous device history', 'VPN detected']
        },
        {
          id: 'FRD-2025-003',
          type: 'transaction',
          severity: 'medium',
          title: 'Unusual Purchase Behavior',
          description: 'High-value electronics purchase deviating from normal buying pattern',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'pending',
          score: 72,
          userId: 'USER-98765',
          orderId: 'ORD-11223',
          amount: 125000,
          location: 'Chittagong, Bangladesh',
          indicators: ['High deviation from profile', 'Electronics category unusual', 'Large amount', 'First-time high value']
        },
        {
          id: 'FRD-2025-004',
          type: 'identity',
          severity: 'medium',
          title: 'Identity Verification Mismatch',
          description: 'Shipping address doesn\'t match billing information patterns',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          status: 'resolved',
          score: 68,
          userId: 'USER-44556',
          orderId: 'ORD-33445',
          amount: 8500,
          location: 'Sylhet, Bangladesh',
          indicators: ['Address mismatch', 'Name similarity check failed', 'Phone verification pending']
        },
        {
          id: 'FRD-2025-005',
          type: 'behavioral',
          severity: 'low',
          title: 'Unusual Shopping Hours',
          description: 'Account activity during unusual hours for user profile',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          status: 'false_positive',
          score: 45,
          userId: 'USER-77889',
          location: 'Rajshahi, Bangladesh',
          indicators: ['Unusual timing', 'Night activity', 'Mobile device switch']
        }
      ];

      const mockMetrics: FraudMetrics = {
        totalAlerts: 156,
        highRiskAlerts: 23,
        resolvedToday: 42,
        preventedLoss: 2850000,
        detectionRate: 94.2,
        falsePositiveRate: 3.8,
        trends: [
          { date: '2025-01-05', alerts: 12, prevented: 180000 },
          { date: '2025-01-06', alerts: 18, prevented: 340000 },
          { date: '2025-01-07', alerts: 15, prevented: 220000 },
          { date: '2025-01-08', alerts: 22, prevented: 450000 },
          { date: '2025-01-09', alerts: 19, prevented: 380000 },
          { date: '2025-01-10', alerts: 25, prevented: 520000 },
          { date: '2025-01-11', alerts: 21, prevented: 410000 },
          { date: '2025-01-12', alerts: 24, prevented: 480000 }
        ],
        typeDistribution: [
          { type: 'Payment', count: 65, percentage: 41.7 },
          { type: 'Account', count: 38, percentage: 24.4 },
          { type: 'Transaction', count: 28, percentage: 17.9 },
          { type: 'Identity', count: 15, percentage: 9.6 },
          { type: 'Behavioral', count: 10, percentage: 6.4 }
        ]
      };

      setAlerts(mockAlerts);
      setMetrics(mockMetrics);
      setLoading(false);
    }, 1500);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'false_positive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment': return <CreditCard className="h-5 w-5" />;
      case 'account': return <Users className="h-5 w-5" />;
      case 'transaction': return <Package className="h-5 w-5" />;
      case 'identity': return <Eye className="h-5 w-5" />;
      case 'behavioral': return <TrendingUp className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = filter === 'all' || alert.severity === filter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, status: 'resolved' as const } : alert
      )
    );
  };

  const handleMarkFalsePositive = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, status: 'false_positive' as const } : alert
      )
    );
  };

  const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading fraud detection center...</p>
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
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Fraud Detection Center</h1>
          <p className="text-xl opacity-90 mb-8">
            AI-powered fraud detection and prevention system
          </p>
          
          {/* Key Metrics */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.totalAlerts}</p>
                    <p className="opacity-80">Total Alerts</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.highRiskAlerts}</p>
                    <p className="opacity-80">High Risk</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.detectionRate}%</p>
                    <p className="opacity-80">Detection Rate</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <Ban className="h-8 w-8" />
                  <div>
                    <p className="text-2xl font-bold">৳{(metrics.preventedLoss / 1000000).toFixed(1)}M</p>
                    <p className="opacity-80">Loss Prevented</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Analytics Dashboard */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Fraud Trends */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Fraud Detection Trends</h3>
              
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics?.trends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).getDate().toString()}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `৳${(value/1000).toFixed(0)}K`} />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString('en-BD')}
                    formatter={(value, name) => [
                      name === 'prevented' ? `৳${(value as number).toLocaleString()}` : value,
                      name === 'prevented' ? 'Loss Prevented' : 'Alerts'
                    ]}
                  />
                  <Bar yAxisId="left" dataKey="alerts" fill="#EF4444" name="Alerts" />
                  <Line yAxisId="right" type="monotone" dataKey="prevented" stroke="#10B981" strokeWidth={3} name="Loss Prevented" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Fraud Type Distribution */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Alert Type Distribution</h3>
              
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metrics?.typeDistribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percentage }) => `${type} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(metrics?.typeDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Alerts Management */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Fraud Alerts</h2>
            
            <div className="flex gap-3">
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search alerts..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Severities</option>
                <option value="high">High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="false_positive">False Positive</option>
              </select>
            </div>
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {filteredAlerts.map(alert => (
              <div key={alert.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getSeverityColor(alert.severity)}`}>
                      {getTypeIcon(alert.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{alert.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                          {alert.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{alert.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {alert.timestamp.toLocaleString('en-BD')}
                        </span>
                        {alert.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {alert.location}
                          </span>
                        )}
                        {alert.amount && (
                          <span className="font-medium text-red-600">
                            Amount: ৳{alert.amount.toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm font-medium text-gray-900">Risk Score:</span>
                        <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              alert.score >= 80 ? 'bg-red-500' : 
                              alert.score >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${alert.score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{alert.score}/100</span>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-900 mb-2">Risk Indicators:</p>
                        <div className="flex flex-wrap gap-2">
                          {alert.indicators.map((indicator, index) => (
                            <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                              {indicator}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-gray-500">Alert #{alert.id}</span>
                    {alert.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleMarkFalsePositive(alert.id)}
                          className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                        >
                          False Positive
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {alert.userId && <span>User: {alert.userId}</span>}
                    {alert.orderId && <span>Order: {alert.orderId}</span>}
                  </div>
                  
                  <button
                    onClick={() => setSelectedAlert(alert)}
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredAlerts.length === 0 && (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No fraud alerts found</h3>
              <p className="text-gray-600">
                {searchQuery ? `No alerts match your search for "${searchQuery}"` : 'All clear! No fraud alerts at this time.'}
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FraudDetectionCenter;