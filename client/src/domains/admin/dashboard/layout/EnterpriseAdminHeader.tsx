/**
 * EnterpriseAdminHeader - Amazon.com/Shopee.sg-Level Admin Header
 * Two-tier comprehensive header system with advanced features
 */

import React from 'react';
import { 
  Bell, 
  Menu, 
  Search, 
  User, 
  Settings, 
  Globe, 
  LogOut, 
  Shield, 
  Zap,
  HelpCircle,
  ChevronDown,
  Activity,
  Database,
  Server,
  Wifi
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

interface EnterpriseAdminHeaderProps {
  onToggleSidebar: () => void;
  onToggleNotifications: () => void;
  currentPage?: string;
}

export function EnterpriseAdminHeader({ 
  onToggleSidebar, 
  onToggleNotifications, 
  currentPage 
}: EnterpriseAdminHeaderProps) {
  const [language, setLanguage] = React.useState('en');
  const [searchQuery, setSearchQuery] = React.useState('');

  const currentTime = new Date().toLocaleTimeString('en-BD', {
    timeZone: 'Asia/Dhaka',
    hour12: true,
    hour: '2-digit',
    minute: '2-digit'
  });

  const currentDate = new Date().toLocaleDateString('en-BD', {
    timeZone: 'Asia/Dhaka',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-8 text-xs">
            {/* Left Side - System Status */}
            <div className="flex items-center space-x-4 text-white/90">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>All Systems Operational</span>
              </div>
              <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-400/10 text-xs">
                Admin Panel v4.2.1
              </Badge>
              <span>Last Updated: {currentDate}, {currentTime}</span>
            </div>

            {/* Right Side - Server Info */}
            <div className="hidden md:flex items-center space-x-4 text-white/70">
              <span>Server: BD-Dhaka-01</span>
              <span>|</span>
              <span>Uptime: 99.98%</span>
              <span>|</span>
              <span>Response: 45ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left Side - Logo and Navigation */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSidebar}
                className="lg:hidden text-white hover:bg-white/20"
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Enhanced Logo Section */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-white to-blue-100 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-blue-600 font-bold text-lg">G</span>
                </div>
                <div className="hidden md:block">
                  <h1 className="font-bold text-white text-xl">GETIT</h1>
                  <p className="text-xs text-white/80">Admin Dashboard</p>
                </div>
                <Badge className="bg-red-500/20 text-red-200 border-red-400/30 text-xs">
                  PRODUCTION
                </Badge>
              </div>
            </div>

            {/* Center - Enhanced Search */}
            <div className="flex-1 max-w-lg mx-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders, vendors, customers, products..."
                  className="pl-12 pr-12 h-12 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-full text-white placeholder-white/60 focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20"
                />
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full w-8 h-8 p-0"
                >
                  <Search className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>

            {/* Right Side - Enhanced Actions */}
            <div className="flex items-center space-x-3">
              {/* Language Toggle */}
              <div className="flex bg-white/10 rounded-full p-1 border border-white/20">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-full text-xs ${
                    language === 'en' 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  EN
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLanguage('bn')}
                  className={`px-3 py-1 rounded-full text-xs ${
                    language === 'bn' 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  বাং
                </Button>
              </div>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleNotifications}
                className="relative text-white hover:bg-white/20 w-10 h-10 rounded-xl"
              >
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white rounded-full animate-bounce">
                  12
                </Badge>
              </Button>

              {/* Quick Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 w-10 h-10 rounded-xl"
                  >
                    <Zap className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Add New User
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Shield className="mr-2 h-4 w-4" />
                    Security Scan
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Database className="mr-2 h-4 w-4" />
                    Database Backup
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Support */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 w-10 h-10 rounded-xl"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>

              {/* Settings */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 w-10 h-10 rounded-xl"
              >
                <Settings className="h-5 w-5" />
              </Button>

              {/* Enhanced User Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-3 text-white hover:bg-white/20 px-3 py-2 rounded-xl h-10"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">AH</span>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold">Admin Hasan</p>
                      <p className="text-xs text-white/70">Super Admin</p>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">AH</span>
                      </div>
                      <div>
                        <p className="font-semibold">Admin Hasan</p>
                        <p className="text-sm text-gray-500">admin@getit.com.bd</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Shield className="mr-2 h-4 w-4" />
                    Security Center
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Admin Preferences
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Activity className="mr-2 h-4 w-4" />
                    Activity Log
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}