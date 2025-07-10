import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaImage, FaFileImage, FaArrowLeft } from 'react-icons/fa';

const AdminEventApplicationsView = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { backendUrl, token } = useContext(AdminContext);
  const { currentTheme } = useTheme();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [eventName, setEventName] = useState('');

  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const fetchEventApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${backendUrl}/api/admin/applications/event/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedApplications = response.data;

      if (!Array.isArray(fetchedApplications)) {
        console.error("API did not return an array for applications:", fetchedApplications);
        setError("Unexpected data format received from server.");
        setLoading(false);
        return;
      }

      if (fetchedApplications.length > 0 && fetchedApplications[0].eventName) {
        setEventName(fetchedApplications[0].eventName);
      } else if (eventId) {
        setEventName(`Event ID: ${eventId}`);
      } else {
        setEventName("Unknown Event");
      }

      const sortedApplications = fetchedApplications.sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate));
      setApplications(sortedApplications);

    } catch (err) {
      console.error(`Error fetching applications for event ${eventId}:`, err);
      const errorMessage = err.response?.data?.message || err.message || 'An unknown error occurred.';
      setError(`Failed to load applications for event ${eventId}: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appId) => {
    setActionLoading(prev => ({ ...prev, [appId]: true }));
    try {
      const response = await axios.post(`${backendUrl}/api/admin/applications/${appId}/status`, {
        status: 'Approved'
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`Application ${appId} status update response:`, response.data);
      setApplications(prev => prev.map(app =>
        app._id === appId ? { ...app, status: 'Approved' } : app
      ));
      alert(`Application ${appId} approved successfully!`);
      // Fetch again to ensure the state is consistent, or directly update
      fetchEventApplications(); // Re-fetch to get updated status and avoid potential stale data issues

    } catch (err) {
      console.error(`Error approving application ${appId}:`, err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to approve.';
      alert(`Failed to approve application ${appId}: ${errorMessage}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [appId]: false }));
    }
  };

  const handleReject = async (appId) => {
    setActionLoading(prev => ({ ...prev, [appId]: true }));
    try {
      const response = await axios.post(`${backendUrl}/api/admin/applications/${appId}/status`, {
        status: 'Rejected'
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`Application ${appId} status update response:`, response.data);
      setApplications(prev => prev.map(app =>
        app._id === appId ? { ...app, status: 'Rejected' } : app
      ));
      alert(`Application ${appId} rejected successfully!`);
      // Fetch again to ensure the state is consistent, or directly update
      fetchEventApplications(); // Re-fetch to get updated status

    } catch (err) {
      console.error(`Error rejecting application ${appId}:`, err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to reject.';
      alert(`Failed to reject application ${appId}: ${errorMessage}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [appId]: false }));
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEventApplications();
    } else {
      setError("Event ID is missing in the URL. Cannot fetch applications.");
      setLoading(false);
    }
  }, [eventId]);

  const getContrastTextColor = (bgColor) => {
    if (!bgColor) return '#333333';
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  const containerStyle = {
    backgroundColor: currentTheme.bgColor || '#ffffff',
    color: currentTheme.textColor || '#333333',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif',
  };

  const tableHeaderStyle = {
    backgroundColor: currentTheme.navbarBgColor || '#f0f0f0',
    color: getContrastTextColor(currentTheme.navbarBgColor || '#f0f0f0'),
    padding: '12px 15px',
    textAlign: 'left',
    borderBottom: `2px solid ${getContrastTextColor(currentTheme.navbarBgColor || '#f0f0f0')}`,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  };

  const baseCellStyle = {
    padding: '15px',
    borderBottom: '1px solid rgba(0,0,0,0.1)',
    fontSize: '0.9375rem',
    lineHeight: '1.5',
  };

  const getStatusBadgeStyle = (status) => {
    let bgColor, textColor;
    switch (status) {
      case 'Pending': bgColor = '#fde68a'; textColor = '#92400e'; break; // Yellow
      case 'Approved': bgColor = '#bbf7d0'; textColor = '#166534'; break; // Green
      case 'Rejected': bgColor = '#fecaca'; textColor = '#991b1b'; break; // Red
      default: bgColor = '#e5e7eb'; textColor = '#374151'; // Gray
    }
    return { backgroundColor: bgColor, color: textColor, padding: '0.6rem 1rem', borderRadius: '9999px', fontWeight: 'semibold', fontSize: '0.875rem', lineHeight: '1.25rem' };
  };

  const handleImageClick = (imageUrl) => {
    if (imageUrl && imageUrl !== 'null') {
      setSelectedImage(imageUrl);
      setIsImageModalOpen(true);
    }
  };

  const renderImageThumbnail = (imageUrl, label, icon) => {
    if (!imageUrl || imageUrl === 'null') return null;
    return (
      <div
        className="flex items-center gap-1 p-1 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-200"
        onClick={() => handleImageClick(imageUrl)}
        key={imageUrl}
      >
        {icon && React.cloneElement(icon, { className: "text-lg" })}
        <span className="text-xs font-medium">{label}</span>
      </div>
    );
  };

  const handleGoBack = () => {
    navigate(-1); // Navigates to the previous page in the browser history
  };

  // Define button styles for Approve and Reject
  const approveButtonStyle = {
    backgroundColor: '#28a745', // Green
    color: 'white',
    padding: '8px 12px',
    borderRadius: '5px',
    border: 'none',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    transition: 'transform 0.2s ease, opacity 0.2s ease',
  };

  const rejectButtonStyle = {
    backgroundColor: '#dc3545', // Red
    color: 'white',
    padding: '8px 12px',
    borderRadius: '5px',
    border: 'none',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    transition: 'transform 0.2s ease, opacity 0.2s ease',
  };

  return (
    <div style={containerStyle} className="admin-event-applications-view p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition duration-200"
          style={{
            backgroundColor: currentTheme.sidebarBgColor || '#60a5fa',
            color: getContrastTextColor(currentTheme.sidebarBgColor || '#60a5fa'),
          }}
        >
          <FaArrowLeft className="text-lg" /> Back
        </button>
        <h2 className="text-3xl font-bold" style={{ color: currentTheme.textColor }}>
          Applications for: {eventName}
        </h2>
        <div></div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64" style={{ color: currentTheme.textColor }}>
          <FaSpinner className="animate-spin mr-3" size={24} />
          <p className="text-lg">Loading Applications for this Event...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center mb-6" role="alert">
          <strong className="font-bold text-lg">Error!</strong>
          <span className="block sm:inline text-lg"> {error}</span>
          <button onClick={fetchEventApplications} className="ml-4 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-600">Retry</button>
        </div>
      )}

      {!loading && !error && applications.length === 0 && (
        <p className="text-center text-gray-500 py-16 text-xl">
          No applications found for this event.
        </p>
      )}

      {!loading && !error && applications.length > 0 && (
        <div className="overflow-x-auto shadow-xl rounded-lg">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th style={tableHeaderStyle} className="px-6 py-4 uppercase">User & Contact</th>
                <th style={tableHeaderStyle} className="px-6 py-4 uppercase">Application Details</th>
                <th style={tableHeaderStyle} className="px-6 py-4 uppercase">Event Info</th>
                <th style={tableHeaderStyle} className="px-6 py-4 uppercase">Status & Payment</th>
                <th style={tableHeaderStyle} className="px-6 py-4 uppercase text-center">Images</th>
                <th style={tableHeaderStyle} className="px-6 py-4 uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, index) => {
                const isPending = app.status === 'Pending';
                const isApproved = app.status === 'Approved';
                const isRejected = app.status === 'Rejected';

                // Determine row background color for alternating rows
                const rowBgColor = index % 2 === 0
                  ? (currentTheme.bgColor || '#ffffff') // Use theme's primary background or default white
                  : (currentTheme.sidebarBgColor ? '#3f3f46' : '#f9f9f9'); // Use theme's sidebar background for a contrast, or a light gray
                const rowTextColor = getContrastTextColor(rowBgColor);

                const currentRowStyle = {
                  ...baseCellStyle,
                  backgroundColor: rowBgColor,
                  color: rowTextColor,
                };

                // Define hover effect style
                const rowHoverStyle = {
                    backgroundColor: rowBgColor === '#ffffff' ? '#f0f0f0' : // Light hover
                                     rowBgColor === '#3f3f46' ? '#4a4a4a' : // Dark hover
                                     getContrastTextColor(rowBgColor) === '#FFFFFF' ? '#555555' : '#EEEEEE' // Fallback for other theme colors
                };

                return (
                  <tr
                    key={app._id}
                    className="transition-colors duration-300"
                    style={{ ...currentRowStyle }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = rowHoverStyle.backgroundColor}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = rowBgColor}
                  >
                    <td style={currentRowStyle} className="text-base whitespace-nowrap">
                      <p className="font-semibold">{app.userName || 'N/A'}</p>
                      <p className="text-sm" style={{ color: rowTextColor === '#FFFFFF' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>{app.userEmail || 'N/A'}</p>
                      <p className="text-sm" style={{ color: rowTextColor === '#FFFFFF' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>Phone: {app.phone_no || 'N/A'}</p>
                      <p className="text-sm" style={{ color: rowTextColor === '#FFFFFF' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>Gender: {app.gender || 'N/A'}</p>
                      <p className="text-sm" style={{ color: rowTextColor === '#FFFFFF' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>Course: {app.course || 'N/A'}</p>
                    </td>

                    <td style={currentRowStyle} className="text-sm whitespace-nowrap">
                      <p>Applied: {new Date(app.applicationDate).toLocaleString()}</p>
                      <p className="text-sm" style={{ color: rowTextColor === '#FFFFFF' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>Notes: {app.notes || 'N/A'}</p>
                    </td>

                    <td style={currentRowStyle} className="text-sm whitespace-nowrap">
                      <p className="font-semibold">{app.eventName || 'N/A'}</p>
                      <p className="text-sm" style={{ color: rowTextColor === '#FFFFFF' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>Date: {new Date(app.eventDate).toLocaleDateString()}</p>
                      <p className="text-sm" style={{ color: rowTextColor === '#FFFFFF' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>Price: ₹{app.price !== undefined ? app.price.toFixed(2) : 'N/A'}</p>
                    </td>

                    <td style={currentRowStyle} className="text-sm whitespace-nowrap">
                      <span
                        className="inline-block px-3 py-1 font-semibold leading-tight rounded-full"
                        style={getStatusBadgeStyle(app.status)}
                      >
                        {app.status}
                      </span>
                      <p className="text-xs mt-1" style={{ color: rowTextColor === '#FFFFFF' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                        Payment: {app.paymentStatus || 'N/A'}
                      </p>
                    </td>

                    <td style={currentRowStyle} className="p-3 flex flex-wrap gap-1 justify-center items-center">
                      {renderImageThumbnail(app.profile_photo, 'Profile', <FaImage />)}
                      {renderImageThumbnail(app.eventImageURL, 'Event', <FaImage />)}
                      {renderImageThumbnail(app.qrCodeImageURL, 'QR Code', <FaImage />)}
                      {renderImageThumbnail(app.paymentScreenshotURL, 'Payment', <FaFileImage />)}
                      {!app.profile_photo && !app.eventImageURL && !app.qrCodeImageURL && !app.paymentScreenshotURL && (
                          <p className="text-xs text-gray-500">No images</p>
                      )}
                    </td>

                    <td style={currentRowStyle} className="text-sm flex gap-2 items-center justify-center">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleApprove(app._id)}
                            disabled={actionLoading[app._id]}
                            style={{
                              ...approveButtonStyle,
                              cursor: actionLoading[app._id] ? 'not-allowed' : 'pointer',
                              opacity: actionLoading[app._id] ? 0.6 : 1
                            }}
                            className="py-1 px-3 rounded text-xs flex items-center"
                            onMouseOver={(e) => !actionLoading[app._id] && (e.currentTarget.style.transform = 'scale(1.05)')}
                            onMouseOut={(e) => !actionLoading[app._id] && (e.currentTarget.style.transform = 'scale(1)')}
                          >
                            {actionLoading[app._id] ? <FaSpinner className="animate-spin" /> : <FaCheckCircle className="mr-1" />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(app._id)}
                            disabled={actionLoading[app._id]}
                            style={{
                              ...rejectButtonStyle,
                              cursor: actionLoading[app._id] ? 'not-allowed' : 'pointer',
                              opacity: actionLoading[app._id] ? 0.6 : 1
                            }}
                            className="py-1 px-3 rounded text-xs flex items-center"
                            onMouseOver={(e) => !actionLoading[app._id] && (e.currentTarget.style.transform = 'scale(1.05)')}
                            onMouseOut={(e) => !actionLoading[app._id] && (e.currentTarget.style.transform = 'scale(1)')}
                          >
                            {actionLoading[app._id] ? <FaSpinner className="animate-spin" /> : <FaTimesCircle className="mr-1" />}
                            Reject
                          </button>
                        </>
                      )}
                       {(isApproved || isRejected) && (
                        <span className={`text-xs px-2 py-1 rounded`}
                              style={getStatusBadgeStyle(app.status)}
                        >
                           {app.status}
                        </span>
                       )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Image Modal */}
      {isImageModalOpen && selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-filter backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="relative rounded-lg shadow-xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex items-center justify-center"
            style={{ ...containerStyle, backgroundColor: currentTheme.bgColor || '#fff' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-3 right-3 text-3xl font-bold leading-none text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white outline-none focus:outline-none transition duration-200"
            >
              ×
            </button>
            <img
              src={selectedImage}
              alt="Enlarged View"
              className="block max-w-full max-h-[85vh] object-contain rounded-md"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventApplicationsView;