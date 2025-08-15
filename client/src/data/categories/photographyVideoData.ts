
import React from 'react';
import { Camera } from 'lucide-react';
import { MainCategory } from './types';

export const photographyVideoData: MainCategory = {
  id: 'photography-video',
  name: 'Photography & Video',
  icon: React.createElement(Camera, { className: "w-6 h-6" }),
  color: 'bg-indigo-600 text-white',
  count: 6109,
  subcategories: {
    'camera-equipment': {
      name: "Camera Equipment",
      subcategories: [
        { name: 'Digital Cameras', count: 1654 },
        { name: 'Lenses', count: 1432 },
        { name: 'Tripods & Stands', count: 1210 },
        { name: 'Camera Accessories', count: 1098 }
      ]
    },
    'video-equipment': {
      name: "Video Equipment",
      subcategories: [
        { name: 'Video Cameras', count: 1098 },
        { name: 'Lighting Equipment', count: 987 },
        { name: 'Audio Recording', count: 876 },
        { name: 'Video Editing', count: 765 }
      ]
    }
  }
};
