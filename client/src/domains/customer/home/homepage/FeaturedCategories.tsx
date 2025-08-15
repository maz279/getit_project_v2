
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Smartphone, Laptop, Headphones, Camera, Watch, Gamepad2, 
  Shirt, ShoppingBag, Home, Car, Baby, Heart,
  Coffee, Book, Dumbbell, Paintbrush, Music, Gift
} from 'lucide-react';

interface CategoryItem {
  icon: React.ReactNode;
  name: string;
  count: number;
  color: string;
  slug: string;
}

const categories: CategoryItem[] = [
  { icon: <Smartphone className="w-8 h-8" />, name: "Electronics", count: 2847, color: "text-blue-500", slug: "electronics" },
  { icon: <Shirt className="w-8 h-8" />, name: "Fashion", count: 1923, color: "text-red-500", slug: "fashion" },
  { icon: <Home className="w-8 h-8" />, name: "Home & Garden", count: 1456, color: "text-green-500", slug: "home-garden" },
  { icon: <Coffee className="w-8 h-8" />, name: "Food & Drink", count: 987, color: "text-yellow-600", slug: "food-drink" },
  { icon: <Laptop className="w-8 h-8" />, name: "Computers", count: 754, color: "text-blue-600", slug: "computers" },
  { icon: <Car className="w-8 h-8" />, name: "Automotive", count: 623, color: "text-red-600", slug: "automotive" },
  { icon: <Baby className="w-8 h-8" />, name: "Baby & Kids", count: 445, color: "text-yellow-500", slug: "baby-kids" },
  { icon: <Dumbbell className="w-8 h-8" />, name: "Sports", count: 389, color: "text-blue-700", slug: "sports" },
  { icon: <Heart className="w-8 h-8" />, name: "Health", count: 267, color: "text-red-400", slug: "health" },
  { icon: <Book className="w-8 h-8" />, name: "Books", count: 234, color: "text-green-600", slug: "books" },
  { icon: <Music className="w-8 h-8" />, name: "Music", count: 198, color: "text-blue-400", slug: "music" },
  { icon: <Gift className="w-8 h-8" />, name: "Gifts", count: 156, color: "text-green-400", slug: "gifts" },
  { icon: <Camera className="w-8 h-8" />, name: "Photography", count: 143, color: "text-yellow-700", slug: "photography" },
  { icon: <Watch className="w-8 h-8" />, name: "Watches", count: 128, color: "text-red-700", slug: "watches" },
  { icon: <Gamepad2 className="w-8 h-8" />, name: "Gaming", count: 112, color: "text-green-700", slug: "gaming" },
  { icon: <Paintbrush className="w-8 h-8" />, name: "Art & Craft", count: 98, color: "text-blue-800", slug: "art-craft" }
];

export const FeaturedCategories: React.FC = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (slug: string) => {
    navigate(`/categories?category=${slug}`);
  };

  const handleSeeAllClick = () => {
    navigate('/categories');
  };

  return (
    <section className="py-8 bg-gradient-to-br from-blue-50 via-yellow-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-br from-blue-50 via-yellow-50 to-red-50 shadow-xl border rounded-xl border-blue-500 border-solid overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 via-red-500 to-green-500 flex w-full items-center justify-between px-8 py-4">
            <div className="text-white text-xl font-bold">
              Search by Category
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold">
              <div className="text-white">SEE ALL</div>
              <button 
                onClick={handleSeeAllClick}
                className="bg-white text-blue-600 whitespace-nowrap px-4 py-2 rounded-lg hover:bg-yellow-100 transition-colors font-bold"
              >
                &gt;
              </button>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-300 via-red-300 to-green-300 h-1 w-full" />
          
          <div className="p-8">
            <div className="grid grid-cols-8 gap-5 mb-8 max-md:grid-cols-4">
              {categories.slice(0, 8).map((category, index) => (
                <div 
                  key={index} 
                  onClick={() => handleCategoryClick(category.slug)}
                  className="bg-white flex flex-col items-center p-5 rounded-xl hover:shadow-xl transition-all cursor-pointer group border border-gray-100 hover:border-blue-200"
                >
                  <div className={`${category.color} mb-3 group-hover:scale-110 transition-transform`}>
                    {category.icon}
                  </div>
                  <div className="text-sm font-medium text-center text-gray-800 group-hover:text-blue-600 transition-colors">{category.name}</div>
                  <div className="text-xs text-gray-500 mt-1">({category.count})</div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-8 gap-5 max-md:grid-cols-4">
              {categories.slice(8, 16).map((category, index) => (
                <div 
                  key={index + 8} 
                  onClick={() => handleCategoryClick(category.slug)}
                  className="bg-white flex flex-col items-center p-5 rounded-xl hover:shadow-xl transition-all cursor-pointer group border border-gray-100 hover:border-blue-200"
                >
                  <div className={`${category.color} mb-3 group-hover:scale-110 transition-transform`}>
                    {category.icon}
                  </div>
                  <div className="text-sm font-medium text-center text-gray-800 group-hover:text-blue-600 transition-colors">{category.name}</div>
                  <div className="text-xs text-gray-500 mt-1">({category.count})</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
