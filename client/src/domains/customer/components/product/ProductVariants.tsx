/**
 * Product Variants Component
 * Advanced variant selection with visual options
 * Implements Amazon.com/Shopee.sg-level variant experience
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { 
  Palette, 
  Ruler, 
  Package, 
  Star,
  ShoppingCart,
  Heart,
  Check,
  AlertCircle,
  Zap,
  Clock
} from 'lucide-react';

interface ProductVariant {
  id: string;
  name: string;
  bengaliName?: string;
  type: 'color' | 'size' | 'style' | 'capacity' | 'material' | 'pattern';
  value: string;
  displayValue?: string;
  colorCode?: string;
  image?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sku: string;
  isAvailable: boolean;
  isPopular?: boolean;
  discount?: number;
}

interface VariantCombination {
  id: string;
  variants: { [key: string]: string };
  price: number;
  originalPrice?: number;
  stock: number;
  sku: string;
  images: string[];
  isAvailable: boolean;
  estimatedDelivery: string;
}

interface ProductVariantsProps {
  productId?: string;
  productTitle?: string;
  variants?: ProductVariant[];
  combinations?: VariantCombination[];
  className?: string;
  language?: 'en' | 'bn';
}

export const ProductVariants: React.FC<ProductVariantsProps> = ({
  productId = 'product_123',
  productTitle = 'Premium Wireless Headphones',
  className = '',
  language = 'en'
}) => {
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
  const [selectedCombination, setSelectedCombination] = useState<VariantCombination | null>(null);
  const [quantity, setQuantity] = useState(1);

  const sampleVariants: ProductVariant[] = [
    // Color variants
    {
      id: 'color_black',
      name: 'Color',
      bengaliName: 'রং',
      type: 'color',
      value: 'black',
      displayValue: 'Midnight Black',
      colorCode: '#000000',
      price: 2850,
      originalPrice: 4000,
      stock: 45,
      sku: 'WH-BLACK-001',
      isAvailable: true,
      isPopular: true
    },
    {
      id: 'color_white',
      name: 'Color',
      bengaliName: 'রং',
      type: 'color',
      value: 'white',
      displayValue: 'Pearl White',
      colorCode: '#FFFFFF',
      price: 2850,
      originalPrice: 4000,
      stock: 32,
      sku: 'WH-WHITE-001',
      isAvailable: true
    },
    {
      id: 'color_blue',
      name: 'Color',
      bengaliName: 'রং',
      type: 'color',
      value: 'blue',
      displayValue: 'Ocean Blue',
      colorCode: '#1E40AF',
      price: 2950,
      originalPrice: 4100,
      stock: 23,
      sku: 'WH-BLUE-001',
      isAvailable: true,
      discount: 5
    },
    {
      id: 'color_red',
      name: 'Color',
      bengaliName: 'রং',
      type: 'color',
      value: 'red',
      displayValue: 'Ruby Red',
      colorCode: '#DC2626',
      price: 3050,
      originalPrice: 4200,
      stock: 0,
      sku: 'WH-RED-001',
      isAvailable: false
    },
    // Size variants
    {
      id: 'size_standard',
      name: 'Size',
      bengaliName: 'সাইজ',
      type: 'size',
      value: 'standard',
      displayValue: 'Standard',
      price: 2850,
      stock: 67,
      sku: 'WH-STD-001',
      isAvailable: true,
      isPopular: true
    },
    {
      id: 'size_xl',
      name: 'Size',
      bengaliName: 'সাইজ',
      type: 'size',
      value: 'xl',
      displayValue: 'XL (Large Head)',
      price: 3050,
      originalPrice: 4200,
      stock: 34,
      sku: 'WH-XL-001',
      isAvailable: true
    },
    // Storage variants
    {
      id: 'storage_32gb',
      name: 'Storage',
      bengaliName: 'স্টোরেজ',
      type: 'capacity',
      value: '32gb',
      displayValue: '32GB Built-in',
      price: 2850,
      stock: 45,
      sku: 'WH-32GB-001',
      isAvailable: true
    },
    {
      id: 'storage_64gb',
      name: 'Storage',
      bengaliName: 'স্টোরেজ',
      type: 'capacity',
      value: '64gb',
      displayValue: '64GB Built-in',
      price: 3250,
      originalPrice: 4500,
      stock: 28,
      sku: 'WH-64GB-001',
      isAvailable: true,
      isPopular: true
    }
  ];

  const sampleCombinations: VariantCombination[] = [
    {
      id: 'combo_1',
      variants: { color: 'black', size: 'standard', storage: '32gb' },
      price: 2850,
      originalPrice: 4000,
      stock: 15,
      sku: 'WH-BLK-STD-32GB',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400'
      ],
      isAvailable: true,
      estimatedDelivery: '1-2 days'
    },
    {
      id: 'combo_2',
      variants: { color: 'white', size: 'standard', storage: '64gb' },
      price: 3250,
      originalPrice: 4500,
      stock: 8,
      sku: 'WH-WHT-STD-64GB',
      images: [
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400'
      ],
      isAvailable: true,
      estimatedDelivery: '2-3 days'
    }
  ];

  const variantTypes = Array.from(new Set(sampleVariants.map(v => v.type)));
  
  useEffect(() => {
    // Find matching combination when variants are selected
    const matchingCombo = sampleCombinations.find(combo => {
      return Object.entries(selectedVariants).every(([type, value]) => {
        const variantType = sampleVariants.find(v => v.value === value)?.type;
        return combo.variants[variantType!] === value;
      });
    });
    setSelectedCombination(matchingCombo || null);
  }, [selectedVariants]);

  const getVariantsByType = (type: string) => {
    return sampleVariants.filter(v => v.type === type);
  };

  const getVariantIcon = (type: string) => {
    switch (type) {
      case 'color': return <Palette className="w-4 h-4" />;
      case 'size': return <Ruler className="w-4 h-4" />;
      case 'capacity': return <Package className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getVariantTypeName = (type: string) => {
    if (language === 'bn') {
      switch (type) {
        case 'color': return 'রং';
        case 'size': return 'সাইজ';
        case 'capacity': return 'স্টোরেজ';
        case 'material': return 'উপাদান';
        case 'style': return 'স্টাইল';
        case 'pattern': return 'প্যাটার্ন';
        default: return 'ভ্যারিয়েন্ট';
      }
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    if (!variant.isAvailable) return;
    
    setSelectedVariants(prev => ({
      ...prev,
      [variant.type]: variant.value
    }));
  };

  const isVariantSelected = (variant: ProductVariant) => {
    return selectedVariants[variant.type] === variant.value;
  };

  const getSelectedPrice = () => {
    if (selectedCombination) {
      return selectedCombination.price;
    }
    
    const selectedVariantList = Object.values(selectedVariants)
      .map(value => sampleVariants.find(v => v.value === value))
      .filter(Boolean) as ProductVariant[];
    
    if (selectedVariantList.length === 0) return 2850; // Base price
    
    return Math.max(...selectedVariantList.map(v => v.price));
  };

  const getSelectedOriginalPrice = () => {
    if (selectedCombination?.originalPrice) {
      return selectedCombination.originalPrice;
    }
    
    const selectedVariantList = Object.values(selectedVariants)
      .map(value => sampleVariants.find(v => v.value === value))
      .filter(Boolean) as ProductVariant[];
    
    const originalPrices = selectedVariantList
      .map(v => v.originalPrice)
      .filter(Boolean) as number[];
    
    if (originalPrices.length === 0) return 4000; // Base original price
    
    return Math.max(...originalPrices);
  };

  const getAvailableStock = () => {
    if (selectedCombination) {
      return selectedCombination.stock;
    }
    
    const selectedVariantList = Object.values(selectedVariants)
      .map(value => sampleVariants.find(v => v.value === value))
      .filter(Boolean) as ProductVariant[];
    
    if (selectedVariantList.length === 0) return 100;
    
    return Math.min(...selectedVariantList.map(v => v.stock));
  };

  const currentPrice = getSelectedPrice();
  const currentOriginalPrice = getSelectedOriginalPrice();
  const currentStock = getAvailableStock();
  const isInStock = currentStock > 0;

  return (
    <div className={`product-variants ${className}`}>
      <div className="space-y-6">
        {/* Variant Selection */}
        {variantTypes.map((type) => {
          const variants = getVariantsByType(type);
          
          return (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getVariantIcon(type)}
                  {getVariantTypeName(type)}
                  {selectedVariants[type] && (
                    <Badge variant="outline" className="text-xs">
                      {variants.find(v => v.value === selectedVariants[type])?.displayValue || 
                       variants.find(v => v.value === selectedVariants[type])?.value}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {variants.map((variant) => (
                    <div
                      key={variant.id}
                      className={`relative border-2 rounded-lg p-3 cursor-pointer transition-all ${
                        isVariantSelected(variant)
                          ? 'border-blue-500 bg-blue-50'
                          : variant.isAvailable
                          ? 'border-gray-200 hover:border-gray-300'
                          : 'border-gray-100 opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => handleVariantSelect(variant)}
                    >
                      {/* Color Preview */}
                      {type === 'color' && variant.colorCode && (
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-gray-200"
                            style={{ backgroundColor: variant.colorCode }}
                          />
                          <span className="text-sm font-medium">{variant.displayValue}</span>
                        </div>
                      )}
                      
                      {/* Non-color variants */}
                      {type !== 'color' && (
                        <div className="text-sm font-medium mb-2">
                          {variant.displayValue || variant.value}
                        </div>
                      )}

                      {/* Price difference */}
                      {variant.price !== 2850 && (
                        <div className="text-xs text-gray-600 mb-1">
                          {variant.price > 2850 ? '+' : ''}৳{(variant.price - 2850).toLocaleString()}
                        </div>
                      )}

                      {/* Stock indicator */}
                      <div className="flex items-center justify-between text-xs">
                        <span className={variant.isAvailable ? 'text-green-600' : 'text-red-600'}>
                          {variant.isAvailable 
                            ? (variant.stock > 10 
                              ? (language === 'bn' ? 'স্টকে আছে' : 'In Stock')
                              : `${variant.stock} ${language === 'bn' ? 'টি বাকি' : 'left'}`
                            )
                            : (language === 'bn' ? 'স্টকে নেই' : 'Out of Stock')
                          }
                        </span>
                        {variant.isPopular && (
                          <Badge className="bg-orange-500 text-white text-xs">
                            <Zap className="w-2 h-2 mr-1" />
                            {language === 'bn' ? 'জনপ্রিয়' : 'Popular'}
                          </Badge>
                        )}
                      </div>

                      {/* Discount badge */}
                      {variant.discount && (
                        <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs">
                          -{variant.discount}%
                        </Badge>
                      )}

                      {/* Selected indicator */}
                      {isVariantSelected(variant) && (
                        <div className="absolute -top-1 -left-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Selected Combination Summary */}
        {Object.keys(selectedVariants).length > 0 && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'bn' ? 'নির্বাচিত ভ্যারিয়েন্ট' : 'Selected Variant'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">
                    {language === 'bn' ? 'কনফিগারেশন' : 'Configuration'}
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(selectedVariants).map(([type, value]) => {
                      const variant = sampleVariants.find(v => v.value === value);
                      return (
                        <div key={type} className="flex justify-between">
                          <span className="text-gray-600">{getVariantTypeName(type)}:</span>
                          <span className="font-medium">
                            {variant?.displayValue || variant?.value}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {selectedCombination && (
                    <div className="mt-4 p-3 bg-white rounded border">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">SKU: {selectedCombination.sku}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">
                          {language === 'bn' ? 'ডেলিভারি:' : 'Delivery:'} {selectedCombination.estimatedDelivery}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-3">
                    {language === 'bn' ? 'মূল্য ও স্টক' : 'Price & Stock'}
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-blue-600">
                        ৳{currentPrice.toLocaleString()}
                      </span>
                      {currentOriginalPrice > currentPrice && (
                        <>
                          <span className="text-lg text-gray-500 line-through">
                            ৳{currentOriginalPrice.toLocaleString()}
                          </span>
                          <Badge className="bg-red-500 text-white">
                            -{Math.round((1 - currentPrice / currentOriginalPrice) * 100)}%
                          </Badge>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isInStock ? (
                        <>
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                          <span className="text-green-600">
                            {currentStock > 10 
                              ? (language === 'bn' ? 'স্টকে আছে' : 'In Stock')
                              : `${currentStock} ${language === 'bn' ? 'টি বাকি' : 'left'}`
                            }
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span className="text-red-600">
                            {language === 'bn' ? 'স্টকে নেই' : 'Out of Stock'}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3">
                      <label className="font-medium">
                        {language === 'bn' ? 'পরিমাণ:' : 'Quantity:'}
                      </label>
                      <div className="flex items-center border rounded">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, Math.min(currentStock, parseInt(e.target.value) || 1)))}
                          className="w-16 text-center border-0"
                          min="1"
                          max={currentStock}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                          disabled={quantity >= currentStock}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-3">
                      <Button 
                        className="flex-1" 
                        disabled={!isInStock}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {language === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}
                      </Button>
                      <Button variant="outline">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Total Price */}
                    {quantity > 1 && (
                      <div className="pt-3 border-t">
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {language === 'bn' ? 'মোট মূল্য:' : 'Total Price:'}
                          </span>
                          <span className="text-xl font-bold text-blue-600">
                            ৳{(currentPrice * quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Variant Images */}
        {selectedCombination?.images && (
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'bn' ? 'পণ্যের ছবি' : 'Product Images'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedCombination.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Variant image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Variant Guide */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">
              {language === 'bn' ? 'ভ্যারিয়েন্ট গাইড' : 'Variant Guide'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h5 className="font-medium mb-2">
                  {language === 'bn' ? 'রং নির্বাচন' : 'Color Selection'}
                </h5>
                <p className="text-gray-600">
                  {language === 'bn' 
                    ? 'প্রতিটি রং আলাদা মূল্যে পাওয়া যেতে পারে'
                    : 'Each color may have different pricing'}
                </p>
              </div>
              <div>
                <h5 className="font-medium mb-2">
                  {language === 'bn' ? 'সাইজ বিবেচনা' : 'Size Considerations'}
                </h5>
                <p className="text-gray-600">
                  {language === 'bn' 
                    ? 'আপনার মাথার সাইজ অনুযায়ী বেছে নিন'
                    : 'Choose based on your head size for comfort'}
                </p>
              </div>
              <div>
                <h5 className="font-medium mb-2">
                  {language === 'bn' ? 'স্টোরেজ সুবিধা' : 'Storage Benefits'}
                </h5>
                <p className="text-gray-600">
                  {language === 'bn' 
                    ? 'বেশি স্টোরেজ বেশি মিউজিক সংরক্ষণ করতে পারে'
                    : 'Higher storage allows more music offline'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductVariants;