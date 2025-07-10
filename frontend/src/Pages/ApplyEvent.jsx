import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom'; // Added useNavigate

const ApplyEventForm = () => {
  const { eventId } = useParams();
  const navigate = useNavigate(); // Use navigate for redirection

  const { token, backendUrl } = useContext(AppContext);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [notes, setNotes] = useState('');
  const [applicationData, setApplicationData] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true); // More specific loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');

  const [showUserDetails, setShowUserDetails] = useState(true); // Start expanded by default
  const [showEventDetails, setShowEventDetails] = useState(true); // Start expanded by default

  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // 5MB

  // Function to fetch user and event details
  const fetchDetails = useCallback(async () => {
    if (!token) {
      toast.error("Authentication token missing. Please log in.");
      navigate('/login'); // Redirect to login if no token
      return;
    }
    if (!eventId) {
      toast.error("Event ID is missing.");
      navigate('/events'); // Redirect to events page if no eventId
      return;
    }

    setLoadingDetails(true);
    try {
      const res = await fetch(`${backendUrl}/api/user/events/${eventId}/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (res.ok) {
        setEventDetails(data.event);
        setUserDetails(data.user);
        if (!data.event) {
            toast.error("Event not found.");
            navigate('/events');
        }
      } else {
        toast.error(data.message || 'Failed to fetch event details. Please check your login.');
        // If fetching details fails for reasons like invalid event ID, redirect
        if (res.status === 404 || res.status === 400) {
             navigate('/events');
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error('Network error. Please try again later.');
      navigate('/events'); // Redirect on network error
    } finally {
      setLoadingDetails(false);
    }
  }, [eventId, backendUrl, token, navigate]); // Added dependencies

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]); // Depend on fetchDetails function

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setPaymentScreenshot(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type. Please upload an image (JPG, PNG, GIF).');
      setPaymentScreenshot(null);
      e.target.value = null; // Clear the input
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`File size exceeds the limit of ${MAX_FILE_SIZE_MB}MB.`);
      setPaymentScreenshot(null);
      e.target.value = null; // Clear the input
      return;
    }

    setPaymentScreenshot(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- Validation ---
    const isPaidEvent = eventDetails?.isPaid && eventDetails?.price > 0;
    if (isPaidEvent && !paymentScreenshot) {
      toast.error('Please upload a payment screenshot for this paid event.');
      return; // Stop submission if payment screenshot is missing for a paid event
    }
    // --- End Validation ---

    setIsSubmitting(true);

    const formData = new FormData();
    if (paymentScreenshot) { // Only append if a file is selected
      formData.append('paymentScreenshot', paymentScreenshot);
    }
    formData.append('notes', notes);

    try {
      const res = await fetch(`${backendUrl}/api/user/events/${eventId}/apply`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Application submitted successfully!');
        setApplicationData(data.application); // Store application data to show confirmation
        // Reset form fields after successful submission
        setPaymentScreenshot(null);
        setNotes('');
        // Optionally clear the file input visually (more complex, might need ref)
        // document.getElementById('paymentScreenshot').value = null;
      } else {
        let errorMessage = data.message || 'Application failed.';
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(' ');
          errorMessage = errorMessages || errorMessage;
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error applying for event:', error);
      toast.error('An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImageUrl('');
  };

  const toggleUserDetails = () => setShowUserDetails(!showUserDetails);
  const toggleEventDetails = () => setShowEventDetails(!showEventDetails);

  // Determine if the payment section should be shown
  const isPaidEvent = eventDetails?.isPaid && eventDetails?.price > 0;

  if (loadingDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 8l3-3.709z"></path>
          </svg>
          <p className="text-lg text-gray-700">Loading event and your details...</p>
        </div>
      </div>
    );
  }

  // If eventDetails is null after loading, it means an error occurred or event not found
  if (!eventDetails) {
      return (
          <div className="max-w-3xl mx-auto p-8 text-center bg-white rounded-lg shadow-xl">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Event</h1>
              <p className="text-gray-700 mb-6">Could not find the event details. It might have been removed or the ID is incorrect.</p>
              <button
                  onClick={() => navigate('/events')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out"
              >
                  Go Back to Events
              </button>
          </div>
      );
  }


  return (
    <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-xl transform transition-all duration-500 hover:shadow-2xl mt-10">

      <h1 className="text-3xl font-extrabold text-blue-800 mb-6 text-center border-b-2 pb-4">
        Apply for <span className="text-blue-600">{eventDetails.eventName}</span>
      </h1>

      {/* --- User + Event Details Section --- */}
      <div className="space-y-6">
          {/* User Details Accordion */}
          <div className="border border-gray-200 rounded-xl shadow-md">
            <button
              onClick={toggleUserDetails}
              className="w-full flex justify-between items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-t-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200"
              aria-expanded={showUserDetails}
              aria-controls="user-details-content"
            >
              <span className="text-xl font-semibold text-blue-700 flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                Your Information
              </span>
              <svg className={`w-6 h-6 transform transition-transform duration-300 ${showUserDetails ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {showUserDetails && userDetails && (
              <div id="user-details-content" className="p-5 border-t border-gray-200 bg-white rounded-b-xl">
                <ul className="text-base space-y-3 text-gray-700">
                  <li><strong>Name:</strong> {userDetails.name || 'N/A'}</li>
                  <li><strong>Email:</strong> {userDetails.email || 'N/A'}</li>
                  <li><strong>Gender:</strong> {userDetails.gender || 'N/A'}</li>
                  <li><strong>Phone:</strong> {userDetails.phone_no || 'N/A'}</li>
                  <li><strong>Course:</strong> {userDetails.course || 'N/A'}</li>
                  {userDetails.profile_photo && (
                    <li className="mt-4">
                      <strong className="mb-2 block">Profile Photo:</strong>
                      <img
                        src={userDetails.profile_photo}
                        alt="User Profile"
                        className="w-28 h-28 rounded-full border-2 border-blue-300 object-cover cursor-pointer transition-shadow duration-300 hover:shadow-md"
                        onClick={() => handleImageClick(userDetails.profile_photo)}
                        tabIndex="0" // Make it focusable
                        onKeyPress={(e) => e.key === 'Enter' && handleImageClick(userDetails.profile_photo)}
                      />
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Event Details Accordion */}
          <div className="border border-gray-200 rounded-xl shadow-md">
            <button
              onClick={toggleEventDetails}
              className="w-full flex justify-between items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-t-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200"
              aria-expanded={showEventDetails}
              aria-controls="event-details-content"
            >
              <span className="text-xl font-semibold text-blue-700 flex items-center">
                <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Event Details
              </span>
              <svg className={`w-6 h-6 transform transition-transform duration-300 ${showEventDetails ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {showEventDetails && (
              <div id="event-details-content" className="p-5 border-t border-gray-200 bg-white rounded-b-xl">
                <ul className="text-base space-y-3 text-gray-700">
                  <li><strong>Event Name:</strong> {eventDetails.eventName}</li>
                  <li><strong>Date:</strong> {new Date(eventDetails.eventDate).toLocaleString()}</li>

                  {isPaidEvent ? (
                    <>
                      <li>
                        <strong>Price:</strong> <span className="font-bold text-green-700">₹{eventDetails.price.toFixed(2)}</span> <span className="text-green-600 font-semibold">(Paid Event)</span>
                      </li>
                      {eventDetails.qrCodeImageURL ? (
                        <li className="mt-4">
                          <strong className="mb-2 block">Payment QR Code:</strong>
                          <img
                            src={eventDetails.qrCodeImageURL}
                            alt="Event QR Code"
                            className="w-40 h-40 border-2 border-blue-300 rounded-md object-cover cursor-pointer transition-shadow duration-300 hover:shadow-md"
                            onClick={() => handleImageClick(eventDetails.qrCodeImageURL)}
                            tabIndex="0"
                            onKeyPress={(e) => e.key === 'Enter' && handleImageClick(eventDetails.qrCodeImageURL)}
                          />
                        </li>
                      ) : (
                          <li className="mt-3 text-yellow-700 font-medium">
                            <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            QR Code not available. Please contact support for payment details.
                          </li>
                      )}
                    </>
                  ) : (
                     <li className="text-green-700 font-bold">
                        This is a Free Event! No payment required.
                     </li>
                  )}
                </ul>
              </div>
            )}
          </div>
      </div>

      {/* --- Application Form Section --- */}
      {!applicationData && (
        <div className="mt-10 p-8 border border-gray-200 rounded-xl shadow-md bg-gradient-to-b from-white to-gray-50">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Fill Your Application</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="notes" className="block mb-2 font-medium text-gray-700 text-base">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out resize-none"
                rows="4"
                placeholder="e.g., Any dietary restrictions, special requests..."
                aria-label="Additional Notes"
              />
            </div>

            {/* Payment Screenshot Upload - Only for Paid Events */}
            {isPaidEvent && (
              <div>
                <label htmlFor="paymentScreenshot" className="block mb-2 font-medium text-gray-700 text-base">
                  Upload Payment Screenshot
                </label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer bg-white hover:bg-gray-50 transition-colors duration-200 ease-in-out">
                  <input
                    id="paymentScreenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    aria-label="Upload payment screenshot"
                  />
                  <div className="flex flex-col items-center justify-center pointer-events-none"> {/* Prevent clicks from passing through */}
                    <svg className="w-12 h-12 text-blue-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v1m0 18v-1M4.5 4.5l1.77 1.77M17.73 17.73l1.77 1.77M3 12h1m18 0h-1M4.5 19.5l1.77-1.77M17.73 6.27l1.77-1.77M12 17.77V21M12 3v3"></path></svg>
                    <p className="text-lg font-semibold text-gray-700 mb-1">
                      {paymentScreenshot ? paymentScreenshot.name : 'Select Image File'}
                    </p>
                    {paymentScreenshot && (
                      <p className="text-sm text-gray-500">
                        {`(${paymentScreenshot.name}) - ${(paymentScreenshot.size / 1024).toFixed(1)} KB`}
                      </p>
                    )}
                    {!paymentScreenshot && (
                      <p className="text-sm text-gray-500 mt-2">
                        Max file size: {MAX_FILE_SIZE_MB}MB (JPG, PNG, GIF)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center
                ${isSubmitting || loadingDetails || (isPaidEvent && !paymentScreenshot)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
              disabled={isSubmitting || loadingDetails || (isPaidEvent && !paymentScreenshot)}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 8l3-3.709z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Apply for Event'
              )}
            </button>
          </form>
        </div>
      )}

      {/* --- Submission Confirmation Section --- */}
      {applicationData && (
        <div className="mt-10 p-8 border border-green-300 rounded-xl shadow-lg bg-green-50 text-center">
          <div className="flex items-center justify-center mb-5">
            <svg className="w-10 h-10 text-green-600 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2 className="text-3xl font-bold text-green-700">Application Submitted!</h2>
          </div>
          <p className="text-lg text-gray-700 mb-6">Your application details for "{eventDetails.eventName}" are confirmed:</p>
          <div className="bg-white p-6 rounded-lg shadow-inner border border-gray-200 text-left">
            <ul className="text-base space-y-4 text-gray-700">
              <li><strong>Application ID:</strong> {applicationData._id || 'N/A'}</li>
              <li><strong>User Name:</strong> {applicationData.userName || 'N/A'}</li>
              <li><strong>User Email:</strong> {applicationData.userEmail || 'N/A'}</li>
              <li><strong>Event Name:</strong> {applicationData.eventName || 'N/A'}</li>
              <li>
                <strong>Status:</strong> <span className={`font-bold ${applicationData.status === 'Pending' ? 'text-orange-500' : applicationData.status === 'Approved' ? 'text-green-600' : applicationData.status === 'Rejected' ? 'text-red-500' : 'text-gray-500'}`}>{applicationData.status}</span>
              </li>
              <li>
                <strong>Payment Status:</strong> <span className={`font-bold ${applicationData.paymentStatus === 'Verified' ? 'text-green-600' : 'text-red-500'}`}>{applicationData.paymentStatus || 'N/A'}</span>
              </li>
              {applicationData.notes && <li><strong>Notes Provided:</strong> <p className="mt-1 p-3 bg-gray-100 rounded-md">{applicationData.notes}</p></li>}
            </ul>
            {/* Displaying uploaded images if they exist in the submitted data */}
            {(applicationData.profile_photo || applicationData.paymentScreenshotURL) && (
                <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {applicationData.profile_photo && (
                        <div>
                            <strong className="block mb-2 text-lg">Your Profile Photo</strong>
                            <img
                                src={applicationData.profile_photo}
                                alt="Profile"
                                className="w-full h-48 object-cover rounded-lg shadow-md cursor-pointer"
                                onClick={() => handleImageClick(applicationData.profile_photo)}
                                tabIndex="0"
                                onKeyPress={(e) => e.key === 'Enter' && handleImageClick(applicationData.profile_photo)}
                            />
                        </div>
                    )}
                    {applicationData.paymentScreenshotURL && (
                        <div>
                            <strong className="block mb-2 text-lg">Your Payment Screenshot</strong>
                            <img
                                src={applicationData.paymentScreenshotURL}
                                alt="Payment Screenshot"
                                className="w-full h-48 object-cover rounded-lg shadow-md cursor-pointer"
                                onClick={() => handleImageClick(applicationData.paymentScreenshotURL)}
                                tabIndex="0"
                                onKeyPress={(e) => e.key === 'Enter' && handleImageClick(applicationData.paymentScreenshotURL)}
                            />
                        </div>
                    )}
                </div>
            )}
          </div>
          <div className="mt-8">
            <button
              onClick={() => {
                setApplicationData(null); // Clear data to allow re-applying or navigating away
                navigate('/user/dashboard'); // Example: Redirect to user dashboard
              }}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out shadow-lg"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* --- Image Modal Component --- */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black bg-opacity-80 backdrop-blur-sm"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="image-modal-title"
        >
          <button
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center text-3xl font-bold hover:bg-white hover:text-black transition-colors duration-300 z-20"
            onClick={closeModal}
            aria-label="Close image preview"
          >
            ×
          </button>
          <div className="relative max-w-4xl w-full max-h-[85vh] rounded-lg shadow-xl overflow-hidden">
            <img
              id="image-modal-title" // Associate title with image for accessibility
              src={selectedImageUrl}
              alt="Enlarged Preview"
              className="block w-full h-full object-contain"
              onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking image
            />
          </div>
        </div>
      )}
      {/* --- End Image Modal Component --- */}
    </div>
  );
};

export default ApplyEventForm;