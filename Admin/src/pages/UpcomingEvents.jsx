// src/pages/UpcomingEvents.jsx
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { FaCalendarAlt, FaSpinner, FaMapMarkerAlt, FaUsers, FaInfoCircle, FaClock } from 'react-icons/fa'; // Added more relevant icons

const UpcomingEvents = () => {
  const { backendUrl, token } = useContext(AdminContext);
  const { currentTheme } = useTheme(); // Access theme properties

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUpcomingEvents = async () => {
    setLoading(true);
    setError(''); // Clear previous errors
    try {
      const res = await axios.get(`${backendUrl}/api/admin/upcoming`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Ensure we are setting an array, even if response is null or undefined
      setEvents(res.data.upcomingEvents || []);
    } catch (err) {
      console.error('Error fetching upcoming events:', err.response?.data || err.message);
      // Provide a more specific error message
      const errorMessage = err.response?.data?.message || err.message || 'An unknown error occurred.';
      setError(`Failed to load upcoming events: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  // Helper to get contrast text color for dynamic backgrounds
  const getContrastTextColor = (bgColor) => {
    if (!bgColor) return currentTheme.textColor || '#333333'; // Default to theme's text color or dark gray
    // Basic luminance calculation for contrast
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? currentTheme.textColor || '#333333' : '#FFFFFF'; // White text on dark backgrounds
  };

  // Dynamic card styling based on theme
  const getCardStyle = (event) => {
    // Use a distinct background for each event card, perhaps based on theme colors or a default set
    // For simplicity, let's use a slightly off-white or theme's card background
    const cardBg = currentTheme.cardBgColor || '#ffffff'; // Fallback to white
    return {
      backgroundColor: cardBg,
      color: getContrastTextColor(cardBg),
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      fontFamily: currentTheme.fontFamily || 'sans-serif', // Apply theme font family
    };
  };

  return (
    // Apply overall theme background and text color
    <div className={`p-6 min-h-screen ${currentTheme.bgColor || 'bg-gray-100'}`} style={{ backgroundColor: currentTheme.bgColor, color: currentTheme.textColor || '#333333' }}>
      <h1 className={`text-3xl font-bold mb-8 ${currentTheme.textColor || 'text-black'}`} style={{ fontFamily: currentTheme.fontFamily }}>Upcoming Events</h1>

      {loading ? (
        // Loading state with spinner and theme-consistent text
        <div className={`flex items-center justify-center ${currentTheme.textColor || 'text-black'}`} style={{ height: '50vh' }}>
          <FaSpinner className={`animate-spin text-3xl mr-3 ${currentTheme.primaryColor || 'text-blue-500'}`} />
          <p className="text-xl">Loading upcoming events...</p>
        </div>
      ) : error ? (
        // Error state with theme-consistent styling
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg text-center" role="alert">
          <p className="font-semibold text-lg mb-2">Error!</p>
          <p>{error}</p>
          <button
            onClick={fetchUpcomingEvents}
            className="mt-3 px-4 py-2 rounded-md font-semibold text-sm shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{ backgroundColor: currentTheme.primaryColor || '#3b82f6', color: '#ffffff' }}
          >
            Retry
          </button>
        </div>
      ) : events.length === 0 ? (
        // No events message, themed
        <p className={`text-center py-10 text-lg ${currentTheme.textColor || 'text-gray-600'}`}>No upcoming events found.</p>
      ) : (
        // Grid layout for event cards, responsive
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            // Individual event card with dynamic styling and more details
            <div
              key={event._id}
              className="p-5 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"
              style={getCardStyle(event)}
            >
              {/* Event Name (now more prominent) */}
              <h2 className="font-bold text-2xl mb-3" style={{ fontFamily: currentTheme.fontFamily, color: currentTheme.primaryColor || '#3b82f6' }}>
                {event.eventName || 'Untitled Event'}
              </h2>

              {/* Event Icon */}
              <div className="flex items-center mb-3">
                <FaCalendarAlt className={`text-2xl mr-3 ${currentTheme.primaryColor || 'text-blue-500'}`} />
                {/* Could also place event.name here again, but it's already at the top */}
              </div>

              <div className="flex items-center mb-2 text-sm opacity-80" style={{ fontFamily: currentTheme.fontFamily }}>
                <FaClock className={`mr-2 ${currentTheme.accentColor || 'text-purple-500'}`} />
                Start: {new Date(event.eventDate).toLocaleString()}
              </div>
              {event.eventEndDate && ( // Display end date if available
                <div className="flex items-center mb-2 text-sm opacity-80" style={{ fontFamily: currentTheme.fontFamily }}>
                  <FaClock className={`mr-2 ${currentTheme.accentColor || 'text-purple-500'}`} />
                  End: {new Date(event.eventEndDate).toLocaleString()}
                </div>
              )}

              {event.location && ( // Display location if available
                <div className="flex items-center mb-2 text-sm opacity-80" style={{ fontFamily: currentTheme.fontFamily }}>
                  <FaMapMarkerAlt className={`mr-2 ${currentTheme.secondaryColor || 'text-green-500'}`} />
                  Location: {event.location}
                </div>
              )}

              {/* Display total applications for the event */}
              <div className="flex items-center mt-3 pt-3 border-t border-opacity-30" style={{ borderColor: getContrastTextColor(getCardStyle(event).backgroundColor) }}>
                <FaUsers className={`mr-2 ${currentTheme.infoColor || 'text-indigo-500'}`} />
                <p className="font-semibold text-sm">
                  Applications: {event.applicationCount !== undefined ? event.applicationCount : 'N/A'} {/* Changed 'Loading...' to 'N/A' for final display */}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingEvents;