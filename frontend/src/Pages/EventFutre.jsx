import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const FutureEventsView = () => {
  const { backendUrl } = useContext(AppContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Get the navigate function

  useEffect(() => {
    const fetchFutureEvents = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${backendUrl}/api/user/public/future-events`);
        setEvents(response.data.events || []);
      } catch (error) {
        console.error('Failed to fetch future events:', error);
        // Optionally display an error message to the user
      } finally {
        setLoading(false);
      }
    };

    fetchFutureEvents();
  }, [backendUrl]);

  const handleMediaClick = (url, type, name) => {
    console.log(`Opening ${type}: ${url} for ${name}`);
    window.open(url, '_blank');
  };

  const handleViewEvent = (event) => {
    console.log(`Navigating to view event: ${event.eventName}`);
    navigate(`/eve/${event._id}`); // Use navigate to go to the event details page
  };

  // Helper to format the date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString; // Return original string if formatting fails
    }
  };

  return (
    <div className="p-8  bg-gray-50 mb-12 min-h-screen">
      <h2 className="text-3xl font-bold mb-12 text-center text-gray-800 uppercase tracking-wider">Upcoming Events</h2>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full 10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-lg text-gray-600">Loading events...</p>
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col justify-between transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl"
            >
              {/* Media Section */}
              <div className="relative w-full h-56 md:h-64 overflow-hidden cursor-pointer group">
                {event.eventVideoURL ? (
                  <video
                    controls
                    loop
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover absolute inset-0"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click from triggering
                      handleMediaClick(event.eventVideoURL, 'video', event.eventName);
                    }}
                  >
                    <source src={event.eventVideoURL} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt={event.eventName || 'Event image'}
                    className="w-full h-full object-cover absolute inset-0"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click from triggering
                      handleMediaClick(event.imageUrl, 'image', event.eventName);
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                    No Media Available
                  </div>
                )}

                {/* Overlay with button on hover for media */}
                {(event.imageUrl || event.eventVideoURL) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click from triggering
                        handleMediaClick(event.eventVideoURL || event.imageUrl, event.eventVideoURL ? 'video' : 'image', event.eventName);
                      }}
                      className="bg-white bg-opacity-90 text-blue-700 font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-opacity-100 transition-colors duration-200"
                    >
                      {event.eventVideoURL ? 'Watch Video' : 'View Image'}
                    </button>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-5 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{event.eventName}</h3>
                  <p className="text-sm text-gray-600 mb-1">{formatDate(event.eventDate)}</p>
                  <p className="text-sm text-gray-600 mb-3 truncate" title={event.location}>{event.location || 'Location not specified'}</p>
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3" title={event.description}>{event.description || 'No description available.'}</p>
                </div>

                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-200">
                  <p className={`text-base font-bold ${event.isPaid ? 'text-red-600' : 'text-green-600'}`}>
                    {event.isPaid ? 'Paid Event' : 'Free'}
                  </p>
                  <p className="text-sm text-gray-500 truncate" title={event.organizerName}>{event.organizerName || 'Unknown Organizer'}</p>
                </div>
              </div>

              {/* Footer Button */}
              <div className="p-5 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => handleViewEvent(event)}
                  className="w-full py-3 px-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 ease-in-out transform hover:scale-105"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Upcoming Events</h3>
          <p className="text-gray-500">We couldn't find any events scheduled for the future. Please check back later!</p>
        </div>
      )}
    </div>
  );
};

export default FutureEventsView;