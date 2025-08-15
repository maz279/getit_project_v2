
import React from 'react';
import { Stethoscope } from 'lucide-react';
import { MainCategory } from './types';

export const medicalEquipmentData: MainCategory = {
  id: 'medical-equipment',
  name: 'Medical Equipment',
  icon: React.createElement(Stethoscope, { className: "w-6 h-6" }),
  color: 'bg-red-600 text-white',
  count: 10765,
  subcategories: {
    'medical-devices': {
      name: "Medical Devices",
      subcategories: [
        { name: 'Diagnostic Equipment', count: 2987 },
        { name: 'Monitoring Devices', count: 2109 },
        { name: 'Therapeutic Equipment', count: 1876 },
        { name: 'Emergency Supplies', count: 1654 }
      ]
    },
    'healthcare-supplies': {
      name: "Healthcare Supplies",
      subcategories: [
        { name: 'Personal Protective Equipment', count: 1876 },
        { name: 'First Aid Supplies', count: 1654 },
        { name: 'Mobility Aids', count: 1432 },
        { name: 'Home Care', count: 1210 }
      ]
    }
  }
};
