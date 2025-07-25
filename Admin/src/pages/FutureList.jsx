import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { FaCalendarAlt, FaMapMarkerAlt, FaTrashAlt, FaEdit, FaCheckCircle, FaTimes, FaVideo } from 'react-icons/fa'; // Added FaVideo
import { toast } from 'react-toastify';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress, Box, Typography, IconButton, Checkbox } from '@mui/material';
import { styled } from '@mui/material/styles';

// --- Material-UI Customization ---
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const FileUploadInput = styled('input')(({ theme }) => ({
  display: 'none', // Hidden input that we trigger with a button
}));

const CustomUploadButton = styled(Button)(({ theme }) => ({
  // Apply theme properties to the button
  backgroundColor: theme.palette.primary.main, // Example: use primary from theme
  color: '#ffffff',
  fontFamily: theme.typography.fontFamily,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark, // Example: darker shade on hover
  },
}));

const FutureEventsList = () => {
  const { backendUrl, token } = useContext(AdminContext);
  const { currentTheme } = useTheme();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDeleting, setIsDeleting] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null); // For selection/highlighting

  // --- State for Editing ---
  const [isEditing, setIsEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState({
    _id: '',
    eventName: '',
    eventDate: '',
    location: '',
    description: '',
    imageUrl: '', // This will hold the *current* URL, not the file object
    isPaid: false, // Ensure it's a boolean
    organizerName: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // --- State for File Uploads ---
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const imageInputRef = useRef(null); // Ref for the image file input
  const videoInputRef = useRef(null); // Ref for the video file input

  // --- Themed Styles ---
  const getThemedStyles = () => ({
    container: {
      backgroundColor: currentTheme.background || '#f9fafb',
      color: currentTheme.textColor || '#374151',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      padding: '2rem',
    },
    header: {
      fontSize: '2rem',
      fontWeight: '700',
      color: currentTheme.primaryColor || '#4f46e5',
      fontFamily: currentTheme.sectionTitleFont || currentTheme.fontFamily || 'sans-serif',
      marginBottom: '2rem',
      textAlign: 'center',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    thead: {
      backgroundColor: currentTheme.footerBg || '#f3f4f6', // A lighter background for header
      fontFamily: currentTheme.fontFamily || 'sans-serif',
    },
    th: {
      padding: '1rem',
      fontSize: '0.875rem', // Smaller font for headers
      fontWeight: '600',
      color: currentTheme.textColorMuted || '#6c757d',
      textTransform: 'uppercase',
      textAlign: 'left',
    },
    td: {
      padding: '1rem',
      fontSize: '0.95rem', // Slightly larger font for data cells
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      color: currentTheme.textColor || '#374151',
      borderTop: `1px solid ${currentTheme.borderColor || '#e0e0e0'}`,
    },
    rowHover: {
      backgroundColor: currentTheme.hoverBgColor || '#f9fafb', // Subtle hover effect
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '300px',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
    },
    spinner: {
      color: currentTheme.primaryColor || '#4f46e5',
      height: '2rem', width: '2rem', borderWidth: '3px', borderTopColor: 'transparent',
      borderRadius: '9999px', animation: 'spin 1s linear infinite',
    },
    loadingText: {
      fontSize: '1.125rem',
      marginLeft: '0.75rem',
      color: currentTheme.textColor || '#374151',
    },
    errorContainer: {
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      color: currentTheme.errorColor || '#dc2626',
      textAlign: 'center',
      padding: '2rem 1rem',
    },
    noEventsMessage: {
      textAlign: 'center',
      color: currentTheme.textColorMuted || '#6c757d',
      padding: '2rem 1rem',
      fontStyle: 'italic',
    },
    actionsCell: {
      whiteSpace: 'nowrap', // Keep actions on one line
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center',
      justifyContent: 'flex-end', // Align buttons to the right
    },
    actionButton: (isDeleting, errorColor) => ({ // Dynamic styling for delete button
      color: errorColor || '#dc2626',
      fontSize: '1rem',
      padding: '0.5rem',
      borderRadius: '0.375rem',
      transition: 'all 0.3s ease',
      opacity: isDeleting ? '0.6' : '0.8',
      cursor: isDeleting ? 'not-allowed' : 'pointer',
      '&:hover': {
        opacity: isDeleting ? '0.6' : '1',
        backgroundColor: errorColor + '10',
        color: errorColor || '#dc2626',
      },
    }),
    editButton: { // Styling for the edit button
      color: currentTheme.primaryColor || '#4f46e5',
      fontSize: '1rem',
      padding: '0.5rem',
      borderRadius: '0.375rem',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: (currentTheme.primaryColor || '#4f46e5') + '10',
        color: currentTheme.accentColor || '#3b82f6',
      },
    },
    deleteSpinner: { // Spinner for delete action
      color: currentTheme.errorColor || '#dc2626',
      height: '1.25rem', width: '1.25rem', borderWidth: '2px', borderTopColor: 'transparent',
      borderRadius: '9999px', animation: 'spin 1s linear infinite',
    },
    checkbox: { // Styling for selection checkbox
      width: '1.25rem', height: '1.25rem',
      accentColor: currentTheme.primaryColor || '#4f46e5',
      cursor: 'pointer',
    },
    eventLink: { // Styling for event name link (if it were a link)
      color: currentTheme.primaryColor || '#4f46e5',
      textDecoration: 'none',
      fontWeight: '500',
      transition: 'color 0.3s ease',
      '&:hover': {
        color: currentTheme.accentColor || '#3b82f6',
        textDecoration: 'underline',
      },
    },
    // Styles for the edit modal
    dialogRoot: {
      '& .MuiPaper-root': { // Target the dialog's paper element for theming
        backgroundColor: currentTheme.cardBgColor || '#ffffff',
        color: currentTheme.textColor || '#374151',
        fontFamily: currentTheme.fontFamily || 'sans-serif',
        borderRadius: '0.75rem',
      },
    },
    dialogTitle: {
      backgroundColor: currentTheme.footerBg || '#f3f4f6',
      color: currentTheme.textColor || '#374151',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      fontWeight: 'bold',
      padding: '1.5rem',
      fontSize: '1.5rem',
      borderBottom: `1px solid ${currentTheme.borderColor || '#e0e0e0'}`,
      display: 'flex', // Use flexbox for title and close button layout
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dialogContent: {
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem', // Spacing between form elements
    },
    dialogTextField: {
      '& .MuiInputLabel-root': {
        color: currentTheme.textColorMuted || '#6c757d',
      },
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: currentTheme.borderColor || '#e0e0e0',
        },
        '&:hover fieldset': {
          borderColor: currentTheme.primaryColor || '#4f46e5',
        },
        '&.Mui-focused fieldset': {
          borderColor: currentTheme.primaryColor || '#4f46e5',
        },
        '& input': { // Styling for input text
          color: currentTheme.textColor || '#374151',
          fontFamily: currentTheme.fontFamily || 'sans-serif',
        },
        '& textarea': { // Styling for textarea text
          color: currentTheme.textColor || '#374151',
          fontFamily: currentTheme.fontFamily || 'sans-serif',
        },
      },
    },
    dialogActions: {
      padding: '1.5rem',
      justifyContent: 'flex-end', // Align buttons to the right
      gap: '1rem', // Space between buttons
    },
    cancelButton: { // Styling for the cancel button
      backgroundColor: '#e5e7eb', // Tailwind gray-200
      color: currentTheme.textColorMuted || '#6c757d',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      '&:hover': {
        backgroundColor: '#d1d5db', // Tailwind gray-300
      },
    },
    updateButton: { // Styling for the update button
      backgroundColor: currentTheme.primaryColor || '#4f46e5',
      color: '#ffffff',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      '&:hover': {
        backgroundColor: currentTheme.accentColor || '#3b82f6',
      },
    },
    updateSpinner: { // Spinner for the update button
      color: '#ffffff',
      height: '1.5rem', width: '1.5rem',
    },
    fileUploadContainer: { // Container for file upload buttons and info
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      flexWrap: 'wrap', // Allow items to wrap on smaller screens
    },
    fileInfo: { // Display selected file name
      fontStyle: 'italic',
      fontSize: '0.875rem',
      color: currentTheme.textColorMuted || '#6c757d',
      maxWidth: '200px', // Prevent long filenames from breaking layout
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    videoLink: { // Style for the video link
        color: currentTheme.primaryColor || '#4f46e5',
        textDecoration: 'none',
        fontWeight: '500',
        transition: 'color 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        '&:hover': {
            color: currentTheme.accentColor || '#3b82f6',
            textDecoration: 'underline',
        },
    }
  });

  const styles = getThemedStyles(); // Apply the themed styles

  // Fetch events on component mount
  useEffect(() => {
    const fetchFutureEvents = async () => {
      setLoading(true);
      setErrorMsg(''); // Clear previous errors
      try {
        const response = await axios.get(`${backendUrl}/api/event/get/future-events`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Format eventDate for datetime-local input
        const formattedEvents = (response.data.events || []).map(event => ({
          ...event,
          eventDate: event.eventDate ? new Date(event.eventDate).toISOString().slice(0, 16) : '', // Format: YYYY-MM-DDTHH:MM
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching future events:', error);
        setErrorMsg(error.response?.data?.message || 'Failed to load events.');
      } finally {
        setLoading(false);
      }
    };

    if (backendUrl && token) { // Only fetch if backend URL and token are available
      fetchFutureEvents();
    } else {
      setErrorMsg("Backend URL or Token is missing. Cannot fetch events.");
      setLoading(false);
    }
  }, [backendUrl, token]); // Re-fetch if backendUrl or token changes

  // Handle deleting an event
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return; // Exit if user cancels
    }

    setIsDeleting(eventId); // Set the ID of the event being deleted for UI feedback
    try {
      await axios.delete(`${backendUrl}/api/event/future-events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvents(events.filter(event => event._id !== eventId)); // Remove the deleted event from state
      toast.success('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete event.';
      setErrorMsg(errorMessage); // Display error from backend if available
      toast.error(errorMessage);
    } finally {
      setIsDeleting(null); // Reset deletion state
    }
  };

  // --- Edit Event Modal Handlers ---

  // Open the modal and pre-fill the form with event data
  const handleOpenEditModal = (event) => {
    setEditingEvent({
      _id: event._id,
      eventName: event.eventName,
      eventDate: event.eventDate, // Already formatted for datetime-local
      location: event.location,
      description: event.description || '', // Use empty string if description is null
      imageUrl: event.imageUrl || '', // Store the current URL for display
      isPaid: !!event.isPaid, // Ensure boolean type
      organizerName: event.organizerName || '',
    });
    setSelectedImageFile(null); // Clear any previously selected files
    setSelectedVideoFile(null);
    setIsEditing(true); // Show the modal
  };

  // Close the modal and reset states
  const handleCloseEditModal = () => {
    setIsEditing(false);
    setEditingEvent({ // Reset form state
      _id: '',
      eventName: '',
      eventDate: '',
      location: '',
      description: '',
      imageUrl: '',
      isPaid: false,
      organizerName: '',
    });
    setSelectedImageFile(null); // Clear file selections
    setSelectedVideoFile(null);
    setIsUpdating(false); // Ensure update spinner is off
  };

  // Generic handler for text field changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingEvent(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value // Handle checkbox specially
    }));
  };

  // --- File Selection Handlers ---

  // Handle when the user selects an image file
  const handleImageFileChange = (e) => {
    const file = e.target.files[0]; // Get the first selected file
    if (file) {
      setSelectedImageFile(file);
      // Update the input preview with the selected file's name
      setEditingEvent(prev => ({ ...prev, imageUrl: file.name }));
    }
  };

  // Handle when the user selects a video file
  const handleVideoFileChange = (e) => {
    const file = e.target.files[0]; // Get the first selected file
    if (file) {
      setSelectedVideoFile(file);
      // You might want to add a specific state for video filename display if needed
      // For now, we just store the file object.
    }
  };

  // Function to trigger the hidden image file input
  const handleImageUploadClick = () => {
    imageInputRef.current.click();
  };

  // Function to trigger the hidden video file input
  const handleVideoUploadClick = () => {
    videoInputRef.current.click();
  };

  // Update the event via API call
  const handleUpdateEvent = async () => {
    // Basic validation for required fields
    if (!editingEvent.eventName || !editingEvent.eventDate || !editingEvent.location) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsUpdating(true); // Show update spinner

    // Create FormData object to send files and other data
    const formData = new FormData();
    formData.append('eventName', editingEvent.eventName);
    formData.append('eventDate', editingEvent.eventDate);
    formData.append('location', editingEvent.location);
    formData.append('description', editingEvent.description);
    formData.append('isPaid', editingEvent.isPaid); // Send boolean or string 'true'/'false'
    formData.append('organizerName', editingEvent.organizerName);

    // Append selected files if any
    if (selectedImageFile) {
      formData.append('image', selectedImageFile); // 'image' must match req.files.image on backend
    }
    if (selectedVideoFile) {
      formData.append('video', selectedVideoFile); // 'video' must match req.files.video on backend
    }

    try {
      const response = await axios.put(`${backendUrl}/api/event/future-events/${editingEvent._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Essential for file uploads
          Authorization: `Bearer ${token}`,
        },
      });

      // Update the events state with the response data from the backend
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event._id === editingEvent._id ? {
            ...response.data.event, // Use the updated event data from the backend response
            // Re-format date if backend returns it differently or if it needs to be consistent
            eventDate: new Date(response.data.event.eventDate).toISOString().slice(0, 16)
          } : event
        )
      );

      toast.success(response.data.message || 'Event updated successfully!'); // Use message from backend if provided
      handleCloseEditModal(); // Close modal on success
    } catch (error) {
      console.error('Error updating event:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update event.';
      setErrorMsg(errorMessage); // Display error from backend if available
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false); // Hide update spinner
    }
  };

  // Render the component UI
  return (
    <div className="p-6" style={styles.container}>
      <h2 className="text-4xl font-bold mb-8" style={styles.header}>
        Upcoming Future Events
      </h2>

      {/* Loading State */}
      {loading && (
        <div style={styles.loadingContainer}>
          <div className="flex items-center">
            <div className="animate-spin rounded-full border-t-4 border-solid border-blue-500 h-8 w-8 mr-3" style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading future events...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {!loading && errorMsg && (
        <p className="py-8" style={styles.errorContainer}>
          {errorMsg}
        </p>
      )}

      {/* No Events Message */}
      {!loading && !errorMsg && events.length === 0 && (
        <p className="py-8" style={styles.noEventsMessage}>
          No upcoming future events found.
        </p>
      )}

      {/* Events Table */}
      {!loading && !errorMsg && events.length > 0 && (
        <div className="overflow-x-auto"> {/* For responsiveness on smaller screens */}
          <table className="min-w-full" style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th scope="col" className="py-3 px-4" style={styles.th}>Select</th>
                <th scope="col" className="py-3 px-4" style={styles.th}>Event Name</th>
                <th scope="col" className="py-3 px-4" style={styles.th}>Date</th>
                <th scope="col" className="py-3 px-4" style={styles.th}>Location</th>
                <th scope="col" className="py-3 px-4" style={styles.th}>Paid</th>
                <th scope="col" className="py-3 px-4" style={styles.th}>Organizer</th>
                <th scope="col" className="py-3 px-4" style={styles.th}>Views</th>
                {/* New column for Video */}
                <th scope="col" className="py-3 px-4" style={styles.th}>Video</th>
                <th scope="col" className="py-3 px-4 text-right" style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody className="relative" style={{ backgroundColor: currentTheme.cardBgColor }}>
              {events.map((event) => (
                <tr
                  key={event._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  style={{ ...styles.td, backgroundColor: selectedEventId === event._id ? currentTheme.hoverBgColor : currentTheme.cardBgColor, borderTopColor: currentTheme.borderColor }}
                >
                  {/* Checkbox cell */}
                  <td className="py-4 px-4 w-16" style={{ borderTopColor: currentTheme.borderColor }}>
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      style={styles.checkbox}
                      checked={selectedEventId === event._id}
                      onChange={() => setSelectedEventId(selectedEventId === event._id ? null : event._id)}
                    />
                  </td>
                  {/* Event Name cell */}
                  <td className="py-4 px-4" style={{ borderTopColor: currentTheme.borderColor }}>
                    <div className="flex items-center">
                      {event.imageUrl && (
                        <img
                          src={event.imageUrl}
                          alt={event.eventName}
                          className="w-16 h-16 object-cover rounded-md mr-3"
                          style={{ objectFit: 'cover' }}
                        />
                      )}
                      <div>
                        <p className="font-medium" style={styles.eventLink}>{event.eventName}</p> {/* Event name text */}
                        <p className="text-xs text-gray-500">Added: {new Date(event.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  {/* Date cell */}
                  <td className="py-4 px-4" style={{ borderTopColor: currentTheme.borderColor }}>
                    <p className="mb-1 flex items-center gap-2" style={styles.eventDetailText}>
                      <FaCalendarAlt className="text-primary-500" size={16} />
                      {new Date(event.eventDate).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </td>
                  {/* Location cell */}
                  <td className="py-4 px-4" style={{ borderTopColor: currentTheme.borderColor }}>
                    <p className="mb-1 flex items-center gap-2" style={styles.eventDetailText}>
                      <FaMapMarkerAlt className="text-red-500" size={16} />
                      {event.location}
                    </p>
                  </td>
                  {/* Is Paid cell */}
                  <td className="py-4 px-4" style={{ borderTopColor: currentTheme.borderColor }}>
                    {event.isPaid ? <FaCheckCircle className="text-green-500" size={20} /> : <span className="text-gray-500">No</span>}
                  </td>
                  {/* Organizer Name cell */}
                  <td className="py-4 px-4" style={{ borderTopColor: currentTheme.borderColor }}>
                    {event.organizerName}
                  </td>
                    <td className="py-4 px-4" style={{ borderTopColor: currentTheme.borderColor }}>
                    {event.viewCount || 0} {/* Display viewCount, default to 0 if undefined */}
                  </td>
                  {/* Video cell */}
                  <td className="py-4 px-4" style={{ borderTopColor: currentTheme.borderColor }}>
                    {event.eventVideoURL ? (
                      <a
                        href={event.eventVideoURL}
                        target="_blank" // Open in new tab
                        rel="noopener noreferrer" // Security best practice
                        style={styles.videoLink}
                        title="Watch Video"
                      >
                        <FaVideo className="text-blue-500" size={18} />
                        {/* Optionally display "Video" or a snippet of the URL */}
                        {/* <span className="text-sm">Video</span> */}
                      </a>
                    ) : (
                      <span className="text-gray-500">No Video</span>
                    )}
                  </td>
                  {/* Actions cell */}
                  <td className="py-4 px-4 text-right" style={{ borderTopColor: currentTheme.borderColor }}>
                    <div className="flex items-center justify-end gap-3">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEditModal(event)} // Open modal with event data
                        className="flex items-center justify-center p-1.5 rounded-md"
                        style={styles.editButton}
                        title="Edit Event"
                      >
                        <FaEdit size={18} />
                      </button>
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        disabled={isDeleting === event._id} // Disable while deleting
                        className="flex items-center justify-center p-1.5 rounded-md"
                        style={styles.actionButton(isDeleting === event._id, currentTheme.errorColor)}
                        title="Delete Event"
                      >
                        {isDeleting === event._id ? (
                          <div className="animate-spin rounded-full border-t-2 border-red-500 h-5 w-5 mx-auto" style={{borderColor: currentTheme.errorColor || '#dc2626'}}></div>
                        ) : (
                          <FaTrashAlt />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- Edit Event Modal --- */}
      <BootstrapDialog
        onClose={handleCloseEditModal} // Close when clicking outside or on backdrop
        aria-labelledby="customized-dialog-title"
        open={isEditing} // Control modal visibility
        PaperProps={{ style: styles.dialogRoot }} // Apply custom theme styles to the modal paper
      >
        <DialogTitle id="customized-dialog-title" style={styles.dialogTitle}>
          <Typography variant="h6" component="span" style={{ fontFamily: currentTheme.fontFamily || 'sans-serif', fontWeight: 'bold' }}>
            Edit Event
          </Typography>
          {/* Close button for the dialog */}
          <IconButton
            aria-label="close"
            onClick={handleCloseEditModal}
            sx={{
              color: (theme) => theme.palette.grey[500], // Use theme color for close button
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <FaTimes size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers style={styles.dialogContent}>
          {/* Text Fields for Event Details */}
          <TextField
            label="Event Name"
            name="eventName"
            value={editingEvent.eventName}
            onChange={handleInputChange}
            fullWidth
            required
            sx={styles.dialogTextField}
          />
          <TextField
            label="Event Date and Time"
            name="eventDate"
            type="datetime-local" // User-friendly date/time picker
            value={editingEvent.eventDate}
            onChange={handleInputChange}
            fullWidth
            required
            sx={styles.dialogTextField}
            InputLabelProps={{
              shrink: true, // Ensures the label stays above the input
            }}
          />
          <TextField
            label="Location"
            name="location"
            value={editingEvent.location}
            onChange={handleInputChange}
            fullWidth
            required
            sx={styles.dialogTextField}
          />

          {/* Image Upload Section */}
          <Box sx={styles.fileUploadContainer}>
            <CustomUploadButton
              variant="contained"
              onClick={handleImageUploadClick} // Triggers the hidden input
              startIcon={<FaEdit size={16} />}
              sx={{
                backgroundColor: currentTheme.accentColor || '#3b82f6', // Use accent color for image upload
                '&:hover': {
                  backgroundColor: currentTheme.primaryColor || '#4f46e5',
                }
              }}
            >
              {selectedImageFile ? `Change Image (${selectedImageFile.name})` : 'Upload/Change Image'}
            </CustomUploadButton>
            {/* Hidden file input for images */}
            <FileUploadInput
              type="file"
              accept="image/*" // Accept only image files
              ref={imageInputRef}
              onChange={handleImageFileChange}
            />
            {/* Display name of the newly selected image file */}
            {selectedImageFile && (
              <Typography sx={styles.fileInfo}>
                {selectedImageFile.name}
              </Typography>
            )}
            {/* Display the current image URL if no new file is selected */}
            {!selectedImageFile && editingEvent.imageUrl && (
              <Typography sx={styles.fileInfo}>
                Current: {editingEvent.imageUrl.split('/').pop()} {/* Show just the filename */}
              </Typography>
            )}
          </Box>

          {/* Video Upload Section */}
          <Box sx={styles.fileUploadContainer}>
            <CustomUploadButton
              variant="contained"
              onClick={handleVideoUploadClick} // Triggers the hidden input
              startIcon={<FaEdit size={16} />}
              sx={{
                backgroundColor: '#60a5fa', // A pleasant blue for video upload
                '&:hover': {
                  backgroundColor: '#3b82f6',
                }
              }}
            >
              {selectedVideoFile ? `Change Video (${selectedVideoFile.name})` : 'Upload/Change Video'}
            </CustomUploadButton>
            {/* Hidden file input for videos */}
            <FileUploadInput
              type="file"
              accept="video/*" // Accept only video files
              ref={videoInputRef}
              onChange={handleVideoFileChange}
            />
            {/* Display name of the newly selected video file */}
            {selectedVideoFile && (
              <Typography sx={styles.fileInfo}>
                {selectedVideoFile.name}
              </Typography>
            )}
            {/* You might want to add logic here to display the current video URL filename if applicable */}
          </Box>

          <TextField
            label="Description (Optional)"
            name="description"
            value={editingEvent.description}
            onChange={handleInputChange}
            multiline
            rows={4}
            fullWidth
            sx={styles.dialogTextField}
          />

          {/* Is Paid Checkbox and Organizer Name */}
          <Box display="flex" alignItems="center" gap={1}>
            <Typography>Is this event paid?</Typography>
            <Checkbox
              name="isPaid"
              checked={editingEvent.isPaid}
              onChange={handleInputChange}
              sx={{
                color: currentTheme.primaryColor, // Apply theme color to checkbox
                '&.Mui-checked': {
                  color: currentTheme.primaryColor,
                },
              }}
            />
          </Box>
          <TextField
            label="Organizer Name"
            name="organizerName"
            value={editingEvent.organizerName}
            onChange={handleInputChange}
            fullWidth
            sx={styles.dialogTextField}
          />
        </DialogContent>
        <DialogActions style={styles.dialogActions}>
          <Button onClick={handleCloseEditModal} style={styles.cancelButton} variant="contained">
            Cancel
          </Button>
          <Button
            onClick={handleUpdateEvent}
            disabled={isUpdating} // Disable button while updating
            style={styles.updateButton}
            variant="contained"
            // Show spinner inside the button if updating
            startIcon={isUpdating ? <CircularProgress size={16} sx={{ color: '#ffffff' }}/> : null}
            color="primary"
          >
            {isUpdating ? 'Updating...' : 'Update Event'}
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </div>
  );
};

export default FutureEventsList;