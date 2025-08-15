import React from 'react';
import { User } from 'lucide-react';

interface UserProfileDropdownProps {
  language: string;
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ language }) => {
  return (
    <div className="relative">
      <button className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
        <User className="w-5 h-5" />
      </button>
    </div>
  );
};