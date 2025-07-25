// src/pages/FutureEvent.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext'; // Assuming you have this for styling
import { toast } from 'react-toastify';
import { FaCalendarPlus, FaSpinner, FaImage, FaVideo, FaTrashAlt } from 'react-icons/fa';
import clsx from 'clsx';

// This initial state matches the fields your backend controller expects
const initialFormState = {
  eventName: '',
  eventDate: '',
  location: '',
  description: '',
  isPaid: false,
  organizerName: 'Admin', // Default value as per your backend
};

const FutureEvent = () => {
  const { backendUrl, token } = useContext(AdminContext);
  const { currentTheme } = useTheme();

  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, [name]: finalValue });
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setImageFile(null);
    setVideoFile(null);
    // Visually reset the file inputs by targeting their IDs
    if (document.getElementById('image-upload-input')) {
      document.getElementById('image-upload-input').value = '';
    }
    if (document.getElementById('video-upload-input')) {
      document.getElementById('video-upload-input').value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    // Append all form data fields that your backend expects
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    // Append files if they exist, using the names 'image' and 'video'
    if (imageFile) data.append('image', imageFile);
    if (videoFile) data.append('video', videoFile);

    try {
      const response = await axios.post(`${backendUrl}/api/event/future-events`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(response.data.message || 'Event created successfully!');
      resetForm();
    } catch (error) {
      console.error('Event creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create event. Please check the details.');
    } finally {
      setLoading(false);
    }
  };

  const { background, textColor, borderColor, primaryColor, cardBackgroundColor, hoverAccentColor } = currentTheme;

  return (
    <div className={`p-6 rounded-lg shadow-lg transition-all duration-300 ${cardBackgroundColor} ${textColor}`}>
      <h2 className={`text-2xl font-bold mb-6 border-b pb-3 ${borderColor} ${primaryColor}`}>
        Create a New Event
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* --- Section: Event Details --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="eventName" className="block text-sm font-medium mb-1">Event Name</label>
            <input id="eventName" type="text" name="eventName" placeholder="e.g., Annual Tech Conference" value={formData.eventName} onChange={handleInputChange} required className={`w-full p-2 border rounded-md ${borderColor} ${background} focus:ring-2 focus:${primaryColor}`} />
          </div>
          <div>
            <label htmlFor="eventDate" className="block text-sm font-medium mb-1">Event Date & Time</label>
            <input id="eventDate" type="datetime-local" name="eventDate" value={formData.eventDate} onChange={handleInputChange} required className={`w-full p-2 border rounded-md ${borderColor} ${background} focus:ring-2 focus:${primaryColor}`} />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-1">Location</label>
            <input id="location" type="text" name="location" placeholder="e.g., Main Auditorium" value={formData.location} onChange={handleInputChange} required className={`w-full p-2 border rounded-md ${borderColor} ${background} focus:ring-2 focus:${primaryColor}`} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <textarea id="description" name="description" placeholder="A brief summary of the event..." value={formData.description} onChange={handleInputChange} required rows="4" className={`w-full p-2 border rounded-md ${borderColor} ${background} focus:ring-2 focus:${primaryColor}`} />
          </div>
        </div>
        
        {/* --- Section: Options --- */}
        <div className="flex items-center gap-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" name="isPaid" checked={formData.isPaid} onChange={handleInputChange} className="h-4 w-4 rounded" />
              <span>Is this a Paid Event?</span>
            </label>
        </div>

        {/* --- Section: Media Upload --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Event Image</label>
            {imageFile ? (
              <div className="relative">
                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-40 object-cover rounded-lg shadow-md" />
                <button type="button" onClick={() => setImageFile(null)} className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full text-xs">
                  <FaTrashAlt />
                </button>
              </div>
            ) : (
              <label htmlFor="image-upload-input" className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer ${borderColor} hover:bg-gray-700/50`}>
                <FaImage className="text-4xl text-gray-400" />
                <span className="mt-2 text-sm">Click to select an image</span>
                <input id="image-upload-input" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="hidden" />
              </label>
            )}
          </div>
          {/* Video Upload */}
          <div className="space-y-2">
             <label className="block text-sm font-medium">Event Video (Optional)</label>
             {videoFile ? (
              <div className="relative p-4 bg-gray-800 rounded-lg shadow-md flex items-center justify-between">
                <span className="truncate">{videoFile.name}</span>
                <button type="button" onClick={() => setVideoFile(null)} className="p-1 text-red-500 hover:text-red-700 text-xs">
                  <FaTrashAlt size={18} />
                </button>
              </div>
            ) : (
              <label htmlFor="video-upload-input" className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer ${borderColor} hover:bg-gray-700/50`}>
                <FaVideo className="text-4xl text-gray-400" />
                <span className="mt-2 text-sm">Click to select a video</span>
                <input id="video-upload-input" type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* --- Submit Button --- */}
        <div className="pt-4 border-t ${borderColor}">
          <button
            type="submit"
            disabled={loading}
            className={clsx(
              'w-full flex items-center justify-center gap-2 py-3 px-4 text-lg font-semibold rounded-lg transition-all duration-300',
              currentTheme.buttonTextColor,
              {
                [`${primaryColor} ${hoverAccentColor}`]: !loading,
                'bg-gray-400 cursor-not-allowed': loading
              }
            )}
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaCalendarPlus />}
            {loading ? 'Creating Event...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FutureEvent;