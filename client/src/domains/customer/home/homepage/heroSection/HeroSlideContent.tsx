
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle } from 'lucide-react';
import { HeroSlide, TimeLeft } from './types';

interface HeroSlideContentProps {
  slide: HeroSlide;
  timeLeft: TimeLeft;
}

export const HeroSlideContent: React.FC<HeroSlideContentProps> = ({ slide, timeLeft }) => {
  return (
    <div className="flex items-center h-full p-8">
      <div className="flex-1 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-yellow-300" />
          <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
            Featured
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          {slide.title}
        </h1>
        <p className="text-lg mb-4 opacity-90">{slide.subtitle}</p>
        
        {/* Features List */}
        {slide.features && (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {slide.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-300" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Countdown Timer for slides without features */}
        {!slide.features && (
          <div className="flex items-center gap-4 mb-6">
            <span className="text-lg font-semibold">Ends in:</span>
            <div className="flex gap-2">
              {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2 text-center min-w-[50px]">
                  <div className="text-2xl font-bold">{value.toString().padStart(2, '0')}</div>
                  <div className="text-xs uppercase">{unit}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-4">
          {slide.buttons ? (
            slide.buttons.map((button, idx) => (
              <Link
                key={idx}
                to={button.link}
                className={`font-bold px-6 py-3 rounded-full transition-all transform hover:scale-105 shadow-lg ${
                  button.primary
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-300 hover:to-orange-400'
                    : 'border-2 border-white text-white hover:bg-white hover:text-gray-800'
                }`}
              >
                {button.text}
              </Link>
            ))
          ) : (
            <>
              <Link
                to="/products"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-8 py-3 rounded-full hover:from-yellow-300 hover:to-orange-400 transition-all transform hover:scale-105 shadow-lg"
              >
                Shop Now
              </Link>
              <Link
                to="/categories"
                className="border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white hover:text-gray-800 transition-all"
              >
                Learn More
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="flex-1 hidden md:block">
        <img src={slide.image} alt="Hero" className="w-full h-96 object-cover rounded-xl" />
      </div>
    </div>
  );
};
