
import React from 'react';
import { UserManagementForm } from './forms/UserManagementForm';
import { RoleManagementForm } from './forms/RoleManagementForm';
import { PermissionsManagementForm } from './forms/PermissionsManagementForm';
import { ActivityLogsForm } from './forms/ActivityLogsForm';
import { ActivityReportsForm } from './forms/ActivityReportsForm';
import { RegistrationTrendsForm } from './forms/RegistrationTrendsForm';
import { DemographicsForm } from './forms/DemographicsForm';
import { AdminListManagement } from '../dashboard/sections/AdminListManagement';

interface UserManagementContentProps {
  selectedSubmenu: string;
}

export const UserManagementContent: React.FC<UserManagementContentProps> = ({ selectedSubmenu }) => {
  console.log('🔍 UserManagementContent - selectedSubmenu:', selectedSubmenu);
  console.log('🔍 UserManagementContent - selectedSubmenu type:', typeof selectedSubmenu);
  
  const getContent = () => {
    console.log('🎯 UserManagementContent getContent switch - selectedSubmenu:', selectedSubmenu);
    
    // Normalize the submenu value
    const normalizedSubmenu = selectedSubmenu?.toString().trim().toLowerCase();
    console.log('🔍 Normalized submenu:', normalizedSubmenu);
    
    switch (normalizedSubmenu) {
      case 'admin-users':
      case 'admin-list':
        console.log('✅ Rendering AdminListManagement for admin-users');
        return <AdminListManagement />;
      
      case 'user-analytics':
        console.log('✅ Rendering UserManagementForm for user-analytics');
        return <UserManagementForm />;
      
      case 'user-permissions':
      case 'permissions':
        console.log('✅ Rendering PermissionsManagementForm for permissions');
        return <PermissionsManagementForm />;
      
      case 'role-management':
        console.log('✅ Rendering RoleManagementForm for role-management');
        return <RoleManagementForm />;
      
      case 'user-activity-logs':
      case 'activity-logs':
        console.log('✅ Rendering ActivityLogsForm for activity-logs');
        return <ActivityLogsForm />;
      
      case 'user-reports':
      case 'activity-reports':
        console.log('✅ Rendering ActivityReportsForm for activity-reports');
        return <ActivityReportsForm />;
      
      case 'access-control':
      case 'user-security':
        console.log('✅ Rendering PermissionsManagementForm for access-control');
        return <PermissionsManagementForm />;
      
      case 'user-overview':
        console.log('✅ Rendering UserManagementForm for user-overview');
        return <UserManagementForm />;
      
      case 'active-users':
      case 'inactive-users':
      case 'banned-users':
        console.log('✅ Rendering AdminListManagement for user status');
        return <AdminListManagement />;
      
      case 'user-verification':
      case 'user-settings':
        console.log('✅ Rendering UserManagementForm for user settings');
        return <UserManagementForm />;
      
      case 'registration-trends':
        console.log('✅ Rendering RegistrationTrendsForm for registration-trends');
        return <RegistrationTrendsForm />;
      
      case 'demographics':
      case 'user-demographics':
        console.log('✅ Rendering DemographicsForm for demographics');
        return <DemographicsForm />;
      
      default:
        console.log('⚠️ No matching submenu, defaulting to AdminListManagement');
        console.log('   selectedSubmenu was:', selectedSubmenu);
        return <AdminListManagement />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {getContent()}
    </div>
  );
};
