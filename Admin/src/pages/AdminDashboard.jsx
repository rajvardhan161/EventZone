// src/pages/AdminDashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
// Import more icons for better representation and loading/error states
import { FaUsers, FaClock, FaFileAlt, FaSpinner, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaCalendarAlt } from 'react-icons/fa'; // Added FaCalendarAlt for events

const AdminDashboard = () => {
  const { backendUrl, token } = useContext(AdminContext);
  const { currentTheme } = useTheme(); // Use currentTheme for more granular styling
  const navigate = useNavigate(); // Initialize navigate for routing

  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0, // Added for more comprehensive stats
    rejectedApplications: 0, // Added for more comprehensive stats
    totalUsers: 0,
    totalEvents: 0, // Added for total events count
  });

  const [recentApplications, setRecentApplications] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [recentError, setRecentError] = useState(null);

  // Fetch Summary Stats
  const fetchSummaryStats = async () => {
    setLoadingStats(true); // Set loading to true before fetch
    setStatsError(null);   // Clear previous errors
    try {
      // Fetch stats in parallel for efficiency
      const [summaryRes, userRes, eventRes,upcomingEventsRes] = await Promise.all([ // Added eventRes
        axios.get(`${backendUrl}/api/admin/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${backendUrl}/api/admin/users/count`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${backendUrl}/api/admin/count`, { // New endpoint for event count
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${backendUrl}/api/admin/upcoming/count`, { // New endpoint for event count
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Update stats, ensuring values are numbers or 0 if undefined
      setStats({
        totalApplications: summaryRes.data.totalApplications || 0,
        pendingApplications: summaryRes.data.pendingApplications || 0,
        approvedApplications: summaryRes.data.approvedApplications || 0, // Assign new stat
        rejectedApplications: summaryRes.data.rejectedApplications || 0, // Assign new stat
        totalUsers: userRes.data.totalUsers || 0,
        totalEvents: eventRes.data.totalEvents || 0, // Assign new stat for total events
        upcomingEventsCount: upcomingEventsRes.data.upcomingEventsCount || 0,
      });
    } catch (error) {
      console.error('Failed to fetch summary stats:', error);
      // Provide a user-friendly error message
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred.';
      setStatsError(`Failed to load dashboard stats: ${errorMessage}`);
    } finally {
      setLoadingStats(false); // Set loading to false regardless of success or failure
    }
  };

  // Fetch recent applications
  const fetchRecentApplications = async () => {
    setLoadingRecent(true); // Set loading to true before fetch
    setRecentError(null);   // Clear previous errors
    try {
      // Corrected the API endpoint based on previous context, assuming it's applications and not applicationsex
      // Added sorting and ordering for recency
      const res = await axios.get(`${backendUrl}/api/admin/applications?limit=5&sortBy=applicationDate&order=desc`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecentApplications(res.data);
    } catch (error) {
      console.error('Failed to fetch recent applications:', error);
      // Provide a user-friendly error message
      const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred.';
      setRecentError(`Failed to load recent applications: ${errorMessage}`);
    } finally {
      setLoadingRecent(false); // Set loading to false regardless of success or failure
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    fetchSummaryStats();
    fetchRecentApplications();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Helper function for consistent styling - calculates contrast text color
  const getContrastTextColor = (bgColor) => {
    if (!bgColor) return '#333333'; // Default to dark text if no background
    // Convert hex to RGB and calculate luminance
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF'; // Return black for light backgrounds, white for dark
  };

  // Base style for all stat cards
  const cardBaseStyle = {
    padding: '24px', // Increased padding for more breathing room
    borderRadius: '12px', // More rounded corners for a modern look
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)', // Softer, larger shadow for depth
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out', // Smooth hover effects
    cursor: 'pointer', // Indicate cards are clickable
  };

  // Function to generate dynamic card styles based on background color and theme
  const getCardStyle = (bgColor) => ({
    ...cardBaseStyle,
    backgroundColor: bgColor,
    color: getContrastTextColor(bgColor), // Ensure text has good contrast
  });

  // Handler for clicking on stat cards to navigate
  const handleCardClick = (statType) => {
    // Navigate to the applications page filtered by status, or users page, or events page
    switch (statType) {
      case 'pending':
        navigate('/applications', { state: { filter: 'Pending' } });
        break;
      case 'approved':
        navigate('/applications', { state: { filter: 'Approved' } });
        break;
      case 'rejected':
        navigate('applications', { state: { filter: 'Rejected' } });
        break;
      case 'totalApplications':
        navigate('/applications'); // Navigate to all applications
        break;
      case 'totalUsers':
        navigate('/users'); // Navigate to the users management page
        break;
      case 'totalEvents': // New case for clicking on total events
        navigate('/create-event'); // Navigate to the events management page
        break;
      case 'upcomingEventsCount':
        navigate('/events/upcoming');
        break;

      default:
        break;
    }
  };

  // Define colors for stat cards based on the theme
  // Fallback colors are provided if theme properties are missing
  const statsCardColors = {
    totalApplications: currentTheme.primaryColor || '#3b82f6', // Tailwind blue-500
    pendingApplications: currentTheme.warningColor || '#f59e0b', // Tailwind amber-500
    approvedApplications: currentTheme.successColor || '#10b981', // Tailwind green-500
    rejectedApplications: currentTheme.dangerColor || '#ef4444', // Tailwind red-500
    totalUsers: currentTheme.infoColor || '#6366f1', // Tailwind indigo-500
    totalEvents: currentTheme.secondaryColor || '#64748b', // Tailwind slate-500 as fallback
    upcomingEventsCount: currentTheme.highlightColor || '#0ea5e9', // Tailwind sky-500 as fallback

  };

  // Styles for table headers, leveraging theme colors
  const tableHeaderStyle = {
    backgroundColor: currentTheme.navbarBgColor || '#e5e7eb', // Tailwind gray-200 as fallback
    color: getContrastTextColor(currentTheme.navbarBgColor || '#e5e7eb'),
    padding: '12px 16px',
    textAlign: 'left',
    borderBottom: `2px solid ${getContrastTextColor(currentTheme.navbarBgColor || '#e5e7eb')}`,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    fontSize: '0.875rem', // text-sm
  };

  // Base styles for table cells
  const tableCellStyle = {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(0,0,0,0.1)', // Subtle border for separation
    fontSize: '0.9375rem', // text-base
  };

  // Helper to get status badge styles
  const getStatusBadgeStyle = (status) => {
    let bgColor, textColor;
    switch (status) {
      case 'Pending': bgColor = '#fde68a'; textColor = '#92400e'; break; // Yellow
      case 'Approved': bgColor = '#bbf7d0'; textColor = '#166534'; break; // Green
      case 'Rejected': bgColor = '#fecaca'; textColor = '#991b1b'; break; // Red
      default: bgColor = '#e5e7eb'; textColor = '#374151'; // Gray
    }
    // Styling for the status badges
    return { backgroundColor: bgColor, color: textColor, padding: '0.4rem 0.8rem', borderRadius: '9999px', fontWeight: 'semibold', fontSize: '0.75rem', lineHeight: '1rem' };
  };

  return (
    // Main container, applying background and text color from theme
    <div className={`p-6 ${currentTheme.bgColor ? '' : 'bg-white'} ${currentTheme.textColor || 'text-black'}`} style={{ backgroundColor: currentTheme.bgColor }}>
      {/* Dashboard Title */}
      <h1 className={`text-3xl font-bold mb-8 ${currentTheme.textColor || 'text-black'}`}>Admin Dashboard</h1>

      {/* Stats Cards Section */}
      {statsError ? (
        // Display error message if stats failed to load
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center mb-6" role="alert">
          <strong className="font-bold text-lg">Error!</strong>
          <span className="block sm:inline text-lg"> {statsError}</span>
          <button onClick={fetchSummaryStats} className="ml-4 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-600">Retry</button>
        </div>
      ) : (
        // Grid for stat cards, responsive columns
        // Adjusted grid to accommodate 5 stats comfortably on larger screens
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
          {/* Total Applications Card */}
          <div
            className="card-hover-effect" // Class for hover effect styling
            style={getCardStyle(statsCardColors.totalApplications)}
            onClick={() => handleCardClick('totalApplications')}
          >
            <FaFileAlt className="text-4xl mb-3" />
            {/* Display spinner while loading, otherwise show the count */}
            <p className="text-2xl font-extrabold">{loadingStats ? <FaSpinner className="animate-spin" /> : stats.totalApplications}</p>
            <p className="text-lg font-medium">Total Applications</p>
          </div>

          {/* Pending Applications Card */}
          <div
            className="card-hover-effect"
            style={getCardStyle(statsCardColors.pendingApplications)}
            onClick={() => handleCardClick('pending')}
          >
            <FaClock className="text-4xl mb-3" />
            <p className="text-2xl font-extrabold">{loadingStats ? <FaSpinner className="animate-spin" /> : stats.pendingApplications}</p>
            <p className="text-lg font-medium">Pending Applications</p>
          </div>

          {/* Approved Applications Card */}
          <div
            className="card-hover-effect"
            style={getCardStyle(statsCardColors.approvedApplications)}
            onClick={() => handleCardClick('approved')}
          >
            <FaCheckCircle className="text-4xl mb-3" /> {/* Added Check Circle icon */}
            <p className="text-2xl font-extrabold">{loadingStats ? <FaSpinner className="animate-spin" /> : stats.approvedApplications}</p>
            <p className="text-lg font-medium">Approved</p>
          </div>

          {/* Rejected Applications Card */}
          <div
            className="card-hover-effect"
            style={getCardStyle(statsCardColors.rejectedApplications)}
            onClick={() => handleCardClick('rejected')}
          >
            <FaTimesCircle className="text-4xl mb-3" /> {/* Added Times Circle icon */}
            <p className="text-2xl font-extrabold">{loadingStats ? <FaSpinner className="animate-spin" /> : stats.rejectedApplications}</p>
            <p className="text-lg font-medium">Rejected</p>
          </div>

          {/* Total Users Card */}
          <div
            className="card-hover-effect"
            style={getCardStyle(statsCardColors.totalUsers)}
            onClick={() => handleCardClick('totalUsers')}
          >
            <FaUsers className="text-4xl mb-3" />
            <p className="text-2xl font-extrabold">{loadingStats ? <FaSpinner className="animate-spin" /> : stats.totalUsers}</p>
            <p className="text-lg font-medium">Total Users</p>
          </div>

          {/* Total Events Card */}
          <div
            className="card-hover-effect"
            style={getCardStyle(statsCardColors.totalEvents)} // Use the new color for events
            onClick={() => handleCardClick('totalEvents')} // Navigate to events page
          >
            <FaCalendarAlt className="text-4xl mb-3" /> {/* Icon for events */}
            <p className="text-2xl font-extrabold">{loadingStats ? <FaSpinner className="animate-spin" /> : stats.totalEvents}</p>
            <p className="text-lg font-medium">Total Events</p>
          </div>
          {/* Upcoming Events Card */}
          <div
            className="card-hover-effect"
            style={getCardStyle(statsCardColors.upcomingEventsCount)}
            onClick={() => handleCardClick('upcomingEventsCount')}  // Optional: handle click
          >
            <FaCalendarAlt className="text-4xl mb-3" />  {/* Reuse Calendar Icon or pick a new one */}
            <p className="text-2xl font-extrabold">
              {loadingStats ? <FaSpinner className="animate-spin" /> : stats.upcomingEventsCount}
            </p>
            <p className="text-lg font-medium">Upcoming Events</p>
          </div>

        </div>
      )}

      {/* Recent Applications Table Section */}
      {/* Apply theme background and text color */}
      <div className={`p-6 rounded-2xl shadow-md ${currentTheme.navbarBgColor ? '' : 'bg-gray-100'}`} style={{ backgroundColor: currentTheme.navbarBgColor, color: getContrastTextColor(currentTheme.navbarBgColor) }}>
        <h2 className="text-2xl font-bold mb-5">Recent Applications</h2>

        {recentError ? (
          // Display error message if recent applications failed to load
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center mb-6" role="alert">
            <strong className="font-bold text-lg">Error!</strong>
            <span className="block sm:inline text-lg"> {recentError}</span>
            <button onClick={fetchRecentApplications} className="ml-4 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-600">Retry</button>
          </div>
        ) : loadingRecent ? (
          // Show spinner while recent applications are loading
          <div className="flex items-center justify-center h-40">
            <FaSpinner className="animate-spin mr-3 text-2xl" />
            <p className="text-lg">Loading recent applications...</p>
          </div>
        ) : recentApplications.length === 0 ? (
          // Message if no recent applications are found
          <p className="text-center py-10 text-gray-500 dark:text-gray-400">No recent applications found.</p>
        ) : (
          // Table to display recent applications
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  {/* Table Headers with styling */}
                  <th style={tableHeaderStyle} className="rounded-tl-lg">Name</th> {/* Rounded top-left corner */}
                  <th style={tableHeaderStyle}>Event</th>
                  <th style={tableHeaderStyle}>Status</th>
                  <th style={tableHeaderStyle} className="rounded-tr-lg">Date</th> {/* Rounded top-right corner */}
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app) => {
                  // Determine row background and hover colors based on theme
                  const rowBgColor = currentTheme.bgColor || '#ffffff'; // Fallback to white
                  const rowTextColor = getContrastTextColor(rowBgColor); // Contrast text color for the row
                  // Define a hover background color, potentially using the navbar background for contrast
                  const rowHoverBgColor = currentTheme.navbarBgColor ? '#3f3f46' : '#e0e0e0'; // Example dark hover, fallback to light gray

                  return (
                    <tr
                      key={app.eventId}
                      // Apply styles and transition for smooth hover effect
                      className="transition-colors duration-300 ease-in-out cursor-pointer"
                      style={{ backgroundColor: rowBgColor, color: rowTextColor }}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = rowHoverBgColor; }} // Change background on hover
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = rowBgColor; }}     // Revert background when mouse leaves
                      // Navigate to the specific application details page on click
                      onClick={() => navigate(`/events/${app.eventId}/applications`)}
                    >
                      <td style={tableCellStyle}>{app.userName || 'N/A'}</td>
                      <td style={tableCellStyle}>{app.eventName || 'N/A'}</td>
                      <td style={tableCellStyle}>
                        {/* Status badge with dynamic styling */}
                        <span
                          className="inline-block px-3 py-1 font-semibold leading-tight rounded-full text-xs"
                          style={getStatusBadgeStyle(app.status)}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td style={tableCellStyle}>
                        {new Date(app.applicationDate).toLocaleDateString()} {/* Formatted date */}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;