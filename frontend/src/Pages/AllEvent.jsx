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
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'latest'
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
          url = `${backendUrl}/api/user/user/events`;
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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [backendUrl, filter]);

  const filteredEvents = events
    .filter(event =>
      event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.eventDate);
      const dateB = new Date(b.eventDate);
      return dateA - dateB;
    });

  const openVideoModal = (videoUrl) => {
    setSelectedVideoUrl(videoUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVideoUrl('');
  };

  // === UI ===
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white text-lg">
        <span className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></span>
        <p className="ml-4">Loading Events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600 bg-red-50">
        <div className="text-center p-6 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Error Fetching Events</h2>
          <p className="mb-4">{error}</p>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => window.location.reload()}
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
          />

          <div className="flex gap-3">
            {['all', 'upcoming', 'latest'].map(key => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-full transition ${
                  filter === key ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Events */}
        {filteredEvents.length === 0 ? (
          <p className="text-center text-gray-500">No events match your search or filter.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map(event => {
              const isPast = new Date(event.eventDate) < new Date();
              return (
                <div
                  key={event._id}
                  className={`rounded-lg shadow-lg bg-white text-black p-6 hover:shadow-2xl transition-all duration-300 relative flex flex-col justify-between`}
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

                    {/* Tags like Media, Arts & Crafts, Technology */}
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
                    <h3 className="text-xl font-bold mb-2 truncate">{event.eventName}</h3>

                    {/* Date */}
                    <p className="text-sm mb-1">
                      <FaCalendarAlt className="inline mr-1 text-blue-500" />{' '}
                      {new Date(event.eventDate).toLocaleString('en-US', {
                        dateStyle: 'long',
                        timeStyle: 'short'
                      })}
                    </p>

                    {/* Location */}
                    {event.location && (
                      <p className="text-sm mb-2">
                        <FaMapMarkerAlt className="inline mr-1 text-red-500" /> {event.location}
                      </p>
                    )}

                    {/* Description */}
                    {event.description && (
                      <p className="text-sm text-gray-700 line-clamp-3 mb-4">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* Actions and Icons */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-4">
                      {/* Play Video Icon */}
                      {event.eventVideoURL && (
                        <button
                          onClick={() => openVideoModal(event.eventVideoURL)}
                          className="text-gray-600 hover:text-blue-600 focus:outline-none"
                        >
                          <FaRegPlayCircle size={24} />
                        </button>
                      )}
                      {/* Paid Icon */}
                      {event.isPaid && (
                        <div className="text-gray-600 flex items-center">
                          <FaMoneyBillAlt size={20} className="mr-1 text-yellow-500" />
                          <span className="font-semibold">Paid</span>
                        </div>
                      )}
                    </div>

                    {/* View Details Button */}
                    <Link
                      to={`/events/${event._id}`}
                      className={`px-4 py-2 text-sm font-semibold text-white rounded transition-colors ${
                        isPast ? 'bg-gray-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {isPast ? 'Event Ended' : 'View Details'}
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
        className="ReactModal__Content bg-black p-4 rounded-lg shadow-xl max-w-3xl mx-auto my-10"
        overlayClassName="ReactModal__Overlay fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      >
        <div className="flex justify-end">
          <button onClick={closeModal} className="text-white text-2xl font-bold mb-4 focus:outline-none">×</button>
        </div>
        <div className="aspect-w-16 aspect-h-9">
          <iframe
            width="100%"
            height="100%"
            src={selectedVideoUrl.replace("watch?v=", "embed/")} // For YouTube videos
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </Modal>
    </div>
  );
};

export default EventList;