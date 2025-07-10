// src/pages/EventDetails.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { AppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { FaRegPlayCircle, FaMoneyBillAlt, FaCalendarAlt, FaMapMarkerAlt, FaQrcode, FaArrowLeft } from 'react-icons/fa'; // Added FaArrowLeft
import Modal from 'react-modal';

// Set the app element for accessibility
Modal.setAppElement('#root'); // Make sure your root element has id="root"

const EventDetails = () => {
  const { eventId } = useParams(); // Get the ID from the URL
  const { backendUrl } = useContext(AppContext);
  const { currentTheme } = useTheme();
  const navigate = useNavigate(); // Initialize navigate

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState('');

  const {
    sectionTitleColor,
    fontFamily,
    generalTextFont,
    sectionTitleFont,
    backgroundColor,
    textColor
  } = currentTheme;

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!backendUrl) {
        setError("Backend URL is not configured.");
        setLoading(false);
        return;
      }

      try {
        // Ensure the API endpoint matches your backend setup
        const response = await fetch(`${backendUrl}/api/user/events/${eventId}`);

        if (!response.ok) {
          // Try to get more details from the response if it's a server error
          let errorDetails = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorDetails += `: ${errorData.message || JSON.stringify(errorData)}`;
          } catch (jsonError) {
            const textError = await response.text();
            errorDetails += `: ${textError}`;
          }
          throw new Error(errorDetails);
        }

        const data = await response.json();
        setEvent(data);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError(err.message || "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, backendUrl]); // Re-fetch if eventId or backendUrl changes

  // Calculate isPast based on eventDate
  const isPast = event ? new Date(event.eventDate) < new Date() : false;

  const openVideoModal = (videoUrl) => {
    if (videoUrl && typeof videoUrl === 'string') {
      setSelectedVideoUrl(videoUrl);
      setIsModalOpen(true);
    } else {
      console.warn("Attempted to open video modal with invalid URL:", videoUrl);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVideoUrl('');
  };

  const openQrModal = (qrImgUrl) => {
    if (qrImgUrl && typeof qrImgUrl === 'string') {
      setQrImageUrl(qrImgUrl);
      setIsQrModalOpen(true);
    } else {
      console.warn("Attempted to open QR modal with invalid URL:", qrImgUrl);
    }
  };

  const closeQrModal = () => {
    setIsQrModalOpen(false);
    setQrImageUrl('');
  };

  // Handler for the "Apply" button
  const handleApplyClick = (eventId) => {
    navigate(`/events/${eventId}/apply`);
  };

  // Helper to format dates and times nicely
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'Invalid Date';
    }
  };

  // --- Rendering Logic ---

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${backgroundColor} ${textColor}`}>
        <p className="text-lg">Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex justify-center items-center min-h-screen text-red-600 ${backgroundColor} ${textColor}`}>
        <div className="text-center p-6 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)} // Go back to previous page
            className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
          >
            Go Back
          </button>
          <button
            onClick={() => window.location.reload()} // Reload the page
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${backgroundColor} ${textColor}`}>
        <div className="text-center p-6 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
          <p className="mb-4">The requested event could not be found.</p>
          <Link to="/" className="bg-blue-600 text-white px-4 py-2 rounded">Explore Other Events</Link>
        </div>
      </div>
    );
  }

  // --- Main Content Display ---
  return (
    <div className={`${backgroundColor} ${textColor} py-16 ${fontFamily}`}>
      <div className="container mx-auto px-4">
        {/* Event Image */}
        {event.eventImageURL && (
          <div className="mb-8 flex justify-center">
            <img
              src={event.eventImageURL}
              alt={event.eventName || 'Event Image'}
              className="w-full max-w-3xl h-64 md:h-96 object-cover rounded-lg shadow-xl"
            />
          </div>
        )}

        {/* Event Details Section */}
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags && event.tags.map((tag, index) => (
              <span key={index} className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
          <h1 className={`text-4xl font-bold mb-4 ${sectionTitleColor} ${sectionTitleFont}`}>
            {event.eventName}
          </h1>

          {/* Event Start Date and Time */}
          <p className="text-lg mb-2">
            <FaCalendarAlt className="inline mr-2 text-blue-500" />
            Start: {formatDateTime(event.eventDate)}
          </p>

          {/* Event End Date */}
          {event.eventEndDate && (
            <p className="text-lg mb-2">
              <FaCalendarAlt className="inline mr-2 text-blue-500" />
              End: {formatDateTime(event.eventEndDate)}
            </p>
          )}

          {/* Explicit Event Time (if provided separately and needs to be shown) */}
          {event.eventTime && (
             <p className="text-lg mb-2">
              <FaCalendarAlt className="inline mr-2 text-blue-500" />
              Time: {event.eventTime}
            </p>
          )}

          {/* Location */}
          {event.location && (
            <p className="text-lg mb-4">
              <FaMapMarkerAlt className="inline mr-2 text-red-500" /> {event.location}
            </p>
          )}

          {/* Description */}
          {event.eventDescription && (
            <div className="mb-6">
              <h3 className="text-2xl font-semibold mb-2">About the Event</h3>
              <p className="text-gray-700 leading-relaxed">{event.eventDescription}</p>
            </div>
          )}

          {/* Organizer Info */}
          {(event.organizerName) && (
            <div className="mb-6 p-4 bg-gray-100 rounded-md">
              <h3 className="text-xl font-semibold mb-2">Organizer</h3>
              {event.organizerName && <p className="mb-1"><strong>Name:</strong> {event.organizerName}</p>}
            </div>
          )}

          {/* Price and Paid Info */}
          <div className="flex items-center justify-between mb-6 border-t pt-4">
            {event.isPaid ? (
              <div className="flex items-center text-yellow-600 font-bold">
                <FaMoneyBillAlt size={24} className="mr-2" />
                <span>Paid Event</span>
              </div>
            ) : (
              <div className="flex items-center text-green-600 font-bold">
                <FaMoneyBillAlt size={24} className="mr-2" />
                <span>Free Event</span>
              </div>
            )}
            {event.isPaid && event.price !== undefined && (
              <span className="text-xl font-bold text-gray-800">${event.price}</span>
            )}
          </div>

          {/* Action Buttons and Icons */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Play Video Icon */}
              {event.eventVideoURL && (
                <button
                  onClick={() => openVideoModal(event.eventVideoURL)}
                  className="flex items-center px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition-colors focus:outline-none"
                >
                  <FaRegPlayCircle size={20} className="mr-2" />
                  Watch Video
                </button>
              )}
              {/* QR Code Icon */}
              {event.qrCodeImageURL && (
                <button
                  onClick={() => openQrModal(event.qrCodeImageURL)}
                  className="flex items-center px-4 py-2 border border-green-500 text-green-500 rounded hover:bg-green-500 hover:text-white transition-colors focus:outline-none"
                >
                  <FaQrcode size={20} className="mr-2" />
                  QR Code
                </button>
              )}
            </div>

            {/* Action Buttons: Apply Button and Back Button */}
            <div className="flex items-center gap-2">
              {/* Apply Button */}
              {!isPast && ( // Only show Apply button if event is not past
                <button
                  onClick={() => handleApplyClick(event._id)}
                  className="px-4 py-2 text-sm font-semibold text-white bg-green-500 rounded hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Apply
                </button>
              )}

              {/* Back Button (Replaced View Details) */}
              <button
                onClick={() => navigate(-1)} // Navigate back to the previous page
                className={`px-4 py-2 text-sm font-semibold text-white rounded transition-colors flex items-center ${
                  isPast ? 'bg-gray-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                <FaArrowLeft className="mr-2" /> {/* Back Arrow Icon */}
                {isPast ? 'Event Ended' : 'Back'} {/* Text changes based on state */}
              </button>
            </div>
          </div>
        </div>
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
          <button onClick={closeModal} className="text-white text-3xl font-bold mb-4 focus:outline-none">×</button>
        </div>
        <div className="aspect-w-16 aspect-h-9">
          {selectedVideoUrl && ( // Conditionally render iframe only if URL is valid
            <iframe
              width="100%"
              height="100%"
              src={selectedVideoUrl.replace("watch?v=", "embed/")}
              title="Event Video Player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
        </div>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        isOpen={isQrModalOpen}
        onRequestClose={closeQrModal}
        contentLabel="Event QR Code"
        className="ReactModal__Content bg-white p-6 rounded-lg shadow-xl max-w-sm mx-auto my-10"
        overlayClassName="ReactModal__Overlay fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      >
        <div className="flex justify-end">
          <button onClick={closeQrModal} className="text-gray-700 text-2xl font-bold mb-4 focus:outline-none">×</button>
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-bold mb-4">Scan to Join</h3>
          {qrImageUrl ? (
            <img src={qrImageUrl} alt="Event QR Code" className="w-full h-auto max-w-xs" />
          ) : (
            <p className="text-gray-500">QR Code not available.</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default EventDetails;