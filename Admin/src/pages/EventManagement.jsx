// src/pages/Admin/Events/EventManagement.js

import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext'; // Assuming this path
import debounce from 'lodash.debounce'; // For debouncing search
import { useNavigate } from 'react-router-dom';

const EventManagement = () => {
  const { backendUrl, token } = useContext(AdminContext);
  const navigate = useNavigate();
  const { currentTheme } = useTheme(); // Get the current theme

  // --- Theme-related styles ---
  const themeClasses = {
    light: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      subtleText: 'text-gray-600',
      primaryButtonBg: 'bg-blue-600 hover:bg-blue-700',
      deleteButtonBg: 'text-red-600 hover:text-red-900',
      editButtonBg: 'text-indigo-600 hover:text-indigo-900',
      tableHeaderBg: 'bg-gray-50',
      tableRowBg: 'bg-white',
      modalBg: 'bg-white',
      borderColor: 'border-gray-200',
      focusRing: 'focus:ring-blue-500',
      inputBorder: 'border-gray-300',
      fileButtonBg: 'file:bg-gray-200 hover:file:bg-gray-300',
      modalCloseButton: 'text-gray-300 hover:text-gray-900',
      tableDataHover: 'hover:bg-gray-50', // For table rows
    },
    dark: {
      bg: 'bg-gray-800',
      text: 'text-gray-100',
      subtleText: 'text-gray-300',
      primaryButtonBg: 'bg-blue-500 hover:bg-blue-600',
      deleteButtonBg: 'text-red-400 hover:text-red-300',
      editButtonBg: 'text-indigo-400 hover:text-indigo-300',
      tableHeaderBg: 'bg-gray-700',
      tableRowBg: 'bg-gray-700',
      modalBg: 'bg-gray-700',
      borderColor: 'border-gray-600',
      focusRing: 'focus:ring-blue-400',
      inputBorder: 'border-gray-600',
      fileButtonBg: 'file:bg-gray-600 hover:file:bg-gray-500',
      modalCloseButton: 'text-gray-400 hover:text-gray-200',
      tableDataHover: 'hover:bg-gray-600', // For table rows
    }
  };

  const currentThemeClasses = themeClasses[currentTheme] || themeClasses.light; // Default to light

  // --- State for Events List ---
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]); // For search results
  const [isFetchingList, setIsFetchingList] = useState(false);
  const [error, setError] = useState(null);

  // --- State for Search ---
  const [searchTerm, setSearchTerm] = useState('');

  // --- State for Modal/Form ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null); // For editing an event
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- State for Media Viewing Modals ---
  const [viewingMedia, setViewingMedia] = useState(null); // { type: 'image' | 'video', url: '...' }
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);
  const [qrCodeImageUrl, setQrCodeImageUrl] = useState('');

  // --- State for Form Inputs ---
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
    // New fields
    participantLimit: '',
    allowDutyLeave: false,
    // File inputs
    eventImage: null,
    eventVideo: null,
    qrCode: null,
  });

  // --- State for Calculated Duration ---
  const [eventDuration, setEventDuration] = useState('');

  // --- Auto-fill eventTime from eventDate ---
  useEffect(() => {
    if (formData.eventDate) {
      try {
        const dateObj = new Date(formData.eventDate);
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const timeString = `${hours}:${minutes}`;

        if (formData.eventTime !== timeString) {
          setFormData(prev => ({
            ...prev,
            eventTime: timeString,
          }));
        }
      } catch (e) {
        console.error("Error parsing date for auto-filling event time:", e);
      }
    }
  }, [formData.eventDate]);

  // --- Calculate and display event duration ---
  useEffect(() => {
    if (formData.eventDate && formData.eventEndDate) {
      try {
        const startDate = new Date(formData.eventDate);
        const endDate = new Date(formData.eventEndDate);

        if (!isNaN(startDate) && !isNaN(endDate) && endDate >= startDate) {
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
          if (!durationString) {
            durationString = '0 minutes'; // Handle cases where start and end are the same
          }
          setEventDuration(durationString);
        } else {
          setEventDuration(''); // Clear duration if dates are invalid or end is before start
        }
      } catch (e) {
        console.error("Error calculating event duration:", e);
        setEventDuration('');
      }
    } else {
      setEventDuration(''); // Clear duration if either date is missing
    }
  }, [formData.eventDate, formData.eventEndDate]);


  // --- API Helper Functions ---

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // Fetch all events
  const fetchAllEvents = useCallback(async () => {
    if (!backendUrl || !token) {
      setError("Authentication or backend URL missing.");
      return;
    }
    setIsFetchingList(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/event/allevent`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch events');
      }
      const data = await response.json();
      const formattedData = data.map(event => ({
        ...event,
        eventDate: event.eventDate ? new Date(event.eventDate).toISOString().slice(0, 16) : '',
        eventEndDate: event.eventEndDate ? new Date(event.eventEndDate).toISOString().slice(0, 16) : '',
        participantLimit: event.participantLimit === null ? '' : String(event.participantLimit),
        allowDutyLeave: !!event.allowDutyLeave,
      }));
      setEvents(formattedData);
      setFilteredEvents(formattedData);
    } catch (err) {
      setError(err.message);
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setIsFetchingList(false);
    }
  }, [backendUrl, token]);

  // Fetch single event by ID
  const fetchEventById = async (eventId) => {
    if (!backendUrl || !token) {
      setError("Authentication or backend URL missing.");
      return null;
    }
    try {
      const response = await fetch(`${backendUrl}/api/event/event/${eventId}`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch event');
      }
      const event = await response.json();
      return {
        ...event,
        eventDate: event.eventDate ? new Date(event.eventDate).toISOString().slice(0, 16) : '',
        eventEndDate: event.eventEndDate ? new Date(event.eventEndDate).toISOString().slice(0, 16) : '',
        eventTime: event.eventDate ? new Date(event.eventDate).toISOString().slice(11, 16) : '',
        participantLimit: event.participantLimit === null ? '' : String(event.participantLimit),
        allowDutyLeave: !!event.allowDutyLeave,
      };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Create Event
  const createEvent = async (eventFormData) => {
    if (!backendUrl) {
      setError("Backend URL is not configured.");
      return null;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/event/create`, {
        method: 'POST',
        body: eventFormData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = 'Event creation failed';
        if (errorData?.error && typeof errorData.error === 'object') {
          errorMessage = Object.values(errorData.error).flat().join(', ');
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
        throw new Error(errorMessage);
      }
      const newEventData = await response.json();
      const savedEvent = {
        ...newEventData.event,
        participantLimit: newEventData.event.participantLimit === null ? '' : String(newEventData.event.participantLimit),
        allowDutyLeave: !!newEventData.event.allowDutyLeave,
        eventDate: newEventData.event.eventDate ? new Date(newEventData.event.eventDate).toISOString().slice(0, 16) : '',
        eventEndDate: newEventData.event.eventEndDate ? new Date(newEventData.event.eventEndDate).toISOString().slice(0, 16) : '',
      };
      setEvents(prevEvents => [...prevEvents, savedEvent]);
      setFilteredEvents(prevFiltered => [...prevFiltered, savedEvent]);
      alert('Event created successfully!');
      return newEventData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Event
  const updateEvent = async (eventId, eventData) => {
    if (!backendUrl || !token) {
      setError("Authentication or backend URL missing.");
      return null;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/event/update/${eventId}`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Event update failed');
      }
      const updatedEventData = await response.json();
      const updatedEvent = {
        ...updatedEventData.event,
        participantLimit: updatedEventData.event.participantLimit === null ? '' : String(updatedEventData.event.participantLimit),
        allowDutyLeave: !!updatedEventData.event.allowDutyLeave,
        eventDate: updatedEventData.event.eventDate ? new Date(updatedEventData.event.eventDate).toISOString().slice(0, 16) : '',
        eventEndDate: updatedEventData.event.eventEndDate ? new Date(updatedEventData.event.eventEndDate).toISOString().slice(0, 16) : '',
      };

      setEvents(prevEvents =>
        prevEvents.map(event => (event._id === eventId ? updatedEvent : event))
      );
      setFilteredEvents(prevFiltered =>
        prevFiltered.map(event => (event._id === eventId ? updatedEvent : event))
      );
      alert('Event updated successfully!');
      return updatedEventData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Event
  const deleteEvent = async (eventId) => {
    if (!backendUrl || !token) {
      setError("Authentication or backend URL missing.");
      return;
    }
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch(`${backendUrl}/api/event/event/delete/${eventId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Event deletion failed');
      }
      setEvents(prevEvents => prevEvents.filter(event => event._id !== eventId));
      setFilteredEvents(prevFiltered => prevFiltered.filter(event => event._id !== eventId));
      alert('Event deleted successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Effect to fetch events on mount ---
  useEffect(() => {
    fetchAllEvents();
  }, [fetchAllEvents]);

  // --- Debounced Search Logic ---
  const debouncedSearch = useCallback(
    debounce((query) => {
      const lowerCaseQuery = query.toLowerCase();
      const filtered = events.filter(event =>
        event.eventName.toLowerCase().includes(lowerCaseQuery) ||
        (event.location && event.location.toLowerCase().includes(lowerCaseQuery)) ||
        (event.organizerName && event.organizerName.toLowerCase().includes(lowerCaseQuery))
      );
      setFilteredEvents(filtered);
    }, 300),
    [events]
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  // --- Handlers for Form ---
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

  const handleOpenCreateForm = () => {
    setIsEditing(false);
    setCurrentEvent(null);
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
    setEventDuration(''); // Reset duration when opening new form
    setIsFormOpen(true);
  };

  const handleOpenEditForm = async (eventId) => {
    try {
      const event = await fetchEventById(eventId);
      if (event) {
        setCurrentEvent(event);
        setFormData({
          eventName: event.eventName || '',
          eventDate: event.eventDate || '',
          eventEndDate: event.eventEndDate || '',
          eventTime: event.eventTime || '',
          eventDescription: event.eventDescription || '',
          location: event.location || '',
          isPaid: event.isPaid || false,
          price: event.price || 0,
          organizerName: event.organizerName || '',
          organizerEmail: event.organizerEmail || '',
          organizerPhone: event.organizerPhone || '',
          participantLimit: event.participantLimit || '',
          allowDutyLeave: event.allowDutyLeave || false,
          eventImage: null,
          eventVideo: null,
          qrCode: null,
        });
        // When editing, the duration will be calculated by the useEffect hook,
        // so we don't need to explicitly set eventDuration here unless we want to display it immediately on load.
        // The useEffect will pick up the initial formData.eventDate and formData.eventEndDate.

        setIsEditing(true);
        setIsFormOpen(true);
      }
    } catch (err) {
      // Error is handled by fetchEventById
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setIsEditing(false);
    setCurrentEvent(null);
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
    setEventDuration(''); // Clear duration on close as well
  };

  const handleSubmit = async (e) => {
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

    if (isEditing && currentEvent) {
      const dataToUpdate = {
        eventName: formData.eventName,
        eventDate: formData.eventDate,
        eventEndDate: formData.eventEndDate,
        eventTime: formData.eventTime,
        eventDescription: formData.eventDescription,
        location: formData.location,
        isPaid: formData.isPaid,
        price: formData.isPaid ? parseFloat(formData.price) : 0,
        organizerName: formData.organizerName,
        organizerEmail: formData.organizerEmail,
        organizerPhone: formData.organizerPhone,
        participantLimit: formData.participantLimit === '' ? null : limitAsNumber,
        allowDutyLeave: formData.allowDutyLeave,
      };
      try {
        await updateEvent(currentEvent._id, dataToUpdate);
        handleCloseForm();
      } catch (err) {
        // Error already displayed by updateEvent
      }
    } else {
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
        handleCloseForm();
      } catch (err) {
        // Error already displayed by createEvent
      }
    }
  };

  // --- Handlers for Media Viewing Modals ---
  const openMediaModal = (type, url) => {
    setViewingMedia({ type, url });
  };

  const closeMediaModal = () => {
    setViewingMedia(null);
  };

  const openQrCodeModal = (qrCodeUrl) => {
    if (!qrCodeUrl) {
      setError("QR code image not available.");
      return;
    }
    setQrCodeImageUrl(qrCodeUrl);
    setQrCodeModalOpen(true);
  };

  const closeQrCodeModal = () => {
    setQrCodeModalOpen(false);
    setQrCodeImageUrl('');
  };

  // --- Render JSX ---
  return (
    <div className={`${currentThemeClasses.bg} ${currentThemeClasses.text} min-h-screen p-6`}>
      <div className={`${currentThemeClasses.modalBg} container mx-auto rounded-lg shadow-xl p-8`}>
        <h1 className={`text-3xl font-bold text-center mb-6 ${currentThemeClasses.text}`}>Event Management</h1>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-3 sm:space-y-0">
          <button
            onClick={handleOpenCreateForm}
            disabled={isSubmitting || !backendUrl || !token}
            className={`font-semibold py-2 px-4 rounded-md transition duration-200 ${currentThemeClasses.primaryButtonBg} text-white
                        ${(isSubmitting || !backendUrl || !token) ? 'disabled:bg-gray-400 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Processing...' : 'Add New Event'}
          </button>
          {!backendUrl || !token ? (
            <p className="text-red-500 font-medium text-center">Please configure backend URL and ensure you are logged in.</p>
          ) : null}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search events by name, location, or organizer..."
            value={searchTerm}
            onChange={handleSearch}
            className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none ${currentThemeClasses.focusRing} ${currentThemeClasses.inputBorder}`}
          />
        </div>

        {error && (
          <div className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 ${currentThemeClasses.subtleText}`} role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {isFetchingList ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className={`ml-3 ${currentThemeClasses.subtleText}`}>Loading events...</p>
          </div>
        ) : !error && filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <p className={` ${currentThemeClasses.subtleText}`}>No events found. Add one to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y">
              <thead className={`${currentThemeClasses.tableHeaderBg}`}>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Media</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Limits</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duty Leave</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className={`${currentThemeClasses.tableRowBg} divide-y ${currentThemeClasses.borderColor}`}>
                {filteredEvents.map(event => (
                  <tr key={event._id} className={currentThemeClasses.tableDataHover}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${currentThemeClasses.text}`}>{event.eventName}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentThemeClasses.subtleText}`}>
                      {event.eventDate ? `${new Date(event.eventDate).toLocaleDateString()} ${event.eventTime || ''}` : 'N/A'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentThemeClasses.subtleText}`}>{event.location || 'N/A'}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentThemeClasses.subtleText}`}>
                      {event.eventImageURL ? (
                        <button
                          onClick={() => openMediaModal('image', event.eventImageURL)}
                          className={`hover:underline ${currentThemeClasses.editButtonBg}`}
                        >
                          Image
                        </button>
                      ) : null}
                      {event.eventImageURL && event.eventVideoURL ? ' / ' : null}
                      {event.eventVideoURL ? (
                        <button
                          onClick={() => openMediaModal('video', event.eventVideoURL)}
                          className={`hover:underline ${currentThemeClasses.editButtonBg}`}
                        >
                          Video
                        </button>
                      ) : (
                        !event.eventImageURL && <span>No Media</span>
                      )}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentThemeClasses.subtleText}`}>
                      {event.isPaid ? (
                        <div className="flex items-center">
                          <span className="text-green-600 font-semibold">Paid</span>
                          {event.qrCodeImageURL && (
                            <button
                              onClick={() => openQrCodeModal(event.qrCodeImageURL)}
                              className={`ml-2 hover:text-yellow-800 focus:outline-none ${currentThemeClasses.editButtonBg}`}
                              title="View QR Code"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 2a2 2 0 00-2 2v3H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-3a2 2 0 00-2-2h-3a2 2 0 00-2-2H10V4zm-6 8a2 2 0 110 4 2 2 0 010-4zM10 14a2 2 0 110 4 2 2 0 010-4zm6-4a2 2 0 110 4 2 2 0 010-4z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ) : (
                        <span>Free</span>
                      )}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentThemeClasses.subtleText}`}>
                      {event.participantLimit !== null && event.participantLimit !== ''
                        ? `${event.participantLimit} people`
                        : 'Unlimited'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${currentThemeClasses.subtleText}`}>
                      {event.allowDutyLeave ? 'Yes' : 'No'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2`}>
                      <button
                        onClick={() => handleOpenEditForm(event._id)}
                        disabled={isSubmitting || !backendUrl || !token}
                        className={`focus:outline-none ${currentThemeClasses.editButtonBg}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteEvent(event._id)}
                        disabled={isSubmitting || !backendUrl || !token}
                        className={`focus:outline-none ${currentThemeClasses.deleteButtonBg}`}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => navigate(`/event-details/${event._id}`)}
                        className={`focus:outline-none px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 ${currentTheme === 'dark' ? 'bg-indigo-700 hover:bg-indigo-800' : ''}`}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Event Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden outline-none focus:outline-none bg-black bg-opacity-50">
          <div className="relative w-full max-w-3xl p-6 mx-auto my-6">
            <div className={`${currentThemeClasses.modalBg} border-0 rounded-lg shadow-lg relative flex flex-col w-full outline-none focus:outline-none`}>
              <div className={`flex items-start justify-between p-5 border-b ${currentThemeClasses.borderColor} rounded-t`}>
                <h3 className={`text-2xl font-semibold ${currentThemeClasses.text}`}>
                  {isEditing ? 'Edit Event' : 'Create New Event'}
                </h3>
                <button
                  className={`p-1 ml-auto bg-transparent border-0 text-3xl leading-none font-semibold outline-none focus:outline-none ${currentThemeClasses.modalCloseButton}`}
                  onClick={handleCloseForm}
                >
                  ×
                </button>
              </div>

              <div className="relative p-6 flex-auto overflow-y-auto max-h-[75vh]">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="col-span-2">
                      <label className={`block text-sm font-bold mb-2 ${currentThemeClasses.text}`} htmlFor="eventName">Event Name</label>
                      <input
                        id="eventName" name="eventName" value={formData.eventName} onChange={handleInputChange}
                        className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none ${currentThemeClasses.focusRing}`}
                        type="text" placeholder="Enter event name" required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${currentThemeClasses.text}`} htmlFor="eventDate">Start Date & Time</label>
                      <input
                        id="eventDate" name="eventDate" value={formData.eventDate} onChange={handleInputChange}
                        className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none ${currentThemeClasses.focusRing}`}
                        type="datetime-local" required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${currentThemeClasses.text}`} htmlFor="eventEndDate">End Date & Time</label>
                      <input
                        id="eventEndDate" name="eventEndDate" value={formData.eventEndDate} onChange={handleInputChange}
                        className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none ${currentThemeClasses.focusRing}`}
                        type="datetime-local" required
                      />
                    </div>
                  </div>

                  {/* Display Duration */}
                  <div className="mb-4">
                    <label className={`block text-sm font-bold mb-2 ${currentThemeClasses.text}`} htmlFor="eventDuration">Duration</label>
                    <input
                      id="eventDuration"
                      name="eventDuration"
                      value={eventDuration}
                      readOnly // Make it read-only
                      className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none ${currentThemeClasses.focusRing} cursor-not-allowed`}
                      placeholder="Calculated duration"
                    />
                  </div>

                  <div className="mb-4">
                    <label className={`block text-sm font-bold mb-2 ${currentThemeClasses.text}`} htmlFor="eventTime">Event Time (Specific)</label>
                    <input
                      id="eventTime" name="eventTime" value={formData.eventTime} onChange={handleInputChange}
                      className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none ${currentThemeClasses.focusRing}`}
                      type="time"
                    />
                  </div>
                  <div className="mb-4">
                    <label className={`block text-sm font-bold mb-2 ${currentThemeClasses.text}`} htmlFor="location">Location</label>
                    <input
                      id="location" name="location" value={formData.location} onChange={handleInputChange}
                      className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none ${currentThemeClasses.focusRing}`}
                      type="text" placeholder="Enter event location"
                    />
                  </div>

                  <div className="mb-4">
                    <label className={`block text-sm font-bold mb-2 ${currentThemeClasses.text}`} htmlFor="eventDescription">Description</label>
                    <textarea
                      id="eventDescription" name="eventDescription" value={formData.eventDescription} onChange={handleInputChange}
                      className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow appearance-none border rounded w-full py-2 px-3 h-32 resize-none focus:outline-none ${currentThemeClasses.focusRing}`}
                      placeholder="Enter event description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center">
                      <input
                        id="isPaid" name="isPaid" type="checkbox" checked={formData.isPaid} onChange={handleInputChange}
                        className={`mr-2 h-5 w-5 text-blue-600 rounded ${currentThemeClasses.focusRing}`}
                      />
                      <label className={`text-sm font-bold ${currentThemeClasses.text}`} htmlFor="isPaid">Is Paid Event?</label>
                    </div>
                    {formData.isPaid && (
                      <div className="flex items-center">
                        <label className={`text-sm font-bold mr-2 ${currentThemeClasses.text}`} htmlFor="price">Price:</label>
                        <input
                          id="price" name="price" value={formData.price} onChange={handleInputChange}
                          className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow appearance-none border rounded py-2 px-3 leading-tight focus:outline-none ${currentThemeClasses.focusRing} w-24`}
                          type="number" min="0" step="0.01" placeholder="0.00"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${currentThemeClasses.text}`} htmlFor="organizerName">Organizer Name</label>
                      <input
                        id="organizerName" name="organizerName" value={formData.organizerName} onChange={handleInputChange}
                        className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none ${currentThemeClasses.focusRing}`}
                        type="text" placeholder="Organizer's name" required
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${currentThemeClasses.text}`} htmlFor="organizerEmail">Organizer Email</label>
                      <input
                        id="organizerEmail" name="organizerEmail" value={formData.organizerEmail} onChange={handleInputChange}
                        className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none ${currentThemeClasses.focusRing}`}
                        type="email" placeholder="Organizer's email"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className={`block text-sm font-bold mb-2 ${currentThemeClasses.text}`} htmlFor="organizerPhone">Organizer Phone</label>
                    <input
                      id="organizerPhone" name="organizerPhone" value={formData.organizerPhone} onChange={handleInputChange}
                      className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none ${currentThemeClasses.focusRing}`}
                      type="tel" placeholder="Organizer's phone"
                    />
                  </div>

                  {/* New Fields for Participant Limit and Duty Leave */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${currentThemeClasses.text}`} htmlFor="participantLimit">Participant Limit</label>
                      <input
                        id="participantLimit" name="participantLimit" value={formData.participantLimit} onChange={handleInputChange}
                        className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none ${currentThemeClasses.focusRing}`}
                        type="number" min="0" placeholder="Unlimited"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        id="allowDutyLeave" name="allowDutyLeave" type="checkbox" checked={formData.allowDutyLeave} onChange={handleInputChange}
                        className={`mr-2 h-5 w-5 text-blue-600 rounded ${currentThemeClasses.focusRing}`}
                      />
                      <label className={`text-sm font-bold ${currentThemeClasses.text}`} htmlFor="allowDutyLeave">Allow Duty Leave?</label>
                    </div>
                  </div>

                  {/* File Uploads */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${currentThemeClasses.text}`}>Event Image</label>
                      <input
                        type="file" name="eventImage" accept="image/*" onChange={handleFileChange}
                        className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none ${currentThemeClasses.focusRing} border-dashed ${currentThemeClasses.inputBorder} ${currentThemeClasses.fileButtonBg}`}
                      />
                      {isEditing && currentEvent?.eventImageURL && (
                        <p className={`text-xs ${currentThemeClasses.subtleText} mt-1`}>Current: <a href={currentEvent.eventImageURL} target="_blank" rel="noopener noreferrer" className={`hover:underline ${currentThemeClasses.editButtonBg}`}>Image File</a></p>
                      )}
                    </div>
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${currentThemeClasses.text}`}>Event Video</label>
                      <input
                        type="file" name="eventVideo" accept="video/*" onChange={handleFileChange}
                        className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none ${currentThemeClasses.focusRing} border-dashed ${currentThemeClasses.inputBorder} ${currentThemeClasses.fileButtonBg}`}
                      />
                      {isEditing && currentEvent?.eventVideoURL && (
                        <p className={`text-xs ${currentThemeClasses.subtleText} mt-1`}>Current: <a href={currentEvent.eventVideoURL} target="_blank" rel="noopener noreferrer" className={`hover:underline ${currentThemeClasses.editButtonBg}`}>Video File</a></p>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className={`block text-sm font-bold mb-2 ${currentThemeClasses.text}`}>QR Code Image</label>
                    <input
                      type="file" name="qrCode" accept="image/*" onChange={handleFileChange}
                      className={`${currentThemeClasses.bg} ${currentThemeClasses.text} ${currentThemeClasses.inputBorder} shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none ${currentThemeClasses.focusRing} border-dashed ${currentThemeClasses.inputBorder} ${currentThemeClasses.fileButtonBg}`}
                    />
                    {isEditing && currentEvent?.qrCodeImageURL && (
                      <p className={`text-xs ${currentThemeClasses.subtleText} mt-1`}>Current: <a href={currentEvent.qrCodeImageURL} target="_blank" rel="noopener noreferrer" className={`hover:underline ${currentThemeClasses.editButtonBg}`}>QR Code File</a></p>
                    )}
                  </div>

                  <div className={`flex items-center justify-end p-6 border-t ${currentThemeClasses.borderColor} rounded-b`}>
                    <button
                      type="button" className={`font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 ${currentThemeClasses.deleteButtonBg}`}
                      onClick={handleCloseForm} disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit" className={`font-bold uppercase text-sm px-6 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 text-white ${isSubmitting ? 'bg-gray-400' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : (isEditing ? 'Update Event' : 'Create Event')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Viewer Modal (Image/Video) */}
      {viewingMedia && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden outline-none focus:outline-none bg-black bg-opacity-75 ${currentThemeClasses.bg}`} onClick={closeMediaModal}>
          <div className="relative w-full max-w-3xl p-6 mx-auto my-6" onClick={(e) => e.stopPropagation()}>
            <div className={`${currentThemeClasses.modalBg} relative rounded-lg shadow-xl`}>
              <div className={`flex items-start justify-between p-5 border-b ${currentThemeClasses.borderColor} rounded-t`}>
                <h3 className={`text-2xl font-semibold ${currentThemeClasses.text}`}>
                  {viewingMedia.type === 'image' ? 'Event Image' : 'Event Video'}
                </h3>
                <button
                  className={`p-1 ml-auto bg-transparent border-0 text-3xl leading-none font-semibold outline-none focus:outline-none ${currentThemeClasses.modalCloseButton}`}
                  onClick={closeMediaModal}
                >
                  ×
                </button>
              </div>
              <div className="p-6 text-center">
                {viewingMedia.type === 'image' ? (
                  <img src={viewingMedia.url} alt="Event Media" className="max-w-full max-h-[70vh] mx-auto object-contain" />
                ) : (
                  <video controls width="640" height="360" className="max-w-full mx-auto">
                    <source src={viewingMedia.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
              <div className={`flex items-center justify-end p-6 border-t ${currentThemeClasses.borderColor} rounded-b`}>
                <button
                  className={`text-white font-bold py-2 px-4 rounded ${currentThemeClasses.primaryButtonBg}`}
                  onClick={closeMediaModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrCodeModalOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden outline-none focus:outline-none bg-black bg-opacity-75 ${currentThemeClasses.bg}`} onClick={closeQrCodeModal}>
          <div className="relative w-full max-w-sm p-6 mx-auto my-6" onClick={(e) => e.stopPropagation()}>
            <div className={`${currentThemeClasses.modalBg} relative rounded-lg shadow-xl`}>
              <div className={`flex items-start justify-between p-5 border-b ${currentThemeClasses.borderColor} rounded-t`}>
                <h3 className={`text-2xl font-semibold ${currentThemeClasses.text}`}>QR Code</h3>
                <button
                  className={`p-1 ml-auto bg-transparent border-0 text-3xl leading-none font-semibold outline-none focus:outline-none ${currentThemeClasses.modalCloseButton}`}
                  onClick={closeQrCodeModal}
                >
                  ×
                </button>
              </div>
              <div className="p-6 text-center">
                <img src={qrCodeImageUrl} alt="Event QR Code" className="w-full h-auto object-contain" />
                <p className={`text-sm mt-3 ${currentThemeClasses.subtleText}`}>Scan with your device.</p>
              </div>
              <div className={`flex items-center justify-end p-6 border-t ${currentThemeClasses.borderColor} rounded-b`}>
                <button
                  className={`text-white font-bold py-2 px-4 rounded ${currentThemeClasses.primaryButtonBg}`}
                  onClick={closeQrCodeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;