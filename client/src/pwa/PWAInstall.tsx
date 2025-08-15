import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor, Share, Star } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';

/**
 * PWA Install Prompt - Amazon.com/Shopee.sg-Level App Installation Experience
 * Smart PWA installation prompt with platform detection and user engagement tracking
 */

interface PWAInstallProps {
  onInstall?: () => void;
  onDismiss?: () => void;
  showOnFirstVisit?: boolean;
  delayMs?: number;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstall: React.FC<PWAInstallProps> = ({
  onInstall,
  onDismiss,
  showOnFirstVisit = true,
  delayMs = 3000
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'unknown'>('unknown');
  const [canInstall, setCanInstall] = useState(false);

  // Detect platform
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    } else if (/windows|mac|linux/.test(userAgent)) {
      setPlatform('desktop');
    }
  }, []);

  // Listen for PWA install events
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      console.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Check if app is already installed
  useEffect(() => {
    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone ||
                         document.referrer.includes('android-app://');
    
    setIsInstalled(isStandalone);

    // Show prompt with delay if not installed and first visit
    if (!isStandalone && showOnFirstVisit && !localStorage.getItem('pwa-install-dismissed')) {
      const timer = setTimeout(() => {
        if (deferredPrompt || platform === 'ios') {
          setShowPrompt(true);
        }
      }, delayMs);

      return () => clearTimeout(timer);
    }
  }, [deferredPrompt, platform, showOnFirstVisit, delayMs]);

  const handleInstall = async () => {
    if (platform === 'ios') {
      // iOS requires manual installation
      setShowPrompt(false);
      // Show iOS installation instructions
      return;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted PWA install');
          onInstall?.();
        }
        
        setDeferredPrompt(null);
        setShowPrompt(false);
      } catch (error) {
        console.error('Error during PWA installation:', error);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    onDismiss?.();
  };

  const getInstallInstructions = () => {
    switch (platform) {
      case 'ios':
        return {
          title: 'Add to Home Screen',
          steps: [
            'Tap the Share button at the bottom of Safari',
            'Scroll down and tap "Add to Home Screen"',
            'Tap "Add" to install the app'
          ],
          icon: Share
        };
      case 'android':
        return {
          title: 'Install GetIt App',
          steps: [
            'Tap "Install" to add GetIt to your home screen',
            'Enjoy native app experience with offline support',
            'Access all features without opening browser'
          ],
          icon: Download
        };
      case 'desktop':
        return {
          title: 'Install Desktop App',
          steps: [
            'Click "Install" to add GetIt to your computer',
            'Access GetIt directly from your desktop',
            'Get notifications and offline support'
          ],
          icon: Monitor
        };
      default:
        return {
          title: 'Install App',
          steps: ['Install GetIt for the best experience'],
          icon: Smartphone
        };
    }
  };

  // Don't show if already installed
  if (isInstalled || !showPrompt) {
    return null;
  }

  const instructions = getInstallInstructions();
  const IconComponent = instructions.icon;

  return (
    <>
      {/* Mobile Bottom Sheet */}
      <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl">
          <div className="p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">GetIt Bangladesh</h3>
                  <p className="text-sm text-gray-600">E-commerce App</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="text-gray-400"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Why install our app?</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-xs">📱</span>
                  </div>
                  <span className="text-sm text-gray-700">Native Experience</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-xs">⚡</span>
                  </div>
                  <span className="text-sm text-gray-700">Faster Loading</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-xs">🔔</span>
                  </div>
                  <span className="text-sm text-gray-700">Push Notifications</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 text-xs">📶</span>
                  </div>
                  <span className="text-sm text-gray-700">Offline Support</span>
                </div>
              </div>
            </div>

            {/* Install Button */}
            <div className="space-y-3">
              <Button
                onClick={handleInstall}
                className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 hover:from-blue-700 hover:via-purple-700 hover:to-red-600"
              >
                <IconComponent className="h-5 w-5 mr-2" />
                {instructions.title}
              </Button>
              
              {platform === 'ios' && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-800 font-medium mb-2">Installation Steps:</p>
                  {instructions.steps.map((step, index) => (
                    <p key={index} className="text-xs text-blue-700 mb-1">
                      {index + 1}. {step}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center justify-center space-x-2 pt-2 border-t">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-gray-600">4.8 • Trusted by 100K+ users</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Modal */}
      <div className="hidden lg:block fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Card className="w-96 shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">G</span>
              </div>
              <div>
                <CardTitle className="text-xl">Install GetIt Bangladesh</CardTitle>
                <p className="text-gray-600 text-sm mt-2">
                  Get the full app experience with faster loading and offline support
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="text-xs font-medium">Fast Loading</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-1">🔔</div>
                  <div className="text-xs font-medium">Notifications</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-1">📶</div>
                  <div className="text-xs font-medium">Offline Mode</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-1">🛡️</div>
                  <div className="text-xs font-medium">Secure</div>
                </div>
              </div>

              {/* Install Button */}
              <Button
                onClick={handleInstall}
                className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-red-500"
              >
                <Download className="h-5 w-5 mr-2" />
                Install App
              </Button>

              {/* Dismiss */}
              <Button
                variant="ghost"
                onClick={handleDismiss}
                className="w-full text-gray-600"
              >
                Maybe Later
              </Button>

              {/* Trust Indicators */}
              <div className="text-center text-xs text-gray-500 space-y-1">
                <div className="flex items-center justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span>4.8 rating</span>
                </div>
                <div>100K+ downloads • Verified by Google</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

// Hook for PWA installation state
export const usePWAInstall = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                           (window.navigator as any).standalone ||
                           document.referrer.includes('android-app://');
      setIsInstalled(isStandalone);
    };

    checkInstalled();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setCanInstall(false);
      return choiceResult.outcome === 'accepted';
    }
    return false;
  };

  return {
    canInstall,
    isInstalled,
    install
  };
};

export default PWAInstall;