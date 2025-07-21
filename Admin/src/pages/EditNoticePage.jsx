// src/pages/EditNoticePage.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; // Import useParams to get notice ID
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { FaBell, FaCalendarAlt, FaLink, FaInfoCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa'; // Essential icons
import { toast } from 'react-toastify'; // For better feedback

const EditNoticePage = () => {
  const { token, backendUrl } = useContext(AdminContext);
  const { currentTheme } = useTheme();
  const { id } = useParams(); // Get the notice ID from the URL
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [link, setLink] = useState('');
  const [linkText, setLinkText] = useState('');
  const [loading, setLoading] = useState(true); // Start as loading to fetch data
  const [error, setError] = useState('');

  // --- Styling based on Theme ---

  const containerStyles = {
    backgroundColor: currentTheme.bgColor || '#f4f7fc',
    color: currentTheme.textColor || '#333333',
    fontFamily: currentTheme.fontFamily || 'Inter, sans-serif',
    padding: '40px 20px',
    minHeight: '100vh',
  };

  const formCardStyles = {
    backgroundColor: currentTheme.cardBgColor || '#ffffff',
    color: currentTheme.textColor || '#333333',
    fontFamily: currentTheme.fontFamily || 'Inter, sans-serif',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
    border: `1px solid ${currentTheme.borderColor || '#e2e8f0'}`,
  };

  const titleStyles = {
    fontSize: '2.2rem',
    fontWeight: '700',
    color: currentTheme.primaryColor || '#4f46e5',
    textAlign: 'center',
    marginBottom: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
  };

  const inputBaseStyles = {
    backgroundColor: currentTheme.inputBgColor || '#f9fafb',
    color: currentTheme.textColor || '#333333',
    borderColor: currentTheme.borderColor || '#d1d5eb',
    fontFamily: currentTheme.fontFamily || 'Inter, sans-serif',
    padding: '16px 20px',
    borderRadius: '12px',
    borderWidth: '1px',
    fontSize: '1rem',
    width: 'calc(100% - 60px)', // Account for icon space
    outline: 'none',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
  };

  const textareaStyles = {
    ...inputBaseStyles,
    minHeight: '180px',
    resize: 'vertical',
  };

  const labelStyles = {
    fontSize: '0.95rem',
    fontWeight: '500',
    color: currentTheme.textColor || '#333333',
    marginBottom: '10px',
    display: 'block',
  };

  const iconStyles = {
    fontSize: '1.5rem',
    opacity: '0.7',
    color: currentTheme.accentColor || currentTheme.primaryColor || '#4f46e5',
    marginRight: '16px',
    marginTop: '3px',
  };

  const buttonStyles = {
    backgroundColor: currentTheme.primaryColor || '#4f46e5',
    color: '#ffffff',
    fontFamily: currentTheme.fontFamily || 'Inter, sans-serif',
    padding: '16px 30px',
    borderRadius: '12px',
    fontWeight: '600',
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease',
    fontSize: '1.05rem',
    width: '100%',
    border: 'none',
    cursor: 'pointer',
  };

  const loadingStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px',
    fontSize: '1.2rem',
    color: currentTheme.textColor || '#333333',
  };

  const errorMessageStyles = {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    borderColor: '#fecaca',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '30px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    fontSize: '0.95rem',
  };

  // --- Fetching Notice Data ---
  const fetchNoticeData = async () => {
    setError(''); // Clear any previous errors
    try {
      const response = await axios.get(`${backendUrl}/api/notice/get/${id}`, { // Assuming GET endpoint by ID
        headers: { Authorization: `Bearer ${token}` }
      });
      const noticeData = response.data;
      setTitle(noticeData.title);
      setMessage(noticeData.message);
      // Format date to YYYY-MM-DD for input type="date"
      setExpiresAt(noticeData.expiresAt ? noticeData.expiresAt.split('T')[0] : '');
      setLink(noticeData.link || '');
      setLinkText(noticeData.linkText || '');
    } catch (err) {
      console.error('Error fetching notice data:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Could not fetch notice details.';
      setError(`Failed to load notice: ${errorMessage}`);
      toast.error(`Failed to load notice: ${errorMessage}`);
    } finally {
      setLoading(false); // Stop loading after fetch attempt
    }
  };

  // --- Handling Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Indicate saving is in progress
    setError('');

    if (!title.trim() || !message.trim()) {
      setError('Title and Message are required fields.');
      setLoading(false);
      return;
    }

    try {
      await axios.put( // Use PUT for updating
        `${backendUrl}/api/notice/update/${id}`,
        { title, message, expiresAt, link, linkText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Notice updated successfully!');
      navigate('/notices'); // Redirect back to the notices list
    } catch (err) {
      console.error('Error updating notice:', err);
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.';
      setError(`Failed to update notice: ${errorMessage}`);
      toast.error(`Failed to update notice: ${errorMessage}`);
    } finally {
      setLoading(false); // Stop saving indicator
    }
  };

  useEffect(() => {
    fetchNoticeData();
  }, []); // Fetch data when the component mounts

  return (
    <div style={containerStyles}>
      <div className="max-w-3xl mx-auto" style={formCardStyles}>
        <h1 className="text-3xl font-bold mb-8 text-center" style={titleStyles}>
          <FaBell className="text-5xl -mt-2" />
          Edit Announcement
        </h1>

        {error && (
          <div className="shadow-sm mb-8" role="alert" style={errorMessageStyles}>
            <FaExclamationTriangle className="text-2xl" />
            <p className="flex-grow">{error}</p>
          </div>
        )}

        {loading ? (
          <div style={loadingStyles}>
            <FaSpinner className="animate-spin text-4xl mr-3" style={{ color: currentTheme.primaryColor }} />
            <p className="text-lg">Loading announcement details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title Input */}
            <div>
              <label htmlFor="noticeTitle" className="block text-base font-medium mb-2" style={labelStyles}>
                Notice Title
              </label>
              <div className="flex items-center">
                <FaInfoCircle style={iconStyles} />
                <input
                  id="noticeTitle"
                  type="text"
                  placeholder="Enter notice title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={inputBaseStyles}
                  className="focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Message Textarea */}
            <div>
              <label htmlFor="noticeMessage" className="block text-base font-medium mb-2" style={labelStyles}>
                Notice Message
              </label>
              <div className="flex items-start">
                <FaBell style={iconStyles} />
                <textarea
                  id="noticeMessage"
                  placeholder="Enter the detailed message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={textareaStyles}
                  className="focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Expiry Date Input */}
            <div>
              <label htmlFor="noticeExpiresAt" className="block text-base font-medium mb-2" style={labelStyles}>
                Expiry Date (Optional)
              </label>
              <div className="flex items-center">
                <FaCalendarAlt style={iconStyles} />
                <input
                  id="noticeExpiresAt"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  style={{
                    ...inputBaseStyles,
                    '-webkit-appearance': 'none',
                    '-moz-appearance': 'none',
                    'appearance': 'none',
                  }}
                  className="focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Link Input */}
            <div>
              <label htmlFor="noticeLink" className="block text-base font-medium mb-2" style={labelStyles}>
                Optional Link URL
              </label>
              <div className="flex items-center">
                <FaLink style={iconStyles} />
                <input
                  id="noticeLink"
                  type="url"
                  placeholder="e.g., https://example.com/news"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  style={inputBaseStyles}
                  className="focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Link Text Input */}
            <div>
              <label htmlFor="noticeLinkText" className="block text-base font-medium mb-2" style={labelStyles}>
                Optional Link Text
              </label>
              <div className="flex items-center">
                <FaInfoCircle style={iconStyles} />
                <input
                  id="noticeLinkText"
                  type="text"
                  placeholder="e.g., Read More"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  style={inputBaseStyles}
                  className="focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={buttonStyles}
              className="w-full shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 active:scale-98"
              disabled={loading}
              onMouseEnter={(e) => handleMouseEnter(e, { backgroundColor: currentTheme.secondaryColor || '#3b82f6', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' })}
              onMouseLeave={(e) => handleMouseLeave(e, buttonStyles)}
            >
              {loading ? (
                <FaSpinner className="animate-spin mr-3 text-lg" />
              ) : (
                <span className="text-lg font-semibold">Update Announcement</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditNoticePage;