
import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

interface AuthButtonsProps {
  language: string;
}

export const AuthButtons: React.FC<AuthButtonsProps> = ({ language }) => {
  const content = {
    EN: {
      signIn: "Sign In",
      signUp: "Sign Up"
    },
    BD: {
      signIn: "লগইন",
      signUp: "নিবন্ধন"
    }
  };

  const currentContent = content[language as keyof typeof content];

  return (
    <div className="flex items-center gap-2">
      <Link
        to="/auth/login"
        className="flex items-center gap-2 px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
      >
        <LogIn className="w-4 h-4" />
        <span className="hidden sm:inline">{currentContent.signIn}</span>
      </Link>
      
      <Link
        to="/signup"
        className="flex items-center gap-2 px-3 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg transition-colors text-sm"
      >
        <UserPlus className="w-4 h-4" />
        <span className="hidden sm:inline">{currentContent.signUp}</span>
      </Link>
    </div>
  );
};
