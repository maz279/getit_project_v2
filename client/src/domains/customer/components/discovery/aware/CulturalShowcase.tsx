/**
 * Phase 3: Aware Stage - Cultural Showcase
 * Amazon.com 5 A's Framework Implementation
 * Bangladesh Cultural Products and Heritage Collection
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  Heart, 
  Star, 
  Crown, 
  Calendar, 
  MapPin, 
  Users,
  Sparkles,
  Gift,
  Palette,
  Music,
  BookOpen,
  Shirt
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CulturalShowcaseProps {
  className?: string;
}

interface CulturalCollection {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  category: string;
  significance: string;
  products: CulturalProduct[];
  heritage: string;
  region: string;
  festival?: string;
  color: string;
  icon: any;
}

interface CulturalProduct {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  cultural: string;
  significance: string;
  artisan?: string;
  region: string;
  material: string;
  featured: boolean;
}

const CulturalShowcase: React.FC<CulturalShowcaseProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('featured');
  const [collections, setCollections] = useState<CulturalCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load cultural collections
    const loadCulturalData = () => {
      const culturalCollections: CulturalCollection[] = [
        {
          id: 'eid-special',
          title: 'ঈদ বিশেষ সংগ্রহ',
          titleEn: 'Eid Special Collection',
          description: 'Traditional and modern Eid wear for the whole family',
          category: 'Festival Fashion',
          significance: 'Celebrate Eid with authentic Bengali fashion',
          heritage: 'Islamic Traditional Wear',
          region: 'All Bangladesh',
          festival: 'Eid ul-Fitr, Eid ul-Adha',
          color: 'bg-green-500',
          icon: Crown,
          products: [
            {
              id: 'eid-1',
              name: 'প্রিমিয়াম ঈদ পাঞ্জাবি',
              nameEn: 'Premium Eid Panjabi',
              price: 3500,
              originalPrice: 5000,
              image: 'https://images.unsplash.com/photo-1583743089695-4b816a340f82?w=300',
              rating: 4.9,
              cultural: 'eid',
              significance: 'Traditional men\'s Eid wear',
              artisan: 'Dhaka Handloom',
              region: 'Dhaka',
              material: 'Cotton Khadi',
              featured: true
            },
            {
              id: 'eid-2',
              name: 'ঈদ বিশেষ শাড়ি',
              nameEn: 'Eid Special Saree',
              price: 6500,
              originalPrice: 8500,
              image: 'https://images.unsplash.com/photo-1610030469036-12993ce8c2c2?w=300',
              rating: 4.8,
              cultural: 'eid',
              significance: 'Elegant Eid saree for women',
              artisan: 'Tangail Weavers',
              region: 'Tangail',
              material: 'Silk Cotton',
              featured: true
            }
          ]
        },
        {
          id: 'pohela-boishakh',
          title: 'পহেলা বৈশাখ সংগ্রহ',
          titleEn: 'Pohela Boishakh Collection',
          description: 'Celebrate Bengali New Year with traditional attire',
          category: 'Cultural Festival',
          significance: 'Welcome the Bengali New Year in style',
          heritage: 'Bengali Cultural Heritage',
          region: 'Bengal Region',
          festival: 'Pohela Boishakh',
          color: 'bg-red-500',
          icon: Heart,
          products: [
            {
              id: 'pb-1',
              name: 'নববর্ষ শাড়ি',
              nameEn: 'New Year Saree',
              price: 4500,
              image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300',
              rating: 4.9,
              cultural: 'pohela-boishakh',
              significance: 'Traditional red and white Bengali saree',
              artisan: 'Comilla Handloom',
              region: 'Comilla',
              material: 'Handwoven Cotton',
              featured: true
            },
            {
              id: 'pb-2',
              name: 'বৈশাখী কুর্তা',
              nameEn: 'Boishakhi Kurta',
              price: 2200,
              image: 'https://images.unsplash.com/photo-1506629905042-87f36601c674?w=300',
              rating: 4.7,
              cultural: 'pohela-boishakh',
              significance: 'Colorful kurta for New Year celebration',
              artisan: 'Jamdani Craft',
              region: 'Sonargaon',
              material: 'Block Print Cotton',
              featured: false
            }
          ]
        },
        {
          id: 'jamdani-heritage',
          title: 'জামদানি ঐতিহ্য',
          titleEn: 'Jamdani Heritage',
          description: 'UNESCO recognized Jamdani weaving tradition',
          category: 'Heritage Craft',
          significance: 'World heritage weaving art of Bengal',
          heritage: 'UNESCO Cultural Heritage',
          region: 'Sonargaon, Dhaka',
          color: 'bg-purple-500',
          icon: Palette,
          products: [
            {
              id: 'jam-1',
              name: 'ঐতিহ্যবাহী জামদানি শাড়ি',
              nameEn: 'Traditional Jamdani Saree',
              price: 15000,
              originalPrice: 20000,
              image: 'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=300',
              rating: 5.0,
              cultural: 'jamdani',
              significance: 'Hand-woven traditional Jamdani with motifs',
              artisan: 'Master Weaver Karim',
              region: 'Sonargaon',
              material: 'Pure Cotton Jamdani',
              featured: true
            }
          ]
        },
        {
          id: 'nakshi-katha',
          title: 'নকশি কাঁথা',
          titleEn: 'Nakshi Kantha',
          description: 'Traditional embroidered quilts and crafts',
          category: 'Traditional Craft',
          significance: 'Folk art embroidery tradition',
          heritage: 'Bengali Folk Art',
          region: 'Rural Bangladesh',
          color: 'bg-yellow-500',
          icon: Sparkles,
          products: [
            {
              id: 'nk-1',
              name: 'হস্তশিল্প নকশি কাঁথা',
              nameEn: 'Handcrafted Nakshi Kantha',
              price: 2800,
              image: 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?w=300',
              rating: 4.8,
              cultural: 'nakshi-kantha',
              significance: 'Traditional embroidered quilt',
              artisan: 'Village Women Collective',
              region: 'Rajshahi',
              material: 'Recycled Cotton with Embroidery',
              featured: false
            }
          ]
        },
        {
          id: 'durga-puja',
          title: 'দুর্গা পূজা সংগ্রহ',
          titleEn: 'Durga Puja Collection',
          description: 'Festive wear for the biggest Bengali festival',
          category: 'Religious Festival',
          significance: 'Goddess Durga worship celebration',
          heritage: 'Hindu Bengali Tradition',
          region: 'West Bengal, Bangladesh',
          festival: 'Durga Puja',
          color: 'bg-orange-500',
          icon: Crown,
          products: [
            {
              id: 'dp-1',
              name: 'পূজা বিশেষ শাড়ি',
              nameEn: 'Puja Special Saree',
              price: 5200,
              image: 'https://images.unsplash.com/photo-1594736797933-d0cc2fe2baa3?w=300',
              rating: 4.7,
              cultural: 'durga-puja',
              significance: 'Festive saree for puja celebration',
              region: 'Dhaka',
              material: 'Silk Blend',
              featured: false
            }
          ]
        }
      ];

      setTimeout(() => {
        setCollections(culturalCollections);
        setLoading(false);
      }, 1000);
    };

    loadCulturalData();
  }, []);

  const ProductCard = ({ product }: { product: CulturalProduct }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.featured && (
          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            <Crown className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}
        <div className="absolute top-3 right-3">
          <Button size="sm" variant="secondary" className="rounded-full w-8 h-8 p-0">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        {product.originalPrice && (
          <Badge className="absolute bottom-3 left-3 bg-red-500 text-white">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="font-bold text-lg mb-1 line-clamp-2">{product.name}</h3>
          <p className="text-sm text-muted-foreground">{product.nameEn}</p>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-primary">
              ৳{product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ৳{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">{product.region}</span>
          </div>
          {product.artisan && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{product.artisan}</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground line-clamp-2">
            {product.significance}
          </p>
        </div>

        <Badge variant="outline" className="mb-3 text-xs">
          {product.material}
        </Badge>

        <Button className="w-full">
          <Gift className="h-4 w-4 mr-2" />
          Add to Cultural Collection
        </Button>
      </CardContent>
    </Card>
  );

  const CollectionHeader = ({ collection }: { collection: CulturalCollection }) => {
    const Icon = collection.icon;
    return (
      <Card className={cn('mb-6 overflow-hidden')}>
        <div className={cn('h-32 bg-gradient-to-r', collection.color, 'relative')}>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <Icon className="h-12 w-12 mx-auto mb-2" />
              <h2 className="text-2xl font-bold">{collection.title}</h2>
              <p className="text-sm opacity-90">{collection.titleEn}</p>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">সাংস্কৃতিক তাৎপর্য</h3>
              <p className="text-muted-foreground text-sm mb-4">{collection.significance}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Heritage:</span>
                  <span className="text-muted-foreground">{collection.heritage}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Region:</span>
                  <span className="text-muted-foreground">{collection.region}</span>
                </div>
                {collection.festival && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Festival:</span>
                    <span className="text-muted-foreground">{collection.festival}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Collection Highlights</h3>
              <p className="text-muted-foreground text-sm mb-4">{collection.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{collection.category}</Badge>
                <Badge variant="outline">{collection.products.length} Products</Badge>
                <Badge variant="outline">Authentic Craft</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className={cn('max-w-7xl mx-auto p-6', className)}>
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-muted rounded-lg w-96"></div>
          <div className="h-10 bg-muted rounded w-full"></div>
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const featuredProducts = collections.flatMap(c => c.products).filter(p => p.featured);
  const allProducts = collections.flatMap(c => c.products);

  return (
    <div className={cn('max-w-7xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full flex items-center justify-center">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">সাংস্কৃতিক প্রদর্শনী</h1>
            <p className="text-muted-foreground">
              Celebrating Bangladesh's rich cultural heritage through authentic products
            </p>
          </div>
        </div>

        {/* Cultural Stats */}
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">5+</div>
                <div className="text-sm text-muted-foreground">Heritage Crafts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">UNESCO</div>
                <div className="text-sm text-muted-foreground">Recognition</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">1000+</div>
                <div className="text-sm text-muted-foreground">Artisans</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">64</div>
                <div className="text-sm text-muted-foreground">Districts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cultural Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="featured">Featured Collections</TabsTrigger>
          <TabsTrigger value="festivals">Festival Collections</TabsTrigger>
          <TabsTrigger value="heritage">Heritage Crafts</TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="mt-6">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">বিশেষ নির্বাচিত পণ্য</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="festivals" className="mt-6">
          <div className="space-y-8">
            {collections.filter(c => c.festival).map((collection) => (
              <div key={collection.id}>
                <CollectionHeader collection={collection} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {collection.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="heritage" className="mt-6">
          <div className="space-y-8">
            {collections.filter(c => !c.festival).map((collection) => (
              <div key={collection.id}>
                <CollectionHeader collection={collection} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {collection.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Cultural Impact */}
      <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Supporting Cultural Heritage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Every purchase from our cultural showcase directly supports local artisans 
            and helps preserve Bangladesh's rich heritage. We work with master craftspeople 
            to bring you authentic, handmade products that tell the story of our culture.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Fair Trade Certified</Badge>
            <Badge variant="outline">Artisan Support Program</Badge>
            <Badge variant="outline">Heritage Preservation</Badge>
            <Badge variant="outline">Authentic Craftsmanship</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CulturalShowcase;