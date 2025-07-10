import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaFolderOpen, FaCheckCircle, FaSpinner, FaTimesCircle } from 'react-icons/fa';

const InquiryDetailPage = () => {
  const { inquiryId } = useParams();
  const navigate = useNavigate();
  const { token, backendUrl } = useContext(AdminContext);
  const { currentTheme } = useTheme();

  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [resolutionDetails, setResolutionDetails] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const styles = {
    container: { backgroundColor: currentTheme.backgroundColor || '#ffffff', color: currentTheme.textColor || '#333', borderColor: currentTheme.borderColor || '#ddd', padding: '1.5rem 1rem' },
    header: { color: currentTheme.highlightColor || '#007bff', fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' },
    fieldLabel: { fontWeight: 'bold', color: currentTheme.textColor || '#333', marginBottom: '0.5rem', display: 'block' },
    fieldValue: { marginBottom: '1rem', color: '#555' },
    textarea: { backgroundColor: currentTheme.inputBg || '#fff', color: currentTheme.textColor || '#333', borderColor: currentTheme.borderColor || '#ccc', width: '100%', padding: '0.75rem', borderRadius: '0.375rem', resize: 'vertical' },
    statusBadge: { padding: '0.375rem 0.75rem', fontSize: '0.8125rem', borderRadius: '9999px', fontWeight: '600' },
    openStatus: { backgroundColor: currentTheme.warningBg || '#fef3c7', color: currentTheme.warningColor || '#92400e' },
    progressStatus: { backgroundColor: currentTheme.infoBg || '#cfe2ff', color: currentTheme.infoColor || '#0b5ed7' },
    resolvedStatus: { backgroundColor: currentTheme.successBg || '#d1fae5', color: currentTheme.successColor || '#065f46' },
    closedStatus: { backgroundColor: currentTheme.secondaryBg || '#e0e0e0', color: currentTheme.secondaryColor || '#444' },
    actionButtonContainer: { marginTop: '2rem', paddingTop: '1rem', borderTop: `1px solid ${currentTheme.borderColor || '#ddd'}` },
    replyButton: { backgroundColor: currentTheme.successButtonBg || '#28a745', color: currentTheme.buttonTextColor || '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'medium' },
    cancelButton: { backgroundColor: currentTheme.secondaryButtonBg || '#6c757d', color: currentTheme.buttonTextColor || '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'medium' },
    backButton: { color: currentTheme.highlightColor || '#007bff', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: `1px solid ${currentTheme.highlightColor || '#007bff'}` },
  };

  const fetchInquiry = async () => {
    setLoading(true);
    setError(null);
    if (!token) {
      Swal.fire({ icon: 'warning', title: 'Not Logged In', text: 'Please log in.' }).then(() => navigate('/'));
      return;
    }
    try {
      const response = await fetch(`${backendUrl}/api/admin/inquiries/${inquiryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setInquiry(data);
      setNewStatus(data.inquiryStatus); // Set initial status for the dropdown
      setResolutionDetails(data.resolutionDetails || ''); // Set initial resolution details
    } catch (err) {
      setError(err.message);
      console.error('Error fetching inquiry details:', err);
      Swal.fire('Error!', err.message || 'Could not load inquiry details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && backendUrl) {
      fetchInquiry();
    }
  }, [token, backendUrl, inquiryId]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!token || !inquiryId) return;

    try {
      const response = await fetch(`${backendUrl}/api/admin/inquiries/${inquiryId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resolutionDetails, inquiryStatus: newStatus }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setInquiry(prev => ({ ...prev, ...result.inquiry })); // Update inquiry with new data
      Swal.fire('Success!', 'Inquiry updated.', 'success');
      // Optionally navigate away after successful update
      // navigate('/inquiries');
    } catch (err) {
      console.error('Error submitting reply:', err);
      Swal.fire('Error!', err.message || 'Failed to update inquiry.', 'error');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Open': return styles.openStatus;
      case 'In Progress': return styles.progressStatus;
      case 'Resolved': return styles.resolvedStatus;
      case 'Closed': return styles.closedStatus;
      default: return {};
    }
  };

  if (loading) return <div style={styles.loadingMessage}>Loading inquiry details...</div>;
  if (error) return <div style={styles.errorMessage}>Error: {error}</div>;
  if (!inquiry) return <div style={styles.errorMessage}>Inquiry not found.</div>;

  return (
    <div style={styles.container}>
      <div className="flex justify-between items-center mb-6">
        <h1 style={styles.header}>Inquiry Details</h1>
        <Link to="/inquiries" style={styles.backButton}>
          Back to Inquiries
        </Link>
      </div>

      <div className="p-8 rounded-lg shadow-lg border border-gray-200" style={styles.container}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="mb-4">
              <span style={styles.fieldLabel}>Name:</span>
              <span style={styles.fieldValue}>{inquiry.firstName} {inquiry.lastName}</span>
            </p>
            <p className="mb-4">
              <span style={styles.fieldLabel}>Student ID:</span>
              <span style={styles.fieldValue}>{inquiry.student_id || 'N/A'}</span>
            </p>
            <p className="mb-4">
              <span style={styles.fieldLabel}>Email:</span>
              <span style={styles.fieldValue} className="flex items-center"><FaEnvelope className="mr-2" /> {inquiry.email}</span>
            </p>
            <p className="mb-4">
              <span style={styles.fieldLabel}>Phone:</span>
              <span style={styles.fieldValue} className="flex items-center"><FaPhone className="mr-2" /> {inquiry.phone || 'N/A'}</span>
            </p>
          </div>
          <div>
            <p className="mb-4">
              <span style={styles.fieldLabel}>Inquiry:</span>
              <span style={styles.fieldValue}>{inquiry.query}</span>
            </p>
            <p className="mb-4">
              <span style={styles.fieldLabel}>Status:</span>
              <span style={{ ...styles.statusBadge, ...getStatusStyle(inquiry.inquiryStatus) }}>
                {inquiry.inquiryStatus}
              </span>
            </p>
            {inquiry.resolutionDetails && (
              <p className="mb-4">
                <span style={styles.fieldLabel}>Admin Reply:</span>
                <span style={styles.fieldValue}>{inquiry.resolutionDetails}</span>
              </p>
            )}
            {inquiry.resolvedBy && (
              <p className="mb-4">
                <span style={styles.fieldLabel}>Resolved By:</span>
                <span style={styles.fieldValue}>{inquiry.resolvedBy.firstName} {inquiry.resolvedBy.lastName}</span>
              </p>
            )}
            <p className="mb-4">
              <span style={styles.fieldLabel}>Submitted At:</span>
              <span style={styles.fieldValue}>{new Date(inquiry.createdAt).toLocaleString()}</span>
            </p>
          </div>
        </div>

        <div style={styles.actionButtonContainer}>
          <h3 className="text-xl font-semibold mb-4" style={{ color: styles.highlightColor }}>Respond to Inquiry</h3>
          <form onSubmit={handleReplySubmit}>
            <div className="mb-4">
              <label htmlFor="status" style={styles.fieldLabel}>Update Status</label>
              <select
                id="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="p-3 rounded-md"
                style={styles.input}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="resolutionDetails" style={styles.fieldLabel}>Your Reply / Resolution Details</label>
              <textarea
                id="resolutionDetails"
                rows="5"
                value={resolutionDetails}
                onChange={(e) => setResolutionDetails(e.target.value)}
                className="p-3"
                style={styles.textarea}
                placeholder="Enter your reply or resolution details here..."
              ></textarea>
            </div>

            <div className="flex justify-end space-x-4">
              <button type="button" onClick={() => navigate('/inquiries')} style={styles.cancelButton}>
                Cancel
              </button>
              <button type="submit" style={styles.replyButton}>
                Submit Reply & Update Status
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InquiryDetailPage;