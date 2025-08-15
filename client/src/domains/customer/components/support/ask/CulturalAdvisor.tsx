/**
 * Phase 3: Ask Stage - Cultural Advisor
 * Amazon.com 5 A's Framework Implementation
 * Bangladesh-Specific Cultural Shopping Guidance
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Progress } from '@/shared/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Star, 
  Crown,
  Palette,
  Music,
  Gift,
  Users,
  Clock,
  CheckCircle,
  Globe,
  BookOpen,
  Sparkles,
  Award,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CulturalAdvisorProps {
  className?: string;
}

interface CulturalEvent {
  id: string;
  name: string;
  nameEn: string;
  date: string;
  type: 'religious' | 'cultural' | 'national' | 'seasonal';
  significance: string;
  shoppingTips: string[];
  recommendedProducts: CulturalProduct[];
  traditions: string[];
  colors: string[];
  preparations: string[];
  daysUntil: number;
}

interface CulturalProduct {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  price: number;
  image: string;
  culturalSignificance: string;
  occasions: string[];
  regions: string[];
  artisan?: string;
  material: string;
  authenticity: number;
}

interface CulturalTip {
  id: string;
  title: string;
  category: 'etiquette' | 'shopping' | 'gifting' | 'styling' | 'traditions';
  content: string;
  importance: 'high' | 'medium' | 'low';
  applicableEvents: string[];
  culturalContext: string;
}

interface RegionalGuide {
  id: string;
  region: string;
  specialties: string[];
  culturalNotes: string[];
  shoppingAdvice: string[];
  localCustoms: string[];
  recommendedItems: string[];
}

const CulturalAdvisor: React.FC<CulturalAdvisorProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<'events' | 'products' | 'tips' | 'regions'>('events');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('dhaka');
  const [culturalEvents, setCulturalEvents] = useState<CulturalEvent[]>([]);
  const [culturalProducts, setCulturalProducts] = useState<CulturalProduct[]>([]);
  const [culturalTips, setCulturalTips] = useState<CulturalTip[]>([]);
  const [regionalGuides, setRegionalGuides] = useState<RegionalGuide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load cultural data
    const loadCulturalData = () => {
      const mockEvents: CulturalEvent[] = [
        {
          id: 'eid-ul-fitr',
          name: 'ঈদুল ফিতর',
          nameEn: 'Eid ul-Fitr',
          date: '2025-03-30',
          type: 'religious',
          significance: 'Most important Islamic festival celebrating the end of Ramadan',
          shoppingTips: [
            'Shop for new clothes 2-3 weeks before Eid',
            'Traditional colors like white, green, and gold are preferred',
            'Consider family sets for a coordinated look',
            'Buy gifts for children and family members',
            'Stock up on dates, sweets, and special foods'
          ],
          recommendedProducts: [
            {
              id: 'eid-1',
              name: 'ঈদ বিশেষ পাঞ্জাবি',
              nameEn: 'Eid Special Panjabi',
              category: 'Men\'s Traditional Wear',
              price: 3500,
              image: 'https://images.unsplash.com/photo-1583743089695-4b816a340f82?w=300',
              culturalSignificance: 'Traditional men\'s wear for Eid prayers and celebrations',
              occasions: ['Eid ul-Fitr', 'Eid ul-Adha', 'Religious gatherings'],
              regions: ['All Bangladesh'],
              material: 'Cotton Khadi',
              authenticity: 95
            },
            {
              id: 'eid-2',
              name: 'ঈদের শাড়ি',
              nameEn: 'Eid Saree',
              category: 'Women\'s Traditional Wear',
              price: 6500,
              image: 'https://images.unsplash.com/photo-1610030469036-12993ce8c2c2?w=300',
              culturalSignificance: 'Elegant saree for women during Eid celebrations',
              occasions: ['Eid celebrations', 'Family gatherings'],
              regions: ['Bengal region'],
              material: 'Silk Cotton Blend',
              authenticity: 92
            }
          ],
          traditions: [
            'Morning Eid prayers at mosque',
            'Visiting family and friends',
            'Exchanging gifts and sweets',
            'Wearing new clothes',
            'Charity giving (Zakat al-Fitr)'
          ],
          colors: ['White', 'Green', 'Gold', 'Silver'],
          preparations: [
            'Buy new clothes for the family',
            'Prepare traditional sweets',
            'Clean and decorate the house',
            'Plan family visits',
            'Buy gifts for children'
          ],
          daysUntil: 75
        },
        {
          id: 'pohela-boishakh',
          name: 'পহেলা বৈশাখ',
          nameEn: 'Pohela Boishakh',
          date: '2025-04-14',
          type: 'cultural',
          significance: 'Bengali New Year celebrating the start of the Bengali calendar',
          shoppingTips: [
            'Red and white clothing are traditional colors',
            'Look for Bengali cultural motifs and designs',
            'Support local artisans and handmade products',
            'Buy traditional Bengali sweets and foods',
            'Consider cultural accessories and jewelry'
          ],
          recommendedProducts: [
            {
              id: 'pb-1',
              name: 'পহেলা বৈশাখ শাড়ি',
              nameEn: 'Pohela Boishakh Saree',
              category: 'Women\'s Cultural Wear',
              price: 4500,
              image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300',
              culturalSignificance: 'Traditional red and white saree for Bengali New Year',
              occasions: ['Pohela Boishakh', 'Cultural festivals'],
              regions: ['Bengal'],
              artisan: 'Comilla Handloom',
              material: 'Handwoven Cotton',
              authenticity: 98
            }
          ],
          traditions: [
            'Wearing red and white clothes',
            'Traditional Bengali music and dance',
            'Eating traditional Bengali sweets',
            'Cultural processions and fairs',
            'Family gatherings and celebrations'
          ],
          colors: ['Red', 'White', 'Yellow'],
          preparations: [
            'Buy traditional red and white outfits',
            'Prepare Bengali sweets like roshogolla',
            'Plan cultural program participation',
            'Decorate with traditional Bengali motifs'
          ],
          daysUntil: 90
        },
        {
          id: 'durga-puja',
          name: 'দুর্গা পূজা',
          nameEn: 'Durga Puja',
          date: '2025-10-05',
          type: 'religious',
          significance: 'Major Hindu festival celebrating Goddess Durga',
          shoppingTips: [
            'Traditional silk sarees are popular',
            'Gold and red colors are auspicious',
            'Shop for puja items and decorations',
            'Consider cultural jewelry and accessories',
            'Buy sweets and traditional foods'
          ],
          recommendedProducts: [],
          traditions: [
            'Pandal hopping and cultural programs',
            'Traditional clothing and jewelry',
            'Special prayers and offerings',
            'Cultural performances and music',
            'Community feasts and celebrations'
          ],
          colors: ['Red', 'Gold', 'Yellow', 'Orange'],
          preparations: [
            'Shop for traditional clothing',
            'Buy puja items and flowers',
            'Plan pandal visits',
            'Prepare traditional sweets'
          ],
          daysUntil: 265
        }
      ];

      const mockTips: CulturalTip[] = [
        {
          id: 'tip-1',
          title: 'Eid Shopping Etiquette',
          category: 'shopping',
          content: 'When shopping for Eid, start early to avoid last-minute rush. Choose modest, elegant clothing that reflects the spiritual significance of the occasion. White, green, and earth tones are traditionally preferred.',
          importance: 'high',
          applicableEvents: ['Eid ul-Fitr', 'Eid ul-Adha'],
          culturalContext: 'Islamic festivals emphasize modesty and community celebration'
        },
        {
          id: 'tip-2',
          title: 'Bengali New Year Traditions',
          category: 'traditions',
          content: 'For Pohela Boishakh, red and white are the traditional colors symbolizing prosperity and purity. Women typically wear red-bordered white sarees, while men opt for white kurtas or panjabis.',
          importance: 'high',
          applicableEvents: ['Pohela Boishakh'],
          culturalContext: 'Bengali cultural celebration emphasizing heritage and tradition'
        },
        {
          id: 'tip-3',
          title: 'Gift Giving Guidelines',
          category: 'gifting',
          content: 'When giving gifts during cultural events, consider items that have cultural significance or practical value. For children, new clothes and sweets are traditional. For adults, books, traditional crafts, or religious items are appropriate.',
          importance: 'medium',
          applicableEvents: ['All cultural events'],
          culturalContext: 'Gift giving strengthens family and community bonds'
        },
        {
          id: 'tip-4',
          title: 'Supporting Local Artisans',
          category: 'shopping',
          content: 'Choose handmade products from local artisans when possible. This supports traditional craftsmanship and ensures authenticity. Look for items like handwoven textiles, traditional jewelry, and locally made sweets.',
          importance: 'medium',
          applicableEvents: ['All cultural events'],
          culturalContext: 'Preserving traditional craftsmanship and supporting local economy'
        }
      ];

      const mockRegionalGuides: RegionalGuide[] = [
        {
          id: 'dhaka',
          region: 'Dhaka',
          specialties: ['Dhakai Jamdani', 'Traditional sweets', 'Handcrafted jewelry'],
          culturalNotes: [
            'Hub of Bengali culture and traditions',
            'Home to master craftsmen and artisans',
            'Rich history of textile and craft production'
          ],
          shoppingAdvice: [
            'Visit Old Dhaka for authentic traditional items',
            'New Market and Chandni Chowk for variety',
            'Look for certified authentic Jamdani products'
          ],
          localCustoms: [
            'Bargaining is expected in traditional markets',
            'Respectful dress code in religious areas',
            'Friday afternoons may have limited shopping'
          ],
          recommendedItems: ['Jamdani sarees', 'Traditional panjabis', 'Handmade jewelry', 'Bengali sweets']
        },
        {
          id: 'chittagong',
          region: 'Chittagong',
          specialties: ['Hill tribe crafts', 'Coastal cultural items', 'Traditional textiles'],
          culturalNotes: [
            'Diverse cultural influences from hill tribes',
            'Coastal traditions and maritime culture',
            'Unique blend of Bengali and tribal craftsmanship'
          ],
          shoppingAdvice: [
            'Explore local markets for tribal handicrafts',
            'Look for unique coastal-inspired designs',
            'Support hill tribe artisan communities'
          ],
          localCustoms: [
            'Respect for tribal cultural sensitivities',
            'Coastal lifestyle influences fashion choices',
            'Traditional fishing community customs'
          ],
          recommendedItems: ['Tribal textiles', 'Coastal jewelry', 'Traditional crafts', 'Local artwork']
        }
      ];

      setTimeout(() => {
        setCulturalEvents(mockEvents);
        setCulturalTips(mockTips);
        setRegionalGuides(mockRegionalGuides);
        setCulturalProducts(mockEvents.flatMap(e => e.recommendedProducts));
        setLoading(false);
      }, 1000);
    };

    loadCulturalData();
  }, []);

  const EventCard = ({ event }: { event: CulturalEvent }) => (
    <Card className="mb-4 hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-lg">{event.name}</h3>
            <p className="text-sm text-muted-foreground">{event.nameEn}</p>
            <Badge variant="outline" className="mt-1 text-xs">
              {event.type}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{event.daysUntil}</div>
            <div className="text-xs text-muted-foreground">days until</div>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">{event.significance}</p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {event.colors.map((color) => (
            <Badge key={color} variant="secondary" className="text-xs">
              {color}
            </Badge>
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
        >
          {selectedEvent === event.id ? 'Hide Details' : 'View Details'}
        </Button>
        
        {selectedEvent === event.id && (
          <div className="mt-4 pt-4 border-t space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Shopping Tips</h4>
              <ul className="space-y-1">
                {event.shoppingTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Traditions</h4>
              <div className="flex flex-wrap gap-1">
                {event.traditions.map((tradition, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tradition}
                  </Badge>
                ))}
              </div>
            </div>
            
            {event.recommendedProducts.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Recommended Products</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {event.recommendedProducts.map((product) => (
                    <Card key={product.id} className="p-3">
                      <div className="flex gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{product.name}</h5>
                          <p className="text-xs text-muted-foreground">{product.nameEn}</p>
                          <p className="text-sm font-bold text-primary">৳{product.price.toLocaleString()}</p>
                          <Badge className="text-xs mt-1">
                            {product.authenticity}% authentic
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const ProductCard = ({ product }: { product: CulturalProduct }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover rounded-lg mb-3"
        />
        <h3 className="font-semibold mb-1">{product.name}</h3>
        <p className="text-sm text-muted-foreground mb-2">{product.nameEn}</p>
        <p className="text-lg font-bold text-primary mb-2">৳{product.price.toLocaleString()}</p>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span>Cultural Authenticity:</span>
            <Progress value={product.authenticity} className="w-16 h-1" />
          </div>
          <Badge variant="outline" className="text-xs">{product.category}</Badge>
        </div>
        
        <p className="text-xs text-muted-foreground mb-3">{product.culturalSignificance}</p>
        
        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            <Gift className="h-3 w-3 mr-1" />
            View Product
          </Button>
          <Button size="sm" variant="outline">
            <MessageCircle className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className={cn('max-w-6xl mx-auto p-6', className)}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="h-10 bg-muted rounded w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('max-w-6xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-500" />
          Cultural Shopping Advisor
        </h1>
        <p className="text-muted-foreground">
          Discover authentic Bengali culture and shop with cultural awareness
        </p>
      </div>

      {/* Cultural Calendar Overview */}
      <Card className="mb-6 bg-gradient-to-r from-red-50 via-yellow-50 to-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Cultural Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {culturalEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="text-center p-4 bg-white/80 rounded-lg">
                <h3 className="font-semibold">{event.name}</h3>
                <p className="text-sm text-muted-foreground">{event.nameEn}</p>
                <div className="text-2xl font-bold text-primary mt-2">{event.daysUntil}</div>
                <div className="text-xs text-muted-foreground">days remaining</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cultural Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="events">Cultural Events</TabsTrigger>
          <TabsTrigger value="products">Cultural Products</TabsTrigger>
          <TabsTrigger value="tips">Cultural Tips</TabsTrigger>
          <TabsTrigger value="regions">Regional Guides</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-6">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Cultural Events & Festivals</h2>
            {culturalEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Authentic Cultural Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {culturalProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tips" className="mt-6">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Cultural Shopping Tips</h2>
            <div className="space-y-4">
              {culturalTips.map((tip) => (
                <Card key={tip.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center',
                        tip.importance === 'high' && 'bg-red-100',
                        tip.importance === 'medium' && 'bg-yellow-100',
                        tip.importance === 'low' && 'bg-blue-100'
                      )}>
                        {tip.category === 'shopping' && <Gift className="h-5 w-5" />}
                        {tip.category === 'traditions' && <Crown className="h-5 w-5" />}
                        {tip.category === 'gifting' && <Heart className="h-5 w-5" />}
                        {tip.category === 'etiquette' && <Users className="h-5 w-5" />}
                        {tip.category === 'styling' && <Palette className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{tip.title}</h3>
                          <Badge variant={
                            tip.importance === 'high' ? 'destructive' :
                            tip.importance === 'medium' ? 'default' : 'secondary'
                          } className="text-xs">
                            {tip.importance}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{tip.content}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <BookOpen className="h-3 w-3" />
                          <span>{tip.culturalContext}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="regions" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-xl font-semibold">Regional Shopping Guides</h2>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="border rounded px-3 py-1"
              >
                {regionalGuides.map((guide) => (
                  <option key={guide.id} value={guide.id}>{guide.region}</option>
                ))}
              </select>
            </div>
            
            {regionalGuides
              .filter(guide => guide.id === selectedRegion)
              .map((guide) => (
                <Card key={guide.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {guide.region} Cultural Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Regional Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {guide.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline">{specialty}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Cultural Notes</h4>
                      <ul className="space-y-1">
                        {guide.culturalNotes.map((note, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Globe className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Shopping Advice</h4>
                      <ul className="space-y-1">
                        {guide.shoppingAdvice.map((advice, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {advice}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Cultural Preservation Message */}
      <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Preserving Bengali Heritage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            By choosing authentic cultural products and supporting local artisans, 
            you help preserve Bangladesh's rich cultural heritage for future generations. 
            Every purchase contributes to sustaining traditional craftsmanship and cultural practices.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Heritage Preservation</Badge>
            <Badge variant="outline">Artisan Support</Badge>
            <Badge variant="outline">Cultural Authenticity</Badge>
            <Badge variant="outline">Community Impact</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CulturalAdvisor;