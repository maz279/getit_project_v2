
import { MainCategory } from '../categoriesData';
import { createElement } from 'react';
import { Music } from 'lucide-react';
import { traditionalInstrumentsData } from './musicalInstruments/traditionalInstrumentsData';
import { modernInstrumentsData } from './musicalInstruments/modernInstrumentsData';
import { audioEquipmentData } from './musicalInstruments/audioEquipmentData';

export const musicalInstrumentsData: MainCategory = {
  id: 'musical-instruments',
  name: 'Musical Instruments',
  icon: createElement(Music, { className: 'w-6 h-6' }),
  color: 'text-purple-600',
  count: 2345,
  featured: false,
  subcategories: {
    'traditional-instruments': traditionalInstrumentsData,
    'modern-instruments': modernInstrumentsData,
    'audio-equipment': audioEquipmentData
  }
};
