
import React from 'react';
import { 
  User, 
  LogOut, 
  Settings, 
  Key, 
  Activity, 
  ShieldCheck, 
  ChevronDown 
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

interface AdminProfileDropdownProps {
  userProfile: any;
  handleSignOut: () => void;
}

export const AdminProfileDropdown: React.FC<AdminProfileDropdownProps> = ({
  userProfile,
  handleSignOut
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-3 p-2">
          <div className="hidden md:block text-right">
            <div className="text-sm font-medium text-gray-700">
              {userProfile?.full_name || 'John Doe'}
            </div>
            <div className="text-xs text-gray-500">
              Super Administrator
            </div>
          </div>
          
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User size={12} className="text-white" />
          </div>
          <ChevronDown size={10} className="text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-white border shadow-lg z-50" align="end">
        <DropdownMenuLabel>
          <div className="space-y-1">
            <div className="font-medium">{userProfile?.full_name || 'John Doe'}</div>
            <div className="text-xs text-gray-500">Super Administrator</div>
            <div className="text-xs text-gray-500">Last Login: Today, 09:30 AM</div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="flex items-center">
          <Settings size={12} className="mr-2" />
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center">
          <Key size={12} className="mr-2" />
          Change Password
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center">
          <Activity size={12} className="mr-2" />
          Activity Log
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center">
          <ShieldCheck size={12} className="mr-2" />
          Two-Factor Authentication
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="flex items-center text-red-600"
        >
          <LogOut size={12} className="mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
