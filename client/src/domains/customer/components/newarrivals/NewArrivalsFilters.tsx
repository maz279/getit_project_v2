import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/shared/ui/button';
import { 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Package, 
  Clock,
  DollarSign,
  Tag,
  Calendar
} from 'lucide-react';

// Types
interface PriceRange {
  min: number;
  max: number;
}

interface FilterState {
  categories: string[];
  brands: string[];
  priceRange: PriceRange;
  rating: number;
  availability: string[];
  dateRange: string;
  sortBy: string;
}

interface FilterSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

// Constants
const CATEGORIES = [
  'Electronics',
  'Fashion & Clothing',
  'Home & Kitchen',
  'Beauty & Personal Care',
  'Sports & Outdoors',
  'Books & Stationery',
  'Toys & Games',
  'Health & Wellness'
];

const BRANDS = [
  'Samsung',
  'Walton',
  'Symphony',
  'Minister',
  'Pran',
  'Square',
  'Beximco',
  'ACI',
  'Bashundhara',
  'Fresh'
];

const AVAILABILITY_OPTIONS = [
  { value: 'in-stock', label: 'In Stock', count: 245 },
  { value: 'pre-order', label: 'Pre-Order', count: 18 },
  { value: 'coming-soon', label: 'Coming Soon', count: 32 },
  { value: 'limited-stock', label: 'Limited Stock', count: 15 }
];

const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this-week', label: 'This Week' },
  { value: 'last-week', label: 'Last Week' },
  { value: 'this-month', label: 'This Month' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' }
];

const PRICE_RANGES = [
  { min: 0, max: 1000, label: 'Under ৳1,000' },
  { min: 1000, max: 5000, label: '৳1,000 - ৳5,000' },
  { min: 5000, max: 10000, label: '৳5,000 - ৳10,000' },
  { min: 10000, max: 25000, label: '৳10,000 - ৳25,000' },
  { min: 25000, max: 50000, label: '৳25,000 - ৳50,000' },
  { min: 50000, max: Infinity, label: 'Above ৳50,000' }
];

// Sub-components
const FilterSection: React.FC<FilterSectionProps> = ({ 
  title, 
  icon: Icon, 
  children, 
  defaultExpanded = true 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-gray-200 pb-6 mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left mb-4 hover:text-blue-600 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-gray-800">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="space-y-3">
          {children}
        </div>
      )}
    </div>
  );
};

const CheckboxOption: React.FC<{
  id: string;
  label: string;
  checked: boolean;
  count?: number;
  onChange: (checked: boolean) => void;
}> = ({ id, label, checked, count, onChange }) => (
  <label 
    htmlFor={id}
    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
  >
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </div>
    {count !== undefined && (
      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
        {count}
      </span>
    )}
  </label>
);

const RatingFilter: React.FC<{
  selectedRating: number;
  onRatingChange: (rating: number) => void;
}> = ({ selectedRating, onRatingChange }) => (
  <div className="space-y-2">
    {[5, 4, 3, 2, 1].map((rating) => (
      <label 
        key={rating}
        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
      >
        <input
          type="radio"
          name="rating"
          checked={selectedRating === rating}
          onChange={() => onRatingChange(rating)}
          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
        />
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-sm text-gray-600 ml-1">& up</span>
        </div>
      </label>
    ))}
  </div>
);

const PriceRangeFilter: React.FC<{
  selectedRange: PriceRange;
  onRangeChange: (range: PriceRange) => void;
}> = ({ selectedRange, onRangeChange }) => (
  <div className="space-y-2">
    {PRICE_RANGES.map((range, index) => (
      <label 
        key={index}
        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
      >
        <input
          type="radio"
          name="priceRange"
          checked={selectedRange.min === range.min && selectedRange.max === range.max}
          onChange={() => onRangeChange({ min: range.min, max: range.max })}
          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">{range.label}</span>
      </label>
    ))}
  </div>
);

// Main Component
export const NewArrivalsFilters: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    brands: [],
    priceRange: { min: 0, max: Infinity },
    rating: 0,
    availability: [],
    dateRange: '',
    sortBy: 'newest'
  });

  const [appliedFiltersCount, setAppliedFiltersCount] = useState(0);

  // Calculate applied filters count
  const countAppliedFilters = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.brands.length > 0) count++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < Infinity) count++;
    if (filters.rating > 0) count++;
    if (filters.availability.length > 0) count++;
    if (filters.dateRange) count++;
    if (filters.sortBy !== 'newest') count++;
    return count;
  }, [filters]);

  // Event handlers
  const handleCategoryChange = useCallback((category: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      categories: checked
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
  }, []);

  const handleBrandChange = useCallback((brand: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      brands: checked
        ? [...prev.brands, brand]
        : prev.brands.filter(b => b !== brand)
    }));
  }, []);

  const handleAvailabilityChange = useCallback((availability: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      availability: checked
        ? [...prev.availability, availability]
        : prev.availability.filter(a => a !== availability)
    }));
  }, []);

  const handlePriceRangeChange = useCallback((range: PriceRange) => {
    setFilters(prev => ({ ...prev, priceRange: range }));
  }, []);

  const handleRatingChange = useCallback((rating: number) => {
    setFilters(prev => ({ ...prev, rating }));
  }, []);

  const handleDateRangeChange = useCallback((dateRange: string) => {
    setFilters(prev => ({ ...prev, dateRange }));
  }, []);

  const handleSortChange = useCallback((sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      categories: [],
      brands: [],
      priceRange: { min: 0, max: Infinity },
      rating: 0,
      availability: [],
      dateRange: '',
      sortBy: 'newest'
    });
  }, []);

  const applyFilters = useCallback(() => {
    // Here you would typically call an API or update the parent component
    console.log('Applying filters:', filters);
    setAppliedFiltersCount(countAppliedFilters);
  }, [filters, countAppliedFilters]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 h-fit sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
          {countAppliedFilters > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {countAppliedFilters}
            </span>
          )}
        </div>
        {countAppliedFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-500 hover:text-red-600"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Sort By */}
      <FilterSection title="Sort By" icon={Tag} defaultExpanded={true}>
        <select
          value={filters.sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FilterSection>

      {/* Date Range */}
      <FilterSection title="Arrival Date" icon={Calendar}>
        <div className="space-y-2">
          {DATE_RANGES.map((range) => (
            <label 
              key={range.value}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
            >
              <input
                type="radio"
                name="dateRange"
                checked={filters.dateRange === range.value}
                onChange={() => handleDateRangeChange(range.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{range.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Categories */}
      <FilterSection title="Categories" icon={Tag}>
        {CATEGORIES.map((category) => (
          <CheckboxOption
            key={category}
            id={`category-${category}`}
            label={category}
            checked={filters.categories.includes(category)}
            onChange={(checked) => handleCategoryChange(category, checked)}
          />
        ))}
      </FilterSection>

      {/* Brands */}
      <FilterSection title="Brands" icon={Package}>
        {BRANDS.map((brand) => (
          <CheckboxOption
            key={brand}
            id={`brand-${brand}`}
            label={brand}
            checked={filters.brands.includes(brand)}
            onChange={(checked) => handleBrandChange(brand, checked)}
          />
        ))}
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range" icon={DollarSign}>
        <PriceRangeFilter
          selectedRange={filters.priceRange}
          onRangeChange={handlePriceRangeChange}
        />
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Customer Rating" icon={Star}>
        <RatingFilter
          selectedRating={filters.rating}
          onRatingChange={handleRatingChange}
        />
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability" icon={Clock}>
        {AVAILABILITY_OPTIONS.map((option) => (
          <CheckboxOption
            key={option.value}
            id={`availability-${option.value}`}
            label={option.label}
            count={option.count}
            checked={filters.availability.includes(option.value)}
            onChange={(checked) => handleAvailabilityChange(option.value, checked)}
          />
        ))}
      </FilterSection>

      {/* Apply Filters Button */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <Button
          onClick={applyFilters}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={countAppliedFilters === 0}
        >
          Apply Filters {countAppliedFilters > 0 && `(${countAppliedFilters})`}
        </Button>
      </div>
    </div>
  );
};