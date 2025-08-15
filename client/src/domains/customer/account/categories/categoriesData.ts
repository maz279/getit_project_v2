
import { Heart, Clock, TrendingDown, Package, Star, Gift, Calendar, Sparkles } from 'lucide-react';
import { CategoryData } from './types';

export const defaultCategories: CategoryData[] = [
  {
    id: 'all',
    name: 'All Items',
    nameBn: 'সব পণ্য',
    icon: Heart,
    count: 23,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'All your saved items',
    isDefault: true
  },
  {
    id: 'recent',
    name: 'Recently Added',
    nameBn: 'সম্প্রতি যোগ করা',
    icon: Clock,
    count: 8,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Items added in last 7 days',
    isDefault: true
  },
  {
    id: 'price_drops',
    name: 'Price Drops',
    nameBn: 'দাম কমেছে',
    icon: TrendingDown,
    count: 5,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Items with recent price reductions',
    isDefault: true
  },
  {
    id: 'back_in_stock',
    name: 'Back in Stock',
    nameBn: 'আবার এসেছে',
    icon: Package,
    count: 3,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Previously out-of-stock items',
    isDefault: true
  }
];

export const customCategories: CategoryData[] = [
  {
    id: 'eid_shopping',
    name: 'Eid Shopping',
    nameBn: 'ঈদ কেনাকাটা',
    icon: Star,
    count: 12,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    description: 'Special items for Eid celebration',
    isDefault: false
  },
  {
    id: 'wedding_items',
    name: 'Wedding Items',
    nameBn: 'বিয়ের পণ্য',
    icon: Gift,
    count: 7,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    description: 'Wedding and ceremony items',
    isDefault: false
  }
];

export const festivalCollections: CategoryData[] = [
  {
    id: 'eid_collection',
    name: 'Eid Collection',
    nameBn: 'ঈদ কালেকশন',
    icon: Star,
    count: 15,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    description: 'Curated Eid special items',
    isDefault: false
  },
  {
    id: 'pahela_baishakh',
    name: 'Pahela Baishakh',
    nameBn: 'পহেলা বৈশাখ',
    icon: Calendar,
    count: 4,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Bengali New Year celebration',
    isDefault: false
  },
  {
    id: 'durga_puja',
    name: 'Durga Puja Collection',
    nameBn: 'দুর্গা পূজা কালেকশন',
    icon: Sparkles,
    count: 6,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    description: 'Durga Puja special items',
    isDefault: false
  }
];
