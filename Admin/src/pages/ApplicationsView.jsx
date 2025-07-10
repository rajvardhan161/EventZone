import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { FaEye, FaCheckCircle, FaTimesCircle, FaSpinner, FaImage, FaFileImage, FaMoneyCheckAlt, FaSquare, FaCheckSquare, FaExclamationTriangle, FaSearch } from 'react-icons/fa'; // Added FaSearch

// import { toast } from 'react-toastify'; // Consider using a toast library for better notifications

const AdminApplicationsView = () => {
  const { backendUrl, token } = useContext(AdminContext);
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({}); // State to track loading for specific actions (approve/reject/verify)

  const [selectedApplications, setSelectedApplications] = useState([]); // State for selected application IDs
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false); // Loading state for bulk actions

  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // --- Search and Filter State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
  // --- End Search and Filter State ---

  // --- Status Constants ---
  const STATUS = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled', // Added Cancelled status
  };
  const PAYMENT_STATUS = {
    UNVERIFIED: 'Unverified',
    VERIFIED: 'Verified',
    PENDING: 'Pending', // Example: if you have a pending state
    FAILED: 'Failed',   // Example: if you have a failed state
  };
  // --- End Status Constants ---

  const fetchAllApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${backendUrl}/api/admin/applications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (Array.isArray(response.data)) {
        // Sort by applicationDate, then by status (Pending first, then others)
        const sortedApplications = response.data.sort((a, b) => {
          const dateA = new Date(a.applicationDate);
          const dateB = new Date(b.applicationDate);

          // Sort by status: Pending first
          if (a.status === STATUS.PENDING && b.status !== STATUS.PENDING) return -1;
          if (a.status !== STATUS.PENDING && b.status === STATUS.PENDING) return 1;

          // If statuses are the same (or both pending), sort by date descending
          return dateB - dateA;
        });
        setApplications(sortedApplications);
      } else {
        console.error('Received non-array data from backend:', response.data);
        setError('Failed to load applications: Invalid data format.');
        setApplications([]);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.response?.data?.message || 'Failed to load applications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (appId, eventId) => {
    console.log(`Navigating to details for application: ${appId} (Event: ${eventId})`);
    if (eventId && appId) {
      navigate(`/events/${eventId}/applications`);
    } else {
      console.warn(`Cannot navigate: Missing eventId or appId for application ${appId}.`);
    }
  };

  // --- Individual Status Update ---
  const updateIndividualApplicationStatus = async (appId, newStatus) => {
    setActionLoading(prev => ({ ...prev, [appId]: true }));
    try {
      const response = await axios.post(`${backendUrl}/api/admin/applications/${appId}/status`, {
        status: newStatus
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`Application ${appId} status update response:`, response.data);

      setApplications(prev => prev.map(app =>
        app._id === appId ? { ...app, status: newStatus } : app
      ));

      alert(`Application ${appId} ${newStatus.toLowerCase()}d successfully!`);

    } catch (err) {
      console.error(`Error ${newStatus.toLowerCase()}ing application ${appId}:`, err);
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.join(', ') || `Failed to ${newStatus.toLowerCase()} application ${appId}.`;
      alert(`${errorMessage}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [appId]: false }));
    }
  };

  // --- Payment Verification Handler ---
  const verifyPayment = async (appId) => {
    const currentApp = applications.find(app => app._id === appId);
    if (!currentApp || currentApp.paymentStatus === PAYMENT_STATUS.VERIFIED || actionLoading[appId]) {
      if (currentApp?.paymentStatus === PAYMENT_STATUS.VERIFIED) {
        alert('Payment is already verified for this application.');
      }
      return;
    }

    setActionLoading(prev => ({ ...prev, [appId]: true }));
    try {
      const response = await axios.post(`${backendUrl}/api/admin/applications/${appId}/payment-status`, {
        paymentStatus: PAYMENT_STATUS.VERIFIED
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`Payment verification response for application ${appId}:`, response.data);

      setApplications(prev => prev.map(app =>
        app._id === appId ? { ...app, paymentStatus: PAYMENT_STATUS.VERIFIED } : app
      ));

      alert(`Payment for application ${appId} verified successfully!`);

    } catch (err) {
      console.error(`Error verifying payment for application ${appId}:`, err);
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.join(', ') || `Failed to verify payment for application ${appId}.`;
      alert(`${errorMessage}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [appId]: false }));
    }
  };

  // --- Bulk Action Handler ---
  const handleBulkAction = async (action) => {
    if (selectedApplications.length === 0) {
      alert('Please select applications to perform an action.');
      return;
    }

    const confirmAction = window.confirm(`Are you sure you want to ${action} ${selectedApplications.length} selected applications?`);
    if (!confirmAction) return;

    setIsBulkActionLoading(true);
    setError(null); // Clear previous errors

    try {
      const response = await axios.post(`${backendUrl}/api/admin/applications/bulk-action`, {
        applicationIds: selectedApplications,
        action: action.toLowerCase(), // e.g., "approve", "reject", "cancel"
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`Bulk ${action} response:`, response.data);

      // Update local state based on response
      setApplications(prev => prev.map(app => {
        if (selectedApplications.includes(app._id)) {
          let newStatus;
          switch (action.toLowerCase()) {
            case 'approve': newStatus = STATUS.APPROVED; break;
            case 'reject': newStatus = STATUS.REJECTED; break;
            case 'cancel': newStatus = STATUS.CANCELLED; break;
            default: newStatus = app.status;
          }
          return { ...app, status: newStatus };
        }
        return app;
      }));

      alert(`Bulk ${action} operation successful! Check details for any failures.`);
      if (response.data?.summary?.failed > 0) {
        console.warn("Bulk operation had failures:", response.data.details);
        alert(`Operation partially failed. ${response.data.summary.failed} out of ${response.data.summary.processed} applications encountered issues. Check console.`);
      }

      setSelectedApplications([]);

    } catch (err) {
      console.error(`Error performing bulk ${action}:`, err);
      const errorMessage = err.response?.data?.message || err.response?.data?.summary?.errors?.join(', ') || `Failed to perform bulk ${action}.`;
      setError(`Bulk ${action} failed: ${errorMessage}`);
      alert(`Bulk ${action} failed: ${errorMessage}`);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  // --- Selection Handlers ---
  const handleSelectApplication = (appId) => {
    setSelectedApplications(prev =>
      prev.includes(appId)
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(applications.map(app => app._id));
    }
  };

  const allSelected = applications.length > 0 && selectedApplications.length === applications.length;
  const someSelected = selectedApplications.length > 0 && selectedApplications.length < applications.length;

  // --- Search and Filter Handlers ---
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Reset selection when searching
    setSelectedApplications([]);
  };

  const handleFilterStatusChange = (e) => {
    setFilterStatus(e.target.value);
    // Reset selection when filtering
    setSelectedApplications([]);
  };

  const handleFilterPaymentStatusChange = (e) => {
    setFilterPaymentStatus(e.target.value);
    // Reset selection when filtering
    setSelectedApplications([]);
  };
  // --- End Search and Filter Handlers ---

  // --- Filtered Applications Logic ---
  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      !searchTerm ||
      (app.userName && app.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.userEmail && app.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.eventName && app.eventName.toLowerCase().includes(searchTerm.toLowerCase())); // Also search by event name

    const matchesStatus = !filterStatus || app.status === filterStatus;
    const matchesPaymentStatus = !filterPaymentStatus || app.paymentStatus === filterPaymentStatus;

    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });
  // --- End Filtered Applications Logic ---


  useEffect(() => {
    fetchAllApplications();
  }, []);

  // Re-fetch applications if search or filter criteria change (optional, but good for keeping local state in sync if API changed)
  // If you don't want to re-fetch on every filter, remove this useEffect. The filteredApplications logic handles the display.
  // If the backend *only* supports fetching all and filtering client-side, this is fine.
  // If the backend *could* support server-side filtering, you'd add these params to fetchAllApplications.
  // For now, we'll rely on client-side filtering of the fetched `applications`.
  // useEffect(() => {
  //   if (searchTerm || filterStatus || filterPaymentStatus) {
  //     // Optional: If you want to re-fetch with server-side filters
  //     // fetchAllApplications({ searchTerm, filterStatus, filterPaymentStatus });
  //   } else {
  //     fetchAllApplications(); // Fetch all if filters are cleared
  //   }
  // }, [searchTerm, filterStatus, filterPaymentStatus]); // Dependency array to re-fetch when these change

  // --- Styling Helpers ---
  const getContrastTextColor = (bgColor) => {
    if (!bgColor) return '#333333';
    const hex = bgColor.replace('#', '');
    if (hex.length !== 6) return '#333333';
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

  const getTableStyles = () => ({
    header: {
      backgroundColor: currentTheme.navbarBgColor || '#f0f0f0',
      color: getContrastTextColor(currentTheme.navbarBgColor || '#f0f0f0'),
      padding: '12px 15px',
      textAlign: 'left',
      borderBottom: `2px solid ${getContrastTextColor(currentTheme.navbarBgColor || '#f0f0f0')}`,
      textTransform: 'uppercase',
      fontWeight: 'bold',
    },
    cell: {
      padding: '15px',
      borderBottom: '1px solid rgba(0,0,0,0.1)',
      fontSize: '0.9375rem',
      lineHeight: '1.5',
    },
    baseRowLight: '#ffffff',
    baseRowDark: '#1f2937',
    oddRowLight: '#f9fafb',
    oddRowDark: '#374151',
  });

  const tableStyles = getTableStyles();

  const getStatusBadgeStyle = (status) => {
    let bgColor, textColor;
    switch (status) {
      case STATUS.PENDING: bgColor = '#fde68a'; textColor = '#92400e'; break;
      case STATUS.APPROVED: bgColor = '#bbf7d0'; textColor = '#166534'; break;
      case STATUS.REJECTED: bgColor = '#fecaca'; textColor = '#991b1b'; break;
      case STATUS.CANCELLED: bgColor = '#d1d5db'; textColor = '#374151'; break;
      default: bgColor = '#e5e7eb'; textColor = '#374151';
    }
    return { backgroundColor: bgColor, color: textColor, padding: '0.6rem 1rem', borderRadius: '9999px', fontWeight: 'semibold', fontSize: '0.875rem', lineHeight: '1.25rem' };
  };

  const getRowStyles = (index) => {
    const isEvenRow = index % 2 === 0;
    const isDarkMode = currentTheme.bgColor === '#1f2937';
    const baseBgColor = isDarkMode ? tableStyles.baseRowDark : tableStyles.baseRowLight;
    const oddRowBgColor = isDarkMode ? tableStyles.oddRowDark : tableStyles.oddRowLight;

    const rowBgColor = isEvenRow ? baseBgColor : oddRowBgColor;
    const rowTextColor = getContrastTextColor(rowBgColor);

    let hoverBgColor;
    if (isDarkMode) {
      hoverBgColor = isEvenRow ? '#374151' : '#4b5563';
    } else {
      hoverBgColor = '#f3f4f6';
    }

    return {
      backgroundColor: rowBgColor,
      color: rowTextColor,
      hoverBackgroundColor: hoverBgColor,
    };
  };

  // --- Image Handling ---
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
        onClick={(e) => { e.stopPropagation(); handleImageClick(imageUrl); }}
        key={imageUrl}
      >
        {icon && React.cloneElement(icon, { className: "text-lg" })}
        <span className="text-xs font-medium">{label}</span>
      </div>
    );
  };

  // --- Modal for image display ---
  const ImageModal = () => {
    if (!isImageModalOpen || !selectedImage) return null;

    const modalOverlayStyle = {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
    };

    const modalContentStyle = {
      backgroundColor: currentTheme.bgColor || '#fff',
      color: currentTheme.textColor || '#000',
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-filter backdrop-blur-sm"
        style={modalOverlayStyle}
        onClick={() => setIsImageModalOpen(false)}
      >
        <div
          className="relative rounded-lg shadow-xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex items-center justify-center"
          style={modalContentStyle}
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
    );
  };

  // --- Render Logic ---
  return (
    <div style={containerStyle} className="admin-applications-view p-6">
      <h2 className="text-2xl font-bold mb-6" style={{ color: currentTheme.textColor }}>
        Manage Applications
      </h2>

      {/* Search and Filter Bar */}
      <div className="mb-6 p-4 rounded-lg shadow-sm" style={{ backgroundColor: currentTheme.navbarBgColor || '#f0f0f0', color: getContrastTextColor(currentTheme.navbarBgColor || '#f0f0f0') }}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-center">
          {/* Search Input */}
          <div className="relative flex items-center">
            <FaSearch className="absolute left-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search by User/Event..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 p-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ color: currentTheme.textColor || '#333333' }}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="statusFilter" className="mr-2 font-semibold">Status:</label>
            <select
              id="statusFilter"
              value={filterStatus}
              onChange={handleFilterStatusChange}
              className="p-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ color: currentTheme.textColor || '#333333', backgroundColor: currentTheme.bgColor || '#ffffff' }}
            >
              <option value="">All Statuses</option>
              {Object.values(STATUS).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label htmlFor="paymentStatusFilter" className="mr-2 font-semibold">Payment:</label>
            <select
              id="paymentStatusFilter"
              value={filterPaymentStatus}
              onChange={handleFilterPaymentStatusChange}
              className="p-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ color: currentTheme.textColor || '#333333', backgroundColor: currentTheme.bgColor || '#ffffff' }}
            >
              <option value="">All Payments</option>
              {Object.values(PAYMENT_STATUS).map(pStatus => (
                <option key={pStatus} value={pStatus}>{pStatus}</option>
              ))}
              <option value="Not Paid">Not Paid</option> {/* Option for applications that haven't paid */}
            </select>
          </div>
        </div>
      </div>


      {/* Bulk Action Buttons */}
      {filteredApplications.length > 0 && (
        <div className="flex justify-end gap-3 mb-4">
          {isBulkActionLoading && <FaSpinner className="animate-spin text-blue-500" size={20} />}
          <button
            onClick={() => handleBulkAction('Approve')}
            disabled={selectedApplications.length === 0 || isBulkActionLoading}
            className={`px-4 py-2 rounded-md text-white font-semibold transition duration-200
              ${selectedApplications.length === 0 || isBulkActionLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 transform hover:scale-105'
              }`}
          >
            Approve Selected ({selectedApplications.length})
          </button>
          <button
            onClick={() => handleBulkAction('Reject')}
            disabled={selectedApplications.length === 0 || isBulkActionLoading}
            className={`px-4 py-2 rounded-md text-white font-semibold transition duration-200
              ${selectedApplications.length === 0 || isBulkActionLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 transform hover:scale-105'
              }`}
          >
            Reject Selected ({selectedApplications.length})
          </button>
          <button
            onClick={() => handleBulkAction('Cancel')}
            disabled={selectedApplications.length === 0 || isBulkActionLoading}
            className={`px-4 py-2 rounded-md text-white font-semibold transition duration-200
              ${selectedApplications.length === 0 || isBulkActionLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700 transform hover:scale-105'
              }`}
          >
            Cancel Selected ({selectedApplications.length})
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-64" style={{ color: currentTheme.textColor }}>
          <FaSpinner className="animate-spin mr-3" size={24} />
          <p>Loading Applications...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <button onClick={fetchAllApplications} className="ml-4 px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Retry</button>
        </div>
      )}

      {!loading && !error && filteredApplications.length === 0 && (
        <p className="text-center py-10" style={{ color: currentTheme.textColor }}>
          No applications found matching your criteria.
        </p>
      )}

      {!loading && !error && filteredApplications.length > 0 && (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full leading-normal border-collapse">
            <thead>
              <tr>
                <th style={tableStyles.header} className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                </th>
                <th style={tableStyles.header} className="px-5 py-3">User</th>
                <th style={tableStyles.header} className="px-5 py-3">Event</th>
                <th style={tableStyles.header} className="px-5 py-3">Status</th>
                <th style={tableStyles.header} className="px-5 py-3">Application Date</th>
                <th style={tableStyles.header} className="px-5 py-3 text-center">Payment</th>
                <th style={tableStyles.header} className="px-5 py-3 text-center">Images</th>
                <th style={tableStyles.header} className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app, index) => { // Use filteredApplications here
                const isStatusPending = app.status === STATUS.PENDING;
                const isStatusApproved = app.status === STATUS.APPROVED;
                const isStatusRejected = app.status === STATUS.REJECTED;
                const isStatusCancelled = app.status === STATUS.CANCELLED;

                const isProcessed = isStatusApproved || isStatusRejected || isStatusCancelled;

                const rowColors = getRowStyles(index);
                const isSelected = selectedApplications.includes(app._id);
                const showVerifyButton = app.isPaid && app.paymentStatus === PAYMENT_STATUS.UNVERIFIED;

                return (
                  <tr
                    key={app._id}
                    className="transition-colors duration-200"
                    style={{ backgroundColor: isSelected ? '#dbeafe' : rowColors.backgroundColor, color: rowColors.color }}
                    onMouseOver={(e) => !isSelected && (e.currentTarget.style.backgroundColor = rowColors.hoverBackgroundColor)}
                    onMouseOut={(e) => !isSelected && (e.currentTarget.style.backgroundColor = rowColors.backgroundColor)}
                  >
                    <td style={tableStyles.cell} className="text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectApplication(app._id)}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                    </td>
                    <td style={tableStyles.cell} className="text-sm">
                      <div className="flex items-center">
                        <div className="ml-3">
                          <p className="whitespace-nowrap font-semibold">{app.userName || 'N/A'}</p>
                          <p className="text-xs" style={{ color: rowColors.color === '#FFFFFF' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                            {app.userEmail || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={tableStyles.cell} className="text-sm">
                      <p className="whitespace-nowrap font-semibold">{app.eventName || 'N/A'}</p>
                      <p className="text-xs" style={{ color: rowColors.color === '#FFFFFF' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                        Course: {app.course || 'N/A'}
                      </p>
                    </td>
                    <td style={tableStyles.cell} className="text-sm">
                      <span style={getStatusBadgeStyle(app.status)}>
                        {app.status}
                      </span>
                    </td>
                    <td style={tableStyles.cell} className="text-sm">
                      <p className="whitespace-nowrap">{new Date(app.applicationDate).toLocaleDateString()}</p>
                      <p className="text-xs" style={{ color: rowColors.color === '#FFFFFF' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                        {new Date(app.applicationDate).toLocaleTimeString()}
                      </p>
                    </td>
                    <td style={{ ...tableStyles.cell, textAlign: 'center' }} className="text-sm">
                      {app.isPaid ? (
                        <div className="flex flex-col items-center gap-1">
                          <p>₹{app.price !== undefined ? app.price.toFixed(2) : 'N/A'}</p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              app.paymentStatus === PAYMENT_STATUS.VERIFIED
                                ? 'bg-green-100 text-green-800'
                                : app.paymentStatus === PAYMENT_STATUS.UNVERIFIED
                                ? 'bg-yellow-100 text-yellow-800'
                                : app.paymentStatus === PAYMENT_STATUS.PENDING
                                ? 'bg-blue-100 text-blue-800'
                                : app.paymentStatus === PAYMENT_STATUS.FAILED
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {app.paymentStatus || 'Unknown'}
                          </span>
                        </div>
                      ) : (
                        <p className="text-gray-500">Not Paid</p>
                      )}
                    </td>
                    <td style={{ ...tableStyles.cell, textAlign: 'center' }} className="p-3 flex flex-wrap gap-1 justify-center items-center">
                      {renderImageThumbnail(app.profile_photo, 'Profile', <FaImage />)}
                      {renderImageThumbnail(app.eventImageURL, 'Event', <FaImage />)}
                      {renderImageThumbnail(app.qrCodeImageURL, 'QR', <FaFileImage />)}
                      {renderImageThumbnail(app.paymentScreenshotURL, 'Payment', <FaFileImage />)}
                      {!app.profile_photo && !app.eventImageURL && !app.qrCodeImageURL && !app.paymentScreenshotURL && (
                        <p className="text-xs text-gray-500">No images</p>
                      )}
                    </td>
                    <td style={{ ...tableStyles.cell, textAlign: 'center' }} className="text-sm flex gap-2 items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(app._id, app.eventId);
                        }}
                        className="py-1 px-3 rounded text-xs flex items-center bg-blue-500 text-white hover:bg-blue-600 transition duration-200 ease-in-out transform hover:scale-105"
                        style={{ cursor: 'pointer' }}
                      >
                        <FaEye className="mr-1" />
                        Details
                      </button>

                      {!isProcessed && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateIndividualApplicationStatus(app._id, STATUS.APPROVED);
                            }}
                            disabled={actionLoading[app._id]}
                            style={{
                              cursor: actionLoading[app._id] ? 'not-allowed' : 'pointer',
                              opacity: actionLoading[app._id] ? 0.6 : 1,
                              backgroundColor: '#4CAF50',
                              color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.875rem', lineHeight: '1.25rem', display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease-in-out',
                            }}
                            className="hover:scale-105"
                          >
                            {actionLoading[app._id] ? <FaSpinner className="animate-spin mr-1" /> : <FaCheckCircle className="mr-1" />}
                            Approve
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateIndividualApplicationStatus(app._id, STATUS.REJECTED);
                            }}
                            disabled={actionLoading[app._id]}
                            style={{
                              cursor: actionLoading[app._id] ? 'not-allowed' : 'pointer',
                              opacity: actionLoading[app._id] ? 0.6 : 1,
                              backgroundColor: '#f44336',
                              color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.875rem', lineHeight: '1.25rem', display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease-in-out',
                            }}
                            className="hover:scale-105"
                          >
                            {actionLoading[app._id] ? <FaSpinner className="animate-spin mr-1" /> : <FaTimesCircle className="mr-1" />}
                            Reject
                          </button>
                        </>
                      )}

                      {showVerifyButton && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            verifyPayment(app._id);
                          }}
                          disabled={actionLoading[app._id]}
                          style={{
                            cursor: actionLoading[app._id] ? 'not-allowed' : 'pointer',
                            opacity: actionLoading[app._id] ? 0.6 : 1,
                            backgroundColor: '#2196F3',
                            color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.875rem', lineHeight: '1.25rem', display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease-in-out',
                          }}
                          className="hover:scale-105"
                        >
                          <FaMoneyCheckAlt className="mr-1" />
                          Verify Payment
                        </button>
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

export default AdminApplicationsView;