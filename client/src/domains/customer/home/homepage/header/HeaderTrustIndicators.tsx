
import React from 'react';
import { Shield, Lock, Award } from 'lucide-react';

interface HeaderTrustIndicatorsProps {
  language: string;
}

export const HeaderTrustIndicators: React.FC<HeaderTrustIndicatorsProps> = ({ language }) => {
  const content = {
    EN: {
      secure: "Secure",
      verified: "Verified", 
      trusted: "Trusted"
    },
    BD: {
      secure: "নিরাপদ",
      verified: "যাচাইকৃত",
      trusted: "বিশ্বস্ত"
    }
  };

  const currentContent = content[language as keyof typeof content];

  return (
    <div className="hidden lg:flex items-center gap-4 text-white/80">
      <div className="flex items-center gap-1">
        <Shield className="w-4 h-4" />
        <span className="text-xs">{currentContent.secure}</span>
      </div>
      
      <div className="flex items-center gap-1">
        <Lock className="w-4 h-4" />
        <span className="text-xs">SSL</span>
      </div>
      
      <div className="flex items-center gap-1">
        <Award className="w-4 h-4" />
        <span className="text-xs">{currentContent.verified}</span>
      </div>
    </div>
  );
};
