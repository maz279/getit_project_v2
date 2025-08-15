import React from 'react';
import { 
  Smartphone, 
  Laptop, 
  Shirt, 
  Home, 
  Gamepad, 
  Heart, 
  Baby, 
  Car,
  Dumbbell,
  Book,
  Utensils,
  ShoppingBag,
  Sparkles,
  Gift
} from 'lucide-react';
import { Link } from 'wouter';

interface Category {
  id: number;
  name: string;
  icon: React.ReactNode;
  link: string;
  gradient: string;
  count: string;
}

const categories: Category[] = [
  {
    id: 1,
    name: "Mobiles & Electronics",
    icon: <Smartphone className="w-6 h-6" />,
    link: "/category/electronics",
    gradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
    count: "50k+"
  },
  {
    id: 2,
    name: "Computers & Laptops",
    icon: <Laptop className="w-6 h-6" />,
    link: "/category/computers",
    gradient: "bg-gradient-to-br from-purple-500 to-indigo-500",
    count: "25k+"
  },
  {
    id: 3,
    name: "Fashion & Apparel",
    icon: <Shirt className="w-6 h-6" />,
    link: "/category/fashion",
    gradient: "bg-gradient-to-br from-pink-500 to-rose-500",
    count: "80k+"
  },
  {
    id: 4,
    name: "Home & Living",
    icon: <Home className="w-6 h-6" />,
    link: "/category/home",
    gradient: "bg-gradient-to-br from-green-500 to-emerald-500",
    count: "40k+"
  },
  {
    id: 5,
    name: "Gaming & Entertainment",
    icon: <Gamepad className="w-6 h-6" />,
    link: "/category/gaming",
    gradient: "bg-gradient-to-br from-orange-500 to-red-500",
    count: "15k+"
  },
  {
    id: 6,
    name: "Health & Beauty",
    icon: <Heart className="w-6 h-6" />,
    link: "/category/beauty",
    gradient: "bg-gradient-to-br from-teal-500 to-cyan-500",
    count: "35k+"
  },
  {
    id: 7,
    name: "Mother & Baby",
    icon: <Baby className="w-6 h-6" />,
    link: "/category/baby",
    gradient: "bg-gradient-to-br from-yellow-500 to-amber-500",
    count: "20k+"
  },
  {
    id: 8,
    name: "Automotive",
    icon: <Car className="w-6 h-6" />,
    link: "/category/automotive",
    gradient: "bg-gradient-to-br from-gray-600 to-slate-600",
    count: "12k+"
  },
  {
    id: 9,
    name: "Sports & Fitness",
    icon: <Dumbbell className="w-6 h-6" />,
    link: "/category/sports",
    gradient: "bg-gradient-to-br from-emerald-500 to-teal-500",
    count: "18k+"
  },
  {
    id: 10,
    name: "Books & Education",
    icon: <Book className="w-6 h-6" />,
    link: "/category/books",
    gradient: "bg-gradient-to-br from-violet-500 to-purple-500",
    count: "30k+"
  },
  {
    id: 11,
    name: "Food & Groceries",
    icon: <Utensils className="w-6 h-6" />,
    link: "/category/food",
    gradient: "bg-gradient-to-br from-orange-500 to-yellow-500",
    count: "45k+"
  },
  {
    id: 12,
    name: "See All Categories",
    icon: <ShoppingBag className="w-6 h-6" />,
    link: "/categories",
    gradient: "bg-gradient-to-br from-indigo-500 to-blue-500",
    count: "500k+"
  }
];

export const CategoryQuickBrowser: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 py-4">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-3">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-800">
              Shop by Category
            </h2>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-gray-600 text-xs">
            Explore millions of products across all categories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {categories.map((category) => (
            <Link key={category.id} href={category.link}>
              <div className="group cursor-pointer">
                <div className="bg-white rounded-lg p-2 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200 relative overflow-hidden">
                  {/* Icon Container */}
                  <div className="flex justify-center mb-1">
                    <div className={`${category.gradient} p-1.5 rounded-full text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {React.cloneElement(category.icon as React.ReactElement, { className: "w-4 h-4" })}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-800 text-xs mb-0.5 group-hover:text-purple-600 transition-colors line-clamp-2">
                      {category.name}
                    </h3>
                    <div className="flex items-center justify-center gap-0.5">
                      <span className="text-xs text-gray-500">{category.count}</span>
                      <span className="text-xs text-gray-400">items</span>
                    </div>
                  </div>

                  {/* Hover Gradient Overlay */}
                  <div className={`absolute inset-0 ${category.gradient} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`}></div>
                  
                  {/* Special Badge for Last Item */}
                  {category.id === 12 && (
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      <Gift className="w-3 h-3 inline" />
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Popular Searches */}
        <div className="mt-3 text-center">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">
            🔥 Popular Searches
          </h3>
          <div className="flex flex-wrap justify-center gap-1">
            {[
              "iPhone 16", "Gaming Laptop", "Saree Collection", "Air Fryer", 
              "Protein Powder", "Baby Formula", "LED TV", "Makeup Kit"
            ].map((search, index) => (
              <Link key={index} href={`/search?q=${encodeURIComponent(search)}`}>
                <span className="inline-block bg-white text-gray-700 px-2 py-0.5 rounded-full text-xs border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-pointer">
                  {search}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryQuickBrowser;