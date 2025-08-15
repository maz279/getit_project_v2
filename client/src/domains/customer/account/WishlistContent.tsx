
import React, { useState } from 'react';
import { WishlistDashboard } from './WishlistDashboard';
import { WishlistCategories } from './WishlistCategories';
import { SmartNotifications } from './SmartNotifications';
import { PrivacyControls } from './PrivacyControls';
import { PriceAlerts } from './PriceAlerts';
import { WishlistSharing } from './WishlistSharing';
import { BulkActions } from './BulkActions';
import { WishlistItemsGrid } from './WishlistItemsGrid';
import { RecentlyViewed } from './RecentlyViewed';
import { WishlistRecommendations } from './WishlistRecommendations';

interface WishlistContentProps {
  wishlistItems: any[];
}

export const WishlistContent: React.FC<WishlistContentProps> = ({ wishlistItems }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const handleRemoveFromWishlist = (id: number) => {
    console.log('Remove from wishlist:', id);
  };

  const handleAddToCart = (id: number) => {
    console.log('Add to cart:', id);
  };

  const handleShare = (id: number) => {
    console.log('Share product:', id);
  };

  const handleQuickView = (id: number) => {
    console.log('Quick view:', id);
  };

  const handleSortChange = (sort: string) => {
    console.log('Sort changed to:', sort);
  };

  const handleFilterChange = (newFilters: any) => {
    console.log('Filters changed:', newFilters);
  };

  const handleSelectAll = () => {
    setSelectedItems(wishlistItems.map(item => item.id));
  };

  const handleSelectNone = () => {
    setSelectedItems([]);
  };

  const handleBulkRemove = (ids: number[]) => {
    console.log('Bulk remove:', ids);
    setSelectedItems([]);
  };

  const handleBulkAddToCart = (ids: number[]) => {
    console.log('Bulk add to cart:', ids);
    setSelectedItems([]);
  };

  const handleBulkShare = (ids: number[]) => {
    console.log('Bulk share:', ids);
  };

  const handleCompare = (id: number) => {
    console.log('Compare product:', id);
  };

  const handleItemSelect = (id: number, selected: boolean) => {
    if (selected) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    }
  };

  // Dashboard stats
  const totalItems = wishlistItems.length;
  const totalValue = wishlistItems.reduce((sum, item) => sum + item.price, 0);
  const availableItems = wishlistItems.filter(item => item.stock.status === 'in_stock' || item.stock.status === 'limited').length;
  const priceDrops = wishlistItems.filter(item => item.originalPrice && item.originalPrice > item.price).length;

  return (
    <>
      {/* Dashboard Overview */}
      <WishlistDashboard
        totalItems={totalItems}
        totalValue={totalValue}
        availableItems={availableItems}
        priceDrops={priceDrops}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
        onViewModeChange={setViewMode}
        viewMode={viewMode}
      />

      {/* Categories Section */}
      <WishlistCategories
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Smart Notifications */}
      <SmartNotifications />

      {/* Privacy Controls */}
      <PrivacyControls />

      {/* Price Alerts Section */}
      <PriceAlerts />

      {/* Wishlist Sharing Section */}
      <WishlistSharing />

      {/* Bulk Actions */}
      <BulkActions
        selectedItems={selectedItems}
        totalItems={wishlistItems.length}
        onSelectAll={handleSelectAll}
        onSelectNone={handleSelectNone}
        onBulkRemove={handleBulkRemove}
        onBulkAddToCart={handleBulkAddToCart}
        onBulkShare={handleBulkShare}
      />

      {/* Main Wishlist Items */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Your Saved Items</h2>
        
        <WishlistItemsGrid
          items={wishlistItems}
          viewMode={viewMode}
          selectedItems={selectedItems}
          onItemSelect={handleItemSelect}
          onRemoveFromWishlist={handleRemoveFromWishlist}
          onAddToCart={handleAddToCart}
          onShare={handleShare}
          onQuickView={handleQuickView}
          onCompare={handleCompare}
        />
      </div>

      {/* Recently Viewed Section */}
      <RecentlyViewed />

      {/* Recommendations Section */}
      <WishlistRecommendations />
    </>
  );
};
