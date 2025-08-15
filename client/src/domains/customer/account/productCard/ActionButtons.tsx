
import React from 'react';
import { Button } from '@/shared/ui/button';
import { Heart, Share2, Eye, GitCompare } from 'lucide-react';

interface ActionButtonsProps {
  id: number;
  onRemove: (id: number) => void;
  onShare: (id: number) => void;
  onQuickView: (id: number) => void;
  onCompare?: (id: number) => void;
  variant?: 'grid' | 'list';
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  id,
  onRemove,
  onShare,
  onQuickView,
  onCompare,
  variant = 'grid'
}) => {
  const buttonClasses = variant === 'list' 
    ? "flex flex-col gap-2 justify-center"
    : "absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity";

  const buttonStyle = variant === 'list'
    ? "p-2"
    : "p-2 bg-white shadow-lg";

  return (
    <div className={buttonClasses}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onRemove(id)}
        className={`${buttonStyle} text-red-500 hover:text-red-600 hover:bg-red-50`}
      >
        <Heart className="w-4 h-4 fill-current" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onShare(id)}
        className={buttonStyle}
      >
        <Share2 className="w-4 h-4" />
      </Button>
      {onCompare && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCompare(id)}
          className={buttonStyle}
        >
          <GitCompare className="w-4 h-4" />
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onQuickView(id)}
        className={buttonStyle}
      >
        <Eye className="w-4 h-4" />
      </Button>
    </div>
  );
};
