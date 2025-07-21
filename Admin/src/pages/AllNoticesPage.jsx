// src/pages/AllNoticesPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext'; // Assuming you have a ThemeContext
import {
  FaBell, FaCalendarAlt, FaLink, FaInfoCircle, FaSpinner, FaTrash, FaEdit,
  FaUserCircle, FaExclamationTriangle, FaSearch, FaPlus
} from 'react-icons/fa'; // Added more useful icons
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify'; // For better notifications
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS

const AllNoticesPage = () => {
  const { token, backendUrl } = useContext(AdminContext);
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // --- Styling based on Theme ---

  const containerStyles = {
    backgroundColor: currentTheme.bgColor || '#f4f7fc',
    color: currentTheme.textColor || '#333333',
    fontFamily: currentTheme.fontFamily || 'Inter, sans-serif',
    padding: '40px 20px',
    minHeight: '100vh',
  };

  const titleStyles = {
    fontSize: '2.5rem', // Larger title
    fontWeight: '800', // Extra bold
    color: currentTheme.primaryColor || '#4f46e5',
    textAlign: 'center',
    marginBottom: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    letterSpacing: '-0.5px', // Subtle letter spacing
  };

  const searchContainerStyles = {
    backgroundColor: currentTheme.cardBgColor || '#ffffff',
    padding: '20px 25px',
    borderRadius: '16px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
    border: `1px solid ${currentTheme.borderColor || '#e2e8f0'}`,
    marginBottom: '40px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  };

  const searchInputStyles = {
    backgroundColor: 'transparent', // Transparent background for input
    color: currentTheme.textColor || '#333333',
    fontSize: '1.1rem',
    flexGrow: 1, // Take available space
    outline: 'none',
    border: 'none', // Remove input border
  };

  const errorMessageStyles = {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    borderColor: '#fecaca',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '40px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    fontSize: '1rem',
    fontWeight: '500',
  };

  const noticeCardStyles = {
    backgroundColor: currentTheme.cardBgColor || '#ffffff',
    color: currentTheme.textColor || '#333333',
    padding: '30px', // Increased padding
    borderRadius: '18px', // Even softer corners
    boxShadow: '0 12px 30px rgba(0,0,0,0.12)', // Deeper shadow
    border: `1px solid ${currentTheme.borderColor || '#e2e8f0'}`,
    marginBottom: '25px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    overflow: 'hidden', // To contain floated elements or borders
  };

  const noticeTitleStyles = {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '12px',
    color: currentTheme.primaryColor || '#4f46e5',
    lineHeight: '1.3',
  };

  const noticeMessageStyles = {
    fontSize: '1.05rem',
    lineHeight: '1.7',
    marginBottom: '20px',
    opacity: '0.9',
    color: currentTheme.textColor || '#333333',
  };

  const noticeLinkStyles = {
    color: currentTheme.primaryColor || '#4f46e5',
    fontWeight: '600',
    textDecoration: 'none',
    borderBottom: `2px solid ${currentTheme.primaryColor || '#4f46e5'}`,
    paddingBottom: '3px',
    transition: 'color 0.3s ease, border-color 0.3s ease, transform 0.2s ease',
    display: 'inline-flex', // Use flex for icon alignment
    alignItems: 'center',
    gap: '8px',
  };

  const footerInfoStyles = {
    fontSize: '0.9rem',
    opacity: '0.75',
    marginTop: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap', // Allow wrapping on smaller screens
    gap: '10px',
  };

  const actionButtonBase = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.3rem', // Slightly larger icons
    padding: '10px',
    borderRadius: '10px',
    transition: 'background-color 0.2s ease, color 0.2s ease, transform 0.1s ease',
  };

  const editButtonStyle = {
    ...actionButtonBase,
    color: currentTheme.accentColor || '#3b82f6', // Use accent color
  };

  const deleteButtonStyle = {
    ...actionButtonBase,
    color: '#ef4444', // Red for delete
  };

  const createNoticeButtonStyles = {
    backgroundColor: currentTheme.secondaryColor || '#3b82f6', // Complementary color for the button
    color: '#ffffff',
    padding: '14px 25px',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
  };

  // --- No Notices Found Styles ---
  const emptyStateStyles = {
    backgroundColor: currentTheme.cardBgColor || '#ffffff', // Use card background for consistency
    color: currentTheme.textColor || '#333333',
    padding: '40px', // Generous padding
    borderRadius: '20px', // Soft, modern corners
    border: `2px dashed ${currentTheme.borderColor || '#d1d5eb'}`, // Dashed border for emphasis
    opacity: '0.85', // Slightly transparent
    display: 'flex',
    flexDirection: 'column', // Stack elements vertically
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px', // Space between elements
    minHeight: '300px', // Give it some minimum height
  };

  const emptyStateTitleStyles = {
    fontSize: '1.8rem', // Larger title for this section
    fontWeight: '700',
    color: currentTheme.primaryColor || '#4f46e5',
    marginBottom: '0', // Remove default margin if any
  };

  const emptyStateSubtitleStyles = {
    fontSize: '1.1rem',
    opacity: '0.8',
    maxWidth: '60%', // Keep text from stretching too wide
  };

  // --- Fetching Notices ---
  const fetchNotices = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${backendUrl}/api/notice/get/notices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sortedNotices = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotices(sortedNotices);
    } catch (err) {
      console.error('Error fetching notices:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Could not fetch notices.';
      setError(`Failed to fetch notices: ${errorMessage}`);
      toast.error(`Failed to fetch notices: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Deleting a Notice ---
  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice? This action cannot be undone.')) {
      return;
    }
    try {
      await axios.delete(`${backendUrl}/api/notice/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotices(notices.filter(notice => notice._id !== id));
      toast.success('Notice deleted successfully!');
    } catch (err) {
      console.error('Error deleting notice:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Could not delete notice.';
      setError(`Failed to delete notice: ${errorMessage}`); // Set a page-level error if deletion fails
      toast.error(`Failed to delete notice: ${errorMessage}`);
    }
  };

  // --- Navigating to Edit ---
  const handleEditNotice = (id) => {
    navigate(`/notices/edit/${id}`);
  };

  // --- Filtering Logic ---
  const filteredNotices = notices.filter(notice =>
    notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notice.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (notice.sentByAdminId?.username && notice.sentByAdminId.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    fetchNotices();
  }, []);

  // --- Helper to style hover states ---
  const handleMouseEnter = (e, styles) => {
    Object.assign(e.currentTarget.style, styles);
  };

  const handleMouseLeave = (e, defaultStyles) => {
    Object.assign(e.currentTarget.style, defaultStyles);
  };

  return (
    <div style={containerStyles}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={currentTheme.isDark ? "dark" : "light"} // Adjust theme based on your Dark Mode
      />
      <div className="max-w-5xl mx-auto"> {/* Wider container for more content */}

        <div className="flex justify-between items-center mb-12"> {/* Title and Create Button */}
          <h1 className="" style={titleStyles}>
            <FaBell className="text-6xl -mt-3" />
            Announcements Board
          </h1>
          <button
            onClick={() => navigate('/notices/create')} // Make sure this path is correct in your router
            style={createNoticeButtonStyles}
            className="hover:scale-105 transition-transform duration-300"
            onMouseEnter={(e) => handleMouseEnter(e, { backgroundColor: currentTheme.primaryColor || '#3b82f6', transform: 'scale(1.02)' })}
            onMouseLeave={(e) => handleMouseLeave(e, createNoticeButtonStyles)}
          >
            <FaPlus className="text-lg" /> New Notice
          </button>
        </div>

        {/* Search Bar */}
        <div className="shadow-lg" style={searchContainerStyles}>
          <FaSearch className="text-xl opacity-60" style={{ color: currentTheme.accentColor }} />
          <input
            type="text"
            placeholder="Search announcements by title, message, or sender..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyles}
            className="focus:ring-none" // Remove focus ring if it conflicts
          />
        </div>

        {error && !loading && ( // Only show error if not loading (to avoid showing error while loading)
          <div className="shadow-sm mb-10" role="alert" style={errorMessageStyles}>
            <FaExclamationTriangle className="text-2xl" />
            <p className="flex-grow">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-72">
            <FaSpinner className="animate-spin text-5xl mr-4" style={{ color: currentTheme.primaryColor }} />
            <p className="text-xl" style={{ color: currentTheme.textColor }}>Fetching announcements...</p>
          </div>
        ) : filteredNotices.length === 0 ? (
          // --- MODIFIED BLOCK for Empty State ---
          <div style={emptyStateStyles}>
            <FaBell className="text-7xl" style={{ color: currentTheme.primaryColor || '#4f46e5' }} />
            <h2 style={emptyStateTitleStyles}>
              {searchTerm ? "No Matching Announcements Found" : "Your Announcements Board is Empty"}
            </h2>
            <p style={emptyStateSubtitleStyles}>
              {searchTerm ? (
                `There are no announcements matching "${searchTerm}".`
              ) : (
                "It looks like there are no announcements to display right now."
              )}
            </p>
            <p className="text-lg">
              Ready to share something important?
            </p>
            <button
              onClick={() => navigate('/notices/create')} // Ensure this path is correct in your router
              style={createNoticeButtonStyles}
              className="hover:scale-105 transition-transform duration-300"
              onMouseEnter={(e) => handleMouseEnter(e, { backgroundColor: currentTheme.primaryColor || '#3b82f6', transform: 'scale(1.02)' })}
              onMouseLeave={(e) => handleMouseLeave(e, createNoticeButtonStyles)}
            >
              <FaPlus className="text-lg" /> Create New Announcement
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> {/* Two columns for larger screens */}
            {filteredNotices.map((notice) => (
              <div key={notice._id} className="group" style={noticeCardStyles}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 18px 40px rgba(0,0,0,0.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)'; }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="font-bold text-xl" style={noticeTitleStyles}>
                    {notice.title}
                  </h2>
                  <div className="flex items-center space-x-4"> {/* Action buttons */}
                    <button
                      onClick={() => handleEditNotice(notice._id)}
                      style={editButtonStyle}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2"
                      title="Edit Notice"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteNotice(notice._id)}
                      style={deleteButtonStyle}
                      className="hover:bg-red-100 dark:hover:bg-red-900 rounded-full p-2"
                      title="Delete Notice"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <p className="text-base" style={noticeMessageStyles}>{notice.message}</p>

                {notice.link && (
                  <div className="mb-5">
                    <a
                      href={notice.link}
                      className="text-base inline-flex items-center"
                      style={noticeLinkStyles}
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseEnter={(e) => handleMouseEnter(e, { color: currentTheme.secondaryColor || '#3b82f6', borderColor: currentTheme.secondaryColor || '#3b82f6', transform: 'scale(1.02)' })}
                      onMouseLeave={(e) => handleMouseLeave(e, noticeLinkStyles)}
                    >
                      {notice.linkText || 'View Link'} <FaLink className="text-sm" />
                    </a>
                  </div>
                )}

                <div className="footer-info" style={footerInfoStyles}>
                  <div className="flex items-center gap-2 text-sm">
                    <FaUserCircle className="text-xl opacity-70" />
                    <p>
                      Sent by: <strong className="font-semibold">{notice.sentByAdminId?.username || ' Admin'}</strong>
                    </p>
                  </div>
                  {notice.expiresAt && (
                    <div className="flex items-center gap-1 text-red-600 font-medium text-sm">
                      <FaCalendarAlt />
                      Expires: {new Date(notice.expiresAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllNoticesPage;