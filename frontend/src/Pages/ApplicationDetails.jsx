import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext'; // Assuming this path is correct
import { useParams, useNavigate } from 'react-router-dom';

// --- Reusable Components ---

// Reusable Error Component
const ErrorDisplay = ({ error, onRetry }) => {
  const navigate = useNavigate(); // Use useNavigate here

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center transition-transform duration-300 hover:shadow-2xl">
        <div className="flex justify-center mb-6">
          {/* Enhanced Error Icon */}
          <svg className="w-20 h-20 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold mb-3 text-gray-800">Operation Failed</h2>
        <p className="text-lg text-gray-600 mb-6">
          {error || "We encountered an issue trying to load the event details. Please check your connection or try again."}
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onRetry}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150"
          >
            Retry
          </button>
          <button
            onClick={() => navigate('/')} // Use navigate for consistency
            className="px-6 py-3 rounded-lg bg-gray-500 text-white font-semibold shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition ease-in-out duration-150"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable Loading Component
const LoadingDisplay = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="flex items-center space-x-3">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <span className="text-xl font-semibold text-gray-700">Loading Event Details...</span>
    </div>
  </div>
);

// --- Modal Components for Media ---

const MediaViewerModal = ({ mediaItems, currentIndex, onClose, mediaType }) => {
  if (!mediaItems || mediaItems.length === 0) return null;

  const currentItemUrl = mediaItems[currentIndex];
  // Basic check if it's a video based on URL extension
  const isVideo = currentItemUrl.toLowerCase().endsWith('.mp4');

  // --- Gallery Navigation Handlers (Optional: implement state in parent for full functionality) ---
  // const handleNext = () => { /* update state in ApplicationDetails */ };
  // const handlePrevious = () => { /* update state in ApplicationDetails */ };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4" onClick={onClose}>
      {/* Modal Content Container */}
      <div
        className="relative max-w-4xl w-full max-h-[85vh] overflow-hidden rounded-lg shadow-xl bg-black flex items-center justify-center"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {isVideo ? (
          <video
            controls // Show default video controls
            autoPlay // Attempt to autoplay
            className="block w-full h-full object-contain rounded-lg"
            onError={(e) => {
              console.error("Error loading video in modal:", e);
              // Optionally display an error message or fallback within the modal
            }}
          >
            <source src={currentItemUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={currentItemUrl}
            alt="Event Media"
            className="block w-full h-full object-contain rounded-lg"
            onError={(e) => {
              console.error("Error loading image in modal:", e);
              e.target.src = "https://via.placeholder.com/600x400?text=Image+Error"; // Fallback image
            }}
          />
        )}

        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-white bg-gray-800 bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-white z-10 transition-opacity duration-200"
          onClick={onClose}
          aria-label="Close viewer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        {/* Optional: Previous/Next Buttons for Gallery Navigation */}
        {/* These would require state management for currentIndex in the parent component */}
        {/* {mediaItems.length > 1 && (
          <>
            <button
              className="absolute top-1/2 left-3 -translate-y-1/2 text-white bg-gray-800 bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-white z-10 transition-opacity duration-200"
              onClick={handlePrevious}
              aria-label="Previous media"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button
              className="absolute top-1/2 right-3 -translate-y-1/2 text-white bg-gray-800 bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-white z-10 transition-opacity duration-200"
              onClick={handleNext}
              aria-label="Next media"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </>
        )} */}
      </div>
    </div>
  );
};

// --- Main ApplicationDetails Component ---

const ApplicationDetails = () => {
  const { backendUrl, token } = useContext(AppContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  // Store consolidated media items and the index for the modal
  const [viewerMedia, setViewerMedia] = useState({ items: [], currentIndex: 0 });

  // Function to fetch event details from the API
  const fetchEventDetails = async () => {
    // Only fetch if an ID is available
    if (!id) {
      setError('No event ID provided.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(''); // Clear previous errors

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${backendUrl}/api/user/public/events/${id}`, { headers });

      if (response.data && response.data.event) {
        const eventData = response.data.event;

        // Process media to create a unified array with type
        const processedMedia = [];
        if (eventData.imageUrl) {
          processedMedia.push({ url: eventData.imageUrl, type: 'image' });
        }
        if (eventData.eventVideoURL) {
          processedMedia.push({ url: eventData.eventVideoURL, type: 'video' });
        }
        // If your API returns a structured array like `eventData.mediaItems = [{ url: '...', type: 'image' }]`
        // you would merge that here. For example:
        // if (eventData.mediaItems && Array.isArray(eventData.mediaItems)) {
        //   processedMedia.push(...eventData.mediaItems);
        // }

        setEvent({ ...eventData, media: processedMedia }); // Store processed media in event object
      } else {
        throw new Error("Invalid response structure from API. 'event' data missing.");
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      // Provide a more user-friendly error message
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.';
      setError(`Failed to load event details: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Effect hook to fetch data when the component mounts or when id, backendUrl, or token changes
  useEffect(() => {
    fetchEventDetails();
  }, [backendUrl, token, id]); // Dependencies for fetching

  // Handler to open the media viewer modal
  const openViewer = (index) => {
    if (event && event.media && event.media.length > 0) {
      setViewerMedia({
        items: event.media.map(m => m.url), // Pass only the URLs to the modal
        currentIndex: index,
      });
      setIsViewerOpen(true);
    }
  };

  // --- Render Logic ---

  if (loading) {
    return <LoadingDisplay />;
  }

  if (error) {
    // Pass the error message and the fetch function for retrying
    return <ErrorDisplay error={error} onRetry={fetchEventDetails} />;
  }

  // Handle case where event data is not found even without an explicit error
  if (!event) {
    return (
      <ErrorDisplay
        error="Event details could not be loaded."
        onRetry={() => navigate('/')} // On retry, go back to homepage as event ID might be bad
      />
    );
  }

  // --- Event Details Rendering ---
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 font-sans">
      {/* Main Event Card */}
      <div className="bg-white rounded-xl shadow-xl p-6 md:p-10 mb-8 transition-shadow duration-300 hover:shadow-2xl">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4 leading-tight">
          {event.eventName || 'Untitled Event'}
        </h1>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0 md:space-x-6">
          {/* Event Information Section */}
          <div className="flex-1">
            <p className="text-lg text-gray-700 mb-4 leading-relaxed border-b pb-4">
              {event.description || 'No description available for this event.'}
            </p>
            <div className="text-gray-600 text-base space-y-2">
              <p>
                <strong className="text-gray-800 font-semibold">Date:</strong>{' '}
                {event.eventDate ? new Date(event.eventDate).toLocaleString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                }) : 'Not specified'}
              </p>
              <p>
                <strong className="text-gray-800 font-semibold">Location:</strong>{' '}
                {event.location || 'Not specified'}
              </p>
              <p>
                <strong className="text-gray-800 font-semibold">Views:</strong>{' '}
                {event.viewCount !== undefined ? event.viewCount : 'N/A'}
              </p>
              {/* Display additional event details */}
              {event.organizer && <p><strong className="text-gray-800 font-semibold">Organizer:</strong> {event.organizer}</p>}
              {event.ticketPrice !== undefined && <p><strong className="text-gray-800 font-semibold">Price:</strong> ${event.ticketPrice.toFixed(2)}</p>}
              {/* Add more details here from your event object if available */}
            </div>
          </div>

          {/* Media Gallery Section - Takes 1/3 of width on medium screens and up */}
          {event.media && event.media.length > 0 && (
            <div className="w-full md:w-1/3 flex-shrink-0 grid grid-cols-2 md:grid-cols-1 gap-4">
              {event.media.map((item, index) => {
                const isVideo = item.type === 'video'; // Rely on the type from processed data
                return (
                  <div
                    key={index}
                    className="relative group cursor-pointer rounded-lg overflow-hidden shadow-md bg-gray-900 aspect-video flex items-center justify-center"
                    onClick={() => openViewer(index)}
                  >
                    {isVideo ? (
                      // Video Thumbnail Placeholder/Icon
                      <div className="flex flex-col items-center justify-center text-white">
                        <svg className="w-12 h-12 mb-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M14.752 11.163L16.5 9.752a3.003 3.003 0 00-4.242-4.242L11.163 9.752 14.752 11.163z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12.752 12.752C10.795 14.709 10.795 17.705 12.752 19.662l1.414 1.414a3.003 3.003 0 004.242-4.242l-1.414-1.414"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M14.752 11.163L11.163 7.574C9.206 9.531 9.206 12.527 11.163 14.484l1.414 1.414a3.003 3.003 0 004.242-4.242l-1.414-1.414"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8.752 8.752C6.795 10.709 6.795 13.705 8.752 15.662l1.414 1.414a3.003 3.003 0 004.242-4.242l-1.414-1.414"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 21v-8.948"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 3v2.948"></path>
                        </svg>
                        <span className="text-sm font-semibold">Play Video</span>
                      </div>
                    ) : (
                      // Image Thumbnail
                      <img
                        src={item.url}
                        alt={`Event Media ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loop if fallback also fails
                          e.target.src = "https://via.placeholder.com/400x300?text=Media+Unavailable"; // Fallback image
                        }}
                      />
                    )}
                    {/* Overlay for interaction feedback */}
                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex flex-col items-center text-white">
                        <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 8h2a2 2 0 012 2v9a2 2 0 01-2 2H7a2 2 0 01-2-2v-9a2 2 0 012-2h2M7 8a2 2 0 012-2h6a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6a2 2 0 012-2h1a2 2 0 002-2V8z"></path>
                        </svg>
                        <span className="text-sm font-semibold">{isVideo ? 'Play Video' : 'View Photo'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mt-6">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-lg bg-gray-500 text-white font-semibold shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition ease-in-out duration-150"
        >
          Back to Events
        </button>
        {/* Add more action buttons here if needed, e.g., "Register", "Share" */}
      </div>

      {/* Media Viewer Modal */}
      {isViewerOpen && (
        <MediaViewerModal
          mediaItems={viewerMedia.items}
          currentIndex={viewerMedia.currentIndex}
          onClose={() => setIsViewerOpen(false)}
        // mediaType is now determined inside the modal based on URL for simplicity
        />
      )}
    </div>
  );
};

export default ApplicationDetails;