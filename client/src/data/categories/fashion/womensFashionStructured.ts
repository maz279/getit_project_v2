
import { SubCategory } from '../types';

// Define the structure for Women's Fashion with proper hierarchy
interface WomensFashionCategory {
  name: string;
  subcategories: {
    [key: string]: {
      name: string;
      items: Array<{ name: string; count: number }>;
    };
  };
}

export const womensFashionStructured: WomensFashionCategory = {
  name: "Women's Fashion",
  subcategories: {
    'traditional-ethnic': {
      name: 'Traditional & Ethnic Wear',
      items: [
        // Saree
        { name: 'Cotton Saree', count: 15420 },
        { name: 'Silk Saree', count: 12850 },
        { name: 'Muslin Saree', count: 8965 },
        { name: 'Jamdani Saree', count: 7432 },
        { name: 'Tant Saree', count: 6789 },
        { name: 'Tangail Saree', count: 5432 },
        { name: 'Banarasi Saree', count: 4567 },
        { name: 'Designer Saree', count: 8901 },
        { name: 'Bridal Saree', count: 3456 },
        { name: 'Casual Saree', count: 9876 },
        { name: 'Party Saree', count: 6543 },
        
        // Salwar Kameez
        { name: 'Cotton Salwar Kameez', count: 18765 },
        { name: 'Silk Salwar Kameez', count: 12340 },
        { name: 'Georgette Salwar Kameez', count: 9876 },
        { name: 'Anarkali Suits', count: 8765 },
        { name: 'Straight Cut Suits', count: 7654 },
        { name: 'Palazzo Suits', count: 6543 },
        { name: 'Party Wear Salwar Kameez', count: 5432 },
        { name: 'Casual Salwar Kameez', count: 14321 },
        { name: 'Designer Suits', count: 4321 },
        
        // Lehenga & Sharara
        { name: 'Bridal Lehenga', count: 3210 },
        { name: 'Party Lehenga', count: 4321 },
        { name: 'Cotton Lehenga', count: 2109 },
        { name: 'Designer Lehenga', count: 5432 },
        { name: 'Sharara Set', count: 2876 },
        { name: 'Gharara Set', count: 1987 },
        
        // Kurtis & Tunics
        { name: 'Cotton Kurtis', count: 16789 },
        { name: 'Silk Kurtis', count: 8765 },
        { name: 'Designer Kurtis', count: 6543 },
        { name: 'Casual Kurtis', count: 12345 },
        { name: 'Party Kurtis', count: 4567 },
        { name: 'Printed Kurtis', count: 9876 }
      ]
    },
    
    'western-modern': {
      name: 'Western & Modern Clothing',
      items: [
        // Dresses
        { name: 'Cocktail Dresses', count: 4321 },
        { name: 'Evening Gowns', count: 2109 },
        { name: 'Maxi Dresses', count: 7654 },
        { name: 'Midi Dresses', count: 8765 },
        { name: 'Mini Dresses', count: 5432 },
        { name: 'Sundresses', count: 6543 },
        { name: 'Wrap Dresses', count: 3456 },
        { name: 'Shirt Dresses', count: 4567 },
        { name: 'Casual Dresses', count: 12345 },
        { name: 'Party Dresses', count: 6789 },
        { name: 'Office Dresses', count: 5678 },
        
        // Tops & Blouses
        { name: 'Casual Tops', count: 18765 },
        { name: 'Crop Tops', count: 9876 },
        { name: 'Tunics', count: 7654 },
        { name: 'Button-Down Blouses', count: 6543 },
        { name: 'Peplum Tops', count: 4321 },
        { name: 'Off-Shoulder Tops', count: 5432 },
        { name: 'Camisoles', count: 3456 },
        { name: 'Sleeveless Tops', count: 8765 },
        { name: 'Tank Tops', count: 7654 },
        { name: 'Formal Shirts', count: 5678 },
        
        // T-Shirts
        { name: 'Graphic Tees', count: 12345 },
        { name: 'Plain Tees', count: 15678 },
        { name: 'V-Neck Tees', count: 8765 },
        { name: 'Long Sleeve Tees', count: 6543 },
        { name: 'Henley Tees', count: 4321 },
        { name: 'Polo Shirts Women', count: 5432 },
        
        // Bottoms
        { name: 'Skinny Jeans', count: 14321 },
        { name: 'Straight-Leg Jeans', count: 12345 },
        { name: 'Bootcut Jeans', count: 8765 },
        { name: 'Wide-Leg Jeans', count: 6543 },
        { name: 'Dress Trousers', count: 7654 },
        { name: 'Wide-Leg Trousers', count: 5432 },
        { name: 'Cropped Trousers', count: 4321 },
        { name: 'Palazzo Trousers', count: 6789 },
        { name: 'Workout Leggings', count: 9876 },
        { name: 'Fashion Leggings', count: 8765 },
        { name: 'Jeggings', count: 7654 },
        { name: 'High-Waisted Leggings', count: 6543 },
        { name: 'Denim Shorts', count: 8765 },
        { name: 'Bermuda Shorts', count: 6543 },
        { name: 'High-Waisted Shorts', count: 5432 },
        { name: 'Athletic Shorts Women', count: 4321 },
        { name: 'A-Line Skirts', count: 7654 },
        { name: 'Pencil Skirts', count: 6543 },
        { name: 'Maxi Skirts', count: 5432 },
        { name: 'Mini Skirts', count: 4321 },
        { name: 'Midi Skirts', count: 3456 },
        { name: 'Pleated Skirts', count: 2876 },
        { name: 'Wrap Skirts', count: 2109 },
        
        // Suits & Blazers
        { name: 'Pantsuits', count: 4321 },
        { name: 'Skirt Suits', count: 3456 },
        { name: 'Blazers Women', count: 8765 },
        { name: 'Tailored Blazers', count: 6543 },
        { name: 'Double-Breasted Blazers', count: 4567 },
        { name: 'Casual Blazers', count: 5432 },
        
        // Outerwear
        { name: 'Denim Jackets', count: 6789 },
        { name: 'Leather Jackets Women', count: 5432 },
        { name: 'Trench Coats', count: 4321 },
        { name: 'Puffer Jackets', count: 3456 },
        { name: 'Parkas Women', count: 2876 },
        { name: 'Capes', count: 2109 },
        { name: 'Cardigans', count: 7654 }
      ]
    },
    
    'knitwear': {
      name: 'Sweaters & Knitwear',
      items: [
        { name: 'Pullover Sweaters Women', count: 8765 },
        { name: 'V-neck Sweaters Women', count: 6543 },
        { name: 'Turtleneck Sweaters Women', count: 5432 },
        { name: 'Cable Knit Sweaters Women', count: 4321 },
        { name: 'Button-Up Cardigans', count: 7654 },
        { name: 'Open Front Cardigans', count: 6789 }
      ]
    },
    
    'activewear': {
      name: 'Activewear & Sportswear',
      items: [
        { name: 'Sports Bras', count: 8765 },
        { name: 'Workout Tops', count: 7654 },
        { name: 'Athletic Tanks', count: 6543 },
        { name: 'Yoga Pants', count: 9876 },
        { name: 'Running Tights', count: 5432 },
        { name: 'Athletic Shorts', count: 4321 },
        { name: 'Track Jackets Women', count: 3456 },
        { name: 'Yoga Sets', count: 4567 },
        { name: 'Leggings Fitness', count: 6789 },
        { name: 'Sports Tops', count: 5678 },
        { name: 'Fitness Wear', count: 6789 }
      ]
    },
    
    'sleepwear': {
      name: 'Sleepwear & Loungewear',
      items: [
        { name: 'Women Pajama Sets', count: 8765 },
        { name: 'Nightgowns', count: 5432 },
        { name: 'Women Sleep Shirts', count: 4321 },
        { name: 'Women Robes', count: 3456 },
        { name: 'Women Lounge Pants', count: 6543 },
        { name: 'Women Sleep Shorts', count: 4567 },
        { name: 'Loungewear Sets', count: 5678 }
      ]
    },
    
    'swimwear': {
      name: 'Swimwear',
      items: [
        { name: 'Bikinis', count: 6789 },
        { name: 'One-Piece Swimsuits', count: 5432 },
        { name: 'Tankinis', count: 3456 },
        { name: 'Swim Dresses', count: 2109 },
        { name: 'Cover-Ups', count: 4321 },
        { name: 'Rash Guards Women', count: 2876 }
      ]
    },
    
    'intimates': {
      name: 'Intimates & Undergarments',
      items: [
        // Bras
        { name: 'Everyday Bras', count: 12345 },
        { name: 'T-Shirt Bras', count: 9876 },
        { name: 'Sports Bras Intimate', count: 8765 },
        { name: 'Push-Up Bras', count: 7654 },
        { name: 'Strapless Bras', count: 5432 },
        { name: 'Minimizer Bras', count: 4321 },
        { name: 'Nursing Bras', count: 3456 },
        { name: 'Bralettes', count: 6789 },
        
        // Panties
        { name: 'Briefs', count: 8765 },
        { name: 'Thongs', count: 6543 },
        { name: 'Boyshorts', count: 5432 },
        { name: 'Bikini Panties', count: 7654 },
        { name: 'Hipster Panties', count: 4567 },
        { name: 'High-Cut Panties', count: 3456 },
        
        // Shapewear
        { name: 'Bodysuits', count: 4321 },
        { name: 'Waist Cinchers', count: 3210 },
        { name: 'Control Briefs', count: 2876 },
        { name: 'Shaping Slips', count: 2109 },
        { name: 'Thigh Shapers', count: 1987 },
        
        // Thermal Wear
        { name: 'Women Thermal Sets', count: 3456 },
        { name: 'Thermal Tops Women', count: 5432 },
        { name: 'Thermal Bottoms Women', count: 4567 }
      ]
    },
    
    'seasonal': {
      name: 'Seasonal & Weather Specific',
      items: [
        // Summer Wear
        { name: 'Light Cotton Shirts Women', count: 12345 },
        { name: 'Sleeveless Summer Tops', count: 9876 },
        { name: 'Light Trousers Women', count: 7654 },
        { name: 'Summer Dresses', count: 8765 },
        { name: 'Summer Kurta Pajamas Women', count: 6543 },
        { name: 'Tank Tops Summer', count: 5432 },
        { name: 'Linen Summer Shirts', count: 4321 },
        
        // Monsoon Wear
        { name: 'Waterproof Jackets Women', count: 4321 },
        { name: 'Quick-Dry Pants Women', count: 3456 },
        { name: 'Rain Jackets Women', count: 2876 },
        { name: 'Raincoats Women', count: 2109 },
        { name: 'Windbreakers Women', count: 3210 },
        { name: 'Water-Resistant Clothing Women', count: 1987 },
        
        // Winter Wear
        { name: 'Light Sweaters Women', count: 8765 },
        { name: 'Winter Jackets Women', count: 6543 },
        { name: 'Shawls and Wraps', count: 5432 },
        { name: 'Gloves Women', count: 3456 },
        { name: 'Winter Hats and Caps Women', count: 4321 },
        { name: 'Beanies Women', count: 2876 },
        { name: 'Scarves Women', count: 6789 },
        { name: 'Fleece Jackets Women', count: 4567 }
      ]
    },
    
    'festival': {
      name: 'Festival & Special Occasion',
      items: [
        // Eid Collection
        { name: 'Eid Saree', count: 6789 },
        { name: 'Eid Salwar Kameez', count: 8765 },
        { name: 'Eid Lehenga', count: 4321 },
        
        // Pohela Boishakh
        { name: 'Traditional White Saree Red Border', count: 4321 },
        { name: 'Pohela Boishakh Kurtas Women', count: 2876 },
        { name: 'Traditional Bangladeshi Outfits Women', count: 2109 },
        
        // Wedding & Party Wear
        { name: 'Wedding Sarees', count: 5432 },
        { name: 'Bridal Lehengas', count: 4321 },
        { name: 'Party Dresses Women', count: 6789 },
        { name: 'Cocktail Outfits', count: 4567 },
        { name: 'Reception Wear Women', count: 3210 },
        
        // Religious Wear
        { name: 'Modest Wear Women', count: 5432 },
        { name: 'Traditional Religious Clothing Women', count: 3456 }
      ]
    },
    
    'accessories': {
      name: 'Accessories & Add-ons',
      items: [
        // Fashion Accessories
        { name: 'Scarves & Hijabs', count: 8765 },
        { name: 'Belts Women', count: 9876 },
        { name: 'Hair Accessories', count: 6543 },
        { name: 'Fashion Jewelry Women', count: 12345 },
        { name: 'Handbags & Purses', count: 15678 },
        
        // Traditional Accessories
        { name: 'Dupattas', count: 9876 },
        { name: 'Traditional Jewelry Women', count: 8765 },
        { name: 'Bangles', count: 7654 },
        { name: 'Ethnic Bags Women', count: 4321 },
        { name: 'Traditional Footwear Women', count: 5432 }
      ]
    },
    
    'sizes': {
      name: 'Size Categories',
      items: [
        // Standard Sizing
        { name: 'XS Women', count: 5432 },
        { name: 'S Women', count: 8765 },
        { name: 'M Women', count: 12345 },
        { name: 'L Women', count: 9876 },
        { name: 'XL Women', count: 7654 },
        { name: 'XXL Women', count: 6543 },
        { name: 'XXXL Women', count: 4321 },
        { name: 'Petite Sizes', count: 5432 },
        { name: 'Tall Sizes Women', count: 3456 },
        
        // Plus Size
        { name: 'Plus Size Women', count: 8765 },
        
        // Custom & Tailored
        { name: 'Custom Tailoring Women', count: 4321 },
        { name: 'Alterations Women', count: 3456 },
        { name: 'Made-to-Order Women', count: 2876 }
      ]
    },
    
    'special': {
      name: 'Special Categories',
      items: [
        // Sustainable Fashion
        { name: 'Organic Cotton Women', count: 6789 },
        { name: 'Recycled Materials Women', count: 4321 },
        { name: 'Eco-Friendly Fabrics Women', count: 5432 },
        { name: 'Sustainable Brands Women', count: 3456 },
        
        // Local Artisan Products
        { name: 'Hand-woven Fabrics Women', count: 4567 },
        { name: 'Artisan Clothing Women', count: 3210 },
        { name: 'Traditional Crafts Women', count: 2876 },
        { name: 'Local Designer Wear Women', count: 2109 },
        
        // Vintage & Retro
        { name: 'Vintage Clothing Women', count: 3456 },
        { name: 'Retro Fashion Women', count: 2876 },
        { name: 'Classic Designs Women', count: 2109 }
      ]
    }
  }
};

// Convert structured data to the format expected by the existing components
export const womensFashionDataConverted: SubCategory = {
  name: "Women's Fashion",
  subcategories: Object.values(womensFashionStructured.subcategories).reduce((acc, category) => {
    return [...acc, ...category.items];
  }, [] as Array<{ name: string; count: number }>)
};
