import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Separator } from '@/shared/ui/separator';
import { 
  Info, 
  Cpu, 
  Monitor, 
  Battery, 
  Wifi, 
  Camera, 
  Smartphone,
  Package,
  Truck,
  Shield,
  Star,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface ProductSpec {
  category: string;
  specs: Array<{
    name: string;
    value: string;
    important?: boolean;
  }>;
}

interface ProductSpecsProps {
  productId?: string;
  productName?: string;
}

export const ProductSpecs: React.FC<ProductSpecsProps> = ({ 
  productId = '1', 
  productName = 'Premium Smartphone' 
}) => {
  const [activeTab, setActiveTab] = useState('technical');

  // Mock product specifications - in real app, this would come from API
  const productSpecs: ProductSpec[] = [
    {
      category: 'Display',
      specs: [
        { name: 'Screen Size', value: '6.7 inches', important: true },
        { name: 'Resolution', value: '2778 x 1284 pixels', important: true },
        { name: 'Display Type', value: 'Super Retina XDR OLED' },
        { name: 'Refresh Rate', value: '120Hz ProMotion' },
        { name: 'Brightness', value: '1000 nits typical, 1200 nits HDR' },
        { name: 'Color Gamut', value: 'P3 Wide Color' }
      ]
    },
    {
      category: 'Performance',
      specs: [
        { name: 'Processor', value: 'A16 Bionic chip', important: true },
        { name: 'RAM', value: '8GB', important: true },
        { name: 'Storage', value: '256GB', important: true },
        { name: 'GPU', value: '5-core GPU' },
        { name: 'Neural Engine', value: '16-core Neural Engine' }
      ]
    },
    {
      category: 'Camera',
      specs: [
        { name: 'Rear Camera', value: '48MP Main + 12MP Ultra Wide + 12MP Telephoto', important: true },
        { name: 'Front Camera', value: '12MP TrueDepth', important: true },
        { name: 'Video Recording', value: '4K at 60fps' },
        { name: 'Optical Zoom', value: '3x optical zoom in, 2x optical zoom out' },
        { name: 'Digital Zoom', value: 'Up to 15x digital zoom' },
        { name: 'Night Mode', value: 'Available on all cameras' }
      ]
    },
    {
      category: 'Battery & Power',
      specs: [
        { name: 'Battery Life', value: 'Up to 29 hours video playback', important: true },
        { name: 'Charging', value: 'Lightning to USB-C cable' },
        { name: 'Wireless Charging', value: 'MagSafe and Qi wireless charging' },
        { name: 'Fast Charging', value: '50% charge in 30 minutes' }
      ]
    },
    {
      category: 'Connectivity',
      specs: [
        { name: '5G', value: 'Sub-6 GHz and mmWave', important: true },
        { name: 'Wi-Fi', value: 'Wi-Fi 6 (802.11ax)' },
        { name: 'Bluetooth', value: 'Bluetooth 5.3' },
        { name: 'NFC', value: 'NFC with reader mode' },
        { name: 'SIM', value: 'Dual SIM (nano-SIM and eSIM)' }
      ]
    },
    {
      category: 'Physical',
      specs: [
        { name: 'Dimensions', value: '160.8 x 78.1 x 7.65 mm' },
        { name: 'Weight', value: '240g' },
        { name: 'Build Material', value: 'Aerospace-grade aluminum frame' },
        { name: 'Water Resistance', value: 'IP68 rating' },
        { name: 'Colors', value: 'Deep Purple, Gold, Silver, Space Black' }
      ]
    }
  ];

  const features = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'IP68 Water Resistance',
      description: 'Protected against water and dust'
    },
    {
      icon: <Camera className="w-5 h-5" />,
      title: 'ProRAW Photography',
      description: 'Professional-grade photo capture'
    },
    {
      icon: <Battery className="w-5 h-5" />,
      title: 'All-Day Battery Life',
      description: 'Up to 29 hours of video playback'
    },
    {
      icon: <Cpu className="w-5 h-5" />,
      title: 'A16 Bionic Chip',
      description: 'Industry-leading performance'
    }
  ];

  const compatibility = [
    { name: 'iOS Version', value: 'iOS 16 or later', compatible: true },
    { name: 'CarPlay', value: 'Wireless CarPlay', compatible: true },
    { name: 'AirPods', value: 'All AirPods models', compatible: true },
    { name: 'Apple Watch', value: 'Series 4 or later', compatible: true },
    { name: 'MagSafe', value: 'All MagSafe accessories', compatible: true }
  ];

  const certifications = [
    { name: 'FCC', status: 'Certified', icon: <CheckCircle className="w-4 h-4 text-green-600" /> },
    { name: 'CE', status: 'Certified', icon: <CheckCircle className="w-4 h-4 text-green-600" /> },
    { name: 'RoHS', status: 'Compliant', icon: <CheckCircle className="w-4 h-4 text-green-600" /> },
    { name: 'Energy Star', status: 'Qualified', icon: <CheckCircle className="w-4 h-4 text-green-600" /> }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="w-5 h-5 mr-2 text-blue-600" />
            Product Specifications
          </CardTitle>
          <CardDescription>
            Detailed technical specifications for {productName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
              <TabsTrigger value="certifications">Certifications</TabsTrigger>
            </TabsList>

            <TabsContent value="technical" className="space-y-6">
              {productSpecs.map((category, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      {category.category === 'Display' && <Monitor className="w-5 h-5 mr-2 text-blue-600" />}
                      {category.category === 'Performance' && <Cpu className="w-5 h-5 mr-2 text-green-600" />}
                      {category.category === 'Camera' && <Camera className="w-5 h-5 mr-2 text-purple-600" />}
                      {category.category === 'Battery & Power' && <Battery className="w-5 h-5 mr-2 text-orange-600" />}
                      {category.category === 'Connectivity' && <Wifi className="w-5 h-5 mr-2 text-indigo-600" />}
                      {category.category === 'Physical' && <Package className="w-5 h-5 mr-2 text-gray-600" />}
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.specs.map((spec, specIndex) => (
                        <div key={specIndex} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">{spec.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-900">{spec.value}</span>
                            {spec.important && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                Key Feature
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Key Features</CardTitle>
                  <CardDescription>
                    Standout features that make this product special
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                        <div className="text-blue-600 mt-1">{feature.icon}</div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What's in the Box</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Premium Smartphone</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Lightning to USB-C Cable</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Documentation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>SIM Ejector Tool</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compatibility" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Device Compatibility</CardTitle>
                  <CardDescription>
                    Compatible systems and accessories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {compatibility.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-700">{item.name}</span>
                          <p className="text-sm text-gray-600">{item.value}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Compatible
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="certifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Certifications & Compliance</CardTitle>
                  <CardDescription>
                    Industry standards and regulatory compliance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {certifications.map((cert, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {cert.icon}
                          <div>
                            <span className="font-medium text-gray-900">{cert.name}</span>
                            <p className="text-sm text-gray-600">{cert.status}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Safety Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800">Important Safety Notice</p>
                        <p className="text-sm text-yellow-700">
                          Read all safety instructions before use. Keep device away from water and extreme temperatures.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800">Warranty Information</p>
                        <p className="text-sm text-blue-700">
                          This product comes with a 1-year limited warranty. Extended warranty options available.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};