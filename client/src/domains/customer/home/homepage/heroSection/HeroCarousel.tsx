
import React from 'react';
import { HeroSlide, TimeLeft } from './types';
import { HeroSlideContent } from './HeroSlideContent';
import { SlideIndicators } from './SlideIndicators';

interface HeroCarouselProps {
  slides: HeroSlide[];
  currentSlide: number;
  timeLeft: TimeLeft;
  onSlideChange: (index: number) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  slides,
  currentSlide,
  timeLeft,
  onSlideChange
}) => {
  return (
    <div className="lg:col-span-3">
      <div className="relative h-[350px] rounded-2xl overflow-hidden shadow-2xl">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            } ${slide.bg}`}
          >
            <HeroSlideContent slide={slide} timeLeft={timeLeft} />
          </div>
        ))}
        
        <SlideIndicators 
          totalSlides={slides.length}
          currentSlide={currentSlide}
          onSlideChange={onSlideChange}
        />
      </div>
    </div>
  );
};
