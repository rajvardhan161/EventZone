// src/pages/PublicNoticesListView.jsx

import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { FaClipboardList, FaCalendarAlt, FaLink, FaExpandArrowsAlt, FaUserCircle } from 'react-icons/fa'; // Added FaUserCircle

const PublicNoticesListView = () => {
  const { token, backendUrl } = useContext(AppContext);
  const { currentTheme } = useTheme();

  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null); // To store the notice for fullscreen view

  const fetchPublicNotices = useCallback(async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/notice/user/notices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Sort by createdAt in descending order
      setNotices(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch {
      setNotices([]);
    }
  }, [backendUrl, token]);

  useEffect(() => {
    fetchPublicNotices();
  }, [fetchPublicNotices]);

  const handleOpenFullscreen = (notice) => {
    setSelectedNotice(notice);
    document.body.style.overflow = 'hidden'; // Prevent scrolling while modal is open
  };

  const handleCloseFullscreen = () => {
    setSelectedNotice(null);
    document.body.style.overflow = ''; // Restore scrolling
  };

  // Inline styles for consistency with the previous component
  const tableHeaderStyles = {
    color: currentTheme.primaryColor || '#4f46e5',
    fontWeight: '600',
    padding: '10px 12px',
  };

  const tableRowStyles = {
    borderBottom: `1px solid ${currentTheme.borderColor || '#e0e0e0'}`,
    transition: 'background-color 0.2s ease',
    cursor: 'pointer', // Make the whole row clickable
  };

  const tableCellStyles = {
    padding: '15px 12px',
    color: currentTheme.textColor || '#333333',
  };

  const noticeTitleLinkStyles = {
    color: currentTheme.primaryColor || '#4f46e5',
    textDecoration: 'none',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'color 0.3s ease',
  };

  const postDateStyles = {
    fontSize: '0.85rem',
    opacity: '0.7',
  };

  const footerInfoStyles = {
    fontSize: '0.85rem',
    opacity: '0.8',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const expiredStatusStyles = {
    color: '#dc2626', // Red color for expired status
    fontWeight: '500',
  };

  const postedStatusStyles = {
    color: '#10b981', // Green color for posted status
    fontWeight: '500',
  };

  const draftStatusStyles = {
    color: '#6b7280', // Gray color for draft status
    fontWeight: '500',
  };

  const fullscreenOverlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent dark overlay
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const fullscreenContentStyles = {
    backgroundColor: currentTheme.bgColor || '#fff',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
    maxWidth: '90%',
    maxHeight: '85vh',
    overflowY: 'auto',
    position: 'relative',
  };

  const fullscreenTitleStyles = {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: currentTheme.primaryColor || '#4f46e5',
    marginBottom: '20px',
  };

  const fullscreenMessageStyles = {
    fontSize: '1.15rem',
    lineHeight: '1.8',
    marginBottom: '30px',
    opacity: '0.9',
    color: currentTheme.textColor || '#333333',
  };

  const fullscreenLinkStyles = {
    color: currentTheme.secondaryColor || '#3b82f6',
    fontWeight: '600',
    textDecoration: 'none',
    borderBottom: `2px solid ${currentTheme.secondaryColor || '#3b82f6'}`,
    paddingBottom: '4px',
    transition: 'color 0.3s ease, border-color 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '1.05rem',
  };

  const fullscreenCloseButtonStyles = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    fontSize: '2rem',
    color: currentTheme.textColor || '#333333',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
  };

  // Helper to get the status and styles
  const getStatusInfo = (notice) => {
    const createdAt = new Date(notice.createdAt);
    const expiresAt = notice.expiresAt ? new Date(notice.expiresAt) : null;
    const isExpired = expiresAt && expiresAt < new Date();

    let statusText;
    let statusStyles;

    if (isExpired) {
      statusText = 'Expired';
      statusStyles = expiredStatusStyles;
    } else if (notice.status === 'Draft') {
      statusText = 'Draft';
      statusStyles = draftStatusStyles;
    } else {
      statusText = 'Posted';
      statusStyles = postedStatusStyles;
    }
    return { statusText, statusStyles, createdAt, expiresAt };
  };


  return (
    <div className="p-6" style={{ backgroundColor: currentTheme.bgColor || '#fff' }}>
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3" style={{ color: currentTheme.primaryColor }}>
        <FaClipboardList /> Public Announcements
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full text-left" style={{ borderCollapse: 'separate', borderSpacing: '0 15px' }}>
          <thead>
            <tr>
              <th className="py-3 pl-4 font-semibold" style={tableHeaderStyles}>Announcement</th>
              <th className="py-3 font-semibold" style={tableHeaderStyles}>Status</th>
              <th className="py-3 font-semibold" style={tableHeaderStyles}>Post Date</th>
              <th className="py-3 font-semibold" style={tableHeaderStyles}>Expires</th>
              {/* Removed the "Link" header and "Action" header */}
              <th className="py-3 pr-4 font-semibold text-right" style={tableHeaderStyles}>Details</th> {/* Added "Details" header for the expand icon */}
            </tr>
          </thead>
          <tbody>
            {notices.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500" style={{ color: currentTheme.textColor || '#333333', opacity: '0.7' }}>
                  No announcements available.
                </td>
              </tr>
            ) : (
              notices.map((notice) => {
                const { statusText, statusStyles, createdAt, expiresAt } = getStatusInfo(notice);

                return (
                  <tr
                    key={notice._id}
                    className="hover:bg-gray-50 transition-colors"
                    style={tableRowStyles}
                    onClick={() => handleOpenFullscreen(notice)} // Make the entire row clickable
                  >
                    <td className="py-3 pl-4 rounded-l-lg" style={tableCellStyles}>
                      {/* Display link text if available, otherwise just the title */}
                      {notice.link ? (
                        <span
                          className="flex items-center gap-2"
                          style={noticeTitleLinkStyles}
                          // No click handler here to prevent direct navigation, the row click will open fullscreen
                        >
                          {notice.title} <FaLink className="text-xs" />
                        </span>
                      ) : (
                        <span className="flex items-center gap-2" style={{ color: currentTheme.textColor || '#333333' }}>
                          {notice.title}
                        </span>
                      )}
                    </td>
                    <td className="py-3" style={{ ...tableCellStyles, ...statusStyles }}>
                      {statusText}
                    </td>
                    <td className="py-3" style={tableCellStyles}>
                      <div className="flex flex-col">
                        <span style={postDateStyles}>{createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span style={postDateStyles}>{createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                      </div>
                    </td>
                    <td className="py-3" style={tableCellStyles}>
                      {expiresAt ? (
                        <div className="flex items-center gap-1" style={footerInfoStyles}>
                          <FaCalendarAlt />
                          <span>{expiresAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1" style={footerInfoStyles}>
                          <FaCalendarAlt />
                          <span>N/A</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 pr-4 rounded-r-lg text-right" style={tableCellStyles}>
                      {/* Expand icon remains for explicit click to open fullscreen */}
                      <button
                        aria-label="View Fullscreen"
                        onClick={(e) => { e.stopPropagation(); handleOpenFullscreen(notice); }} // Prevent row click
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                        style={{ color: currentTheme.textColor }}
                      >
                        <FaExpandArrowsAlt />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Fullscreen Modal */}
      {selectedNotice && (
        <div style={fullscreenOverlayStyles} onClick={handleCloseFullscreen}>
          <div style={fullscreenContentStyles} onClick={(e) => e.stopPropagation()}> {/* Prevent closing on content click */}
            <button style={fullscreenCloseButtonStyles} onClick={handleCloseFullscreen}>×</button>
            <h2 style={fullscreenTitleStyles}>{selectedNotice.title}</h2>
            <p className="text-base" style={fullscreenMessageStyles}>{selectedNotice.message}</p>

            {selectedNotice.link && (
              <div className="mb-5">
                <a
                  href={selectedNotice.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={fullscreenLinkStyles}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = currentTheme.secondaryColor || '#3b82f6';
                    e.currentTarget.style.borderColor = currentTheme.secondaryColor || '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = currentTheme.primaryColor || '#4f46e5';
                    e.currentTarget.style.borderColor = currentTheme.primaryColor || '#4f46e5';
                  }}
                >
                  {selectedNotice.linkText || 'View Link'} <FaLink className="text-xs" />
                </a>
              </div>
            )}

            <div className="mt-auto pt-6 border-t" style={{ ...footerInfoStyles, borderTopColor: currentTheme.borderColor || '#e0e0e0' }}>
              <div className="flex items-center gap-2">
                <FaUserCircle className="text-xl opacity-70" />
                <p>
                  Sent by: <strong className="font-semibold">{selectedNotice.sentByAdminId?.username || ' Admin'}</strong>
                </p>
              </div>
              {selectedNotice.expiresAt && (
                <div className="flex items-center gap-1" style={footerInfoStyles}>
                  <FaCalendarAlt />
                  Expires: {new Date(selectedNotice.expiresAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicNoticesListView;