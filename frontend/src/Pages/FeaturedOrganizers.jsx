import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGlobe, FaEnvelope, FaCalendarAlt, FaTimes, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import { AppContext } from '../context/AppContext'; // Assumes backendUrl comes from here

// --- HELPER & SKELETON COMPONENTS ---

// Skeleton Card for Loading State
const OrganizerCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-md p-6 text-center flex flex-col items-center justify-center border-4 border-transparent">
    <div className="w-24 h-24 rounded-full bg-gray-300 animate-pulse mb-4"></div>
    <div className="h-6 w-3/4 bg-gray-300 animate-pulse rounded-md mb-2"></div>
    <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded-md mt-1"></div>
  </div>
);

// Reusable Info Panel for Error/Empty States
const InfoPanel = ({ icon, title, message }) => (
  <div className="col-span-full mt-8 text-center bg-gray-50 rounded-2xl p-8">
    <div className="text-gray-400 text-5xl mb-4 inline-block">{icon}</div>
    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
    <p className="text-gray-500 mt-2">{message}</p>
  </div>
);


// --- CORE COMPONENTS ---

// Organizer Card (Minor visual enhancements)
const OrganizerCard = ({ organizer, onSelect, isActive }) => (
  <motion.div
    onClick={onSelect}
    className={`bg-white rounded-2xl shadow-md p-6 text-center flex flex-col items-center justify-center cursor-pointer border-4 transition-all duration-300 group ${
      isActive ? 'border-blue-500 scale-105 shadow-xl' : 'border-transparent hover:shadow-lg hover:-translate-y-1'
    }`}
    whileTap={{ scale: 0.98 }}
    layout // Smoothly animates position changes
  >
    <img
      src={organizer.logoUrl}
      alt={`${organizer.name} logo`}
      className="w-24 h-24 rounded-full object-cover mb-4"
    />
    <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{organizer.name}</h3>
    <p className="text-gray-500 text-sm mt-1">{organizer.tagline}</p>
  </motion.div>
);

// Detail Panel (Enhanced with Close button, better event list)
const OrganizerDetailPanel = ({ organizer, onClose }) => {
  if (!organizer) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      layout
      initial={{ y: -20, opacity: 0, height: 0 }}
      animate={{ y: 0, opacity: 1, height: 'auto' }}
      exit={{ y: -20, opacity: 0, height: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 mt-8 flex flex-col md:flex-row gap-8 relative"
    >
      <button
        onClick={onClose}
        aria-label="Close details"
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors z-10 p-2 rounded-full hover:bg-gray-100"
      >
        <FaTimes size={20} />
      </button>

      <div className="md:w-1/3 flex-shrink-0">
        <div className="flex items-center mb-6">
          <img src={organizer.logoUrl} alt={`${organizer.name} logo`} className="w-20 h-20 rounded-full mr-4 shadow-sm" />
          <div>
            <h3 className="text-2xl font-extrabold text-gray-900">{organizer.name}</h3>
          </div>
        </div>
        <p className="text-gray-600 mb-6">{organizer.description}</p>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <a href={organizer.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
            <FaGlobe className="mr-2" /> Website
          </a>
          <a href={`mailto:${organizer.contactEmail}`} className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
            <FaEnvelope className="mr-2" /> Contact
          </a>
        </div>
      </div>

      <div className="md:w-2/3 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-8">
        <h4 className="text-xl font-bold text-gray-800 mb-4">Recent Events Hosted</h4>
        {organizer.events?.length > 0 ? (
          <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {organizer.events.map(event => (
              <li key={event.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors group">
                <span className="text-gray-800 font-medium group-hover:text-blue-700">{event.title}</span>
                <span className="flex items-center text-xs text-gray-500 font-medium shrink-0 ml-4">
                  <FaCalendarAlt className="mr-2" />
                  {formatDate(event.date)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center bg-gray-50 rounded-lg p-6">
             <FaCalendarAlt className="text-3xl text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">No recent events to display.</p>
            <p className="text-sm text-gray-500">Check back later for updates.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// --- MAIN COMPONENT (Enhanced Logic) ---
const FeaturedOrganizers = () => {
  const { backendUrl } = useContext(AppContext);
  const [organizers, setOrganizers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const detailPanelRef = useRef(null);

  useEffect(() => {
    const fetchOrganizers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${backendUrl}/api/user/public/organizer`);
        setOrganizers(res.data);
      } catch (err) {
        console.error('Failed to fetch organizers:', err);
        setError('Could not load our partners at this time. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizers();
  }, [backendUrl]);

  const handleSelect = (id) => {
    const newId = selectedId === id ? null : id;
    setSelectedId(newId);
  };
  
  // Auto-scroll to detail panel when it opens
  useEffect(() => {
    if (selectedId && detailPanelRef.current) {
        setTimeout(() => { // Timeout ensures layout has settled
            detailPanelRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'end', // Aligns the bottom of the element to the bottom of the viewport
                inline: 'nearest'
            });
        }, 500); // Corresponds with the animation duration
    }
  }, [selectedId]);

  const selectedOrganizer = selectedId ? organizers.find(org => org._id === selectedId) : null;

  // Animation variants for staggered card entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="bg-gray-100 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Our Valued Partners</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Select an organization to learn more about their work and past events.
          </p>
        </div>
        
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => <OrganizerCardSkeleton key={index} />)
          ) : error ? (
            <InfoPanel icon={<FaExclamationTriangle />} title="An Error Occurred" message={error} />
          ) : organizers.length === 0 ? (
            <InfoPanel icon={<FaInfoCircle />} title="No Partners Found" message="There are currently no featured partners to display." />
          ) : (
            organizers.map(org => (
              <motion.div key={org._id} variants={itemVariants}>
                <OrganizerCard
                  organizer={org}
                  onSelect={() => handleSelect(org._id)}
                  isActive={selectedId === org._id}
                />
              </motion.div>
            ))
          )}
        </motion.div>
        
        <div ref={detailPanelRef}>
          <AnimatePresence>
            {selectedOrganizer && (
              <OrganizerDetailPanel 
                organizer={selectedOrganizer} 
                onClose={() => setSelectedId(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FeaturedOrganizers;