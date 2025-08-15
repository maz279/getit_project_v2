import React from 'react';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  language: string;
  onLanguageChange: (lang: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ language, onLanguageChange }) => {
  return (
    <div className="relative">
      <button className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
        <Globe className="w-4 h-4" />
      </button>
    </div>
  );
};