// src/pages/EventList.js
import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { FaRegPlayCircle, FaMoneyBillAlt, FaCalendarAlt, FaMapMarkerAlt, FaFilter, FaSearch, FaClock, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import Modal from 'react-modal';

// Set the app element for accessibility
Modal.setAppElement('#root'); // Assuming your main app div has id="root"

const EventList = () => {
  const { backendUrl } = useContext(AppContext);
  const { currentTheme } = useTheme();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState('');
  const [modalError, setModalError] = useState('');

  // --- Themed Styles ---
  const getThemedStyles = () => ({
    container: {
      backgroundColor: currentTheme.background || '#f8fafc', // Lighter bg for contrast
      color: currentTheme.textColor || '#333333',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
    },
    title: {
      color: currentTheme.primaryColor || '#4f46e5',
      fontFamily: currentTheme.sectionTitleFont || currentTheme.fontFamily || 'sans-serif',
      fontSize: '2.5rem',
      fontWeight: '800', // Bolder
    },
    subtitle: {
      color: currentTheme.textColorMuted || '#6b7280',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
    },
    filterButton: (isActive) => ({
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      fontWeight: '600',
      padding: '0.6rem 1.2rem',
      borderRadius: '9999px', // Pill shape
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      ...(isActive
        ? {
            backgroundColor: currentTheme.primaryColor || '#4f46e5',
            color: currentTheme.background || '#ffffff',
            boxShadow: `0 4px 10px -1px ${currentTheme.primaryColor}50`,
          }
        : {
            backgroundColor: currentTheme.cardBgColor || '#f8fafc',
            color: currentTheme.textColorMuted || '#6c757d',
            border: `1px solid ${currentTheme.borderColor || '#e0e0e0'}`,
            '&:hover': {
              backgroundColor: currentTheme.primaryColor + '15', // Subtle hover
              color: currentTheme.primaryColor,
            },
          }),
    }),
    searchBar: {
      padding: '0.8rem 1rem 0.8rem 2.5rem', // Left padding for icon
      borderColor: currentTheme.borderColor || '#cccccc',
      borderRadius: '9999px',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      color: currentTheme.textColor || '#333333',
      backgroundColor: currentTheme.cardBgColor || '#ffffff',
      boxShadow: `0 1px 3px 0 ${currentTheme.borderColor}30`,
      '&:focus': {
        borderColor: currentTheme.primaryColor || '#4f46e5',
        boxShadow: `0 0 0 3px ${currentTheme.primaryColor}30`,
      },
    },
    eventCard: {
      backgroundColor: currentTheme.cardBgColor || '#ffffff',
      color: currentTheme.textColor || '#333333',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      borderRadius: '1rem', // Slightly smaller for a tighter look
      boxShadow: `0 8px 15px -3px ${currentTheme.shadowColor || '#0000001a'}`,
      border: `1px solid ${currentTheme.borderColor || '#e0e0e0'}`,
      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: `0 12px 25px -5px ${currentTheme.shadowColor || '#00000026'}`,
      },
    },
    eventImageContainer: {
        height: '14rem', // Increased height for better visual
        position: 'relative',
        overflow: 'hidden'
    },
    eventDateOverlay: {
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        color: '#ffffff',
        padding: '0.5rem 0.75rem',
        borderRadius: '0.5rem',
        textAlign: 'center',
        lineHeight: '1.2',
        fontWeight: '700',
        fontFamily: currentTheme.fontFamily,
        backdropFilter: 'blur(4px)',
    },
    pastEventOverlay: {
        position: 'absolute',
        inset: '0',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'grayscale(80%)',
        zIndex: 5,
    },
    eventTitle: {
      color: currentTheme.primaryColor || '#4f46e5',
      fontWeight: '700',
      fontSize: '1.2rem',
    },
    eventDetailText: {
      color: currentTheme.textColorMuted || '#6c757d',
      fontSize: '0.9rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    paidTag: {
        backgroundColor: currentTheme.accentColor + '20', // Using accent color for paid tag
        color: currentTheme.accentColor,
        fontSize: '0.75rem',
        fontWeight: '600',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
    },
    detailsButton: (isPast) => ({
      padding: '0.6rem 1.2rem',
      borderRadius: '0.5rem',
      fontWeight: '600',
      fontSize: '0.875rem',
      transition: 'all 0.3s ease',
      cursor: isPast ? 'not-allowed' : 'pointer',
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
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000, backdropFilter: 'blur(5px)'
    },
    modalContent: {
      backgroundColor: currentTheme.cardBgColor || '#ffffff',
      padding: '2rem', borderRadius: '1rem',
      boxShadow: `0 25px 50px -12px rgba(0,0,0,0.25)`,
      maxWidth: '800px', width: '90%', position: 'relative',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      color: currentTheme.textColor || '#333333',
    },
    modalTitle: {
      fontSize: '1.75rem', fontWeight: '700',
      marginBottom: '1rem',
      fontFamily: currentTheme.sectionTitleFont || currentTheme.fontFamily || 'sans-serif',
      color: currentTheme.primaryColor || '#4f46e5',
    },
    modalCloseButton: {
      position: 'absolute', top: '1rem', right: '1rem',
      cursor: 'pointer', background: 'transparent', border: 'none',
      color: currentTheme.textColorMuted || '#6c757d',
      transition: 'color 0.3s ease, transform 0.3s ease',
      '&:hover': { color: currentTheme.primaryColor || '#4f46e5', transform: 'rotate(90deg)' },
    },
    loadingSpinner: {
      color: currentTheme.primaryColor || '#4f46e5',
      height: '3rem', width: '3rem', borderWidth: '4px', borderTopColor: 'transparent',
      borderRadius: '9999px', animation: 'spin 1s linear infinite',
    },
    loadingText: {
      fontSize: '1.25rem', color: currentTheme.textColor || '#333333', fontWeight: '500'
    },
  });

  const styles = getThemedStyles();

  const isEventPast = (eventDateString) => {
    if (!eventDateString) return true;
    return new Date(eventDateString) < new Date();
  };
  
  // Format Date for Overlay
  const formatDateForOverlay = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    return { month, day };
  };

  useEffect(() => {
    // ... (fetchEvents logic remains the same)
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
        case 'all': url = `${backendUrl}/api/user/user/events`; break;
        default: url = `${backendUrl}/api/user/events/upcoming`; break;
      }

      setLoading(true);
      setError(null);
      setEvents([]);

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
      if (filter === 'upcoming') return dateA - dateB;
      if (filter === 'latest') return dateB - dateA;
      return dateA - dateB;
    });

  const openVideoModal = (videoUrl) => {
    // ... (openVideoModal logic remains the same)
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
        const videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }

      if (embedUrl) {
        setSelectedVideoUrl(embedUrl);
        setIsModalOpen(true);
        setModalError('');
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
    setModalError('');
  };

  if (loading) {
    return (
      <div style={styles.container} className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Loading Events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    // ... (error state remains the same, but can also be styled)
     return (
        <div className="flex items-center justify-center min-h-screen" style={styles.container}>
            <div className="text-center p-8 bg-white rounded-lg shadow-xl max-w-md mx-4" style={{borderColor: currentTheme.errorColor, borderTopWidth: '4px'}}>
                <FaExclamationTriangle className="mx-auto text-5xl mb-4" style={{color: currentTheme.errorColor}} />
                <h2 className="text-2xl font-bold mb-2" style={{color: currentTheme.errorTextColor}}>Oops! Something went wrong.</h2>
                <p className="mb-6" style={{color: currentTheme.textColorMuted}}>
                    We couldn't load the event details. Please check your connection or try again later.
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
    <div style={styles.container} className="py-20 min-h-screen">
      <div className="container mx-auto px-4">

        <header className="text-center mb-12">
          <h1 style={styles.title}>Explore Events</h1>
          <p style={styles.subtitle} className="mt-2 text-lg max-w-2xl mx-auto">
            Your gateway to unforgettable experiences. Find your next adventure below.
          </p>
        </header>

        <div className="flex flex-col md:flex-row items-center gap-4 mb-12 justify-center flex-wrap">
          <div className="relative w-full md:w-auto md:min-w-[300px]">
             <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full"
              style={styles.searchBar}
            />
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            {['upcoming', 'latest', 'all'].map(key => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={styles.filterButton(filter === key)}
                className="inline-flex items-center"
              >
                {key === 'upcoming' && <FaClock className="mr-2" />}
                {key === 'latest' && <FaCalendarAlt className="mr-2" />}
                {key === 'all' && <FaFilter className="mr-2" />}
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredAndSortedEvents.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold mb-2" style={{color: currentTheme.textColor}}>No Events Found</h3>
            <p style={{color: currentTheme.textColorMuted}}>
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedEvents.map(event => {
              const past = isEventPast(event.eventDate);
              const { month, day } = formatDateForOverlay(event.eventDate);

              return (
                <div key={event._id} style={styles.eventCard} className="flex flex-col relative">
                  {past && <div style={styles.pastEventOverlay}></div>}
                  
                  {/* Image Container with Date Overlay */}
                  <div style={styles.eventImageContainer} className="rounded-t-lg">
                    {event.eventImageURL ? (
                      <img src={event.eventImageURL} alt={event.eventName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <p className="text-gray-500">No Image</p>
                      </div>
                    )}
                    <div style={styles.eventDateOverlay}>
                        <span className="text-sm">{month}</span>
                        <br/>
                        <span className="text-2xl">{day}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 style={styles.eventTitle} className="mb-2 truncate">{event.eventName}</h3>
                    
                    {event.location && (
                      <p style={styles.eventDetailText} className="mb-3">
                        <FaMapMarkerAlt className="text-red-500 flex-shrink-0" />
                        <span>{event.location}</span>
                      </p>
                    )}
                    
                    {/* Time */}
                    <p style={styles.eventDetailText} className="mb-4">
                        <FaClock className="text-gray-500 flex-shrink-0"/>
                        <span>
                            {new Date(event.eventDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit'})}
                        </span>
                    </p>

                    {/* Spacer to push actions to the bottom */}
                    <div className="flex-grow"></div>

                    {/* Actions and Info */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: currentTheme.borderColor }}>
                      <div className="flex items-center gap-4">
                        {event.eventVideoURL && (
                          <button
                            onClick={() => openVideoModal(event.eventVideoURL)}
                            aria-label="Watch video"
                            className="text-gray-500 hover:text-indigo-600 transition-colors"
                          >
                            <FaRegPlayCircle size={26} />
                          </button>
                        )}
                        {event.isPaid && (
                          <div style={styles.paidTag}>
                            <FaMoneyBillAlt />
                            <span>Paid</span>
                          </div>
                        )}
                      </div>

                      <Link
                        to={past ? '#' : `/events/${event._id}`}
                        style={styles.detailsButton(past)}
                        onClick={(e) => past && e.preventDefault()}
                      >
                        {past ? 'Event Ended' : 'View Details'}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Event Video"
        style={{ overlay: styles.modalOverlay, content: styles.modalContent }}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 style={styles.modalTitle}>Event Preview</h2>
          <button onClick={closeModal} style={styles.modalCloseButton}>
            <FaTimes size={28} />
          </button>
        </div>
        {modalError ? (
          <div className="py-10 text-center" style={{ color: currentTheme.errorColor }}>
            {modalError}
          </div>
        ) : (
          selectedVideoUrl && (
            <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg">
              <iframe
                src={selectedVideoUrl}
                title="Event Video Player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full absolute top-0 left-0 rounded-lg"
              ></iframe>
            </div>
          )
        )}
      </Modal>
    </div>
  );
};

export default EventList;