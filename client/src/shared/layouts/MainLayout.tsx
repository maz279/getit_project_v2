/**
 * MainLayout Component
 * Core layout component for the application
 */
import React from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;