import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { AppContext } from '../context/AppContext'; // Adjust the import path

// --- Helper Icon Components ---
const ArrowIcon = ({ direction = 'right', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    className={`w-6 h-6 ${direction === 'left' ? 'transform rotate-180' : ''}`}
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

// --- Helper State Components ---

const HeroSkeleton = () => (
  <div className="relative w-full max-w-screen-2xl mx-auto h-[90vh] md:h-[85vh] overflow-hidden bg-gray-800 rounded-b-3xl animate-pulse">
    <div className="absolute inset-0 bg-gray-700"></div>
    <div className="relative z-10 flex flex-col items-start justify-end h-full p-8 md:p-16">
      <div className="bg-gray-600 h-14 w-3/4 md:w-1/2 rounded-lg mb-4"></div>
      <div className="bg-gray-600 h-6 w-full max-w-xl rounded-lg mb-6"></div>
      <div className="bg-gray-500 h-12 w-40 rounded-full"></div>
    </div>
  </div>
);

const StaticFallbackHero = () => (
  <div className="relative w-full max-w-screen-2xl mx-auto h-[90vh] md:h-[85vh] overflow-hidden bg-black text-white rounded-b-3xl">
    <img
      src="https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?auto=format&fit=crop&w=1920"
      alt="Welcome to our platform"
      className="absolute inset-0 w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
    <div className="relative z-10 flex flex-col items-start justify-end h-full p-8 md:p-16">
      <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Our Platform</h1>
      <p className="text-lg md:text-xl max-w-xl">Discover amazing events and experiences.</p>
    </div>
  </div>
);

const ErrorState = ({ message }) => (
    <div className="relative w-full max-w-screen-2xl mx-auto h-[90vh] md:h-[85vh] overflow-hidden bg-red-900/20 text-white rounded-b-3xl flex items-center justify-center text-center">
         <div className="absolute inset-0 bg-black/70"></div>
         <div className="relative z-10 p-4">
            <h2 className="text-3xl font-bold text-red-400 mb-2">An Error Occurred</h2>
            <p className="text-lg text-red-200">{message}</p>
         </div>
    </div>
);

// --- The Main Header Component ---

const SLIDE_DURATION_MS = 5000;

const Header = () => {
  const { backendUrl } = useContext(AppContext);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // --- Data Fetching Effect ---
  useEffect(() => {
    if (!backendUrl) return;
    const fetchSlides = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendUrl}/api/user/public/hero`);
        setSlides(response.data?.slides || []);
      } catch (err) {
        console.error("Failed to fetch hero slides:", err);
        setError("Could not load content. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchSlides();
  }, [backendUrl]);

  // --- Slide Transition Logic ---
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (slides.length > 1) {
      const timer = setInterval(nextSlide, SLIDE_DURATION_MS);
      return () => clearInterval(timer);
    }
  }, [slides.length]);


  // --- Conditional Rendering for States ---
  if (loading) return <HeroSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (slides.length === 0) return <StaticFallbackHero />;

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full  mx-auto h-[90vh] md:h-[85vh] overflow-hidden bg-black text-white  shadow-2xl">
      {/* Background Image */}
      <AnimatePresence initial={false}>
        <motion.img
          key={currentSlide._id}
          src={currentSlide.image}
          alt={currentSlide.altText}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.43, 0.13, 0.23, 0.96] }}
        />
      </AnimatePresence>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>

      {/* Text Content */}
      <div className="relative z-10 flex flex-col items-start justify-end h-full p-8 md:p-12 lg:p-16 text-left">
        <AnimatePresence>
          <motion.div
            key={currentSlide._id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-full"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 max-w-3xl text-shadow">
              {currentSlide.heading}
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mb-8 text-gray-200 text-shadow-sm">
              {currentSlide.subheading}
            </p>
            <motion.a
              href={currentSlide.button.link}
              className="inline-block bg-white/20 border border-white/50 backdrop-blur-sm text-white px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300 hover:bg-white/30 hover:border-white/70"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {currentSlide.button.text}
            </motion.a>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 right-8 z-20 flex items-center gap-4">
        {/* Arrow Buttons */}
        <button onClick={prevSlide} className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
          <ArrowIcon direction="left" />
        </button>
        <button onClick={nextSlide} className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
          <ArrowIcon direction="right" />
        </button>
      </div>
      
      {/* Progress Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="w-8 h-1 rounded-full bg-white/30 overflow-hidden"
            aria-label={`Go to slide ${index + 1}`}
          >
            {currentIndex === index && (
              <motion.div
                className="h-full bg-white"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: SLIDE_DURATION_MS / 1000, ease: 'linear' }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Header;