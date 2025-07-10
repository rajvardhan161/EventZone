// src/pages/UserDashboard.jsx (Corrected - without component imports)
import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

// --- Mock/Example data if backend is not ready ---
// const mockProfile = { ... };

const Dashboard = () => {
  const navigate = useNavigate();
  const { token, setToken, setUserData, backendUrl } = useContext(AppContext);
  const { currentTheme } = useTheme();

  const [profileData, setProfileData] = useState(null);
  const [eventApplications, setEventApplications] = useState([]);
  const [userInquiries, setUserInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Effect to fetch User Dashboard Data ---
  useEffect(() => {
    if (!token) {
      toast.warn('Please log in to view your dashboard.');
      navigate('/login');
      return;
    }

    const fetchUserDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch Profile Data
        const profileResponse = await axios.get(`${backendUrl}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfileData(profileResponse.data);

        // Fetch User's Event Applications
        const applicationsResponse = await axios.get(`${backendUrl}/api/user/user/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEventApplications(applicationsResponse.data.applications || []);

        // Fetch User's Inquiries
        const inquiriesResponse = await axios.get(`${backendUrl}/api/user/user/inquiries`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserInquiries(inquiriesResponse.data || []);

      } catch (err) {
        console.error('User Dashboard fetch error:', err.response?.data || err.message);
        const errorMessage = err.response?.data?.message || 'Failed to fetch your dashboard data.';
        setError(errorMessage);
        toast.error(errorMessage);
        if (err.response && err.response.status === 401) {
          setToken(false);
          setUserData(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDashboardData();
  }, [token, navigate, backendUrl, setToken, setUserData]);

  // --- Memoized data for components ---
  const profileStats = useMemo(() => {
    if (!profileData) return {};
    return {
      current_semester: profileData.current_semester || 'N/A',
      course: profileData.course || 'N/A',
      // Add more stats if available and relevant
    };
  }, [profileData]);

  const applicationStats = useMemo(() => {
    return {
      total: eventApplications.length,
      // You could add counts for 'Approved', 'Pending', 'Rejected' if your API returns that
    };
  }, [eventApplications]);

  const recentInquiries = useMemo(() => {
    return userInquiries.slice(0, 5); // Display first 5 recent inquiries
  }, [userInquiries]);

  // --- Render Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: currentTheme.bgColor, fontFamily: currentTheme.fontFamily }}>
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" style={{ color: currentTheme.primaryColor }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 8l3-3.709z"></path>
          </svg>
          <p className="text-lg" style={{ color: currentTheme.textColor }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // --- Render Error State ---
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: currentTheme.bgColor, color: currentTheme.textColor, fontFamily: currentTheme.fontFamily }}>
        <p className="text-lg text-red-500 text-center mb-4">{error}</p>
        <button
          onClick={() => {
            setToken(false);
            setUserData(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          }}
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // --- Render Dashboard Content ---
  return (
    <div
      className="min-h-screen p-8 transition-colors duration-500"
      style={{
        backgroundColor: currentTheme.bgColor,
        color: currentTheme.textColor,
        fontFamily: currentTheme.fontFamily,
      }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Sidebar: Profile Summary and Navigation */}
        <div className="lg:col-span-1 space-y-8">
          {profileData && (
            <div
              className="p-8 rounded-xl shadow-xl transition-shadow duration-500 hover:shadow-2xl"
              style={{
                backgroundColor: currentTheme.cardBgColor,
                color: currentTheme.textColor,
                fontFamily: currentTheme.fontFamily,
              }}
            >
              <div className="flex flex-col items-center">
                <img
                  src={profileData.profile_photo || '/images/default-profile.png'}
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover shadow-xl border-4 border-opacity-50 transition-all duration-300 ease-in-out
                             hover:border-blue-400 hover:scale-105"
                  onError={(e) => { e.target.onerror = null; e.target.src='/images/default-profile.png'; }}
                />
                <h1 className="text-3xl font-extrabold mt-4 mb-1 transition-colors duration-300" style={{ color: currentTheme.primaryColor }}>
                  {profileData.name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-300 mb-5 transition-colors duration-300">{profileData.email}</p>

                <button
                  onClick={() => navigate('/profile')}
                  className="mt-4 px-5 py-2 rounded-lg font-semibold text-sm transition-colors duration-200"
                  style={{
                    backgroundColor: currentTheme.primaryColor,
                    color: currentTheme.background, // Assuming primary color is dark, use light text
                    boxShadow: `0 4px 6px -1px ${currentTheme.primaryColor}30`,
                  }}
                >
                  View Full Profile
                </button>
              </div>
            </div>
          )}
          {profileData && (
            <div className="p-8 rounded-xl shadow-xl transition-shadow duration-500 hover:shadow-2xl" style={{
                  backgroundColor: currentTheme.cardBgColor,
                  color: currentTheme.textColor,
                  fontFamily: currentTheme.fontFamily,
                }}>
              <h3 className="text-2xl font-bold mb-4" style={{ color: currentTheme.primaryColor }}>Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4 text-center w-full">
                <div className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-300" style={{ backgroundColor: currentTheme.footerBg }}>
                  <p className="text-lg font-bold" style={{ color: currentTheme.primaryColor }}>{profileStats.current_semester}</p>
                  <p className="text-sm text-gray-500">Semester</p>
                </div>
                <div className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-300" style={{ backgroundColor: currentTheme.footerBg }}>
                  <p className="text-lg font-bold" style={{ color: currentTheme.primaryColor }}>{profileStats.course}</p>
                  <p className="text-sm text-gray-500">Course</p>
                </div>
              </div>
            </div>
          )}
          {profileData && (
            <div className="p-8 rounded-xl shadow-xl transition-shadow duration-500 hover:shadow-2xl" style={{
                  backgroundColor: currentTheme.cardBgColor,
                  color: currentTheme.textColor,
                  fontFamily: currentTheme.fontFamily,
                }}>
              <h3 className="text-2xl font-bold mb-4" style={{ color: currentTheme.primaryColor }}>Quick Actions</h3>
              <ul className="space-y-3">
                <li onClick={() => navigate('/profile')} className="flex items-center cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" style={{ color: currentTheme.textColor }}>
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  My Profile
                </li>
                <li onClick={() => navigate('/events')} className="flex items-center cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" style={{ color: currentTheme.textColor }}>
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Browse Events
                </li>
                <li onClick={() => navigate('/applications')} className="flex items-center cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" style={{ color: currentTheme.textColor }}>
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  My Applications
                </li>
                {/* Add more user-specific links if needed */}
              </ul>
            </div>
          )}
        </div>

        {/* Right Section: Welcome Banner, Metrics, and Inquiries */}
        <div className="lg:col-span-2 space-y-8">
          {profileData && (
            <div className="mb-8 p-8 rounded-xl shadow-xl transition-shadow duration-500 hover:shadow-2xl" style={{
                  backgroundColor: currentTheme.accent, // Using accent for a prominent welcome banner
                  color: currentTheme.background, // Use background color for text on accent
                  fontFamily: currentTheme.fontFamily,
                }}>
              <h2 className="text-3xl font-extrabold mb-2">Hello, {profileData.name}!</h2>
              <p className="text-lg">Here's a quick look at your recent activity.</p>
            </div>
          )}

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg" style={{ backgroundColor: currentTheme.cardBgColor }}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-full" style={{ backgroundColor: currentTheme.hoverPrimary }}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <p className="text-4xl font-bold" style={{ color: currentTheme.primaryColor }}>{applicationStats.total}</p>
              </div>
              <h3 className="text-lg font-semibold mb-1">Event Applications</h3>
              <p className="text-sm text-gray-500">Applications submitted</p>
            </div>
            {/* Placeholder for another metric, e.g., upcoming events */}
            <div className="p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg" style={{ backgroundColor: currentTheme.cardBgColor }}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-full" style={{ backgroundColor: currentTheme.accent }}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-4 3h-2m3-3V1M4 7h16M4 11h16M4 15h16M6 20h12a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z"></path></svg>
                </div>
                <p className="text-4xl font-bold" style={{ color: currentTheme.accent }}>{profileData?.upcomingEvents?.count || 0}</p> {/* Example: assuming API provides this */}
              </div>
              <h3 className="text-lg font-semibold mb-1">Upcoming Events</h3>
              <p className="text-sm text-gray-500">Events you might be interested in</p>
            </div>
          </div>

          {/* User Inquiries Section */}
          <div className="p-8 rounded-xl shadow-xl transition-shadow duration-500 hover:shadow-2xl" style={{ backgroundColor: currentTheme.cardBgColor }}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-2xl font-bold" style={{ color: currentTheme.primaryColor }}>Your Recent Inquiries</h3>
              <button
                onClick={() => navigate('/support/inquiries')} // Assuming you have a dedicated inquiries page
                className="px-4 py-2 text-blue-600 font-semibold hover:underline transition duration-200 ease-in-out"
              >
                View All
              </button>
            </div>

            {recentInquiries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50" style={{ backgroundColor: currentTheme.footerBg }}>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inquiry
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Submitted
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Replied By
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Details</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200" style={{ backgroundColor: currentTheme.cardBgColor }}>
                    {recentInquiries.map((inquiry, index) => (
                      <tr key={inquiry._id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {inquiry.query ? inquiry.query.substring(0, 50) + (inquiry.query.length > 50 ? '...' : '') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                           ${inquiry.inquiryStatus === 'Pending' ? 'bg-orange-100 text-orange-800' :
                                             inquiry.inquiryStatus === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                             inquiry.inquiryStatus === 'Resolved' ? 'bg-green-100 text-green-800' :
                                             'bg-red-100 text-red-800'}`}>
                            {inquiry.inquiryStatus || 'N/A'}
                          </span>
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
  {inquiry.inquiryStatus === 'Open'
    ? 'N/A'
    : (inquiry.resolvedBy?.firstName && inquiry.resolvedBy?.lastName)
      ? `${inquiry.resolvedBy.firstName} ${inquiry.resolvedBy.lastName}`
      : 'Admin'}
</td>


                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <button
                            onClick={() => navigate(`/support/inquiries/${inquiry._id}`)} // Assuming you have a route to view inquiry details
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6">Your inquiry history will appear here.</p>
            )}
          </div>

          {/* Additional Features Section (Example: Latest Notifications) */}
          <div className="p-8 rounded-xl shadow-xl transition-shadow duration-500 hover:shadow-2xl" style={{ backgroundColor: currentTheme.cardBgColor }}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-2xl font-bold" style={{ color: currentTheme.primaryColor }}>Latest Notifications</h3>
              <button
                onClick={() => navigate('/notifications')}
                className="px-4 py-2 text-blue-600 font-semibold hover:underline transition duration-200 ease-in-out"
              >
                View All
              </button>
            </div>
            {profileData?.notifications && profileData.notifications.length > 0 ? (
              <ul className="space-y-3">
                {profileData.notifications.slice(0, 3).map((notification) => (
                  <li key={notification._id} className="flex items-start text-sm p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200" style={{ color: currentTheme.textColor }}>
                    <div className="mr-3 mt-1 flex-shrink-0">
                      <svg className={`w-5 h-5 ${notification.type === 'success' ? 'text-green-500' : notification.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        {notification.type === 'success' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>}
                        {notification.type === 'warning' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>}
                        {notification.type === 'info' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v4h-1m1-4h4m2 4h-4m-4-4v-4m4 0h.01M4.317 16.697c2.302 1.398 5.448 1.982 8.914 1.982s6.612-.584 8.914-1.982C21.848 15.59 22 14.843 22 14c0-1.843-.317-2.59-.683-3.071C20.425 9.584 17.279 9 12 9s-8.425-.584-10.317-1.929C1.317 11.41 1 12.157 1 14c0 .843.152 1.59.683 2.071z"></path>}
                      </svg>
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium" style={{ color: currentTheme.primaryColor }}>{notification.title}</p>
                      <p className="mt-1">{notification.message ? notification.message.substring(0, 80) + (notification.message.length > 80 ? '...' : '') : 'No message content.'}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.timestamp ? new Date(notification.timestamp).toLocaleString() : 'Unknown time'}</p>
                    </div>
                  </li>
                ))}
                {profileData.notifications.length === 0 && (
                  <p className="text-center text-gray-500 py-3">No new notifications.</p>
                )}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-6">Your notifications will appear here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;