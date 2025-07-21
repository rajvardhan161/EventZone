// src/pages/CreateNoticePage.jsx

import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { FaBell, FaCalendarAlt, FaLink, FaInfoCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa'; // Added exclamation triangle for errors

const CreateNoticePage = () => {
  const { token, backendUrl } = useContext(AdminContext);
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [link, setLink] = useState('');
  const [linkText, setLinkText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Dynamic Styling based on Theme ---

  const containerStyles = {
    backgroundColor: currentTheme.bgColor || '#f4f7fc', // Lighter, airy background
    color: currentTheme.textColor || '#333333',
    fontFamily: currentTheme.fontFamily || 'Inter, sans-serif', // Modern, clean font
    padding: '40px 20px', // More vertical padding, less horizontal
  };

  const formCardStyles = {
    backgroundColor: currentTheme.cardBgColor || '#ffffff',
    color: currentTheme.textColor || '#333333',
    fontFamily: currentTheme.fontFamily || 'Inter, sans-serif',
    padding: '40px', // Increased padding inside the card
    borderRadius: '20px', // Softer, more modern rounded corners
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.1)', // Subtle, sophisticated shadow
    border: `1px solid ${currentTheme.borderColor || '#e2e8f0'}`, // Subtle border
  };

  const inputBaseStyles = {
    backgroundColor: currentTheme.inputBgColor || '#f9fafb',
    color: currentTheme.textColor || '#333333',
    borderColor: currentTheme.borderColor || '#d1d5eb',
    fontFamily: currentTheme.fontFamily || 'Inter, sans-serif',
    padding: '16px 20px', // Larger, more comfortable padding
    borderRadius: '12px', // Nicely rounded inputs
    borderWidth: '1px',
    fontSize: '1rem',
    width: 'calc(100% - 60px)', // Adjust width to account for icon space
    outline: 'none', // Remove default outline
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
  };

  const textareaStyles = {
    ...inputBaseStyles,
    minHeight: '180px', // Taller for more content
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
    fontSize: '1.5rem', // Slightly larger icons
    opacity: '0.7',
    color: currentTheme.accentColor || currentTheme.primaryColor || '#4f46e5', // Use accent or primary color for icons
    marginRight: '16px', // More space between icon and input
    marginTop: '3px', // Minor adjustment for alignment
  };

  const buttonStyles = {
    backgroundColor: currentTheme.primaryColor || '#4f46e5', // A vibrant primary color
    color: '#ffffff',
    fontFamily: currentTheme.fontFamily || 'Inter, sans-serif',
    padding: '16px 30px', // Larger button padding
    borderRadius: '12px', // Match input rounding
    fontWeight: '600',
    transition: 'background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease', // Smoother transitions
    fontSize: '1.05rem',
    width: '100%',
    border: 'none',
    cursor: 'pointer',
  };

  const errorStyles = {
    backgroundColor: '#fef2f2', // Light red background
    color: '#b91c1c', // Dark red text
    borderColor: '#fecaca', // Lighter red border
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '30px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    fontSize: '0.95rem',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!title.trim() || !message.trim()) {
      setError('Title and Message are required fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/notice/notices`,
        { title, message, expiresAt, link, linkText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Use a more subtle notification or Toastify if available
      alert('Notice created successfully!'); // Kept for simplicity, but consider a better notification system
      setTitle('');
      setMessage('');
      setExpiresAt('');
      setLink('');
      setLinkText('');
      navigate('/admin/notices');

    } catch (error) {
      console.error('Error creating notice:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred. Please try again.';
      setError(`Failed to create notice: ${errorMessage}`);
      // Consider using Toastify or a modal for error feedback
      alert(`Failed to create notice: ${errorMessage}`); // Kept for simplicity
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8" style={containerStyles}>
      <div className="max-w-3xl mx-auto" style={formCardStyles}>
        <h1 className={`text-4xl font-extrabold mb-10 text-center`} style={{ color: currentTheme.primaryColor }}>
          <FaBell className="inline-block mr-4 text-5xl -mt-2" />
          Create New Public Notice
        </h1>

        {error && (
          <div className="border text-red-700 px-5 py-4 rounded-lg mb-8 text-center shadow-sm" role="alert" style={errorStyles}>
            <FaExclamationTriangle className="text-2xl" />
            <p className="font-semibold flex-grow">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8"> {/* Increased spacing between fields */}
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
                placeholder="Enter notice title (e.g., Important Announcement)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={inputBaseStyles}
                className="focus:ring-2 focus:ring-primary-500 focus:border-transparent" // Tailwind-like focus states
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
                placeholder="Enter the detailed message content here..."
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
                  // Customizing date input appearance can be tricky, but we'll try
                  '-webkit-appearance': 'none', // Remove default Chrome/Safari styling
                  '-moz-appearance': 'none',    // Remove default Firefox styling
                  'appearance': 'none',         // Remove default generic styling
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
                placeholder="e.g., https://yourwebsite.com/updates"
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
                placeholder="e.g., Learn More"
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
            className="flex justify-center items-center shadow-xl hover:shadow-inner transform transition-all duration-300 ease-in-out hover:scale-105 active:scale-98"
            disabled={loading}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = currentTheme.secondaryColor || '#3b82f6'; // A slightly darker, complementary hover color
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = buttonStyles.backgroundColor;
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)'; // Reset shadow
            }}
          >
            {loading ? (
              <FaSpinner className="animate-spin mr-3 text-lg" />
            ) : (
              <span className="text-lg font-semibold">Create Notice</span>
            )}
          </button>
        </form>
        <p className="text-center text-sm mt-10 opacity-60 font-light">
          Notices help keep your community informed. Ensure clarity and conciseness.
        </p>
      </div>
    </div>
  );
};

export default CreateNoticePage;