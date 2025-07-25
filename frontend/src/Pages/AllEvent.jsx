// src/pages/EventList.js
import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { FaRegPlayCircle, FaMoneyBillAlt, FaCalendarAlt, FaMapMarkerAlt, FaFilter, FaSearch, FaClock, FaTimes } from 'react-icons/fa';
import Modal from 'react-modal';

// Set the app element for accessibility
Modal.setAppElement('#root'); // Assuming your main app div has id="root"

const EventList = () => {
  const { backendUrl } = useContext(AppContext);
  const { currentTheme } = useTheme();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); // Default to 'upcoming'
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState('');
  const [modalError, setModalError] = useState('');

  // --- Themed Styles ---
  const getThemedStyles = () => ({
    container: {
      backgroundColor: currentTheme.background || '#ffffff',
      color: currentTheme.textColor || '#333333',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
    },
    title: {
      color: currentTheme.primaryColor || '#4f46e5',
      fontFamily: currentTheme.sectionTitleFont || currentTheme.fontFamily || 'sans-serif',
      fontSize: '2.5rem', // Larger title
      fontWeight: '700',
    },
    filterButton: (isActive) => ({
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      fontWeight: '600',
      padding: '0.6rem 1.2rem',
      borderRadius: '1.5rem', // Pill shape
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      ...(isActive
        ? {
            backgroundColor: currentTheme.primaryColor || '#4f46e5',
            color: currentTheme.background || '#ffffff',
            boxShadow: `0 4px 6px -1px ${currentTheme.primaryColor}30`,
          }
        : {
            backgroundColor: currentTheme.cardBgColor || '#f8fafc',
            color: currentTheme.textColorMuted || '#6c757d',
            border: `1px solid ${currentTheme.borderColor || '#e0e0e0'}`,
            '&:hover': {
              backgroundColor: currentTheme.hoverAccentColor || '#e0e7ff', // Slight accent hover
              color: currentTheme.accentColor || '#4f46e5',
            },
          }),
    }),
    searchBar: {
      padding: '0.8rem 1rem',
      borderColor: currentTheme.borderColor || '#cccccc',
      borderRadius: '0.5rem',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      color: currentTheme.textColor || '#333333',
      backgroundColor: currentTheme.cardBgColor || '#ffffff',
      boxShadow: `0 1px 3px 0 ${currentTheme.borderColor}30`,
      '&:focus': {
        borderColor: currentTheme.primaryColor || '#4f46e5',
        boxShadow: `0 0 0 3px ${currentTheme.primaryColor}20`,
      },
    },
    eventCard: {
      backgroundColor: currentTheme.cardBgColor || '#ffffff',
      color: currentTheme.textColor || '#333333',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      borderRadius: '1.25rem', // Larger border radius
      boxShadow: `0 10px 20px -5px ${currentTheme.shadowColor || '#0000001a'}, 0 5px 10px -5px ${currentTheme.shadowColor || '#0000001a'}`,
      border: `1px solid ${currentTheme.borderColor || '#e0e0e0'}`,
      transition: 'all 0.4s ease-in-out',
      '&:hover': {
        transform: 'translateY(-5px) scale(1.02)',
        boxShadow: `0 15px 30px -10px ${currentTheme.shadowColor || '#00000026'}, 0 10px 15px -10px ${currentTheme.shadowColor || '#00000026'}`,
      },
    },
    eventImage: {
      height: '12rem', // Fixed height for images
      objectCover: 'cover',
    },
    eventTag: (tag) => {
      let bgColor, textColor;
      switch (tag.toLowerCase()) {
        case 'media': bgColor = currentTheme.primaryColor + '20'; textColor = currentTheme.primaryColor; break;
        case 'arts & crafts': bgColor = currentTheme.successColor + '20'; textColor = currentTheme.successColor; break;
        case 'technology': bgColor = currentTheme.accentColor + '20'; textColor = currentTheme.accentColor; break;
        default: bgColor = currentTheme.borderColor + '50'; textColor = currentTheme.textColorMuted;
      }
      return {
        backgroundColor: bgColor,
        color: textColor,
        fontSize: '0.75rem',
        fontWeight: '600',
        padding: '0.3rem 0.8rem',
        borderRadius: '9999px',
      };
    },
    eventTitle: {
      color: currentTheme.primaryColor || '#4f46e5',
      fontWeight: '700',
      fontSize: '1.25rem',
    },
    eventDetailText: {
      color: currentTheme.textColorMuted || '#6c757d',
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.5rem',
    },
    eventDescription: {
      fontSize: '0.9rem',
      lineClamp: 3,
      marginBottom: '1rem',
    },
    playButton: {
      color: currentTheme.accentColor || '#6c757d',
      transition: 'color 0.3s ease',
      '&:hover': {
        color: currentTheme.primaryColor || '#4f46e5',
      },
    },
    paidInfo: {
      color: currentTheme.textColor || '#333333',
      fontSize: '0.9rem',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
    },
    detailsButton: (isPast) => ({
      padding: '0.6rem 1.2rem',
      borderRadius: '0.5rem',
      fontWeight: '600',
      fontSize: '0.875rem',
      transition: 'all 0.3s ease',
      cursor: isPast ? 'default' : 'pointer',
      ...(isPast
        ? {
            backgroundColor: currentTheme.borderColor || '#d1d5db',
            color: currentTheme.textColorMuted || '#6b7280',
          }
        : {
            backgroundColor: currentTheme.primaryColor || '#4f46e5',
            color: currentTheme.background || '#ffffff',
            boxShadow: `0 4px 6px -1px ${currentTheme.primaryColor}30`,
            '&:hover': {
              backgroundColor: currentTheme.hoverAccentColor || '#3730a3',
            },
          }),
    }),
    modalOverlay: {
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: currentTheme.cardBgColor || '#ffffff',
      padding: '40px', borderRadius: '1.5rem',
      boxShadow: `0 25px 60px rgba(0,0,0,0.3), 0 0 0 2px ${currentTheme.borderColor || '#e0e0e0'}`,
      maxWidth: '90%', maxHeight: '85vh', overflowY: 'auto', position: 'relative',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      color: currentTheme.textColor || '#333333',
    },
    modalTitle: {
      fontSize: '2rem', // Slightly smaller modal title
      fontWeight: '700',
      marginBottom: '20px',
      fontFamily: currentTheme.sectionTitleFont || currentTheme.fontFamily || 'sans-serif',
      color: currentTheme.primaryColor || '#4f46e5',
    },
    modalMessage: {
      fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '30px',
      opacity: '0.9', fontFamily: currentTheme.fontFamily || 'sans-serif',
      color: currentTheme.textColor || '#333333',
    },
    modalLink: {
      color: currentTheme.accentColor || '#3b82f6', fontWeight: '600',
      textDecoration: 'none', borderBottom: `2px solid ${currentTheme.accentColor || '#3b82f6'}`,
      paddingBottom: '4px', transition: 'color 0.3s ease, border-color 0.3s ease',
      display: 'inline-flex', alignItems: 'center', gap: '10px',
      fontSize: '1rem', fontFamily: currentTheme.fontFamily || 'sans-serif',
      '&:hover': { color: currentTheme.primaryColor, borderColor: currentTheme.primaryColor },
    },
    modalCloseButton: {
      position: 'absolute', top: '20px', right: '20px', fontSize: '2rem',
      cursor: 'pointer', background: 'none', border: 'none',
      color: currentTheme.textColor || '#333333',
      transition: 'color 0.3s ease',
      '&:hover': { color: currentTheme.primaryColor || '#4f46e5' },
    },
    errorContainer: {
      minHeight: '70vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
    },
    errorCard: {
      padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.5), 0 2px 4px -1px rgba(239, 68, 68, 0.5)',
      backgroundColor: currentTheme.warningBgColor || '#fee2e2', // Light red
      color: currentTheme.warningTextColor || '#dc2626', // Dark red
    },
    retryButton: {
      padding: '0.75rem 1.25rem', borderRadius: '0.5rem', fontWeight: '600',
      fontSize: '0.875rem', transition: 'all 0.3s ease',
      backgroundColor: currentTheme.primaryColor || '#4f46e5',
      color: currentTheme.background || '#ffffff',
      boxShadow: `0 4px 6px -1px ${currentTheme.primaryColor}30`,
      '&:hover': { backgroundColor: currentTheme.hoverAccentColor || '#3730a3' },
    },
    loadingSpinner: {
      color: currentTheme.primaryColor || '#4f46e5',
      height: '2.5rem', width: '2.5rem', borderWidth: '4px', borderTopColor: 'transparent',
      borderRadius: '9999px', animation: 'spin 1s linear infinite',
    },
    loadingText: {
      fontSize: '1.125rem', color: currentTheme.textColor || '#333333',
    },
    iconContainer: (bgColor, iconColor) => ({
      backgroundColor: bgColor,
      color: iconColor,
      padding: '0.5rem',
      borderRadius: '9999px',
      marginRight: '1rem',
    }),
  });

  const styles = getThemedStyles();

  // Helper to check if an event is in the past
  const isEventPast = (eventDateString) => {
    if (!eventDateString) return true;
    const eventDate = new Date(eventDateString);
    // Compare with current date at the same time to be precise
    return eventDate < new Date();
  };

  useEffect(() => {
    const fetchEvents = async () => {
      if (!backendUrl) {
        setError("Backend URL missing from context.");
        setLoading(false);
        return;
      }

      let url;
      switch (filter) {
        case 'upcoming': url = `${backendUrl}/api/user/events/upcoming`; break;
        case 'latest': url = `${backendUrl}/api/user/events/latest`; break;
        case 'all': url = `${backendUrl}/api/user/user/events`; break; // Use general events endpoint for 'all'
        default: url = `${backendUrl}/api/user/events/upcoming`; break;
      }

      setLoading(true);
      setError(null); // Clear previous errors
      setEvents([]); // Clear previous events

      try {
        const response = await fetch(url);
        if (!response.ok) {
          const details = await response.text();
          throw new Error(`Status ${response.status}: ${details}`);
        }
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        console.error(`Error fetching events (${filter}):`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [backendUrl, filter]);

  const filteredAndSortedEvents = events
    .filter(event =>
      event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.eventDate);
      const dateB = new Date(b.eventDate);
      if (filter === 'upcoming') return dateA - dateB; // Upcoming events sorted ascending
      if (filter === 'latest') return dateB - dateA; // Latest events sorted descending
      return dateA - dateB; // Default to ascending for 'all'
    });

  const openVideoModal = (videoUrl) => {
    if (!videoUrl) {
      setModalError('No video URL provided.');
      setIsModalOpen(true);
      return;
    }
    let embedUrl = videoUrl;
    try {
      if (videoUrl.includes('youtube.com')) {
        const urlParams = new URLSearchParams(new URL(videoUrl).search);
        const videoId = urlParams.get('v');
        if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (videoUrl.includes('youtu.be/')) {
        const videoId = videoUrl.split('youtu.be/')[1].split('?')[0]; // Handle potential query params in youtu.be URLs
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      // Add more platform support here if needed (e.g., Vimeo)

      if (embedUrl) {
        setSelectedVideoUrl(embedUrl);
        setIsModalOpen(true);
        setModalError(''); // Clear any previous modal error
      } else {
        throw new Error('Invalid video URL format.');
      }
    } catch (err) {
      console.error("Error processing video URL:", err);
      setModalError('Could not process the video URL. Please check the link.');
      setSelectedVideoUrl('');
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVideoUrl('');
    setModalError(''); // Reset modal error
  };

  // === Rendering ===
  if (loading) {
    return (
      <div className={`${styles.container.backgroundColor} ${styles.container.color} ${styles.container.fontFamily} flex justify-center items-center min-h-screen`}>
        <div className="flex items-center">
          <div className={styles.loadingSpinner.className || ''} style={styles.loadingSpinner}></div>
          <p className={styles.loadingText.className || ''} style={styles.loadingText}>Loading Events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.errorContainer.fontFamily} ${styles.errorContainer.backgroundColor} ${styles.errorContainer.color}`} style={styles.errorContainer}>
        <div className={`${styles.errorCard.backgroundColor} ${styles.errorCard.color}`} style={styles.errorCard}>
          <h2 className="text-2xl font-bold mb-2 text-center">Oops! Something went wrong.</h2>
          <p className="mb-6 text-center">
            We couldn't load the event details. Please check your connection or try again later.<br />
            {error && <span className="text-sm block mt-2">{error}</span>}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mx-auto block"
            style={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container.backgroundColor} ${styles.container.color} py-16 min-h-screen ${styles.container.fontFamily}`}>
      <div className="container mx-auto px-4">

        {/* Header */}
        <h1 className={`text-center mb-10`} style={styles.title}>
          Explore Events
        </h1>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-10 justify-center">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-3 rounded-lg shadow-sm"
              style={styles.searchBar}
            />
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            {['upcoming', 'latest', 'all'].map(key => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="px-5 py-2 rounded-full font-semibold transition-all duration-300 shadow-md"
                style={styles.filterButton(filter === key)}
              >
                {key === 'upcoming' && <FaClock className="mr-1" />}
                {key === 'latest' && <FaCalendarAlt className="mr-1" />}
                {key === 'all' && <FaFilter className="mr-1" />}
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Events */}
        {filteredAndSortedEvents.length === 0 ? (
          <p className={`text-center text-lg py-10 ${styles.container.color}`} style={{ opacity: '0.7' }}>
            No events match your search or filter.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedEvents.map(event => {
              const past = isEventPast(event.eventDate);
              return (
                <div
                  key={event._id}
                  className="rounded-lg shadow-xl p-6 flex flex-col justify-between"
                  style={styles.eventCard}
                >
                  <div>
                    {/* Image */}
                    <div className="w-full aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden" style={styles.eventImage}>
                      {event.eventImageURL ? (
                        <img src={event.eventImageURL} alt={event.eventName} className="w-full h-full object-cover" />
                      ) : (
                        <p className="text-gray-500">No Image Available</p>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {event.tags && event.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 rounded-full text-xs font-semibold" style={styles.eventTag(tag)}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    <h3 className="mb-2 truncate" style={styles.eventTitle}>{event.eventName}</h3>

                    {/* Date */}
                    <p className="mb-1" style={styles.eventDetailText}>
                      <FaCalendarAlt className="text-red-500" size={18} />
                      {new Date(event.eventDate).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </p>

                    {/* Location */}
                    {event.location && (
                      <p className="mb-2" style={styles.eventDetailText}>
                        <FaMapMarkerAlt className="text-red-500" size={18} />
                        {event.location}
                      </p>
                    )}

                    {/* Description */}
                    {event.description && (
                      <p className="mb-4" style={styles.eventDescription}>
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* Actions and Icons */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: currentTheme.borderColor }}>
                    <div className="flex items-center gap-4">
                      {/* Play Video Icon */}
                      {event.eventVideoURL && (
                        <button
                          onClick={() => openVideoModal(event.eventVideoURL)}
                          className="focus:outline-none"
                          aria-label="Watch video"
                          style={styles.playButton}
                        >
                          <FaRegPlayCircle size={24} />
                        </button>
                      )}
                      {/* Paid Icon */}
                      {event.isPaid && (
                        <div style={styles.paidInfo}>
                          <FaMoneyBillAlt size={20} className="text-yellow-500" />
                          <span>Paid</span>
                        </div>
                      )}
                    </div>

                    {/* View Details Button */}
                    <Link
                      to={past ? '#' : `/events/${event._id}`} // Prevent navigation if past
                      className="px-4 py-2 text-sm font-semibold rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={styles.detailsButton(past)}
                    >
                      {past ? 'Event Ended' : 'View Details'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Event Video"
        style={{
          overlay: styles.modalOverlay,
          content: styles.modalContent,
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold" style={styles.modalTitle}>Event Preview</h2>
          <button onClick={closeModal} className="focus:outline-none" style={styles.modalCloseButton}>
            <FaTimes className="text-2xl" />
          </button>
        </div>
        {modalError ? (
          <div className="py-10 text-center" style={{color: currentTheme.errorColor}}>
            {modalError}
          </div>
        ) : (
          selectedVideoUrl && (
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                width="100%"
                height="100%"
                src={selectedVideoUrl}
                title="Event Video Player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              ></iframe>
            </div>
          )
        )}
      </Modal>
    </div>
  );
};

export default EventList;