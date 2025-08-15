import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from '@/shared/layouts/components/Header/Header';
import { Footer } from '@/shared/layouts/components/Footer/Footer';
import UnifiedSearchResults from '@/shared/components/ai-search/UnifiedSearchResults';
import { useToast } from '@/shared/hooks/use-toast';

interface CustomerLayoutProps {
  children?: React.ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  // Wikipedia-style Search State Management
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [conversationalResponse, setConversationalResponse] = useState('');
  const [navigationResults, setNavigationResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle search from AISearchBar - Wikipedia-style inline display
  const handleSearchResults = (query: string, data: {
    searchResults?: any[];
    conversationalResponse?: string;
    navigationResults?: any[];
  }) => {
    setSearchQuery(query);
    setSearchResults(data.searchResults || []);
    setConversationalResponse(data.conversationalResponse || '');
    setNavigationResults(data.navigationResults || []);
    setIsSearchMode(true);
    setIsSearching(false);
    
    // Scroll to top to show search results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle search loading state
  const handleSearchLoading = (loading: boolean) => {
    setIsSearching(loading);
  };

  // Handle back to homepage
  const handleBackToHome = () => {
    setIsSearchMode(false);
    setSearchQuery('');
    setSearchResults([]);
    setConversationalResponse('');
    setNavigationResults([]);
  };

  // Handle navigation to pages
  const handleNavigateToPage = (route: string, title: string) => {
    navigate(route);
    toast({ title: `Navigating to ${title}` });
    setIsSearchMode(false); // Exit search mode when navigating
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Persistent Header */}
      <Header 
        onSearch={handleSearchResults}
        onSearchLoading={handleSearchLoading}
        cartCount={2}
        wishlistCount={7}
        notificationCount={3}
        isAuthenticated={false}
        variant="default"
        sticky={true}
      />

      {/* Dynamic Main Content Area */}
      <main className="relative">
        {isSearchMode ? (
          // Wikipedia-style Search Results - Inline display
          <div className="container mx-auto px-4 py-6">
            <div className="mb-4">
              <button 
                onClick={handleBackToHome}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center mb-4"
              >
                ← Back to Homepage
              </button>
            </div>
            
            <UnifiedSearchResults
              showConversationalResponse={!!conversationalResponse}
              conversationalResponse={conversationalResponse}
              query={searchQuery}
              showNavigationResults={navigationResults.length > 0}
              navigationResults={navigationResults}
              showResults={searchResults.length > 0}
              searchResults={searchResults}
              onClose={handleBackToHome}
              onNavigateToPage={handleNavigateToPage}
              language="en"
            />
          </div>
        ) : (
          // Normal Page Content Mode - Show routed page content
          <div className="pt-0">
            {children || <Outlet />}
          </div>
        )}
      </main>

      {/* Persistent Footer */}
      <Footer />
    </div>
  );
};

export default CustomerLayout;