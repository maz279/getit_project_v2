import { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { LoginForm } from './LoginForm';
// SignupForm removed - users now navigate to dedicated signup page
import { useSimpleLanguage } from '@/contexts/SimpleLanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
  onSuccess?: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab);
  const { language } = useSimpleLanguage();

  const handleSuccess = (user: any) => {
    onSuccess?.(user);
    onClose();
  };

  const handleTabChange = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-center">
            {language === 'bn' ? 'GetIt এ স্বাগতম' : 'Welcome to GetIt'}
          </DialogTitle>
          <p className="text-sm text-gray-600 text-center mt-2">
            {language === 'bn' 
              ? 'আপনার অ্যাকাউন্টে প্রবেশ করুন অথবা নতুন অ্যাকাউন্ট তৈরি করুন'
              : 'Sign in to your account or create a new one'
            }
          </p>
        </DialogHeader>

        <div className="px-6 pb-6">
          <Tabs value={activeTab} onValueChange={handleTabChange as any} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="text-sm font-medium">
                {language === 'bn' ? 'লগইন' : 'Sign In'}
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-sm font-medium">
                {language === 'bn' ? 'সাইন আপ' : 'Sign Up'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <LoginForm 
                onSuccess={handleSuccess}
                onSwitchToSignup={() => handleTabChange('signup')}
              />
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Create your GetIt account on our dedicated signup page</p>
                <button 
                  onClick={() => window.location.href = '/signup'}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
                >
                  Go to Signup Page
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};