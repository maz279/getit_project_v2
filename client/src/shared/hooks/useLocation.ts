/**
 * Location Management Hook
 * Production-ready hook for managing location state and persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Location, 
  getLocationById, 
  getPopularLocations, 
  searchLocations,
  getMultiLanguageLocationById 
} from '@/shared/data/bangladesh-locations';

interface UseLocationReturn {
  selectedLocation: Location;
  filteredLocations: Location[];
  locationSearchQuery: string;
  setLocationSearchQuery: (query: string) => void;
  handleLocationSelect: (location: Location) => void;
  loadPopularLocations: () => void;
  searchLocationsByQuery: (query: string) => void;
  showLocationChangeNotification: (location: Location) => void;
}

export const useLocation = (initialLocationId: number = 1): UseLocationReturn => {
  const [selectedLocation, setSelectedLocation] = useState<Location>(() => {
    // Try to load from localStorage first
    const savedLocation = localStorage.getItem('selectedLocation');
    if (savedLocation) {
      try {
        return JSON.parse(savedLocation);
      } catch (error) {
        console.error('Error parsing saved location:', error);
      }
    }
    // Fallback to default location (Dhaka)
    return getLocationById(initialLocationId) || getPopularLocations()[0];
  });

  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');

  // Load popular locations on mount
  useEffect(() => {
    const popularLocations = getPopularLocations();
    setFilteredLocations(popularLocations);
  }, []);

  // Filter locations based on search query
  useEffect(() => {
    if (locationSearchQuery.trim() === '') {
      const popularLocations = getPopularLocations();
      setFilteredLocations(popularLocations);
    } else {
      const filtered = searchLocations(locationSearchQuery);
      setFilteredLocations(filtered);
    }
  }, [locationSearchQuery]);

  // Handle location selection with proper persistence
  const handleLocationSelect = useCallback((location: Location) => {
    console.log('Location selected:', location);
    
    // Update state immediately
    setSelectedLocation(location);
    
    // Save to localStorage for persistence
    localStorage.setItem('selectedLocation', JSON.stringify(location));
    
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('locationChanged', { detail: location }));
    
    // Show success notification
    showLocationChangeNotification(location);
  }, []);

  // Load popular locations
  const loadPopularLocations = useCallback(() => {
    const popularLocations = getPopularLocations();
    setFilteredLocations(popularLocations);
    setLocationSearchQuery('');
  }, []);

  // Search locations by query
  const searchLocationsByQuery = useCallback((query: string) => {
    setLocationSearchQuery(query);
  }, []);

  // Show location change notification
  const showLocationChangeNotification = useCallback((location: Location) => {
    const confirmationMessage = `Delivery area changed to: ${location.city}`;
    
    // Create temporary notification element
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 animate-in slide-in-from-right';
    notification.textContent = confirmationMessage;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.add('animate-out', 'slide-out-to-right');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }, []);

  return {
    selectedLocation,
    filteredLocations,
    locationSearchQuery,
    setLocationSearchQuery,
    handleLocationSelect,
    loadPopularLocations,
    searchLocationsByQuery,
    showLocationChangeNotification
  };
};