/**
 * AdminHeader - Bangladesh Enterprise Admin Header
 * Based on HTML specification with exact styling requirements
 */

import { useState } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Settings, 
  Globe, 
  HelpCircle,
  ChevronDown,
  Monitor,
  Zap,
  Users,
  Activity
} from 'lucide-react';

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  onToggleNotifications?: () => void;
  currentPage?: string;
}

export const AdminHeader = ({ onToggleSidebar, onToggleNotifications, currentPage }: AdminHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('EN');

  const currentTime = new Date().toLocaleString('en-BD', { 
    timeZone: 'Asia/Dhaka',
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <header className="admin-header sticky top-0 z-50" style={{
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div className="header-container max-w-7xl mx-auto px-5">
        
        {/* Top Header Bar */}
        <div className="header-top py-2 border-b border-white/10 text-xs">
          <div className="header-top-content flex justify-between items-center text-white/90">
            <div className="header-left flex items-center gap-4">
              <div className="system-status flex items-center gap-2">
                <Monitor className="w-3 h-3" />
                <span>System Status: </span>
                <span className="text-green-300 font-medium">Operational</span>
              </div>
              <div className="server-info flex items-center gap-2">
                <Zap className="w-3 h-3" />
                <span>Server: Primary BD-1</span>
              </div>
              <div className="version-info">
                <span>v2.1.0 Enterprise</span>
              </div>
            </div>
            
            <div className="header-right flex items-center gap-4">
              <div className="user-count flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>Active: 1,247</span>
              </div>
              <div className="performance flex items-center gap-1">
                <Activity className="w-3 h-3" />
                <span>Load: 23%</span>
              </div>
              <div className="time">
                <span>Dhaka: {currentTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="header-main py-3">
          <div className="header-main-content flex items-center gap-6">
            
            {/* Logo Section */}
            <div className="logo-section flex items-center gap-4">
              <button 
                onClick={onToggleSidebar}
                className="menu-toggle p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-white" />
              </button>
              
              <a href="/admin/dashboard" className="logo flex items-center gap-3 no-underline">
                <div className="logo-icon w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg"
                     style={{
                       background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1)',
                       boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                     }}>
                  GI
                </div>
                <div className="logo-text">
                  <h1 className="logo-title text-2xl font-extrabold m-0 text-white">
                    GetIt
                  </h1>
                  <p className="logo-subtitle text-xs text-white/70 m-0 font-medium">
                    Bangladesh Admin
                  </p>
                </div>
              </a>
              
              <div className="environment-badge px-2 py-1 rounded text-xs font-semibold uppercase"
                   style={{
                     background: 'rgba(239, 68, 68, 0.2)',
                     color: '#ef4444',
                     border: '1px solid rgba(239, 68, 68, 0.3)'
                   }}>
                Development
              </div>
            </div>

            {/* Search Section */}
            <div className="search-section flex-1 max-w-lg">
              <div className="search-container relative flex items-center">
                <input
                  type="text"
                  placeholder="Search admin panels, users, orders, products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input w-full py-3 pl-4 pr-12 border-2 border-white/20 rounded-full text-white text-sm transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.4)';
                    e.target.style.background = 'rgba(255,255,255,0.15)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                    e.target.style.background = 'rgba(255,255,255,0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button className="search-btn absolute right-1 top-1/2 transform -translate-y-1/2 w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                  <Search className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Action Section */}
            <div className="action-section flex items-center gap-2">
              
              {/* Language Toggle */}
              <button 
                onClick={() => setLanguage(language === 'EN' ? 'বাং' : 'EN')}
                className="lang-toggle flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white text-sm font-medium"
              >
                <Globe className="w-4 h-4" />
                <span>{language}</span>
              </button>

              {/* Quick Actions */}
              <div className="quick-actions flex items-center gap-1">
                <button className="action-btn w-10 h-10 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors relative">
                  <Bell className="w-5 h-5 text-white" />
                  <span className="notification-badge absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    3
                  </span>
                </button>
                
                <button className="action-btn w-10 h-10 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors">
                  <HelpCircle className="w-5 h-5 text-white" />
                </button>
                
                <button className="action-btn w-10 h-10 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors">
                  <Settings className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* User Profile */}
              <div className="user-profile flex items-center gap-3 ml-2">
                <div className="user-avatar w-9 h-9 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  AB
                </div>
                <div className="user-info hidden md:block">
                  <div className="user-name text-sm font-medium text-white">Admin User</div>
                  <div className="user-role text-xs text-white/70">Super Administrator</div>
                </div>
                <ChevronDown className="w-4 h-4 text-white/70" />
              </div>

            </div>
          </div>
        </div>
      </div>
    </header>
  );
}