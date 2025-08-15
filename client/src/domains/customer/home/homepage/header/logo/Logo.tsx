
import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  language: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ language, className = "" }) => {
  const content = {
    EN: {
      name: "GETIT",
      tagline: "Shop Smart, Ship Fast, Pay Easy"
    },
    BD: {
      name: "গেটইট",
      tagline: "স্মার্ট কিনুন, দ্রুত পান, সহজে মূল্য দিন"
    }
  };

  const currentContent = content[language as keyof typeof content];

  return (
    <Link to="/" className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`}>
      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-red-500 to-yellow-400 rounded-lg flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-xs sm:text-sm">G</span>
      </div>
      <div className="flex flex-col">
        <span className="text-white font-bold text-sm sm:text-lg leading-tight">{currentContent.name}</span>
        <span className="text-yellow-200 text-xs hidden sm:block leading-tight">{currentContent.tagline}</span>
      </div>
    </Link>
  );
};
