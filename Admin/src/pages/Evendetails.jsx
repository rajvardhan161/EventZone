import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import {
  FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaArrowLeft, FaEdit, FaTrash, FaTimes,
  FaSearch, FaTicketAlt, FaUserCheck, FaBullseye, FaSave, FaSpinner
} from 'react-icons/fa'; // Added FaSave, FaSpinner
import { format } from 'date-fns';
import axios from 'axios';
import Modal from 'react-modal';

Modal.setAppElement('#root');

// Helper functions and sub-components (these remain the same)
const safeFormatDate = (dateString, formatString = 'PPPPp') => {
  try {
    if (!dateString || isNaN(new Date(dateString))) return 'Date not available';
    return format(new Date(dateString), formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

const StatCard = ({ icon, title, value }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md flex items-center gap-4">
    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-600 dark:text-indigo-300">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const ParticipantModal = ({ isOpen, onRequestClose, participants, theme }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParticipants = useMemo(() => {
    if (!searchTerm) return participants;
    const lowercasedFilter = searchTerm.toLowerCase();
    return participants.filter(p =>
      p.name.toLowerCase().includes(lowercasedFilter) ||
      p.email.toLowerCase().includes(lowercasedFilter) ||
      p.student_id?.toLowerCase().includes(lowercasedFilter)
    );
  }, [searchTerm, participants]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1000 },
        content: {
          top: '50%', left: '50%', right: 'auto', bottom: 'auto',
          marginRight: '-50%', transform: 'translate(-50%, -50%)',
          width: '90%', maxWidth: '800px',
          maxHeight: '90vh',
          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          border: 'none',
          borderRadius: '1rem',
          padding: '2rem'
        }
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Participants ({filteredParticipants.length})</h2>
        <button onClick={onRequestClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white transition">
          <FaTimes size={24} />
        </button>
      </div>
      <div className="relative mb-4">
        <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, or Reg No."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Reg. No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredParticipants.length > 0 ? filteredParticipants.map(p => (
              <tr key={p._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{p.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.student_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.email}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" className="text-center py-8 text-gray-500">No participants match your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};


const EventDetailSkeleton = () => (
  <div className="max-w-7xl mx-auto animate-pulse">
    <div className="mb-8">
      <div className="h-5 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
      <div className="flex justify-between items-start">
        <div>
          <div className="h-10 w-80 bg-gray-400 dark:bg-gray-600 rounded mb-3"></div>
          <div className="h-5 w-96 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-10 w-24 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-8 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <div className="w-full h-80 bg-gray-300 dark:bg-gray-700 rounded-lg mb-6"></div>
          <div className="h-8 w-1/3 bg-gray-400 dark:bg-gray-600 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { backendUrl, token } = useContext(AdminContext);
  const { currentTheme } = useTheme();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // States for edit mode and update operation
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  // Form data states
  const [formData, setFormData] = useState({
    eventName: '',
    eventDescription: '',
    eventDate: '',
    eventEndDate: '',
    eventTime: '',
    location: '',
    isPaid: false,
    price: '',
    participantLimit: '',
    allowDutyLeave: false,
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedQrCode, setSelectedQrCode] = useState(null);

  // CSS Classes for consistency
  const themeClasses = currentTheme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800';
  const inputClasses = "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400";
  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const checkboxContainerClasses = "flex items-center space-x-2";
  const checkboxClasses = "form-checkbox h-5 w-5 text-indigo-600 rounded dark:bg-gray-600 dark:border-gray-500";


  const fetchEventDetails = useCallback(async () => {
    if (!id) {
      setError("Event ID is missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${backendUrl}/api/admin/eventss/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedEvent = response.data.event || response.data;
      setEvent(fetchedEvent);

      // Populate form data when event details are fetched
      setFormData({
        eventName: fetchedEvent.eventName || '',
        eventDescription: fetchedEvent.eventDescription || '',
        eventDate: fetchedEvent.eventDate ? new Date(fetchedEvent.eventDate).toISOString().split('T')[0] : '',
        eventEndDate: fetchedEvent.eventEndDate ? new Date(fetchedEvent.eventEndDate).toISOString().split('T')[0] : '',
        eventTime: fetchedEvent.eventTime || '',
        location: fetchedEvent.location || '',
        isPaid: fetchedEvent.isPaid || false,
        price: fetchedEvent.price || '',
        participantLimit: fetchedEvent.participantLimit || '',
        allowDutyLeave: fetchedEvent.allowDutyLeave || false,
      });
      // Clear file inputs, as current files are linked to the fetched event
      setSelectedImage(null);
      setSelectedVideo(null);
      setSelectedQrCode(null);

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch event details.';
      console.error('Error fetching event details:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id, backendUrl, token]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  const latestParticipants = useMemo(() => {
    if (!event?.participants) return [];
    return [...(event.participants || [])].reverse().slice(0, 5);
  }, [event]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle file input changes
  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (fileType === 'image') setSelectedImage(file);
    else if (fileType === 'video') setSelectedVideo(file);
    else if (fileType === 'qrCode') setSelectedQrCode(file);
  };

  // Handle form submission for update
  const handleUpdateEvent = async (e) => {
    e.preventDefault(); // Prevent default browser form submission

    setUpdateLoading(true);
    setUpdateError(null);

    const dataToSend = new FormData();

    // Append all form data fields
    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        // Convert boolean to string for FormData
        if (typeof formData[key] === 'boolean') {
          dataToSend.append(key, String(formData[key]));
        } else {
          dataToSend.append(key, formData[key]);
        }
      }
    }

    // Append files if selected
    if (selectedImage) dataToSend.append('image', selectedImage);
    if (selectedVideo) dataToSend.append('video', selectedVideo);
    if (selectedQrCode) dataToSend.append('qrCode', selectedQrCode);

    try {
      const response = await axios.put(`${backendUrl}/api/event/update/${id}`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data' is automatically set by axios for FormData
        },
      });
      setEvent(response.data.event); // Update the main event state with the new data
      setIsEditing(false); // Exit edit mode
      setUpdateError(null); // Clear any previous update errors

      // Re-populate formData and clear selected files after successful update
      setFormData({
        eventName: response.data.event.eventName || '',
        eventDescription: response.data.event.eventDescription || '',
        eventDate: response.data.event.eventDate ? new Date(response.data.event.eventDate).toISOString().split('T')[0] : '',
        eventEndDate: response.data.event.eventEndDate ? new Date(response.data.event.eventEndDate).toISOString().split('T')[0] : '',
        eventTime: response.data.event.eventTime || '',
        location: response.data.event.location || '',
        isPaid: response.data.event.isPaid || false,
        price: response.data.event.price || '',
        participantLimit: response.data.event.participantLimit || '',
        allowDutyLeave: response.data.event.allowDutyLeave || false,
      });
      setSelectedImage(null);
      setSelectedVideo(null);
      setSelectedQrCode(null);

      alert('Event updated successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update event.';
      console.error('Error updating event:', errorMessage);
      setUpdateError(errorMessage);
    } finally {
      setUpdateLoading(false);
    }
  };


  if (loading) {
    return (
      <div className={`p-4 md:p-8 min-h-screen ${currentTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <EventDetailSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex justify-center items-center min-h-screen p-4 ${currentTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">An Error Occurred</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/create-event')}
            className="flex items-center justify-center w-full gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
          >
            <FaArrowLeft />
            <span>Back to My Events</span>
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return <div className="text-center p-10">Event could not be found.</div>;
  }

  return (
    <div className={`p-4 md:p-8 min-h-screen ${currentTheme === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <button onClick={() => navigate('/create-event')} className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-4 font-semibold">
            <FaArrowLeft />
            Back to All Events
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{event.eventName}</h1>
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-2"><FaCalendarAlt /> {safeFormatDate(event.eventDate)}</span>
                <span className="flex items-center gap-2"><FaMapMarkerAlt /> {event.location || 'Location TBD'}</span>
              </div>
            </div>
            <div className="flex gap-3">
              {/* Edit Button - Toggles isEditing state */}
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold transition text-gray-800 dark:text-white"
              >
                <FaEdit /> Edit
              </button>
              {/* Optional: Delete button, uncomment if you implement delete functionality */}
              {/* <button className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 rounded-lg font-semibold transition"><FaTrash /> Delete</button> */}
            </div>
          </div>
        </div>

        {/* Conditional Rendering: Show form if isEditing is true, else show details */}
        {isEditing ? (
          <div className={`p-6 rounded-xl shadow-lg mb-8 ${themeClasses}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Event</h2>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setUpdateError(null); // Clear any previous update errors
                  fetchEventDetails(); // Re-fetch to reset form to original values if cancelled
                }}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-white transition"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateEvent} className="space-y-6">
              {/* Event Name */}
              <div>
                <label htmlFor="eventName" className={labelClasses}>Event Name</label>
                <input
                  type="text"
                  id="eventName"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>

              {/* Event Description */}
              <div>
                <label htmlFor="eventDescription" className={labelClasses}>Event Description</label>
                <textarea
                  id="eventDescription"
                  name="eventDescription"
                  value={formData.eventDescription}
                  onChange={handleChange}
                  className={`${inputClasses} h-32`}
                  required
                />
              </div>

              {/* Event Date & End Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="eventDate" className={labelClasses}>Start Date</label>
                  <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="eventEndDate" className={labelClasses}>End Date (Optional)</label>
                  <input
                    type="date"
                    id="eventEndDate"
                    name="eventEndDate"
                    value={formData.eventEndDate}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </div>
              </div>

              {/* Event Time */}
              <div>
                <label htmlFor="eventTime" className={labelClasses}>Event Time</label>
                <input
                  type="time"
                  id="eventTime"
                  name="eventTime"
                  value={formData.eventTime}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className={labelClasses}>Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>

              {/* Is Paid & Price */}
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className={checkboxContainerClasses}>
                  <input
                    type="checkbox"
                    id="isPaid"
                    name="isPaid"
                    checked={formData.isPaid}
                    onChange={handleChange}
                    className={checkboxClasses}
                  />
                  <label htmlFor="isPaid" className={labelClasses}>Is Paid Event?</label>
                </div>
                {formData.isPaid && (
                  <div className="flex-1">
                    <label htmlFor="price" className={labelClasses}>Price (₹)</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className={inputClasses}
                      min="0"
                      step="0.01"
                      required={formData.isPaid}
                    />
                  </div>
                )}
              </div>

              {/* Participant Limit */}
              <div>
                <label htmlFor="participantLimit" className={labelClasses}>Participant Limit (leave empty for unlimited)</label>
                <input
                  type="number"
                  id="participantLimit"
                  name="participantLimit"
                  value={formData.participantLimit}
                  onChange={handleChange}
                  className={inputClasses}
                  min="1"
                />
              </div>

              {/* Allow Duty Leave */}
              <div className={checkboxContainerClasses}>
                <input
                  type="checkbox"
                  id="allowDutyLeave"
                  name="allowDutyLeave"
                  checked={formData.allowDutyLeave}
                  onChange={handleChange}
                  className={checkboxClasses}
                />
                <label htmlFor="allowDutyLeave" className={labelClasses}>Allow Duty Leave?</label>
              </div>

              {/* Image Upload */}
              <div>
                <label htmlFor="image" className={labelClasses}>Event Image</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'image')}
                  className={`${inputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 dark:hover:file:bg-indigo-900`}
                />
                {event.eventImageURL && !selectedImage && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Current: <a href={event.eventImageURL} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline">View Image</a> (Upload new to replace)</p>
                )}
                {selectedImage && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">New image selected: {selectedImage.name}</p>
                )}
              </div>

              {/* Video Upload */}
              <div>
                <label htmlFor="video" className={labelClasses}>Event Video (Optional)</label>
                <input
                  type="file"
                  id="video"
                  name="video"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, 'video')}
                  className={`${inputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 dark:hover:file:bg-indigo-900`}
                />
                {event.eventVideoURL && !selectedVideo && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Current: <a href={event.eventVideoURL} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline">View Video</a> (Upload new to replace)</p>
                )}
                {selectedVideo && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">New video selected: {selectedVideo.name}</p>
                )}
              </div>

              {/* QR Code Upload */}
              <div>
                <label htmlFor="qrCode" className={labelClasses}>QR Code Image (Optional)</label>
                <input
                  type="file"
                  id="qrCode"
                  name="qrCode"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'qrCode')}
                  className={`${inputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 dark:hover:file:bg-indigo-900`}
                />
                {event.qrCodeImageURL && !selectedQrCode && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Current: <a href={event.qrCodeImageURL} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline">View QR Code</a> (Upload new to replace)</p>
                )}
                {selectedQrCode && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">New QR code selected: {selectedQrCode.name}</p>
                )}
              </div>

              {updateError && (
                <div className="p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-sm">
                  Error: {updateError}
                </div>
              )}

              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setUpdateError(null); // Clear error on cancel
                    fetchEventDetails(); // Re-fetch to reset form to original values
                  }}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  disabled={updateLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                  disabled={updateLoading}
                >
                  {updateLoading ? (
                    <>
                      <FaSpinner className="animate-spin" /> Updating...
                    </>
                  ) : (
                    <>
                      <FaSave /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Stat Cards (display mode) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard icon={<FaTicketAlt size={22} />} title="Event Type" value={event.isPaid ? `Paid (₹${event.price})` : 'Free'} />
              <StatCard icon={<FaBullseye size={22} />} title="Capacity" value={event.participantLimit || 'Unlimited'} />
              <StatCard icon={<FaUserCheck size={22} />} title="Registered" value={event.currentApplications ?? 0} />
              <StatCard icon={<FaUsers size={22} />} title="Slots Remaining" value={event.participantLimit ? (event.participantLimit - (event.currentApplications ?? 0)) : '∞'} />
            </div>

            {/* Main Content Grid (display mode) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Details, Description, Participants (display mode) */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                  <img
                    src={event.eventImageURL || 'https://via.placeholder.com/800x400?text=Event+Image'}
                    alt={event.eventName}
                    className="w-full h-auto max-h-full object-cover rounded-lg mb-6"
                  />
                  <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Event Description</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{event.eventDescription}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Event Details</h2>

                  <div className="space-y-2">
                    <p className="text-gray-600 dark:text-gray-300">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">Event Name: </span>
                      {event.eventName}
                    </p>

                    <p className="text-gray-600 dark:text-gray-300">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">Organizer Name: </span>
                      {event.organizerName}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">Organizer Email: </span>
                      {event.organizerEmail}
                    </p>

                    <p className="text-gray-600 dark:text-gray-300">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">Start Date: </span>
                      {new Date(event.eventDate).toLocaleDateString()}
                    </p>

                    <p className="text-gray-600 dark:text-gray-300">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">Start Time: </span>
                      {event.eventTime}
                    </p>

                    {event.eventEndDate && new Date(event.eventEndDate).toDateString() !== new Date(event.eventDate).toDateString() && (
                        <p className="text-gray-600 dark:text-gray-300">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">End Date: </span>
                        {new Date(event.eventEndDate).toLocaleDateString()}
                        </p>
                    )}

                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">Location: </span>
                      {event.location}
                    </p>

                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                      <span className="font-semibold text-gray-800 dark:text-gray-200"> Duty Leave: </span>
                      {event.allowDutyLeave ? 'Allowed' : 'Not Allowed'}
                    </p>

                    {event.eventVideoURL && (
                      <div className="mt-4">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">Event Video:</span>
                        <video
                          className="w-full mt-2 rounded-lg"
                          src={event.eventVideoURL}
                          controls
                        />
                      </div>
                    )}

                    {event.qrCodeImageURL && (
                      <div className="mt-4">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">QR Code:</span>
                        <img
                          src={event.qrCodeImageURL}
                          alt="QR Code"
                          className="w-40 mt-2 rounded-lg"
                        />
                      </div>
                    )}

                  </div>
                </div>

                {/* Latest Participants (display mode) */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest Participants</h2>
                    {event.participants?.length > 0 && (
                      <button onClick={() => setIsModalOpen(true)} className="px-4 py-1.5 text-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900 rounded-lg font-semibold transition">
                        View All ({event.participants.length})
                      </button>
                    )}
                  </div>
                  {latestParticipants.length > 0 ? (
                    <ul className="space-y-4">
                      {latestParticipants.map(p => (
                        <li key={p._id} className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-500">
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-white">{p.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{p.email}</p>
                            </div>
                          </div>
                          <p className="text-sm font-mono text-gray-500 dark:text-gray-400">{p.student_id}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 py-4 text-center">No one has registered for this event yet.</p>
                  )}
                </div>
              </div>

              {/* Right Column (display mode) */}
              <div className="lg:col-span-1">
                {/* Add more info cards or actions here if needed for display mode */}
              </div>
            </div>
          </>
        )}
      </div>

      <ParticipantModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        participants={event.participants || []}
        theme={currentTheme}
      />
    </div>
  );
};

export default EventDetails;