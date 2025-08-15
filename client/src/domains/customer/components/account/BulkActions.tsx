
import React, { useState } from 'react';
import { Trash2, ShoppingCart, Share2, Archive, Check, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Badge } from '@/shared/ui/badge';

interface BulkActionsProps {
  selectedItems: number[];
  totalItems: number;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onBulkRemove: (ids: number[]) => void;
  onBulkAddToCart: (ids: number[]) => void;
  onBulkShare: (ids: number[]) => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedItems,
  totalItems,
  onSelectAll,
  onSelectNone,
  onBulkRemove,
  onBulkAddToCart,
  onBulkShare
}) => {
  const [showBulkActions, setShowBulkActions] = useState(false);

  const isAllSelected = selectedItems.length === totalItems;
  const isNoneSelected = selectedItems.length === 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={isAllSelected ? onSelectNone : onSelectAll}
              id="select-all"
            />
            <label htmlFor="select-all" className="text-sm font-medium text-gray-700">
              Select All ({totalItems} items)
            </label>
          </div>
          
          {selectedItems.length > 0 && (
            <Badge variant="secondary" className="text-sm">
              {selectedItems.length} selected
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkActions(!showBulkActions)}
            disabled={isNoneSelected}
          >
            Bulk Actions
          </Button>
          
          {!isNoneSelected && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSelectNone}
            >
              <X className="w-4 h-4" />
              Clear Selection
            </Button>
          )}
        </div>
      </div>

      {showBulkActions && selectedItems.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAddToCart(selectedItems)}
              className="flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Add All to Cart
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkShare(selectedItems)}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share Selected
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkRemove(selectedItems)}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Remove Selected
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
