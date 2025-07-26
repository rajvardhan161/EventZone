// src/pages/EventDetails.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import {
  FaRegPlayCircle, FaMoneyBillAlt, FaCalendarAlt, FaMapMarkerAlt, FaQrcode, FaArrowLeft,
  FaHourglassHalf, // For duration
  FaToggleOn, FaToggleOff, // For Duty Leave
  FaUsers, FaUserPlus, FaExclamationTriangle, FaExpand // Added FaExpand for image modal
} from 'react-icons/fa';
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
  const [isModalOpen, setIsModalOpen] = useState(false); // For video modal
  const [selectedVideoUrl, setSelectedVideoUrl] = useState('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false); // For QR modal
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // For Image modal
  const [selectedImageUrl, setSelectedImageUrl] = useState('');

  // Destructure theme variables
  const {
    sectionTitleColor,
    fontFamily,
    generalTextFont,
    sectionTitleFont,
    backgroundColor,
    textColor,
    cardBackgroundColor, // Use card background for detail section for consistency
    cardTextColor,
    cardShadow,
    accentColor,
    hoverAccentColor,
    buttonTextColor,
    buttonBackgroundColor,
    buttonHoverBackgroundColor,
    inputBorderColor,
    inputTextColor,
    modalOverlayColor,
    modalContentBackgroundColor,
    modalCloseButtonColor
  } = currentTheme;

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!backendUrl) {
        setError("Backend URL is not configured.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${backendUrl}/api/user/events/${eventId}`);

        if (!response.ok) {
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
        const processedData = {
          ...data,
          duration: calculateDuration(data.eventDate, data.eventEndDate),
          allowDutyLeave: data.allowDutyLeave || false,
          maxParticipants: data.participantLimit ?? null, // Use null if undefined or not present
          currentParticipants: data.currentApplications ?? 0,
        };
        setEvent(processedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError(err.message || "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, backendUrl]);

  // --- Helper functions ---
  const isEventPast = (eventDateString) => {
    if (!eventDateString) return true;
    const eventDate = new Date(eventDateString);
    return eventDate < new Date();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
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

  const calculateDuration = (startDateTimeString, endDateTimeString) => {
    if (!startDateTimeString || !endDateTimeString) return '';
    try {
      const startDate = new Date(startDateTimeString);
      const endDate = new Date(endDateTimeString);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate < startDate) {
        return '';
      }

      const diffMilliseconds = endDate.getTime() - startDate.getTime();
      const totalMinutes = Math.round(diffMilliseconds / (1000 * 60));

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      let durationString = '';
      if (hours > 0) {
        durationString += `${hours} hour${hours !== 1 ? 's' : ''}`;
      }
      if (minutes > 0) {
        if (durationString) durationString += ' ';
        durationString += `${minutes} minute${minutes !== 1 ? 's' : ''}`;
      }
      return durationString || '0 minutes';
    } catch (e) {
      console.error("Error calculating duration:", e);
      return '';
    }
  };

  const getParticipantInfo = (event) => {
    // Correctly check if maxParticipants is a valid number and not null/undefined
    const isLimited = event.maxParticipants !== null && event.maxParticipants !== undefined && typeof event.maxParticipants === 'number' && event.maxParticipants >= 0;
    const isFull = isLimited && event.currentParticipants >= event.maxParticipants;

    let displayInfo = '';
    let icon = null;

    if (isLimited) {
      icon = <FaUsers className="mr-1" />;
      if (isFull) {
        displayInfo = `Full (${event.currentParticipants}/${event.maxParticipants})`;
      } else {
        displayInfo = `${event.currentParticipants}/${event.maxParticipants}`;
      }
    } else {
      icon = <FaUserPlus className="mr-1" />;
      displayInfo = `${event.currentParticipants} registered`;
    }
    return { displayInfo, icon, isFull, isLimited };
  };

  const openVideoModal = (videoUrl) => {
    if (videoUrl && typeof videoUrl === 'string') {
      const embedUrl = videoUrl.includes('youtube.com')
        ? videoUrl.replace(/watch\?v=|youtu.be\//, 'embed/')
        : videoUrl;
      setSelectedVideoUrl(embedUrl);
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

  // New handler for opening the image modal
  const openImageModal = (imageUrl) => {
    if (imageUrl && typeof imageUrl === 'string') {
      setSelectedImageUrl(imageUrl);
      setIsImageModalOpen(true);
    } else {
      console.warn("Attempted to open image modal with invalid URL:", imageUrl);
    }
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImageUrl('');
  };

  const handleApplyClick = (eventId) => {
    // Check if the event is full before navigating
    if (participantInfo.isFull) {
      // Optionally, you could show a message or do nothing
      alert("This event is currently full. You cannot apply.");
      return; // Prevent navigation
    }
    navigate(`/events/${eventId}/apply`);
  };

  // --- Rendering Logic ---

  const isPast = event ? isEventPast(event.eventDate) : false;
  const participantInfo = event ? getParticipantInfo(event) : { displayInfo: '', icon: null, isFull: false, isLimited: false };

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${backgroundColor} ${textColor} ${fontFamily}`}>
        <p className="text-lg">Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${backgroundColor} ${textColor} ${fontFamily} p-6`}>
        <div className={`text-center p-6 rounded-lg shadow-lg ${cardBackgroundColor || 'bg-white'} ${cardTextColor}`}>
          <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong.</h2>
          <p className="mb-6 text-gray-700">
            We couldn't load the event details. Please check your connection or try again later.<br />
            {error && <span className="text-sm text-red-600 block mt-2">{error}</span>}
          </p>
          <button
            onClick={() => navigate(-1)}
            className={`px-5 py-2 rounded-lg font-semibold transition-colors mr-2 ${buttonBackgroundColor || 'bg-gray-600'} ${buttonTextColor || 'text-white'}`}
          >
            Go Back
          </button>
          <button
            onClick={() => window.location.reload()}
            className={`px-5 py-2 rounded-lg font-semibold transition-colors ${buttonBackgroundColor || 'bg-blue-600'} ${buttonTextColor || 'text-white'}`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${backgroundColor} ${textColor} ${fontFamily}`}>
        <div className={`text-center p-6 rounded-lg shadow-lg ${cardBackgroundColor || 'bg-white'} ${cardTextColor}`}>
          <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
          <p className="mb-4">The requested event could not be found.</p>
          <Link to="/" className={`px-5 py-2 rounded-lg font-semibold transition-colors ${buttonBackgroundColor || 'bg-blue-600'} ${buttonTextColor || 'text-white'}`}>Explore Other Events</Link>
        </div>
      </div>
    );
  }

  // --- Main Content Display ---
  return (
    <div className={`${backgroundColor} ${textColor} py-16 min-h-screen ${fontFamily}`}>
      <div className="container mx-auto px-4">
        {/* Navigation and Title */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center text-lg font-semibold focus:outline-none transition-colors ${textColor} ${hoverAccentColor || 'hover:text-blue-500'}`}
            aria-label="Go back to event list"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
          <h1 className={`text-4xl font-bold ${sectionTitleColor} ${sectionTitleFont}`}>
            Event Details
          </h1>
        </div>

        {/* Event Image */}
        {event.eventImageURL && (
          <div className="mb-8 flex justify-center">
            <img
              src={event.eventImageURL}
              alt={event.eventName || 'Event Image'}
              className="w-full max-w-3xl h-85 md:h-108 object-cover rounded-lg shadow-xl cursor-pointer" // Added cursor-pointer
              onClick={() => openImageModal(event.eventImageURL)} // Click handler for modal
            />
          </div>
        )}

        {/* Event Details Section */}
        <div className={`p-8 rounded-lg shadow-xl ${cardBackgroundColor || 'bg-white'} ${cardTextColor}`}>
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags && event.tags.map((tag, index) => (
              <span key={index} className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
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
          <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${sectionTitleColor} ${sectionTitleFont}`}>
            {event.eventName}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Date, Time, Duration, Location */}
            <div>
              <h2 className={`text-2xl font-semibold mb-4 border-b pb-2 ${sectionTitleColor}`}>Details</h2>
              {/* Event Start Date and Time */}
              <p className="text-lg mb-3 flex items-center">
                <FaCalendarAlt className={`mr-3 ${accentColor || 'text-blue-500'}`} size={20} />
                <span className="font-medium">Starts:</span> {formatDateTime(event.eventDate)}
              </p>

              {/* Event End Date */}
              {event.eventEndDate && (
                <p className="text-lg mb-3 flex items-center">
                  <FaCalendarAlt className={`mr-3 ${accentColor || 'text-blue-500'}`} size={20} />
                  <span className="font-medium">Ends:</span> {formatDateTime(event.eventEndDate)}
                </p>
              )}

              {/* Explicit Event Time (if provided separately) */}
              {event.eventTime && (
                 <p className="text-lg mb-3 flex items-center">
                  <FaCalendarAlt className={`mr-3 ${accentColor || 'text-blue-500'}`} size={20} />
                  <span className="font-medium">Specific Time:</span> {event.eventTime}
                </p>
              )}

              {/* Duration */}
              {event.duration && (
                <p className="text-lg mb-3 flex items-center">
                  <FaHourglassHalf className={`mr-3 ${accentColor || 'text-purple-500'}`} size={20} />
                  <span className="font-medium">Duration:</span> {event.duration}
                </p>
              )}

              {/* Location */}
              {event.location && (
                <p className="text-lg mb-4 flex items-center" title={event.location}>
                  <FaMapMarkerAlt className={`mr-3 text-red-500`} size={20} />
                  <span className="font-medium">Location:</span> <span className="ml-1 truncate">{event.location}</span>
                </p>
              )}

              {/* Participant Info */}
              {(event.maxParticipants !== null || event.currentParticipants > 0) && (
                <p className={`text-lg mb-3 flex items-center font-semibold ${participantInfo.isFull && !true /* User isAdmin check would go here if available */ ? 'text-red-500' : ''}`}>
                  {participantInfo.icon}
                  <span className="font-medium ml-1 mr-2">{participantInfo.isLimited ? 'Slots:' : 'Registrations:'}</span> {participantInfo.displayInfo}
                  {participantInfo.isFull && !true && <span className="ml-2 text-xs font-medium text-red-500">(Full)</span>}
                </p>
              )}

              {/* Duty Leave */}
              {event.allowDutyLeave && (
                <p className="text-lg mb-3 flex items-center">
                  {event.allowDutyLeave ? <FaToggleOn className="mr-3 text-green-500" size={24} /> : <FaToggleOff className="mr-3 text-red-500" size={24} />}
                  Duty Leave Allowed
                </p>
              )}
            </div>

            {/* Right Column: Organizer, Price, Description */}
            <div>
              {/* Organizer Info */}
              {(event.organizerName) && (
                <div className="mb-6 p-5 bg-gray-50 rounded-lg">
                  <h3 className="text-2xl font-semibold mb-3 border-b pb-2">Organizer</h3>
                  {event.organizerName && <p className="text-lg mb-1"><strong>Name:</strong> {event.organizerName}</p>}
                  {event.organizerEmail && <p className="text-lg mb-1"><strong>Email:</strong> {event.organizerEmail}</p>}
                 
                </div>
              )}

              {/* Price and Paid Info */}
              <div className="flex items-center justify-between mb-6 border-t pt-4">
                {event.isPaid ? (
                  <div className="flex items-center text-yellow-600 font-bold text-xl">
                    <FaMoneyBillAlt size={28} className="mr-2" />
                    <span>Paid Event</span>
                  </div>
                ) : (
                  <div className="flex items-center text-green-600 font-bold text-xl">
                    <FaMoneyBillAlt size={28} className="mr-2" />
                    <span>Free Event</span>
                  </div>
                )}
                {event.isPaid && event.price !== undefined && (
                  <span className="text-2xl font-bold text-gray-800">${event.price}</span>
                )}
              </div>

              {/* Description */}
              {event.eventDescription && (
                <div className="mt-6">
                  <h2 className={`text-2xl font-semibold mb-3 border-b pb-2 ${sectionTitleColor}`}>About the Event</h2>
                  <p className="text-gray-700 leading-relaxed text-lg">{event.eventDescription}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-4">
              {/* Play Video Icon */}
              {event.eventVideoURL && (
                <button
                  onClick={() => openVideoModal(event.eventVideoURL)}
                  className={`flex items-center px-5 py-2 text-lg font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonBackgroundColor || 'bg-blue-600'} ${buttonTextColor || 'text-white'} ${hoverAccentColor || 'hover:bg-blue-700'}`}
                >
                  <FaRegPlayCircle size={22} className="mr-2" />
                  Watch Video
                </button>
              )}
              {/* QR Code Icon */}
              {event.qrCodeImageURL && (
                <button
                  onClick={() => openQrModal(event.qrCodeImageURL)}
                  className={`flex items-center px-5 py-2 text-lg font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonBackgroundColor || 'bg-green-500'} ${buttonTextColor || 'text-white'} ${hoverAccentColor || 'hover:bg-green-600'}`}
                >
                  <FaQrcode size={22} className="mr-2" />
                  QR Code
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Apply Button */}
              {!isPast && !participantInfo.isFull && ( // Added !participantInfo.isFull condition
                <button
                  onClick={() => handleApplyClick(event._id)}
                  className={`px-5 py-2 text-lg font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonBackgroundColor || 'bg-green-500'} ${buttonTextColor || 'text-white'} ${hoverAccentColor || 'hover:bg-green-600'}`}
                >
                  Apply
                </button>
              )}
              {/* If event is full, show a disabled/different button */}
              {!isPast && participantInfo.isFull && (
                <button
                  disabled // Disable the button
                  className={`px-5 py-2 text-lg font-semibold rounded-lg transition-colors focus:outline-none cursor-not-allowed ${buttonBackgroundColor || 'bg-gray-400'} ${buttonTextColor || 'text-white'}`}
                >
                  Event Full
                </button>
              )}

              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className={`px-5 py-2 text-lg font-semibold rounded-lg transition-colors flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isPast ? `bg-gray-500 text-white cursor-not-allowed` : `${buttonBackgroundColor || 'bg-indigo-600'} ${buttonTextColor || 'text-white'} ${hoverAccentColor || 'hover:bg-indigo-700'}`
                }`}
              >
                <FaArrowLeft className="mr-2" />
                {isPast ? 'Event Ended' : 'Back'}
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
        className={`ReactModal__Content p-4 rounded-lg shadow-xl max-w-3xl mx-auto my-10 ${modalContentBackgroundColor || 'bg-black'}`}
        overlayClassName={`ReactModal__Overlay fixed inset-0 flex items-center justify-center z-50 ${modalOverlayColor || 'bg-black bg-opacity-75'}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Event Video</h2>
          <button onClick={closeModal} className={`text-3xl font-bold focus:outline-none transition-colors ${modalCloseButtonColor || 'text-white hover:text-gray-300'}`}>×</button>
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

      {/* QR Code Modal */}
      <Modal
        isOpen={isQrModalOpen}
        onRequestClose={closeQrModal}
        contentLabel="Event QR Code"
        className={`ReactModal__Content p-6 rounded-lg shadow-xl max-w-sm mx-auto my-10 ${modalContentBackgroundColor || 'bg-white'}`}
        overlayClassName={`ReactModal__Overlay fixed inset-0 flex items-center justify-center z-50 ${modalOverlayColor || 'bg-black bg-opacity-75'}`}
      >
        <div className="flex justify-end">
          <button onClick={closeQrModal} className={`text-2xl font-bold focus:outline-none ${modalCloseButtonColor || 'text-gray-700 hover:text-gray-900'}`}>×</button>
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

      {/* Image Modal */}
      <Modal
        isOpen={isImageModalOpen}
        onRequestClose={closeImageModal}
        contentLabel="Event Image"
className={`ReactModal__Content p-4 rounded-lg shadow-xl w-full max-w-5xl mx-2 sm:mx-auto my-10 ${modalContentBackgroundColor || 'bg-white'}`}
        overlayClassName={`ReactModal__Overlay fixed inset-0 flex items-center justify-center z-50 ${modalOverlayColor || 'bg-black bg-opacity-75'}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Event Image</h2> {/* Darker text for image modal */}
          <button onClick={closeImageModal} className={`text-3xl font-bold focus:outline-none transition-colors ${modalCloseButtonColor || 'text-gray-700 hover:text-gray-900'}`}>×</button>
        </div>
        <div className="text-center">
          {selectedImageUrl && (
            <img
  src={selectedImageUrl}
  alt="Full Screen Event Image"
  className="w-auto h-auto max-w-[90vw] max-h-[80vh] object-contain mx-auto rounded-md"
/>

          )}
        </div>
      </Modal>
    </div>
  );
};

export default EventDetails;