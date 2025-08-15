
import React from 'react';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import { CategoryCardProps } from './types';

export const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  activeCategory, 
  onCategoryChange 
}) => (
  <Card 
    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
      activeCategory === category.id 
        ? 'ring-2 ring-blue-500 shadow-lg' 
        : 'hover:shadow-lg'
    }`}
    onClick={() => onCategoryChange(category.id)}
  >
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${category.bgColor}`}>
          <category.icon className={`w-5 h-5 ${category.color}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{category.name}</h3>
          <p className="text-sm text-gray-500">{category.nameBn}</p>
          <p className="text-xs text-gray-400 mt-1">{category.description}</p>
        </div>
        <div className="text-center">
          <Badge variant="secondary" className="text-sm">
            {category.count}
          </Badge>
        </div>
      </div>
    </CardContent>
  </Card>
);
