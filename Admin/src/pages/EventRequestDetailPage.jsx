// src/pages/EventRequestDetailPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaFolderOpen, FaCheckCircle, FaSpinner, FaTimesCircle, FaRegCalendarAlt, FaClock } from 'react-icons/fa'; // Add more icons

const EventRequestDetailPage = () => {
  const { requestId } = useParams(); // Get the request ID from URL parameters
  const navigate = useNavigate();
  const { token, backendUrl } = useContext(AdminContext);
  const { currentTheme } = useTheme();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the form inputs
  const [replyMessage, setReplyMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Styles derived from the current theme
  const styles = {
    container: { backgroundColor: currentTheme.backgroundColor || '#ffffff', color: currentTheme.textColor || '#333', borderColor: currentTheme.borderColor || '#ddd', padding: '1.5rem 1rem' },
    header: { color: currentTheme.highlightColor || '#007bff', fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' },
    fieldLabel: { fontWeight: 'bold', color: currentTheme.textColor || '#333', marginBottom: '0.5rem', display: 'block' },
    fieldValue: { marginBottom: '1rem', color: '#555' },
    textarea: { backgroundColor: currentTheme.inputBg || '#fff', color: currentTheme.textColor || '#333', borderColor: currentTheme.borderColor || '#ccc', width: '100%', padding: '0.75rem', borderRadius: '0.375rem', resize: 'vertical' },
    statusBadge: { padding: '0.375rem 0.75rem', fontSize: '0.8125rem', borderRadius: '9999px', fontWeight: '600' },
    // Status badge styles based on theme
    pendingStatus: { backgroundColor: currentTheme.warningBg || '#fef3c7', color: currentTheme.warningColor || '#92400e' },
    progressStatus: { backgroundColor: currentTheme.infoBg || '#cfe2ff', color: currentTheme.infoColor || '#0b5ed7' },
    approvedStatus: { backgroundColor: currentTheme.successBg || '#d1fae5', color: currentTheme.successColor || '#065f46' },
    rejectedStatus: { backgroundColor: currentTheme.dangerBg || '#fee2e2', color: currentTheme.dangerColor || '#7f1d1d' },
    completedStatus: { backgroundColor: currentTheme.secondaryBg || '#e0e0e0', color: currentTheme.secondaryColor || '#444' },
    actionButtonContainer: { marginTop: '2rem', paddingTop: '1rem', borderTop: `1px solid ${currentTheme.borderColor || '#ddd'}` },
    replyButton: { backgroundColor: currentTheme.successButtonBg || '#28a745', color: currentTheme.buttonTextColor || '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'medium' },
    cancelButton: { backgroundColor: currentTheme.secondaryButtonBg || '#6c757d', color: currentTheme.buttonTextColor || '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'medium' },
    backButton: { color: currentTheme.highlightColor || '#007bff', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: `1px solid ${currentTheme.highlightColor || '#007bff'}`, transition: 'all 0.2s' },
    iconStyle: { color: currentTheme.highlightColor || '#007bff', marginRight: '0.5rem' }
  };

  // Function to fetch details of a single event request
  const fetchRequestDetails = async () => {
    setLoading(true);
    setError(null);
    // Check authentication
    if (!token) {
      Swal.fire({ icon: 'warning', title: 'Not Logged In', text: 'Please log in.', confirmButtonColor: styles.header.color }).then(() => navigate('/'));
      return;
    }
    // Check if requestId is valid
    if (!requestId) {
      setError('Invalid request ID.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${backendUrl}/api/admin/event-requests/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRequest(data);
      // Initialize form state with fetched data
      setNewStatus(data.completionStatus);
      setReplyMessage(data.replyMessage || '');
      setRejectionReason(data.rejectionReason || '');
    } catch (err) {
      setError(err.message);
      console.error('Error fetching event request details:', err);
      Swal.fire('Error!', err.message || 'Could not load request details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or when dependencies change
  useEffect(() => {
    if (token && backendUrl) {
      fetchRequestDetails();
    } else if (!token) {
      Swal.fire({ icon: 'warning', title: 'Not Logged In', text: 'Please log in.', confirmButtonColor: styles.header.color }).then(() => navigate('/'));
    }
  }, [token, backendUrl, requestId, navigate]); // Dependencies ensure re-fetch if needed

  // Handler for submitting the reply and status update
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!token || !requestId) return; // Basic check for auth and ID

    // Frontend validation for rejection reason
    if (newStatus === 'Rejected' && !rejectionReason) {
      Swal.fire('Validation Error', 'Please provide a rejection reason when rejecting the request.', 'warning');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/admin/event-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ replyMessage, completionStatus: newStatus, rejectionReason }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setRequest(prev => ({ ...prev, ...result.eventRequest })); // Update state with new data
      Swal.fire('Success!', 'Event request updated successfully.', 'success');
      // Optionally navigate away after successful update
      // navigate('/event-requests');
    } catch (err) {
      console.error('Error submitting update:', err);
      Swal.fire('Error!', err.message || 'Failed to update event request.', 'error');
    }
  };

  // Helper to get the correct status badge style
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': return styles.pendingStatus;
      case 'In Progress': return styles.progressStatus;
      case 'Approved': return styles.approvedStatus;
      case 'Rejected': return styles.rejectedStatus;
      case 'Completed': return styles.completedStatus;
      default: return {};
    }
  };

  // Date and Time formatting helpers
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date'; // Handle invalid date strings
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return 'Invalid Date';
    }
  };
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    // Basic time formatting (assuming HH:MM). For more complex formatting, use a library like moment.js or date-fns.
    return timeString;
  }

  // Render loading or error states
  if (loading) return <div style={styles.loadingMessage}>Loading event request details...</div>;
  if (error) return <div style={styles.errorMessage}>Error: {error}</div>;
  if (!request) return <div style={styles.errorMessage}>Event request not found.</div>; // Handle case where request is null

  return (
    <div style={styles.container}>
      <div className="flex justify-between items-center mb-6">
        <h1 style={styles.header}>Event Request Details</h1>
        {/* Back button */}
        <Link to="/event-requests" style={styles.backButton}>
          Back to Requests
        </Link>
      </div>

      {/* Main details container */}
      <div className="p-8 rounded-lg shadow-lg border border-gray-200" style={styles.container}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Event Information */}
          <div>
            <p className="mb-4">
              <span style={styles.fieldLabel}>Event Name:</span>
              <span style={styles.fieldValue}>{request.eventName || 'N/A'}</span>
            </p>
            <p className="mb-4">
              <span style={styles.fieldLabel}>Student ID:</span>
              <span style={styles.fieldValue}>{request.student_id || 'N/A'}</span>
            </p>
            <p className="mb-4">
              <span style={styles.fieldLabel}>Event Date:</span>
              <span style={styles.fieldValue} className="flex items-center"><FaRegCalendarAlt style={styles.iconStyle} /> {formatDate(request.eventDate)}</span>
            </p>
            <p className="mb-4">
              <span style={styles.fieldLabel}>Event Time:</span>
              <span style={styles.fieldValue} className="flex items-center"><FaClock style={styles.iconStyle} /> {formatTime(request.eventTime)}</span>
            </p>
            <p className="mb-4">
              <span style={styles.fieldLabel}>Event Description:</span>
              <span style={styles.fieldValue}>{request.eventDescription || 'N/A'}</span>
            </p>
          </div>

          {/* Right Column: Organizer & Admin Info */}
          <div>
            <p className="mb-4">
              <span style={styles.fieldLabel}>Organizer Name:</span>
              <span style={styles.fieldValue}>{request.organizerName || 'N/A'}</span>
            </p>
            <p className="mb-4">
              <span style={styles.fieldLabel}>Organizer Email:</span>
              <span style={styles.fieldValue} className="flex items-center"><FaEnvelope style={styles.iconStyle} /> {request.organizerEmail}</span>
            </p>
            <p className="mb-4">
              <span style={styles.fieldLabel}>Organizer Phone:</span>
              <span style={styles.fieldValue} className="flex items-center"><FaPhone style={styles.iconStyle} /> {request.organizerPhone || 'N/A'}</span>
            </p>
            <p className="mb-4">
              <span style={styles.fieldLabel}>Additional Query:</span>
              <span style={styles.fieldValue}>{request.query || 'N/A'}</span>
            </p>
            <p className="mb-4">
              <span style={styles.fieldLabel}>Status:</span>
              <span style={{ ...styles.statusBadge, ...getStatusStyle(request.completionStatus) }}>
                {request.completionStatus}
              </span>
            </p>
            {/* Display Admin action info if available */}
            {request.repliedBy && (
              <p className="mb-4">
                <span style={styles.fieldLabel}>Actioned By:</span>
                <span style={styles.fieldValue}>{request.repliedBy.firstName} {request.repliedBy.lastName}</span>
              </p>
            )}
            {request.repliedAt && (
              <p className="mb-4">
                <span style={styles.fieldLabel}>Actioned At:</span>
                <span style={styles.fieldValue}>{new Date(request.repliedAt).toLocaleString()}</span>
              </p>
            )}
          </div>
        </div>

        {/* Section for Admin to Reply and Update Status */}
        <div style={styles.actionButtonContainer}>
          <h3 className="text-xl font-semibold mb-4" style={{ color: styles.highlightColor }}>Respond to Request</h3>
          <form onSubmit={handleUpdateSubmit}>
            {/* Status Selection */}
            <div className="mb-4">
              <label htmlFor="completionStatus" style={styles.fieldLabel}>Update Status</label>
              <select
                id="completionStatus"
                value={newStatus}
                onChange={(e) => {
                  setNewStatus(e.target.value);
                  // Clear rejection reason if status is not 'Rejected'
                  if (e.target.value !== 'Rejected') {
                    setRejectionReason('');
                  }
                }}
                className="p-3 rounded-md"
                style={styles.input}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Rejection Reason Field (conditionally shown) */}
            {newStatus === 'Rejected' && (
              <div className="mb-4">
                <label htmlFor="rejectionReason" style={styles.fieldLabel}>Rejection Reason</label>
                <textarea
                  id="rejectionReason"
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="p-3"
                  style={styles.textarea}
                  placeholder="Enter reason for rejection..."
                  required={newStatus === 'Rejected'} // Make it required if status is Rejected
                ></textarea>
              </div>
            )}

            {/* Reply Message Field */}
            <div className="mb-4">
              <label htmlFor="replyMessage" style={styles.fieldLabel}>Admin Reply</label>
              <textarea
                id="replyMessage"
                rows="5"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="p-3"
                style={styles.textarea}
                placeholder="Enter your reply to the organizer..."
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button type="button" onClick={() => navigate('/event-requests')} style={styles.cancelButton}>
                Cancel
              </button>
              <button type="submit" style={styles.replyButton}>
                Submit Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventRequestDetailPage;