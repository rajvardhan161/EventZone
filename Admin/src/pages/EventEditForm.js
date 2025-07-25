// src/components/EventEditForm.js (or wherever you keep your components)
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AdminContext } from '../context/AdminContext'; // Assuming AdminContext provides backendUrl and token
import { useTheme } from '../context/ThemeContext'; // Assuming ThemeContext for styling
import { FaTimes } from 'react-icons/fa'; // Icon for closing

const EventEditForm = ({ eventId, onCancelEdit, onEventUpdated }) => {
  const { backendUrl, token } = useContext(AdminContext);
  const { currentTheme } = useTheme();

  const [eventDetails, setEventDetails] = useState({
    eventName: '',
    eventDate: '',
    location: '',
    description: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const styles = {
    formContainer: {
      backgroundColor: currentTheme.cardBgColor || '#ffffff',
      color: currentTheme.textColor || '#374151',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      border: `1px solid ${currentTheme.borderColor || '#e0e0e0'}`,
      borderRadius: '0.75rem',
      boxShadow: `0 4px 6px -1px ${currentTheme.shadowColor || '#0000001a'}, 0 2px 4px -1px ${currentTheme.shadowColor || '#0000001a'}`,
      padding: '2rem',
      margin: '2rem auto', // Center the form
      maxWidth: '600px', // Limit width
    },
    header: {
      fontSize: '1.75rem',
      fontWeight: '700',
      color: currentTheme.primaryColor || '#4f46e5',
      fontFamily: currentTheme.sectionTitleFont || currentTheme.fontFamily || 'sans-serif',
      marginBottom: '1.5rem',
      textAlign: 'center',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '500',
      color: currentTheme.textColor || '#374151',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      marginBottom: '1rem',
      border: `1px solid ${currentTheme.borderColor || '#e0e0e0'}`,
      borderRadius: '0.375rem',
      backgroundColor: currentTheme.inputBgColor || '#f9fafb',
      color: currentTheme.textColor || '#374151',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      outline: 'none',
      '&:focus': {
        borderColor: currentTheme.primaryColor || '#4f46e5',
        boxShadow: `0 0 0 3px ${currentTheme.primaryColor}1a`,
      },
    },
    textArea: {
      width: '100%',
      padding: '0.75rem',
      marginBottom: '1rem',
      border: `1px solid ${currentTheme.borderColor || '#e0e0e0'}`,
      borderRadius: '0.375rem',
      backgroundColor: currentTheme.inputBgColor || '#f9fafb',
      color: currentTheme.textColor || '#374151',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      minHeight: '100px',
      resize: 'vertical',
      outline: 'none',
      '&:focus': {
        borderColor: currentTheme.primaryColor || '#4f46e5',
        boxShadow: `0 0 0 3px ${currentTheme.primaryColor}1a`,
      },
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem',
      marginTop: '1.5rem',
    },
    cancelButton: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.375rem',
      backgroundColor: currentTheme.textColorMuted || '#6c757d',
      color: '#ffffff',
      fontWeight: '600',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      transition: 'background-color 0.3s ease',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#5a6268',
      },
    },
    saveButton: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.375rem',
      backgroundColor: currentTheme.primaryColor || '#4f46e5',
      color: '#ffffff',
      fontWeight: '600',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      transition: 'background-color 0.3s ease',
      cursor: isSaving ? 'not-allowed' : 'pointer',
      opacity: isSaving ? '0.7' : '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '&:hover': {
        backgroundColor: isSaving ? currentTheme.primaryColor || '#4f46e5' : '#3a36c7',
      },
    },
    spinner: {
      color: '#ffffff',
      height: '1.25rem', width: '1.25rem', borderWidth: '2px', borderTopColor: 'transparent',
      borderRadius: '9999px', animation: 'spin 1s linear infinite',
      marginRight: '0.5rem',
    },
    closeButton: {
      fontSize: '1.5rem',
      color: currentTheme.textColorMuted || '#6c757d',
      cursor: 'pointer',
      transition: 'color 0.3s ease',
      '&:hover': {
        color: currentTheme.errorColor || '#dc2626',
      },
    },
    errorContainer: {
      color: currentTheme.errorColor || '#dc2626',
      textAlign: 'center',
      marginTop: '1rem',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
    },
    loadingText: {
      fontSize: '1.125rem',
      marginLeft: '0.75rem',
      color: currentTheme.textColor || '#374151',
    },
  };

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const response = await axios.get(`${backendUrl}/api/event/future-events/${eventId}`, { // Assuming an endpoint to get single event by ID
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Adjust date format for input type="datetime-local"
        const eventDateLocal = new Date(response.data.eventDate).toISOString().slice(0, 16);
        setEventDetails({
          ...response.data,
          eventDate: eventDateLocal,
        });
      } catch (error) {
        console.error('Error fetching event details:', error);
        setErrorMsg(error.response?.data?.message || 'Failed to load event details.');
        toast.error('Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };

    if (eventId && backendUrl && token) {
      fetchEvent();
    } else if (!eventId) {
      setErrorMsg("No event ID provided for editing.");
      setLoading(false);
    }
  }, [eventId, backendUrl, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventDetails(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    try {
      const response = await axios.put(`${backendUrl}/api/event/future-events/${eventId}`, eventDetails, { // Assuming a PUT endpoint for updates
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Event updated successfully!');
      onEventUpdated(response.data); // Notify parent that event was updated
      onCancelEdit(); // Close the edit form
    } catch (error) {
      console.error('Error updating event:', error);
      setErrorMsg(error.response?.data?.message || 'Failed to update event.');
      toast.error('Failed to update event.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full" style={styles.formContainer}>
      <div style={styles.header}>
        <span>Edit Event</span>
        <FaTimes style={styles.closeButton} onClick={onCancelEdit} />
      </div>

      {loading && (
        <div style={styles.loadingContainer}>
          <div className="flex items-center">
            <div className="animate-spin rounded-full border-t-4 border-solid border-blue-500 h-8 w-8 mr-3" style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading event details...</p>
          </div>
        </div>
      )}

      {!loading && errorMsg && (
        <p style={styles.errorContainer}>
          {errorMsg}
        </p>
      )}

      {!loading && !errorMsg && (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="eventName" style={styles.label}>Event Name</label>
            <input
              type="text"
              id="eventName"
              name="eventName"
              value={eventDetails.eventName}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div>
            <label htmlFor="eventDate" style={styles.label}>Event Date & Time</label>
            <input
              type="datetime-local"
              id="eventDate"
              name="eventDate"
              value={eventDetails.eventDate}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div>
            <label htmlFor="location" style={styles.label}>Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={eventDetails.location}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div>
            <label htmlFor="imageUrl" style={styles.label}>Image URL</label>
            <input
              type="text"
              id="imageUrl"
              name="imageUrl"
              value={eventDetails.imageUrl}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div>
            <label htmlFor="description" style={styles.label}>Description</label>
            <textarea
              id="description"
              name="description"
              value={eventDetails.description}
              onChange={handleChange}
              style={styles.textArea}
            ></textarea>
          </div>

          {errorMsg && <p style={styles.errorContainer}>{errorMsg}</p>}

          <div style={styles.buttonContainer}>
            <button
              type="button"
              onClick={onCancelEdit}
              style={styles.cancelButton}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.saveButton}
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="animate-spin rounded-full border-t-2 border-white h-5 w-5 mr-2" style={styles.spinner}></div>
              ) : null}
              Save Changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EventEditForm;