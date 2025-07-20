// src/pages/EventList.js
import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { FaRegPlayCircle, FaMoneyBillAlt, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import Modal from 'react-modal'; // Import Modal component

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

  const {
    sectionTitleColor,
    fontFamily,
    generalTextFont,
    sectionTitleFont,
    backgroundColor,
    textColor
  } = currentTheme;

  // Helper to check if an event is in the past
  const isEventPast = (eventDateString) => {
    if (!eventDateString) return true; // Treat missing date as past
    return new Date(eventDateString) < new Date();
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
        case 'upcoming':
          url = `${backendUrl}/api/user/events/upcoming`;
          break;
        case 'latest':
          url = `${backendUrl}/api/user/events/latest`;
          break;
        case 'all':
        default:
          // Corrected the API endpoint path here. Assuming it should be /api/user/events
          url = `${backendUrl}/api/user/user/events`; // *** Corrected API endpoint ***
          break;
      }

      try {
        const res = await fetch(url);
        if (!res.ok) {
          const details = await res.text();
          throw new Error(`Status ${res.status}: ${details}`);
        }

        const data = await res.json();
        setEvents(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching events:", err); // Log the error for debugging
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [backendUrl, filter]); // Dependency array includes filter

  const filteredAndSortedEvents = events
    .filter(event =>
      event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.eventDate);
      const dateB = new Date(b.eventDate);

      // If filter is 'all', sort ascending (upcoming first)
      if (filter === 'all') {
        return dateA - dateB;
      }
      // For 'upcoming' and 'latest', the API should already handle sorting,
      // but if not, you might want to adjust this sort logic.
      // For now, we assume the API sorts them correctly.
      return 0; // Keep original order if API sorted
    });

  const openVideoModal = (videoUrl) => {
    if (videoUrl) {
      // Handle YouTube URL transformation for embed
      let embedUrl = videoUrl;
      if (videoUrl.includes('youtube.com')) {
        embedUrl = videoUrl.replace('watch?v=', 'embed/');
        // Handle shortened YouTube URLs like youtu.be/
        if (videoUrl.includes('youtu.be/')) {
          const videoId = videoUrl.split('youtu.be/')[1];
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
      }
      setSelectedVideoUrl(embedUrl);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVideoUrl('');
  };

  // === UI ===
  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${backgroundColor} ${textColor} ${fontFamily}`}>
        <span className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mr-4"></span>
        <p className="text-lg">Loading Events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${backgroundColor} ${textColor} ${fontFamily} p-6`}>
        <div className={`text-center p-6 rounded-lg shadow-lg ${currentTheme.cardBackgroundColor || 'bg-white'} ${currentTheme.cardTextColor}`}>
          <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong.</h2>
          <p className="mb-6 text-gray-700">
            We couldn't load the event details. Please check your connection or try again later.<br />
            {error && <span className="text-sm text-red-600 block mt-2">{error}</span>}
          </p>
          <button
            onClick={() => window.location.reload()}
            className={`px-5 py-2 rounded-lg font-semibold transition-colors ${currentTheme.buttonBackgroundColor || 'bg-blue-600'} ${currentTheme.buttonTextColor || 'text-white'}`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${backgroundColor} ${textColor} py-16 min-h-screen ${fontFamily}`}>
      <div className="container mx-auto px-4">

        {/* Header */}
        <h1 className={`text-4xl text-center font-bold mb-10 ${sectionTitleColor} ${sectionTitleFont}`}>
          Explore Events
        </h1>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-10 justify-center">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`p-3 border rounded shadow-sm w-full md:w-1/3 text-black ${generalTextFont}`}
            style={{ borderColor: currentTheme.inputBorderColor, color: currentTheme.inputTextColor }} // Apply theme colors
          />

          <div className="flex gap-3">
            {['upcoming', 'latest','all'].map(key => ( // Reordered to show upcoming first
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-5 py-2 rounded-full transition font-semibold ${
                  filter === key
                    ? `${currentTheme.buttonBackgroundColor || 'bg-blue-600'} ${currentTheme.buttonTextColor || 'text-white'}`
                    : `${currentTheme.cardBackgroundColor || 'bg-gray-200'} ${currentTheme.cardTextColor || 'text-gray-800'} hover:${currentTheme.hoverAccentColor || 'hover:bg-gray-300'}`
                }`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Events */}
        {filteredAndSortedEvents.length === 0 ? (
          <p className={`text-center text-lg py-10 ${textColor}`}>No events match your search or filter.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedEvents.map(event => {
              const past = isEventPast(event.eventDate);
              return (
                <div
                  key={event._id}
                  className={`rounded-lg shadow-xl ${currentTheme.cardBackgroundColor || 'bg-white'} ${currentTheme.cardTextColor} p-6 hover:shadow-2xl transition-all duration-300 relative flex flex-col justify-between`}
                >
                  <div>
                    {/* Image */}
                    <div className="w-full h-48 bg-gray-200 rounded mb-4 flex items-center justify-center overflow-hidden">
                      {event.eventImageURL ? (
                        <img src={event.eventImageURL} alt={event.eventName} className="w-full h-full object-cover" />
                      ) : (
                        <p className="text-gray-500">No Image Available</p>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {event.tags && event.tags.map(tag => (
                        <span key={tag} className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          tag.toLowerCase() === 'media' ? 'bg-purple-200 text-purple-800' :
                          tag.toLowerCase() === 'arts & crafts' ? 'bg-green-200 text-green-800' :
                          tag.toLowerCase() === 'technology' ? 'bg-blue-200 text-blue-800' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    <h3 className={`text-xl font-bold mb-2 truncate ${sectionTitleColor}`}>{event.eventName}</h3>

                    {/* Date */}
                    <p className="text-sm mb-1 flex items-center">
                      <FaCalendarAlt className={`mr-1 ${currentTheme.accentColor || 'text-blue-500'}`} size={18} />{' '}
                      {new Date(event.eventDate).toLocaleString('en-US', {
                        dateStyle: 'long',
                        timeStyle: 'short'
                      })}
                    </p>

                    {/* Location */}
                    {event.location && (
                      <p className="text-sm mb-2 flex items-center">
                        <FaMapMarkerAlt className="mr-1 text-red-500" size={18} /> {event.location}
                      </p>
                    )}

                    {/* Description */}
                    {event.description && (
                      <p className={`text-sm text-gray-700 line-clamp-3 mb-4 ${generalTextFont}`}>
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* Actions and Icons */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-300">
                    <div className="flex items-center gap-4">
                      {/* Play Video Icon */}
                      {event.eventVideoURL && (
                        <button
                          onClick={() => openVideoModal(event.eventVideoURL)}
                          className={`text-gray-600 hover:${currentTheme.hoverAccentColor || 'text-blue-600'} focus:outline-none`}
                          aria-label="Watch video"
                        >
                          <FaRegPlayCircle size={24} />
                        </button>
                      )}
                      {/* Paid Icon */}
                      {event.isPaid && (
                        <div className={`text-gray-700 flex items-center font-medium ${generalTextFont}`}>
                          <FaMoneyBillAlt size={20} className="mr-1 text-yellow-500" />
                          <span>Paid</span>
                        </div>
                      )}
                    </div>

                    {/* View Details Button */}
                    <Link
                      to={`/events/${event._id}`}
                      className={`px-4 py-2 text-sm font-semibold text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        past
                          ? `bg-gray-400 cursor-not-allowed`
                          : `${currentTheme.buttonBackgroundColor || 'bg-indigo-600'} ${currentTheme.buttonTextColor || 'text-white'} ${currentTheme.hoverAccentColor || 'hover:bg-indigo-700'}`
                      }`}
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
        className={`ReactModal__Content bg-black p-4 rounded-lg shadow-xl max-w-3xl mx-auto my-10 ${currentTheme.modalContentBackgroundColor || ''}`}
        overlayClassName={`ReactModal__Overlay fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 ${currentTheme.modalOverlayColor || ''}`}
      >
        <div className="flex justify-end">
          <button onClick={closeModal} className={`text-white text-3xl font-bold focus:outline-none ${currentTheme.modalCloseButtonColor || ''}`}>×</button>
        </div>
        <div className="aspect-w-16 aspect-h-9">
          {selectedVideoUrl && (
            <iframe
              width="100%"
              height="100%"
              src={selectedVideoUrl}
              title="Event Video Player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-md"
            ></iframe>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default EventList;