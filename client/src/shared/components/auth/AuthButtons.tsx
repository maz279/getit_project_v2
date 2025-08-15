import { LogIn, UserPlus, User } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useAuth } from '@/domains/customer/auth/components/AuthProvider';
import { UserDropdown } from './UserDropdown';
import { useSimpleLanguage } from '@/contexts/SimpleLanguageContext';
import { useNavigate } from 'react-router-dom';

interface AuthButtonsProps {
  className?: string;
}

export const AuthButtons: React.FC<AuthButtonsProps> = ({ className = '' }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { language } = useSimpleLanguage();
  const navigate = useNavigate();

  const handleLoginClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Sign in button clicked, navigating to /login');
    console.log('Current navigate function:', typeof navigate);
    navigate('/login');
    console.log('Navigate called for /login');
  };

  const handleSignupClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Signup button clicked, navigating to /signup');
    console.log('Current navigate function:', typeof navigate);
    navigate('/signup');
    console.log('Navigate called for /signup');
  };

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className={`flex items-center ${className}`}>
        <UserDropdown />
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Sign In Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLoginClick}
        className="text-white hover:bg-white/10 transition-colors flex items-center space-x-2 px-3 py-2 rounded-lg"
      >
        <LogIn className="w-4 h-4" />
        <span className="font-medium">
          {language === 'bn' ? 'লগইন' : 'Sign In'}
        </span>
      </Button>

      {/* Sign Up Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleSignupClick}
        className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-gray-900 transition-colors flex items-center space-x-2 px-3 py-2 rounded-lg backdrop-blur-sm"
      >
        <UserPlus className="w-4 h-4" />
        <span className="font-medium">
          {language === 'bn' ? 'সাইন আপ' : 'Sign Up'}
        </span>
      </Button>

      {/* Mobile: Single Account Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLoginClick}
        className="md:hidden text-white hover:bg-white/10 transition-colors p-2 rounded-lg"
        title={language === 'bn' ? 'অ্যাকাউন্ট' : 'Account'}
      >
        <User className="w-5 h-5" />
      </Button>
    </div>
  );
};