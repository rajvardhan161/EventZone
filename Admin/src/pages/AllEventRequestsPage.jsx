// src/pages/AllEventRequestsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { FaFilter, FaFolderOpen, FaCheckCircle, FaSpinner, FaEye, FaPen, FaTimesCircle } from 'react-icons/fa'; // Icons for status and actions

const AllEventRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Contexts for authentication and theming
  const { token, backendUrl } = useContext(AdminContext);
  const { currentTheme } = useTheme();

  // Styles object to apply theme-based styling
  const styles = {
    container: { backgroundColor: currentTheme.backgroundColor || '#ffffff', color: currentTheme.textColor || '#333', padding: '1.5rem 1rem', minHeight: '100vh' },
    header: { color: currentTheme.highlightColor || '#007bff', fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' },
    tableContainer: { overflowX: 'auto', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderColor: currentTheme.borderColor || '#ddd' },
    tableHeader: { backgroundColor: currentTheme.tableHeaderColor || '#f8f9fa', color: currentTheme.textColor || '#333', borderBottom: `1px solid ${currentTheme.borderColor || '#ddd'}` },
    tableCell: { borderColor: currentTheme.borderColor || '#ddd' },
    statusBadge: { padding: '0.375rem 0.75rem', fontSize: '0.8125rem', borderRadius: '9999px', fontWeight: '600' },
    // Theme-specific styles for status badges
    pendingStatus: { backgroundColor: currentTheme.warningBg || '#fef3c7', color: currentTheme.warningColor || '#92400e' },
    progressStatus: { backgroundColor: currentTheme.infoBg || '#cfe2ff', color: currentTheme.infoColor || '#0b5ed7' },
    approvedStatus: { backgroundColor: currentTheme.successBg || '#d1fae5', color: currentTheme.successColor || '#065f46' },
    rejectedStatus: { backgroundColor: currentTheme.dangerBg || '#fee2e2', color: currentTheme.dangerColor || '#7f1d1d' },
    completedStatus: { backgroundColor: currentTheme.secondaryBg || '#e0e0e0', color: currentTheme.secondaryColor || '#444' },
    filterButton: { color: currentTheme.highlightColor || '#007bff', marginRight: '0.75rem', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: `1px solid ${currentTheme.highlightColor || '#007bff'}`, transition: 'all 0.2s' },
    activeFilterButton: { color: '#fff', backgroundColor: currentTheme.highlightColor || '#007bff', marginRight: '0.75rem', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: `1px solid ${currentTheme.highlightColor || '#007bff'}`, transition: 'all 0.2s' },
    noInquiriesMessage: { textAlign: 'center', padding: '2rem 0', color: currentTheme.textColor || '#333' },
    loadingMessage: { textAlign: 'center', padding: '3rem 0', color: currentTheme.textColor || '#333' },
    errorMessage: { textAlign: 'center', padding: '3rem 0', color: 'red' },
  };

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    const statusFilter = searchParams.get('status') || 'all'; // Default to 'all'
    let url = `${backendUrl}/api/admin/event-requests`;
    if (statusFilter !== 'all') {
      url += `?status=${statusFilter}`;
    }

    // Check for token before making the request
    if (!token) {
      Swal.fire({ icon: 'warning', title: 'Not Logged In', text: 'Please log in to view requests.', confirmButtonColor: styles.header.color })
        .then(() => navigate('/'));
      return;
    }

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle non-OK responses
      if (!response.ok) {
        let errorMsg = `HTTP error! Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) { /* If response is not JSON, use status text */ }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching event requests:', err);
      Swal.fire({ icon: 'error', title: 'Fetch Error', text: err.message, confirmButtonColor: styles.header.color });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data when the component mounts or when auth/filter changes
    if (token && backendUrl) {
      fetchRequests();
    } else if (!token) {
      // Redirect if token is missing upon mounting
      Swal.fire({ icon: 'warning', title: 'Not Logged In', text: 'Please log in to view requests.', confirmButtonColor: styles.header.color }).then(() => navigate('/'));
    }
  }, [token, backendUrl, searchParams, navigate]); // Dependencies for the effect

  // Handler to update the URL search parameters for filtering
  const handleFilter = (status) => {
    setSearchParams({ status });
  };

  // Helper to get appropriate styling for status badges
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

  // Render loading or error states
  if (loading) return <div style={styles.loadingMessage}>Loading event requests...</div>;
  if (error) return <div style={styles.errorMessage}>Error: {error}</div>;

  return (
    <div style={styles.container}>
      <div className="flex justify-between items-center mb-6">
        <h1 style={styles.header}>Event Organization Requests</h1>
        <div>
          {/* Filter Buttons */}
          <button onClick={() => handleFilter('all')} style={searchParams.get('status') === 'all' ? styles.activeFilterButton : styles.filterButton}>All</button>
          <button onClick={() => handleFilter('Pending')} style={searchParams.get('status') === 'Pending' ? styles.activeFilterButton : styles.filterButton}><FaFolderOpen className="mr-1"/> Pending</button>
          <button onClick={() => handleFilter('In Progress')} style={searchParams.get('status') === 'In Progress' ? styles.activeFilterButton : styles.filterButton}><FaSpinner className="mr-1"/> In Progress</button>
          <button onClick={() => handleFilter('Approved')} style={searchParams.get('status') === 'Approved' ? styles.activeFilterButton : styles.filterButton}><FaCheckCircle className="mr-1"/> Approved</button>
          <button onClick={() => handleFilter('Rejected')} style={searchParams.get('status') === 'Rejected' ? styles.activeFilterButton : styles.filterButton}><FaTimesCircle className="mr-1"/> Rejected</button>
          <button onClick={() => handleFilter('Completed')} style={searchParams.get('status') === 'Completed' ? styles.activeFilterButton : styles.filterButton}><FaCheckCircle className="mr-1"/> Completed</button>
        </div>
      </div>

      {/* Display message if no requests are found */}
      {requests.length === 0 ? (
        <div style={styles.noInquiriesMessage}>
          <p>No event requests found for the selected filter.</p>
        </div>
      ) : (
        // Render the table of requests
        <div style={styles.tableContainer}>
          <table className="min-w-full" style={{ borderColor: styles.tableContainer.borderColor }}>
            <thead style={styles.tableHeader}>
              <tr>
                <th scope="col" className="py-3 px-4 text-left" style={{ ...styles.tableHeader, ...styles.tableCell }}>Event Name</th>
                <th scope="col" className="py-3 px-4 text-left" style={{ ...styles.tableHeader, ...styles.tableCell }}>Organizer</th>
                <th scope="col" className="py-3 px-4 text-left" style={{ ...styles.tableHeader, ...styles.tableCell }}>Student ID</th>
                <th scope="col" className="py-3 px-4 text-left" style={{ ...styles.tableHeader, ...styles.tableCell }}>Event Date</th>
                <th scope="col" className="py-3 px-4 text-left" style={{ ...styles.tableHeader, ...styles.tableCell }}>Status</th>
                <th scope="col" className="py-3 px-4 text-left" style={{ ...styles.tableHeader, ...styles.tableCell }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" style={{ borderBottom: `1px solid ${styles.tableCell.borderColor}`, backgroundColor: styles.container.backgroundColor }}>
                  <td className="py-3 px-4" style={styles.tableCell}>{request.eventName || 'N/A'}</td>
                  <td className="py-3 px-4" style={styles.tableCell}>{request.organizerName || 'N/A'}</td>
                  <td className="py-3 px-4" style={styles.tableCell}>{request.student_id || 'N/A'}</td>
                  <td className="py-3 px-4" style={styles.tableCell}>{request.eventDate ? new Date(request.eventDate).toLocaleDateString() : 'N/A'}</td>
                  <td className="py-3 px-4" style={styles.tableCell}>
                    <span style={{ ...styles.statusBadge, ...getStatusStyle(request.completionStatus) }}>
                      {request.completionStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex items-center space-x-2" style={styles.tableCell}>
                    {/* Link to view details and potentially reply */}
                    <Link to={`/event-requests/${request._id}`} className="text-blue-500 hover:underline flex items-center">
                      <FaEye className="mr-1" /> View
                    </Link>
                    <Link to={`/event-requests/${request._id}`} className="text-green-600 hover:underline flex items-center">
                      <FaPen className="mr-1" /> Reply
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllEventRequestsPage;