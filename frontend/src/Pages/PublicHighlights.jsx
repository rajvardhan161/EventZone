import React, { useEffect, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaImage, FaSpinner, FaExclamationTriangle, FaSearchPlus, FaArrowLeft, FaArrowRight, FaTimes } from 'react-icons/fa';

// NOTE FOR BACKEND: For the best experience, your highlight objects should include a `title`.
// Example: { _id: '...', image: 'url...', title: 'Opening Ceremony' }

// --- Skeleton Loader Component ---
const HighlightSkeleton = ({ theme }) => {
  const skeletonCards = Array.from({ length: 8 });
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6`}>
      {skeletonCards.map((_, index) => (
        <div key={index} className={`aspect-[4/5] rounded-xl bg-gray-300 dark:bg-gray-700 animate-pulse`}></div>
      ))}
    </div>
  );
};

// --- Lightbox Modal Component ---
const ImageLightbox = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  const currentImage = images[currentIndex];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      {/* Close Button */}
      <button className="absolute top-4 right-4 text-white text-3xl z-20" aria-label="Close image viewer">
        <FaTimes />
      </button>

      {/* Prev Button */}
      <button
        className="absolute left-4 md:left-8 text-white p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-20"
        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
        aria-label="Previous image"
      >
        <FaArrowLeft size={24} />
      </button>

      {/* Image Display */}
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImage._id}
            src={currentImage.image}
            alt={currentImage.title || 'Event Highlight'}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
          />
        </AnimatePresence>
      </div>

      {/* Next Button */}
      <button
        className="absolute right-4 md:right-8 text-white p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-20"
        onClick={(e) => { e.stopPropagation(); handleNext(); }}
        aria-label="Next image"
      >
        <FaArrowRight size={24} />
      </button>
    </motion.div>
  );
};


// --- Main PublicHighlights Component ---
const PublicHighlights = () => {
  const { backendUrl } = useContext(AppContext);
  const { currentTheme } = useTheme();
  
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [modalIndex, setModalIndex] = useState(null);

  useEffect(() => {
    const fetchPublicHighlights = async () => {
      // ... (fetching logic remains the same)
      setLoading(true);
      setError(null);
      if (!backendUrl) {
          setError("Backend URL is not configured.");
          setLoading(false);
          return;
      }
      try {
        const res = await axios.get(`${backendUrl}/api/event/public/highlights`); 
        setHighlights(res.data || []);
      } catch (err) {
        console.error('Error fetching highlights:', err);
        setError('Could not load event highlights. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicHighlights();
  }, [backendUrl]);

  const openImageModal = (index) => {
    setModalIndex(index);
  };

  const closeImageModal = () => {
    setModalIndex(null);
  };
  
  const { background, textColor, primaryColor, borderColor } = currentTheme;

  // --- Render Error State ---
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center py-20 min-h-[400px] ${background}`}>
        <FaExclamationTriangle className="text-red-500 text-6xl mb-4" />
        <p className={`text-xl font-semibold text-red-500`}>Oops! Something went wrong.</p>
        <p className={`mt-2 ${textColor}`}>{error}</p>
      </div>
    );
  }

  return (
    <div className={`py-16 sm:py-24 transition-colors duration-300 ${background}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className={`text-4xl md:text-5xl font-extrabold ${primaryColor}`}>Event Highlights</h1>
          <p className={`mt-4 text-lg md:text-xl ${textColor} max-w-3xl mx-auto text-opacity-80`}>
            A glimpse into the memorable moments from our recent events.
          </p>
        </div>

        {loading ? (
            <HighlightSkeleton theme={currentTheme} />
        ) : highlights.length > 0 ? (
          // --- Masonry Grid Layout ---
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {highlights.map((highlight, index) => (
              <div
                key={highlight._id || index}
                className={`group relative aspect-[4/5] rounded-xl shadow-lg cursor-pointer overflow-hidden ${background}`}
                onClick={() => openImageModal(index)}
                aria-label={`View highlight: ${highlight.title || `image ${index + 1}`}`}
              >
                <img
                  src={highlight.image}
                  alt={highlight.title || 'Event Highlight'}
                  className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                  loading="lazy"
                />
                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                
                {/* Content on hover */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                    <FaSearchPlus className="text-white text-5xl mb-2" />
                    <h3 className="text-white text-xl font-bold text-center">{highlight.title || 'View Image'}</h3>
                </div>

                {/* Always visible title */}
                <h3 className="absolute bottom-0 left-0 p-4 text-white text-lg font-bold transition-opacity duration-300 group-hover:opacity-0">
                  {highlight.title}
                </h3>
              </div>
            ))}
          </div>
        ) : (
          // --- Render No Highlights State ---
          <div className={`text-center py-20 border-2 border-dashed rounded-lg ${borderColor}`}>
            <FaImage className={`mx-auto text-7xl text-gray-400 mb-4`} />
            <h3 className={`text-2xl font-semibold ${primaryColor}`}>No Highlights to Show Yet</h3>
            <p className={`mt-2 ${textColor} text-opacity-70`}>Check back soon for photos from our latest events!</p>
          </div>
        )}
      </div>

      {/* --- Image Lightbox Modal --- */}
      <AnimatePresence>
        {modalIndex !== null && (
          <ImageLightbox
            images={highlights}
            initialIndex={modalIndex}
            onClose={closeImageModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublicHighlights;