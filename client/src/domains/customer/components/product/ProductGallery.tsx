/**
 * Product Gallery Component
 * Advanced image gallery with zoom, video, and 360° view
 * Implements Amazon.com/Shopee.sg-level media experience
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { 
  ZoomIn, 
  Play, 
  RotateCcw, 
  Share2, 
  Download,
  Maximize,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ProductMedia {
  id: string;
  type: 'image' | 'video' | '360';
  url: string;
  thumbnail: string;
  caption?: string;
  altText?: string;
}

interface ProductGalleryProps {
  productId?: string;
  media?: ProductMedia[];
  className?: string;
  language?: 'en' | 'bn';
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  productId = 'product_123',
  media = [],
  className = '',
  language = 'en'
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const defaultMedia: ProductMedia[] = [
    {
      id: '1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150',
      caption: 'Front view',
      altText: 'Premium headphones front view'
    },
    {
      id: '2',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=150',
      caption: 'Side view',
      altText: 'Premium headphones side view'
    },
    {
      id: '3',
      type: 'video',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150',
      caption: 'Product demo video',
      altText: 'Product demonstration video'
    },
    {
      id: '4',
      type: '360',
      url: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=150',
      caption: '360° view',
      altText: '360 degree product view'
    },
    {
      id: '5',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800',
      thumbnail: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=150',
      caption: 'Unboxing contents',
      altText: 'Product unboxing and contents'
    }
  ];

  const galleryMedia = media.length > 0 ? media : defaultMedia;
  const currentMedia = galleryMedia[selectedIndex];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  };

  const handlePreviousImage = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : galleryMedia.length - 1));
    setIsZoomed(false);
  };

  const handleNextImage = () => {
    setSelectedIndex((prev) => (prev < galleryMedia.length - 1 ? prev + 1 : 0));
    setIsZoomed(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Product Gallery',
        url: window.location.href
      });
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentMedia.url;
    link.download = `product-${productId}-${currentMedia.id}`;
    link.click();
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />;
      case '360': return <RotateCcw className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className={`product-gallery ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Thumbnail Strip */}
        <div className="order-2 lg:order-1 lg:col-span-1">
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-96">
            {galleryMedia.map((item, index) => (
              <div
                key={item.id}
                className={`relative flex-shrink-0 w-20 h-20 lg:w-full lg:h-20 border-2 rounded-lg overflow-hidden cursor-pointer transition-colors ${
                  selectedIndex === index 
                    ? 'border-blue-500 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedIndex(index)}
              >
                <img 
                  src={item.thumbnail} 
                  alt={item.altText || item.caption}
                  className="w-full h-full object-cover"
                />
                
                {/* Media Type Indicator */}
                {item.type !== 'image' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      {getMediaIcon(item.type)}
                    </div>
                  </div>
                )}
                
                {/* Selected Indicator */}
                {selectedIndex === index && (
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-lg" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Display */}
        <div className="order-1 lg:order-2 lg:col-span-3">
          <Card className="relative overflow-hidden">
            <div className="relative aspect-square bg-gray-100">
              {/* Media Display */}
              <div
                className="relative w-full h-full cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => currentMedia.type === 'image' && setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
              >
                {currentMedia.type === 'video' ? (
                  <video
                    controls
                    className="w-full h-full object-cover"
                    poster={currentMedia.thumbnail}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  >
                    <source src={currentMedia.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img 
                    src={currentMedia.url} 
                    alt={currentMedia.altText || currentMedia.caption}
                    className={`w-full h-full object-cover transition-transform duration-200 ${
                      isZoomed ? 'scale-150' : 'scale-100'
                    }`}
                    style={
                      isZoomed 
                        ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }
                        : {}
                    }
                  />
                )}
                
                {/* 360° Indicator */}
                {currentMedia.type === '360' && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-purple-600 text-white">
                      <RotateCcw className="w-3 h-3 mr-1" />
                      360°
                    </Badge>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <Button
                variant="outline"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                onClick={handlePreviousImage}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                onClick={handleNextImage}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/90 hover:bg-white"
                  onClick={() => setIsZoomed(!isZoomed)}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/90 hover:bg-white"
                  onClick={() => setIsFullscreen(true)}
                >
                  <Maximize className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/90 hover:bg-white"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/90 hover:bg-white"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>

              {/* Media Counter */}
              <div className="absolute bottom-4 left-4">
                <Badge variant="outline" className="bg-white/90">
                  {selectedIndex + 1} / {galleryMedia.length}
                </Badge>
              </div>

              {/* Zoom Hint */}
              {currentMedia.type === 'image' && !isZoomed && (
                <div className="absolute bottom-4 right-4">
                  <Badge variant="outline" className="bg-white/90 text-xs">
                    <ZoomIn className="w-3 h-3 mr-1" />
                    {language === 'bn' ? 'জুম করতে হোভার করুন' : 'Hover to zoom'}
                  </Badge>
                </div>
              )}
            </div>

            {/* Media Caption */}
            {currentMedia.caption && (
              <CardContent className="p-4">
                <p className="text-sm text-gray-600 text-center">
                  {currentMedia.caption}
                </p>
              </CardContent>
            )}
          </Card>

          {/* Gallery Features */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <ZoomIn className="w-5 h-5 mx-auto mb-1 text-blue-600" />
              <div className="text-xs text-blue-800">
                {language === 'bn' ? 'জুম ভিউ' : 'Zoom View'}
              </div>
            </div>
            
            <div className="text-center p-2 bg-purple-50 rounded-lg">
              <RotateCcw className="w-5 h-5 mx-auto mb-1 text-purple-600" />
              <div className="text-xs text-purple-800">
                {language === 'bn' ? '৩৬০° ভিউ' : '360° View'}
              </div>
            </div>
            
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <Play className="w-5 h-5 mx-auto mb-1 text-green-600" />
              <div className="text-xs text-green-800">
                {language === 'bn' ? 'ভিডিও ডেমো' : 'Video Demo'}
              </div>
            </div>
            
            <div className="text-center p-2 bg-orange-50 rounded-lg">
              <Download className="w-5 h-5 mx-auto mb-1 text-orange-600" />
              <div className="text-xs text-orange-800">
                {language === 'bn' ? 'ডাউনলোড' : 'Download'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="relative max-w-7xl max-h-full p-4">
            <img 
              src={currentMedia.url} 
              alt={currentMedia.altText || currentMedia.caption}
              className="max-w-full max-h-full object-contain"
            />
            
            <Button
              variant="outline"
              className="absolute top-4 right-4 bg-white"
              onClick={() => setIsFullscreen(false)}
            >
              ✕
            </Button>
            
            <Button
              variant="outline"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white"
              onClick={handlePreviousImage}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white"
              onClick={handleNextImage}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;