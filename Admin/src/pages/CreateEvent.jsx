import React, { useState, useEffect, useContext } from 'react';
import { AdminContext } from '../context/AdminContext'; // Adjust path if necessary
import { useTheme } from '../context/ThemeContext'; // Adjust path if necessary

// A standalone component for the create event form.
const CreateEvent = () => {
  const { backendUrl, token } = useContext(AdminContext);
  const { currentTheme } = useTheme();

  // --- Initial State ---
  const initialFormData = {
    eventName: '',
    eventDate: '',
    eventEndDate: '',
    eventTime: '',
    eventDescription: '',
    location: '',
    isPaid: false,
    price: 0,
    organizerName: '',
    organizerEmail: '',
    organizerPhone: '',
    participantLimit: '',
    allowDutyLeave: false,
    eventImage: null,
    eventVideo: null,
    qrCode: null,
  };

  // --- State Hooks ---
  const [formData, setFormData] = useState(initialFormData);
  const [eventDuration, setEventDuration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // --- Theme-related styles ---
  const themeClasses = {
    light: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      containerBg: 'bg-white',
      subtleText: 'text-gray-600',
      primaryButtonBg: 'bg-blue-600 hover:bg-blue-700',
      secondaryButtonBg: 'bg-gray-600 hover:bg-gray-700',
      borderColor: 'border-gray-300',
      focusRing: 'focus:ring-blue-500',
      inputBorder: 'border-gray-300',
      fileButtonBg: 'file:bg-gray-200 hover:file:bg-gray-300',
    },
    dark: {
      bg: 'bg-gray-900',
      text: 'text-gray-100',
      containerBg: 'bg-gray-800',
      subtleText: 'text-gray-400',
      primaryButtonBg: 'bg-blue-500 hover:bg-blue-600',
      secondaryButtonBg: 'bg-gray-500 hover:bg-gray-400',
      borderColor: 'border-gray-600',
      focusRing: 'focus:ring-blue-400',
      inputBorder: 'border-gray-600',
      fileButtonBg: 'file:bg-gray-600 hover:file:bg-gray-500',
    }
  };
  const currentThemeClasses = themeClasses[currentTheme] || themeClasses.light;

  // --- Auto-fill eventTime from eventDate's time part ---
  useEffect(() => {
    if (formData.eventDate) {
      try {
        const dateObj = new Date(formData.eventDate);
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const timeString = `${hours}:${minutes}`;

        // Update eventTime only if it's different to avoid re-renders
        if (formData.eventTime !== timeString) {
          setFormData(prev => ({ ...prev, eventTime: timeString }));
        }
      } catch (e) {
        console.error("Error parsing date for auto-filling event time:", e);
      }
    }
  }, [formData.eventDate]); // Dependency on formData.eventDate

  // --- Calculate and display event duration in real-time ---
  useEffect(() => {
    if (formData.eventDate && formData.eventEndDate) {
      try {
        const startDate = new Date(formData.eventDate);
        const endDate = new Date(formData.eventEndDate);

        if (!isNaN(startDate) && !isNaN(endDate) && endDate >= startDate) {
          const diffMs = endDate.getTime() - startDate.getTime();
          const totalMinutes = Math.round(diffMs / (1000 * 60));
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;

          let durationString = '';
          if (hours > 0) durationString += `${hours} hour${hours > 1 ? 's' : ''} `;
          if (minutes > 0) durationString += `${minutes} minute${minutes > 1 ? 's' : ''}`;
          
          setEventDuration(durationString.trim() || '0 minutes');
        } else {
          setEventDuration('Invalid date range');
        }
      } catch (e) {
        setEventDuration('Error calculating');
      }
    } else {
      setEventDuration('');
    }
  }, [formData.eventDate, formData.eventEndDate]);

  // --- Form Handlers ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0] || null,
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEventDuration('');
    // Reset file input fields visually
    document.getElementById('create-event-form').reset();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // --- Basic Validation ---
    if (!formData.eventName || !formData.eventDate || !formData.eventEndDate || !formData.organizerName) {
      setError('Please fill in all required fields: Event Name, Start Date, End Date, and Organizer Name.');
      return;
    }
    if (new Date(formData.eventEndDate) < new Date(formData.eventDate)) {
        setError('End date cannot be before the start date.');
        return;
    }
    if (formData.isPaid && (formData.price === null || parseFloat(formData.price) <= 0)) {
        setError('Price must be a positive number for paid events.');
        return;
    }

    setIsSubmitting(true);

    const eventFormData = new FormData();
    // Append all form data, ensuring correct types and handling for null values
    Object.keys(formData).forEach(key => {
        if (key === 'eventImage' || key === 'eventVideo' || key === 'qrCode') {
            if (formData[key]) {
                // Map form field names to expected backend field names
                const fileFieldMap = { eventImage: 'image', eventVideo: 'video', qrCode: 'qrCode' };
                eventFormData.append(fileFieldMap[key], formData[key]);
            }
        } else if (key === 'participantLimit') {
            // Send empty string for unlimited, or the number
            eventFormData.append(key, formData[key] === '' ? '' : parseInt(formData[key], 10));
        } else {
            eventFormData.append(key, formData[key]);
        }
    });

    try {
      const response = await fetch(`${backendUrl}/api/event/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // 'Content-Type' is not set for FormData; the browser sets it with the correct boundary
        },
        body: eventFormData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessage = 'Event creation failed.';
        if (responseData?.error && typeof responseData.error === 'object') {
          errorMessage = Object.values(responseData.error).flat().join(' ');
        } else if (responseData?.message) {
          errorMessage = responseData.message;
        }
        throw new Error(errorMessage);
      }

      setSuccessMessage(`Event "${responseData.event.eventName}" created successfully!`);
      resetForm();

    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!backendUrl || !token) {
    return (
        <div className={`${currentThemeClasses.bg} ${currentThemeClasses.text} min-h-screen flex items-center justify-center`}>
            <div className={`p-8 rounded-lg shadow-xl ${currentThemeClasses.containerBg}`}>
                <h2 className="text-2xl font-bold text-red-500">Configuration Error</h2>
                <p className="mt-2">Backend URL or authentication token is missing. Please log in and configure the application.</p>
            </div>
        </div>
    );
  }

  return (
    <div className={`${currentThemeClasses.bg} ${currentThemeClasses.text} min-h-screen p-4 sm:p-6 lg:p-8`}>
      <div className={`max-w-4xl mx-auto rounded-lg shadow-xl p-6 sm:p-8 ${currentThemeClasses.containerBg}`}>
        <h1 className="text-3xl font-bold text-center mb-2">Create New Event</h1>
        <p className={`text-center mb-6 ${currentThemeClasses.subtleText}`}>Fill out the details below to add a new event.</p>
        
        {/* --- Alerts --- */}
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}
        {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
                <strong className="font-bold">Success! </strong>
                <span className="block sm:inline">{successMessage}</span>
            </div>
        )}

        <form id="create-event-form" onSubmit={handleSubmit} noValidate>
          {/* --- Basic Info --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-2" htmlFor="eventName">Event Name *</label>
              <input id="eventName" name="eventName" value={formData.eventName} onChange={handleInputChange} className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow-sm appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 ${currentThemeClasses.focusRing}`} type="text" placeholder="e.g., Annual Tech Conference" required />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="eventDate">Start Date & Time *</label>
              <input id="eventDate" name="eventDate" value={formData.eventDate} onChange={handleInputChange} className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow-sm appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 ${currentThemeClasses.focusRing}`} type="datetime-local" required />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="eventEndDate">End Date & Time *</label>
              <input id="eventEndDate" name="eventEndDate" value={formData.eventEndDate} onChange={handleInputChange} className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow-sm appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 ${currentThemeClasses.focusRing}`} type="datetime-local" required />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="eventDuration">Calculated Duration</label>
              <input id="eventDuration" value={eventDuration} readOnly className={`${currentThemeClasses.bg} ${currentThemeClasses.subtleText} ${currentThemeClasses.inputBorder} shadow-sm border rounded w-full py-2 px-3 cursor-not-allowed`} placeholder="Auto-calculated"/>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" htmlFor="location">Location</label>
              <input id="location" name="location" value={formData.location} onChange={handleInputChange} className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow-sm appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 ${currentThemeClasses.focusRing}`} type="text" placeholder="e.g., Virtual or City Hall" />
            </div>
          </div>

          {/* --- Description --- */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2" htmlFor="eventDescription">Description</label>
            <textarea id="eventDescription" name="eventDescription" value={formData.eventDescription} onChange={handleInputChange} className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow-sm appearance-none border rounded w-full py-2 px-3 h-32 resize-y focus:outline-none focus:ring-2 ${currentThemeClasses.focusRing}`} placeholder="Describe the event..."/>
          </div>

          {/* --- Organizer Info --- */}
          <div className="border-t pt-6 mb-6 ${currentThemeClasses.borderColor}">
            <h2 className="text-xl font-semibold mb-4">Organizer Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2" htmlFor="organizerName">Organizer Name *</label>
                <input id="organizerName" name="organizerName" value={formData.organizerName} onChange={handleInputChange} className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow-sm appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 ${currentThemeClasses.focusRing}`} type="text" placeholder="e.g., John Doe" required />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" htmlFor="organizerEmail">Organizer Email</label>
                <input id="organizerEmail" name="organizerEmail" value={formData.organizerEmail} onChange={handleInputChange} className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow-sm appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 ${currentThemeClasses.focusRing}`} type="email" placeholder="e.g., contact@example.com" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2" htmlFor="organizerPhone">Organizer Phone</label>
                <input id="organizerPhone" name="organizerPhone" value={formData.organizerPhone} onChange={handleInputChange} className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow-sm appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 ${currentThemeClasses.focusRing}`} type="tel" placeholder="e.g., +1 234 567 890" />
              </div>
            </div>
          </div>
          
          {/* --- Settings & Media --- */}
          <div className="border-t pt-6 mb-6 ${currentThemeClasses.borderColor}">
            <h2 className="text-xl font-semibold mb-4">Settings & Media</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold mb-2" htmlFor="participantLimit">Participant Limit</label>
                    <input id="participantLimit" name="participantLimit" value={formData.participantLimit} onChange={handleInputChange} className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow-sm appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 ${currentThemeClasses.focusRing}`} type="number" min="0" placeholder="Leave blank for unlimited" />
                </div>
                <div className="flex items-center space-x-4 pt-6">
                  <div className="flex items-center">
                    <input id="allowDutyLeave" name="allowDutyLeave" type="checkbox" checked={formData.allowDutyLeave} onChange={handleInputChange} className="h-5 w-5 text-blue-600 rounded focus:ring-2 ${currentThemeClasses.focusRing}" />
                    <label className="ml-2 text-sm font-bold" htmlFor="allowDutyLeave">Allow Duty Leave?</label>
                  </div>
                  <div className="flex items-center">
                    <input id="isPaid" name="isPaid" type="checkbox" checked={formData.isPaid} onChange={handleInputChange} className="h-5 w-5 text-blue-600 rounded focus:ring-2 ${currentThemeClasses.focusRing}" />
                    <label className="ml-2 text-sm font-bold" htmlFor="isPaid">Is Paid Event?</label>
                  </div>
                </div>
                {formData.isPaid && (
                  <div>
                    <label className="block text-sm font-bold mb-2" htmlFor="price">Price (USD)</label>
                    <input id="price" name="price" value={formData.price} onChange={handleInputChange} className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow-sm appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 ${currentThemeClasses.focusRing}`} type="number" min="0.01" step="0.01" placeholder="e.g., 25.00" required />
                  </div>
                )}
                {formData.isPaid && (
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold mb-2">Payment QR Code</label>
                        <input type="file" name="qrCode" accept="image/*" onChange={handleFileChange} className={`text-sm rounded-lg border cursor-pointer block w-full ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} ${currentThemeClasses.fileButtonBg}`} />
                        <p className={`text-xs mt-1 ${currentThemeClasses.subtleText}`}>Optional. Upload a QR code for payment (e.g., UPI, PayPal).</p>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                    <label className="block text-sm font-bold mb-2">Event Image (Poster)</label>
                    <input type="file" name="eventImage" accept="image/*" onChange={handleFileChange} className={`text-sm rounded-lg border cursor-pointer block w-full ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} ${currentThemeClasses.fileButtonBg}`} />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-2">Event Video (Teaser)</label>
                    <input type="file" name="eventVideo" accept="video/*" onChange={handleFileChange} className={`text-sm rounded-lg border cursor-pointer block w-full ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} ${currentThemeClasses.fileButtonBg}`} />
                </div>
            </div>
          </div>

          {/* --- Actions --- */}
          <div className="flex items-center justify-end p-6 border-t ${currentThemeClasses.borderColor} -mx-8 -mb-8 mt-8">
            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting}
              className={`font-bold uppercase px-6 py-3 text-sm rounded shadow outline-none focus:outline-none mr-4 ease-linear transition-all duration-150 text-white ${currentThemeClasses.secondaryButtonBg} disabled:opacity-50`}
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 text-white ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : currentThemeClasses.primaryButtonBg}`}
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;