import React, { useState } from 'react';
import { Moon, Sun, Monitor, Palette, Check, ChevronDown } from 'lucide-react';
// import { useThemeContext } from '@/contexts/ThemeContext';

// Temporary fallback to prevent app crashes
const useThemeContext = () => ({
  mode: 'light' as const,
  effectiveTheme: 'light' as const,
  culturalTheme: 'default' as const,
  setTheme: () => {},
  toggleTheme: () => {},
  setCulturalTheme: () => {},
  culturalConfig: { colors: {}, fonts: {} }
});

const DynamicThemeSwitcher: React.FC = () => {
  const {
    mode,
    effectiveTheme,
    culturalTheme,
    setTheme,
    toggleTheme,
    setCulturalTheme,
    culturalConfig
  } = useThemeContext();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showCulturalMenu, setShowCulturalMenu] = useState(false);

  const themeOptions = [
    { 
      value: 'light', 
      icon: Sun, 
      label: 'Light', 
      description: 'Clean and bright interface' 
    },
    { 
      value: 'dark', 
      icon: Moon, 
      label: 'Dark', 
      description: 'Easy on the eyes in low light' 
    },
    { 
      value: 'auto', 
      icon: Monitor, 
      label: 'Auto', 
      description: 'Follows your system preference' 
    }
  ];

  const culturalThemeOptions = [
    { value: 'default', label: 'Default', emoji: '🏢', description: 'Standard theme' },
    { value: 'eid', label: 'Eid Celebration', emoji: '🌙', description: 'Festival colors' },
    { value: 'pohela_boishakh', label: 'Pohela Boishakh', emoji: '🎊', description: 'New Year celebration' },
    { value: 'independence_day', label: 'Independence Day', emoji: '🇧🇩', description: 'Patriotic colors' },
    { value: 'victory_day', label: 'Victory Day', emoji: '🏆', description: 'Victory celebration' },
    { value: 'durga_puja', label: 'Durga Puja', emoji: '🪔', description: 'Sacred festival' },
    { value: 'winter', label: 'Winter Season', emoji: '❄️', description: 'Cool season theme' },
    { value: 'monsoon', label: 'Monsoon Season', emoji: '🌧️', description: 'Rainy season theme' }
  ];

  const getCurrentThemeIcon = () => {
    const option = themeOptions.find(opt => opt.value === mode);
    return option ? option.icon : Sun;
  };

  const CurrentIcon = getCurrentThemeIcon();

  return (
    <div className="relative">
      {/* Quick Theme Toggle Button */}
      <div className="flex items-center gap-2">
        {/* Primary Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="relative group p-2 rounded-lg bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-105 active:scale-95"
          title={`Current: ${effectiveTheme === 'dark' ? 'Dark' : 'Light'} mode`}
        >
          <div className="relative w-5 h-5">
            <Sun 
              className={`absolute inset-0 w-5 h-5 text-amber-500 transition-all duration-500 transform ${
                effectiveTheme === 'dark' ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
              }`} 
            />
            <Moon 
              className={`absolute inset-0 w-5 h-5 text-blue-400 transition-all duration-500 transform ${
                effectiveTheme === 'dark' ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0'
              }`} 
            />
          </div>
          
          {/* Animated background indicator */}
          <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${
            effectiveTheme === 'dark' 
              ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20' 
              : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20'
          }`} />
        </button>

        {/* Advanced Options Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 rounded-lg bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-1"
            title="Theme options"
          >
            <Palette className="w-4 h-4 text-purple-500" />
            <ChevronDown className={`w-3 h-3 text-gray-600 dark:text-gray-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm z-[9999] animate-in slide-in-from-top-2 duration-300">
              
              {/* Theme Mode Section */}
              <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Display Mode
                </h3>
                <div className="space-y-2">
                  {themeOptions.map((option) => {
                    const IconComponent = option.icon;
                    const isActive = mode === option.value;
                    
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setTheme(option.value);
                          setShowDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all duration-300 ${
                          isActive 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className={`p-1.5 rounded-md transition-all duration-300 ${
                          isActive 
                            ? 'bg-blue-100 dark:bg-blue-800/50' 
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <IconComponent className="w-3 h-3" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-medium">{option.label}</div>
                          <div className="text-2xs text-gray-500 dark:text-gray-400">{option.description}</div>
                        </div>
                        {isActive && (
                          <Check className="w-4 h-4 text-blue-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cultural Theme Section */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Cultural Themes
                  </h3>
                  <button
                    onClick={() => setShowCulturalMenu(!showCulturalMenu)}
                    className="text-2xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {showCulturalMenu ? 'Show less' : 'Show all'}
                  </button>
                </div>
                
                <div className={`space-y-1 transition-all duration-300 overflow-hidden ${
                  showCulturalMenu ? 'max-h-64 overflow-y-auto' : 'max-h-32'
                }`}>
                  {culturalThemeOptions.slice(0, showCulturalMenu ? culturalThemeOptions.length : 4).map((option) => {
                    const isActive = culturalTheme === option.value;
                    
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setCulturalTheme(option.value);
                        }}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all duration-300 ${
                          isActive 
                            ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-700' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="text-lg">{option.emoji}</div>
                        <div className="flex-1">
                          <div className="text-xs font-medium">{option.label}</div>
                          <div className="text-2xs text-gray-500 dark:text-gray-400">{option.description}</div>
                        </div>
                        {isActive && (
                          <Check className="w-4 h-4 text-purple-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current Theme Info */}
              {culturalConfig && culturalTheme !== 'default' && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-t border-gray-200/50 dark:border-gray-700/50 rounded-b-xl">
                  <div className="text-2xs text-purple-700 dark:text-purple-300 font-medium">
                    🎨 Active: {culturalConfig.name}
                  </div>
                  <div className="text-2xs text-purple-600/80 dark:text-purple-400/80 mt-1">
                    Celebrating Bangladesh's rich cultural heritage
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-[9998]" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default DynamicThemeSwitcher;