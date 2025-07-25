// src/pages/UploadImageHighlights.js
import React, { useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { FaUpload, FaTrashAlt, FaImage, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import clsx from 'clsx';

const UploadImageHighlights = () => {
  const { backendUrl, token } = useContext(AdminContext);
  const { currentTheme } = useTheme();
  const [imagesToUpload, setImagesToUpload] = useState([]);
  const [uploadedHighlights, setUploadedHighlights] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loadingHighlights, setLoadingHighlights] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // To track which image is being deleted
  const [isDragging, setIsDragging] = useState(false); // For drag-n-drop UI

  // Fetch existing highlights when the component mounts
  const fetchHighlights = useCallback(async () => {
    setLoadingHighlights(true);
    try {
      const res = await axios.get(`${backendUrl}/api/event/highlights`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Ensure we always get an array
      setUploadedHighlights(res.data.highlights || []);
    } catch (error) {
      console.error('Error fetching highlights:', error);
      toast.error('Failed to load existing highlights.');
    } finally {
      setLoadingHighlights(false);
    }
  }, [backendUrl, token]);

  useEffect(() => {
    fetchHighlights();
  }, [fetchHighlights]);

  const handleFileChange = (files) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      toast.warn('Some files were not images and were ignored.');
    }
    setImagesToUpload(prev => [...prev, ...validFiles]);
  };

  const handleFileSelect = (e) => {
    handleFileChange(e.target.files);
  };
  
  const removeImageToUpload = (index) => {
    setImagesToUpload(prev => prev.filter((_, i) => i !== index));
  };

  // --- Drag and Drop Handlers ---
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (!imagesToUpload.length) {
      toast.warn('Please select images to upload.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    imagesToUpload.forEach((image) => {
      formData.append('image', image); // Use 'images' (plural) to align with backend expectations
    });

    try {
      await axios.post(`${backendUrl}/api/event/highlights`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Images uploaded successfully!');
      setImagesToUpload([]);
      fetchHighlights();
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload images. Please try again.';
      toast.error(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteHighlight = async (highlightId) => {
    if (!window.confirm('Are you sure you want to delete this highlight? This action cannot be undone.')) {
      return;
    }

    setDeletingId(highlightId);
    try {
      await axios.delete(`${backendUrl}/api/event/highlights/${highlightId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Highlight deleted successfully!');
      fetchHighlights(); // Refresh the list of highlights
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete highlight. Please try again.';
      toast.error(`Deletion failed: ${errorMessage}`);
    } finally {
      setDeletingId(null);
    }
  };
  
  // Destructure theme for cleaner class names
  const {
    background,
    textColor,
    borderColor,
    primaryColor,
    buttonTextColor,
    cardBackgroundColor,
    cardTextColor,
    hoverAccentColor,
  } = currentTheme;
  
  return (
    <div className={`p-6 rounded-lg shadow-lg transition-all duration-300 ${background} ${textColor}`}>
      <h2 className={`text-2xl font-bold mb-6 border-b pb-3 ${borderColor} ${primaryColor}`}>
        Manage Event Highlights
      </h2>

      {/* --- Upload Section --- */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Upload New Highlights</h3>
        
        {/* Drag and Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={clsx(
            `p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all duration-300`,
            borderColor,
            isDragging ? `border-solid ${primaryColor} ${cardBackgroundColor}` : 'hover:border-gray-400'
          )}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <FaImage className="mx-auto text-4xl mb-3 text-gray-400"/>
            <p className="font-semibold">Drag & drop images here, or click to select files</p>
            <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
          </label>
        </div>

        {/* --- Image Previews --- */}
        {imagesToUpload.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-semibold mb-3">Selected Images ({imagesToUpload.length}):</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {imagesToUpload.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index}`}
                    className="w-full h-24 object-cover rounded-lg shadow-md"
                    onLoad={(e) => URL.revokeObjectURL(e.target.src)} // Clean up object URL
                  />
                  <button
                    onClick={() => removeImageToUpload(index)}
                    className="absolute top-0 right-0 p-1 bg-red-600 text-white rounded-full text-xs transition-opacity opacity-0 group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <FaTrashAlt/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || !imagesToUpload.length}
          className={clsx(
            'mt-6 w-full sm:w-auto px-6 py-2.5 text-lg font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2',
            buttonTextColor,
            {
              [`${primaryColor} ${hoverAccentColor}`]: !uploading && imagesToUpload.length > 0,
              'bg-gray-400 cursor-not-allowed': uploading || !imagesToUpload.length
            }
          )}
        >
          {uploading ? (
            <>
              <FaSpinner className="animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <FaUpload /> Upload {imagesToUpload.length > 0 ? imagesToUpload.length : ''} Image(s)
            </>
          )}
        </button>
      </div>

      {/* --- Current Highlights Section --- */}
      <div>
        <h3 className={`text-xl font-semibold mb-4 ${primaryColor}`}>Current Event Highlights</h3>
        {loadingHighlights ? (
          <div className="text-center py-8">
            <FaSpinner className="animate-spin text-4xl mx-auto text-gray-400"/>
            <p className="mt-2 text-gray-500">Loading highlights...</p>
          </div>
        ) : uploadedHighlights.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {uploadedHighlights.map((highlight) => (
              <div
                key={highlight._id}
                className={clsx(
                  'relative group rounded-lg overflow-hidden shadow-lg transition-transform duration-200 hover:scale-105',
                  deletingId === highlight._id && 'opacity-50'
                )}
              >
                <img
                  src={highlight.image}
                  alt="Event Highlight"
                  className="w-full h-32 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                  <button
                    onClick={() => handleDeleteHighlight(highlight._id)}
                    disabled={deletingId === highlight._id}
                    className="p-3 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100"
                    aria-label={`Delete highlight ${highlight._id}`}
                  >
                    {deletingId === highlight._id ? <FaSpinner className="animate-spin" /> : <FaTrashAlt />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-10 border-2 border-dashed rounded-lg ${borderColor}`}>
            <FaImage className="mx-auto text-5xl text-gray-400 mb-4"/>
            <p className="font-semibold">No highlights found.</p>
            <p className="text-gray-500">Upload some images to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadImageHighlights;