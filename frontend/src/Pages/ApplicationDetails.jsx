// src/pages/ApplicationDetailPage.jsx
import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext'; // Make sure this path is correct

// Re-importing icons for consistency (ensure these are accessible)
const DocumentIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const CalendarIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-4 3h-2m3-3V1M4 7h16M4 11h16M4 15h16M6 20h12a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z"></path>
  </svg>
);

const LocationIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c4.202 0 8-3.201 8-7.5S16.202 0 12 0 4 3.201 4 7.5 7.798 15 12 15zm0 2a6.5 6.5 0 016.5-6.5v13a6.5 6.5 0 01-6.5-6.5z"></path>
  </svg>
);

const TicketIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3-1.343-3-3S10.343 2 12 2s3 1.343 3 3-1.343 3-3 3zm0 14c-4.202 0-8-3.201-8-7.5S7.798 7.5 12 7.5s8 3.201 8 7.5-4.202 7.5-8 7.5zM12 7c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"></path>
  </svg>
);

const SpinnerIcon = ({ className = "animate-spin h-6 w-6" }) => (
  <svg className={className} viewBox="0 0 24 24" style={{ color: 'currentColor' }}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 8l3-3.709z"></path>
  </svg>
);

const ErrorIcon = ({ className = "h-12 w-12 text-red-500 mb-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const ApplicationDetails = () => {
  const { applicationId } = useParams(); // Get the applicationId from the URL
  const navigate = useNavigate();
  const { token, backendUrl } = useContext(AppContext);
  const { currentTheme } = useTheme(); // Access theme properties

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      setLoading(true);
      setError(''); // Clear previous errors
      try {
        const response = await axios.get(`${backendUrl}/api/user/user/applications/${applicationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplication(response.data);
      } catch (err) {
        console.error('Error fetching application details:', err.response?.data || err.message);
        const errorMessage = err.response?.data?.message || 'Failed to fetch application details.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (applicationId && token) { // Fetch only if applicationId and token are available
      fetchApplicationDetails();
    } else if (!token) {
      setError("Authentication required. Please log in.");
      setLoading(false);
      navigate('/login'); // Redirect to login if no token
    } else {
      setError("Application ID not provided.");
      setLoading(false);
    }
  }, [applicationId, navigate, backendUrl, token]); // Dependencies for the effect

  // Memoize the formatted date and time to avoid re-calculation on every render
  const formattedEventDate = useMemo(() => {
    if (!application?.eventDate) return { date: 'TBD', time: '' };
    const date = new Date(application.eventDate);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }, [application?.eventDate]);

  const formattedEventEndDate = useMemo(() => {
    if (!application?.eventEndDate) return { date: 'TBD', time: '' };
    const date = new Date(application.eventEndDate);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }, [application?.eventEndDate]);

  // Calculate event duration if both start and end dates are available
  const eventDuration = useMemo(() => {
    if (application?.eventDate && application?.eventEndDate) {
      const startDate = new Date(application.eventDate);
      const endDate = new Date(application.eventEndDate);
      const diffInMs = Math.abs(endDate - startDate);
      const hours = Math.floor(diffInMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        return `${hours} hr${hours > 1 ? 's' : ''}${minutes > 0 ? `, ${minutes} min` : ''}`;
      } else if (minutes > 0) {
        return `${minutes} min`;
      } else {
        return 'Instantaneous'; // Or 'Less than a minute'
      }
    }
    return 'N/A';
  }, [application?.eventDate, application?.eventEndDate]);


  // --- Render Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: currentTheme.bgColor, color: currentTheme.textColor, fontFamily: currentTheme.fontFamily }}>
        <div className="flex items-center gap-3 text-lg">
          <SpinnerIcon className="h-8 w-8" style={{ color: currentTheme.primaryColor }} />
          <span>Loading application details...</span>
        </div>
      </div>
    );
  }

  // --- Render Error State ---
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: currentTheme.bgColor, color: currentTheme.textColor, fontFamily: currentTheme.fontFamily }}>
        <ErrorIcon />
        <p className="text-lg text-center mb-4 max-w-md">{error}</p>
        <button
          onClick={() => navigate('/applications')} // Go back to applications list
          className="px-6 py-3 rounded-lg font-semibold text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 shadow-lg"
          style={{
            backgroundColor: currentTheme.primaryColor,
            color: currentTheme.background, // Text color for the button
            boxShadow: `0 4px 6px -1px ${currentTheme.primaryColor}30`,
            fontFamily: currentTheme.fontFamily,
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  // --- Render Application Details ---
  return (
    <div
      className="min-h-screen p-8 transition-colors duration-500"
      style={{
        backgroundColor: currentTheme.bgColor, // Page background
        color: currentTheme.textColor, // General text color
        fontFamily: currentTheme.fontFamily, // Page font family
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/applications')}
            className="flex items-center text-lg font-semibold hover:underline transition-colors duration-200"
            style={{ color: currentTheme.accent, fontFamily: currentTheme.fontFamily }} // Use accent color for link
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Applications
          </button>
        </div>

        {application ? (
          // Card container for application details
          <div className="rounded-2xl shadow-xl p-8" style={{
            backgroundColor: currentTheme.cardBgColor, // Use theme's card background
            fontFamily: currentTheme.fontFamily,
          }}>
            {/* Application Title */}
            <h1 className="text-4xl font-extrabold mb-4" style={{ color: currentTheme.primaryColor, fontFamily: currentTheme.fontFamily }}>
              {application.eventName || 'Application Details'} {/* Display Event Name or fallback */}
            </h1>

            {/* Event Description - if you have it from the API */}
            {application.eventDescription && (
              <p className="text-lg mb-6 leading-relaxed opacity-90" >
                {application.eventDescription}
              </p>
            )}

            {/* Two-Column Layout for Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> {/* Increased gap for better spacing */}
              {/* Application Specific Info Section */}
              <div className="space-y-6"> {/* Increased spacing between items */}
                <h3 className="text-2xl font-bold mb-4" style={{ color: currentTheme.primaryColor, fontFamily: currentTheme.fontFamily }}>Application Info</h3>

                <div className="flex items-center gap-4"> {/* Added gap between icon and text */}
                  <CalendarIcon className="w-8 h-8 opacity-70 flex-shrink-0" style={{ color: currentTheme.accent }} />
                  <div className="flex-grow"> {/* Allow text to take available space */}
                    <h4 className="text-xl font-semibold" style={{ fontFamily: currentTheme.fontFamily }}>Applied On</h4>
                    <p className="text-base opacity-80" style={{ fontFamily: currentTheme.fontFamily }}>
                      {application.applicationDate ? new Date(application.applicationDate).toLocaleString() : 'N/A'} {/* Using toLocaleString for date and time */}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <TicketIcon className="w-8 h-8 opacity-70 flex-shrink-0" style={{ color: currentTheme.accent }} />
                  <div className="flex-grow">
                    <h4 className="text-xl font-semibold" style={{ fontFamily: currentTheme.fontFamily }}>Application Status</h4>
                    <p className={`text-base font-bold opacity-90 px-3 py-1 rounded-full inline-block ${getStatusColor(application.status)}`} style={{ fontFamily: currentTheme.fontFamily }}>
                      {application.status || 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <TicketIcon className="w-8 h-8 opacity-70 flex-shrink-0" style={{ color: currentTheme.accent }} />
                  <div className="flex-grow">
                    <h4 className="text-xl font-semibold" style={{ fontFamily: currentTheme.fontFamily }}>Payment Status</h4>
                    <p className={`text-base font-bold opacity-90 px-3 py-1 rounded-full inline-block ${getPaymentStatusColor(application.paymentStatus)}`} style={{ fontFamily: currentTheme.fontFamily }}>
                      {application.paymentStatus || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Details Section (from populated data) */}
              {application.eventDetails && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold mb-4" style={{ color: currentTheme.primaryColor, fontFamily: currentTheme.fontFamily }}>Event Information</h3>

                  <div className="flex items-center gap-4">
                    <CalendarIcon className="w-8 h-8 opacity-70 flex-shrink-0" style={{ color: currentTheme.accent }} />
                    <div className="flex-grow">
                      <h4 className="text-xl font-semibold mb-1" style={{ fontFamily: currentTheme.fontFamily }}>
                        Event Date & Time
                      </h4>
                      <p className="text-base opacity-80 mb-2" style={{ fontFamily: currentTheme.fontFamily }}>
                        {`${formattedEventDate.date} at ${formattedEventDate.time}`}
                      </p>
                    </div>
                  </div>
                <div className="flex items-center gap-4">
                    <CalendarIcon className="w-8 h-8 opacity-70 flex-shrink-0" style={{ color: currentTheme.accent }} />
                    <div className="flex-grow">
                      <h4 className="text-xl font-semibold mb-1" style={{ fontFamily: currentTheme.fontFamily }}>
                        EndEvent Date & Time
                      </h4>
                      <p className="text-base opacity-80" style={{ fontFamily: currentTheme.fontFamily }}>
                        To: {`${formattedEventEndDate.date} at ${formattedEventEndDate.time}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <CalendarIcon className="w-8 h-8 opacity-70 flex-shrink-0" style={{ color: currentTheme.accent }} />
                    <div className="flex-grow">
                      <h4 className="text-xl font-semibold mb-1" style={{ fontFamily: currentTheme.fontFamily }}>
                        Event Duration
                      </h4>
                      <p className="text-sm opacity-70 mt-1" style={{ fontFamily: currentTheme.fontFamily }}>
                        Duration: {eventDuration}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <LocationIcon className="w-8 h-8 opacity-70 flex-shrink-0" style={{ color: currentTheme.accent }} />
                    <div className="flex-grow">
                      <h4 className="text-xl font-semibold" style={{ fontFamily: currentTheme.fontFamily }}>Location</h4>
                      <p className="text-base opacity-80" style={{ fontFamily: currentTheme.fontFamily }}>
                        {application.eventDetails.location || 'Online / TBD'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Fallback if application data is somehow null after loading (should be rare with error handling)
          <div className="text-center py-12" style={{ backgroundColor: currentTheme.cardBgColor, fontFamily: currentTheme.fontFamily }}>
            <p className="text-lg" style={{ color: currentTheme.textColor }}>Could not load application details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to determine status badge color
const getStatusColor = (status) => {
  switch (status) {
    case 'Approved': return 'text-green-800 bg-green-100';
    case 'Pending': return 'text-orange-800 bg-orange-100';
    case 'Rejected': return 'text-red-800 bg-red-100';
    default: return 'text-gray-800 bg-gray-200';
  }
};

// Helper function to determine payment status badge color
const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'Paid': return 'text-blue-800 bg-blue-100';
    case 'Pending': return 'text-yellow-800 bg-yellow-100';
    default: return 'text-gray-800 bg-gray-200';
  }
};

export default ApplicationDetails;