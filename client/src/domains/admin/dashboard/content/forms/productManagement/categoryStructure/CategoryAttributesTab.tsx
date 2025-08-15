
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Tag, Settings, Plus, Edit } from 'lucide-react';
import { Category, CategoryAttribute, CategoryRule } from './types';

interface CategoryAttributesTabProps {
  categories: Category[];
  attributes: CategoryAttribute[];
  rules: CategoryRule[];
}

export const CategoryAttributesTab: React.FC<CategoryAttributesTabProps> = ({
  categories,
  attributes,
  rules
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Attributes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Tag className="h-5 w-5" />
                <span>Category Attributes</span>
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Attribute
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attributes.map((attribute) => (
                <div key={attribute.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{attribute.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline">{attribute.type}</Badge>
                      {attribute.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Rules */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Category Rules</span>
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{rule.name}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>Condition:</strong> {rule.condition}</p>
                    <p><strong>Action:</strong> {rule.action}</p>
                  </div>
                  <Badge variant="outline" className="mt-2">
                    {rule.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attribute Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>Attribute Assignment by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.slice(0, 5).map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{category.name}</h4>
                  <p className="text-sm text-gray-600">
                    {category.attributes?.length || 0} attributes assigned
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Manage Attributes
                  </Button>
                  <Button variant="outline" size="sm">
                    Apply Rules
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
