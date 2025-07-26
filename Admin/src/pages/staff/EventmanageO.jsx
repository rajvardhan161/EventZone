import React, { useState, useContext, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';

const EventmanageO = () => {
  const { backendUrl, organizer } = useContext(AdminContext);
  const { currentTheme } = useTheme();

  // Theme classes (keep this or adapt as needed)
  const themeClasses = {
    light: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      subtleText: 'text-gray-600',
      primaryButtonBg: 'bg-blue-600 hover:bg-blue-700',
      inputBorder: 'border-gray-300',
      focusRing: 'focus:ring-blue-500',
      modalBg: 'bg-white',
      borderColor: 'border-gray-200',
      fileButtonBg: 'file:bg-gray-200 hover:file:bg-gray-300',
      modalCloseButton: 'text-gray-300 hover:text-gray-900',
    },
    dark: {
      bg: 'bg-gray-800',
      text: 'text-gray-100',
      subtleText: 'text-gray-300',
      primaryButtonBg: 'bg-blue-500 hover:bg-blue-600',
      inputBorder: 'border-gray-600',
      focusRing: 'focus:ring-blue-400',
      modalBg: 'bg-gray-700',
      borderColor: 'border-gray-600',
      fileButtonBg: 'file:bg-gray-600 hover:file:bg-gray-500',
      modalCloseButton: 'text-gray-400 hover:text-gray-200',
    }
  };
  const currentThemeClasses = themeClasses[currentTheme] || themeClasses.light;

  const [formData, setFormData] = useState({
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
  });

  const [eventDuration, setEventDuration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Calculate duration when dates change
  useEffect(() => {
    if (formData.eventDate && formData.eventEndDate) {
      const startDate = new Date(formData.eventDate);
      const endDate = new Date(formData.eventEndDate);
      if (!isNaN(startDate) && !isNaN(endDate) && endDate >= startDate) {
        const diffMinutes = Math.round((endDate - startDate) / (1000 * 60));
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        let dur = '';
        if (hours) dur += `${hours} hour${hours > 1 ? 's' : ''}`;
        if (minutes) dur += (dur ? ' ' : '') + `${minutes} minute${minutes > 1 ? 's' : ''}`;
        if (!dur) dur = '0 minutes';
        setEventDuration(dur);
      } else {
        setEventDuration('');
      }
    } else {
      setEventDuration('');
    }
  }, [formData.eventDate, formData.eventEndDate]);

  // Handle input changes (for text, checkbox, etc.)
  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle file inputs
  const handleFileChange = e => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0] || null,
    }));
  };

  // API call to create event
  const createEvent = async (eventFormData) => {
    if (!backendUrl) {
      setError("Backend URL is not configured.");
      return null;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/organizer/creates`, {
        method: 'POST',
        body: eventFormData,
        headers: {
          'Authorization': `Bearer ${organizer}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errMsg = 'Event creation failed';
        if (errorData?.error && typeof errorData.error === 'object') {
          errMsg = Object.values(errorData.error).flat().join(', ');
        } else if (errorData?.message) {
          errMsg = errorData.message;
        }
        throw new Error(errMsg);
      }

      const newEventData = await response.json();
      alert('Event created successfully!');
      return newEventData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.eventName || !formData.eventDate || !formData.eventEndDate || !formData.organizerName || !formData.eventTime) {
      alert('Please fill in all required fields (Event Name, Start Date/Time, End Date/Time, Organizer Name, Event Time).');
      return;
    }

    if (formData.isPaid && (formData.price === null || formData.price === undefined || String(formData.price).trim() === '' || parseFloat(formData.price) < 0)) {
      alert('Please enter a valid price for a paid event.');
      return;
    }

    const limitAsNumber = formData.participantLimit === '' ? null : parseInt(formData.participantLimit, 10);
    if (formData.participantLimit !== '' && (isNaN(limitAsNumber) || limitAsNumber < 0)) {
      alert('Participant limit must be a non-negative number.');
      return;
    }

    const eventFormData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'eventImage' && key !== 'eventVideo' && key !== 'qrCode') {
        eventFormData.append(key, formData[key]);
      }
    });
    if (formData.eventImage) eventFormData.append('image', formData.eventImage);
    if (formData.eventVideo) eventFormData.append('video', formData.eventVideo);
    if (formData.qrCode) eventFormData.append('qrCode', formData.qrCode);

    try {
      await createEvent(eventFormData);
      // Reset form after successful creation
      setFormData({
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
      });
      setEventDuration('');
    } catch (err) {
      // error handled in createEvent
    }
  };

  return (
    <div className={`${currentThemeClasses.bg} ${currentThemeClasses.text} min-h-screen p-6`}>
      <div className={`${currentThemeClasses.modalBg} max-w-3xl mx-auto p-8 rounded-lg shadow-lg`}>
        <h1 className={`text-3xl font-bold mb-6 text-center`}>Create New Event</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="eventName" className="block mb-1 font-semibold">Event Name *</label>
            <input
              type="text"
              id="eventName"
              name="eventName"
              value={formData.eventName}
              onChange={handleInputChange}
              required
              className={`${currentThemeClasses.inputBorder} border rounded w-full py-2 px-3 focus:outline-none ${currentThemeClasses.focusRing} ${currentThemeClasses.bg} ${currentThemeClasses.text}`}
              placeholder="Enter event name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="eventDate" className="block mb-1 font-semibold">Start Date & Time *</label>
              <input
                type="datetime-local"
                id="eventDate"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleInputChange}
                required
                className={`${currentThemeClasses.inputBorder} border rounded w-full py-2 px-3 focus:outline-none ${currentThemeClasses.focusRing} ${currentThemeClasses.bg} ${currentThemeClasses.text}`}
              />
            </div>
            <div>
              <label htmlFor="eventEndDate" className="block mb-1 font-semibold">End Date & Time *</label>
              <input
                type="datetime-local"
                id="eventEndDate"
                name="eventEndDate"
                value={formData.eventEndDate}
                onChange={handleInputChange}
                required
                className={`${currentThemeClasses.inputBorder} border rounded w-full py-2 px-3 focus:outline-none ${currentThemeClasses.focusRing} ${currentThemeClasses.bg} ${currentThemeClasses.text}`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="eventTime" className="block mb-1 font-semibold">Event Time *</label>
            <input
              type="time"
              id="eventTime"
              name="eventTime"
              value={formData.eventTime}
              onChange={handleInputChange}
              required
              className={`${currentThemeClasses.inputBorder} border rounded w-full py-2 px-3 focus:outline-none ${currentThemeClasses.focusRing} ${currentThemeClasses.bg} ${currentThemeClasses.text}`}
            />
          </div>

          <div>
            <label htmlFor="eventDescription" className="block mb-1 font-semibold">Description</label>
            <textarea
              id="eventDescription"
              name="eventDescription"
              value={formData.eventDescription}
              onChange={handleInputChange}
              rows="4"
              className={`${currentThemeClasses.inputBorder} border rounded w-full py-2 px-3 focus:outline-none ${currentThemeClasses.focusRing} ${currentThemeClasses.bg} ${currentThemeClasses.text}`}
              placeholder="Enter event description"
            />
          </div>

          <div>
            <label htmlFor="location" className="block mb-1 font-semibold">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className={`${currentThemeClasses.inputBorder} border rounded w-full py-2 px-3 focus:outline-none ${currentThemeClasses.focusRing} ${currentThemeClasses.bg} ${currentThemeClasses.text}`}
              placeholder="Enter location"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPaid"
                name="isPaid"
                checked={formData.isPaid}
                onChange={handleInputChange}
                className={`h-5 w-5 ${currentThemeClasses.focusRing}`}
              />
              <span className="font-semibold">Is Paid Event?</span>
            </label>
            {formData.isPaid && (
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`${currentThemeClasses.inputBorder} border rounded py-2 px-3 focus:outline-none ${currentThemeClasses.focusRing} w-24 ${currentThemeClasses.bg} ${currentThemeClasses.text}`}
                placeholder="Price"
                required={formData.isPaid}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="organizerName" className="block mb-1 font-semibold">Organizer Name *</label>
              <input
                type="text"
                id="organizerName"
                name="organizerName"
                value={formData.organizerName}
                onChange={handleInputChange}
                required
                className={`${currentThemeClasses.inputBorder} border rounded w-full py-2 px-3 focus:outline-none ${currentThemeClasses.focusRing} ${currentThemeClasses.bg} ${currentThemeClasses.text}`}
                placeholder="Organizer name"
              />
            </div>
            <div>
              <label htmlFor="organizerEmail" className="block mb-1 font-semibold">Organizer Email</label>
              <input
                type="email"
                id="organizerEmail"
                name="organizerEmail"
                value={formData.organizerEmail}
                onChange={handleInputChange}
                className={`${currentThemeClasses.inputBorder} border rounded w-full py-2 px-3 focus:outline-none ${currentThemeClasses.focusRing} ${currentThemeClasses.bg} ${currentThemeClasses.text}`}
                placeholder="Organizer email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="organizerPhone" className="block mb-1 font-semibold">Organizer Phone</label>
            <input
              type="tel"
              id="organizerPhone"
              name="organizerPhone"
              value={formData.organizerPhone}
              onChange={handleInputChange}
              className={`${currentThemeClasses.inputBorder} border rounded w-full py-2 px-3 focus:outline-none ${currentThemeClasses.focusRing} ${currentThemeClasses.bg} ${currentThemeClasses.text}`}
              placeholder="Organizer phone"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="participantLimit" className="block mb-1 font-semibold">Participant Limit</label>
              <input
                type="number"
                id="participantLimit"
                name="participantLimit"
                value={formData.participantLimit}
                onChange={handleInputChange}
                min="0"
                className={`${currentThemeClasses.inputBorder} border rounded w-full py-2 px-3 focus:outline-none ${currentThemeClasses.focusRing} ${currentThemeClasses.bg} ${currentThemeClasses.text}`}
                placeholder="Unlimited"
              />
            </div>
            <div className="flex items-center space-x-2 mt-6">
              <input
                type="checkbox"
                id="allowDutyLeave"
                name="allowDutyLeave"
                checked={formData.allowDutyLeave}
                onChange={handleInputChange}
                className={`h-5 w-5 ${currentThemeClasses.focusRing}`}
              />
              <label htmlFor="allowDutyLeave" className="font-semibold">Allow Duty Leave?</label>
            </div>
          </div>

          {/* Files input */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 font-semibold">Event Image</label>
              <input
                type="file"
                name="eventImage"
                accept="image/*"
                onChange={handleFileChange}
                className={`w-full ${currentThemeClasses.fileButtonBg} ${currentThemeClasses.inputBorder} border rounded py-2 px-3 focus:outline-none ${currentThemeClasses.focusRing}`}
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Event Video</label>
              <input
                type="file"
                name="eventVideo"
                accept="video/*"
                onChange={handleFileChange}
                className={`w-full ${currentThemeClasses.fileButtonBg} ${currentThemeClasses.inputBorder} border rounded py-2 px-3 focus:outline-none ${currentThemeClasses.focusRing}`}
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">QR Code Image</label>
              <input
                type="file"
                name="qrCode"
                accept="image/*"
                onChange={handleFileChange}
                className={`w-full ${currentThemeClasses.fileButtonBg} ${currentThemeClasses.inputBorder} border rounded py-2 px-3 focus:outline-none ${currentThemeClasses.focusRing}`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="eventDuration" className="block mb-1 font-semibold">Duration (calculated)</label>
            <input
              type="text"
              id="eventDuration"
              name="eventDuration"
              value={eventDuration}
              readOnly
              className={`${currentThemeClasses.inputBorder} border rounded w-full py-2 px-3 cursor-not-allowed bg-gray-200 text-gray-700`}
              placeholder="Duration will be calculated automatically"
            />
          </div>

          <div className="text-right">
            <button
              type="submit"
              disabled={isSubmitting || !backendUrl || !organizer}
              className={`px-6 py-2 rounded text-white font-bold ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : currentThemeClasses.primaryButtonBg}`}
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventmanageO;
