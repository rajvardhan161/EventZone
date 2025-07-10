import React, { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { FaFilter, FaFolderOpen, FaCheckCircle, FaSpinner } from 'react-icons/fa'; // Icons for status and filter

const AllInquiriesPage = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { token, backendUrl } = useContext(AdminContext);
  const { currentTheme } = useTheme();

  const styles = {
    container: { backgroundColor: currentTheme.backgroundColor || '#ffffff', color: currentTheme.textColor || '#333', padding: '1.5rem 1rem' },
    header: { color: currentTheme.highlightColor || '#007bff', fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' },
    tableContainer: { overflowX: 'auto', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderColor: currentTheme.borderColor || '#ddd' },
    tableHeader: { backgroundColor: currentTheme.tableHeaderColor || '#f8f9fa', color: currentTheme.textColor || '#333', borderBottom: `1px solid ${currentTheme.borderColor || '#ddd'}` },
    tableCell: { borderColor: currentTheme.borderColor || '#ddd' },
    statusBadge: { padding: '0.375rem 0.75rem', fontSize: '0.8125rem', borderRadius: '9999px', fontWeight: '600' },
    openStatus: { backgroundColor: currentTheme.warningBg || '#fef3c7', color: currentTheme.warningColor || '#92400e' },
    progressStatus: { backgroundColor: currentTheme.infoBg || '#cfe2ff', color: currentTheme.infoColor || '#0b5ed7' },
    resolvedStatus: { backgroundColor: currentTheme.successBg || '#d1fae5', color: currentTheme.successColor || '#065f46' },
    closedStatus: { backgroundColor: currentTheme.secondaryBg || '#e0e0e0', color: currentTheme.secondaryColor || '#444' },
    filterButton: { color: currentTheme.highlightColor || '#007bff', marginRight: '0.75rem', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: `1px solid ${currentTheme.highlightColor || '#007bff'}` },
    activeFilterButton: { color: '#fff', backgroundColor: currentTheme.highlightColor || '#007bff', marginRight: '0.75rem', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: `1px solid ${currentTheme.highlightColor || '#007bff'}` },
    noInquiriesMessage: { textAlign: 'center', padding: '2rem 0', color: currentTheme.textColor || '#333' },
  };

  const fetchInquiries = async () => {
    setLoading(true);
    setError(null);
    const statusFilter = searchParams.get('status') || 'Open'; // Default to 'Open'
    try {
      const response = await fetch(`${backendUrl}/api/admin/inquiries?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setInquiries(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && backendUrl) {
      fetchInquiries();
    } else {
      // Handle redirection or error if token/backendUrl is missing
    }
  }, [token, backendUrl, searchParams]); // Re-fetch if filters change

  const handleFilter = (status) => {
    setSearchParams({ status });
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

  if (loading) return <div style={styles.loadingMessage}>Loading inquiries...</div>;
  if (error) return <div style={styles.errorMessage}>Error: {error}</div>;

  return (
    <div style={styles.container}>
      <div className="flex justify-between items-center mb-6">
        <h1 style={styles.header}>All Inquiries</h1>
        <div>
          <button onClick={() => handleFilter('all')} style={searchParams.get('status') === 'all' ? styles.activeFilterButton : styles.filterButton}>All</button>
          <button onClick={() => handleFilter('Open')} style={searchParams.get('status') === 'Open' ? styles.activeFilterButton : styles.filterButton}><FaFolderOpen className="mr-1"/> Open</button>
          <button onClick={() => handleFilter('In Progress')} style={searchParams.get('status') === 'In Progress' ? styles.activeFilterButton : styles.filterButton}><FaSpinner className="mr-1"/> In Progress</button>
          <button onClick={() => handleFilter('Resolved')} style={searchParams.get('status') === 'Resolved' ? styles.activeFilterButton : styles.filterButton}><FaCheckCircle className="mr-1"/> Resolved</button>
        </div>
      </div>

      {inquiries.length === 0 ? (
        <div style={styles.noInquiriesMessage}>
          <p>No inquiries found for this filter.</p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table className="min-w-full" style={{ borderColor: styles.tableContainer.borderColor }}>
            <thead style={styles.tableHeader}>
              <tr>
                <th scope="col" className="py-3 px-4 text-left" style={{ ...styles.tableHeader, ...styles.tableCell }}>Name</th>
                <th scope="col" className="py-3 px-4 text-left" style={{ ...styles.tableHeader, ...styles.tableCell }}>Email</th>
                <th scope="col" className="py-3 px-4 text-left" style={{ ...styles.tableHeader, ...styles.tableCell }}>Query</th>
                <th scope="col" className="py-3 px-4 text-left" style={{ ...styles.tableHeader, ...styles.tableCell }}>Status</th>
                <th scope="col" className="py-3 px-4 text-left" style={{ ...styles.tableHeader, ...styles.tableCell }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <tr key={inquiry._id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" style={{ borderBottom: `1px solid ${styles.tableCell.borderColor}`, backgroundColor: styles.container.backgroundColor }}>
                  <td className="py-3 px-4" style={styles.tableCell}>{inquiry.firstName} {inquiry.lastName}</td>
                  <td className="py-3 px-4" style={styles.tableCell}>{inquiry.email}</td>
                  <td className="py-3 px-4" style={styles.tableCell}>{inquiry.query.substring(0, 50)}{inquiry.query.length > 50 ? '...' : ''}</td>
                  <td className="py-3 px-4" style={styles.tableCell}>
                    <span style={{ ...styles.statusBadge, ...getStatusStyle(inquiry.inquiryStatus) }}>
                      {inquiry.inquiryStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex items-center space-x-2" style={styles.tableCell}>
                    <Link to={`/inquiries/${inquiry._id}`} className="text-blue-500 hover:underline">View & Reply</Link>
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

export default AllInquiriesPage;