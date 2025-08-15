
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Badge } from '@/shared/ui/badge';
import { Label } from '@/shared/ui/label';
import { Search, Globe, TrendingUp, Eye, MousePointer } from 'lucide-react';
import { Category, CategorySEOData } from './types';

interface CategorySEOTabProps {
  categories: Category[];
  seoData: CategorySEOData[];
  onSEOUpdate: (categoryId: string, updates: any) => void;
}

export const CategorySEOTab: React.FC<CategorySEOTabProps> = ({
  categories,
  seoData,
  onSEOUpdate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const currentSEO = seoData.find(seo => seo.categoryId === selectedCategory);

  return (
    <div className="space-y-6">
      {/* SEO Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Search Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">2.3</div>
            <p className="text-xs text-muted-foreground">Top 3 average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">223K</div>
            <p className="text-xs text-muted-foreground">+15% this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg CTR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">4.0%</div>
            <p className="text-xs text-muted-foreground">Above industry avg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">SEO Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">87%</div>
            <p className="text-xs text-muted-foreground">Good optimization</p>
          </CardContent>
        </Card>
      </div>

      {/* Category SEO Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Category SEO Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {seoData.map((seo) => {
              const category = categories.find(cat => cat.id === seo.categoryId);
              return (
                <div key={seo.categoryId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{category?.name || 'Unknown Category'}</h4>
                    <p className="text-sm text-gray-600">{seo.title}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Rank #{seo.searchRanking}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{seo.impressions?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MousePointer className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">{seo.clickThroughRate}%</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCategory(seo.categoryId)}
                    >
                      Edit SEO
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* SEO Edit Form */}
      {selectedCategory && currentSEO && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>SEO Settings - {categories.find(cat => cat.id === selectedCategory)?.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic SEO */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic SEO</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    defaultValue={currentSEO.title}
                    placeholder="Category SEO title"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {currentSEO.title.length}/60 characters
                  </p>
                </div>
                <div>
                  <Label htmlFor="seoDescription">Meta Description</Label>
                  <Textarea
                    id="seoDescription"
                    defaultValue={currentSEO.description}
                    placeholder="Category meta description"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {currentSEO.description.length}/160 characters
                  </p>
                </div>
                <div>
                  <Label htmlFor="seoKeywords">Keywords</Label>
                  <Input
                    id="seoKeywords"
                    defaultValue={currentSEO.keywords.join(', ')}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </div>
            </div>

            {/* Open Graph */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Open Graph (Social Media)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ogTitle">OG Title</Label>
                  <Input
                    id="ogTitle"
                    defaultValue={currentSEO.ogTitle}
                    placeholder="Open Graph title"
                  />
                </div>
                <div>
                  <Label htmlFor="ogImage">OG Image URL</Label>
                  <Input
                    id="ogImage"
                    defaultValue={currentSEO.ogImage}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="ogDescription">OG Description</Label>
                <Textarea
                  id="ogDescription"
                  defaultValue={currentSEO.ogDescription}
                  placeholder="Open Graph description"
                  rows={2}
                />
              </div>
            </div>

            {/* Twitter Cards */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Twitter Cards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="twitterTitle">Twitter Title</Label>
                  <Input
                    id="twitterTitle"
                    defaultValue={currentSEO.twitterTitle}
                    placeholder="Twitter card title"
                  />
                </div>
                <div>
                  <Label htmlFor="twitterImage">Twitter Image URL</Label>
                  <Input
                    id="twitterImage"
                    defaultValue={currentSEO.twitterImage}
                    placeholder="https://example.com/twitter-image.jpg"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="twitterDescription">Twitter Description</Label>
                <Textarea
                  id="twitterDescription"
                  defaultValue={currentSEO.twitterDescription}
                  placeholder="Twitter card description"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSelectedCategory('')}>
                Cancel
              </Button>
              <Button onClick={() => onSEOUpdate(selectedCategory, {})}>
                Save SEO Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SEO Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium">Optimize category descriptions</p>
                <p className="text-sm text-gray-600">12 categories missing meta descriptions</p>
              </div>
              <Badge variant="secondary">Medium Priority</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <p className="font-medium">Add structured data</p>
                <p className="text-sm text-gray-600">Enable rich snippets for better visibility</p>
              </div>
              <Badge variant="destructive">High Priority</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">Internal linking optimization</p>
                <p className="text-sm text-gray-600">Improve category cross-linking</p>
              </div>
              <Badge variant="outline">Low Priority</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
