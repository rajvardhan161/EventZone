import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Local image imports (replace paths with your own images if needed)
import img1 from '../assets/photo/wallpaperflare.com_wallpaper (26).jpg';
import img2 from '../assets/photo/wallpaperflare.com_wallpaper (24).jpg';
import img3 from '../assets/photo/wallpaperflare.com_wallpaper (23).jpg';
import img4 from '../assets/photo/wallpaperflare.com_wallpaper (21).jpg';

const slides = [
  {
    id: 1,
    url: img1,
    altText: 'Tech Conference 2024',
    heading: 'Tech Conference 2024',
    subheading: 'Explore the latest in technology and innovation.',
    button: { text: 'Learn More', link: '#' },
  },
  {
    id: 2,
    url: img2,
    altText: 'Music Festival',
    heading: 'Music Festival',
    subheading: 'Experience electrifying performances.',
    button: { text: 'Buy Tickets', link: '#' },
  },
  {
    id: 3,
    url: img3,
    altText: 'Art Showcase',
    heading: 'Art Showcase',
    subheading: 'Immerse in creative masterpieces.',
    button: { text: 'View Gallery', link: '#' },
  },
  {
    id: 4,
    url: img4,
    altText: 'Food & Wine',
    heading: 'Food & Wine Festival',
    subheading: 'Savor flavors from around the world.',
    button: { text: 'Join Us', link: '#' },
  },
];

const Header = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black text-white">
      {/* Background Image */}
      <AnimatePresence initial={false}>
        <motion.img
          key={currentSlide.id}
          src={currentSlide.url}
          alt={currentSlide.altText}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
        />
      </AnimatePresence>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Text Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 min-h-screen">
        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          {currentSlide.heading}
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl max-w-xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {currentSlide.subheading}
        </motion.p>

        <motion.a
          href={currentSlide.button.link}
          className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-full font-semibold text-lg hover:bg-yellow-300 transition"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {currentSlide.button.text}
        </motion.a>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full ${
              currentIndex === index ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Header;
