// src/pages/UserDashboard.jsx
import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

// Placeholder icons (replace with actual imports from react-icons or similar)
const UserIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
  </svg>
);

const CalendarIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-4 3h-2m3-3V1M4 7h16M4 11h16M4 15h16M6 20h12a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z"></path>
  </svg>
);

const DocumentIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const MailIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22.05L21 8M3 8l3-3m0 0l3.898 2.617M3 8v10a2 2 0 002 2h14a2 2 0 002-2V8m-7.89 5.26a2 2 0 01-2.22.05"></path>
  </svg>
);

const SpinnerIcon = ({ className = "animate-spin h-6 w-6" }) => (
  <svg className={className} viewBox="0 0 24 24" style={{ color: 'currentColor' }}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 8l3-3.709z"></path>
  </svg>
);

const ErrorIcon = ({ className = "h-12 w-12 text-red-500 mb-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);


const Dashboard = () => {
  const navigate = useNavigate();
  const { token, setToken, setUserData, backendUrl } = useContext(AppContext);
  const { currentTheme } = useTheme(); // This provides the theme object

  // State variables
  const [profileData, setProfileData] = useState(null);
  const [eventApplications, setEventApplications] = useState([]);
  const [userInquiries, setUserInquiries] = useState([]);
  const [upcomingApplications, setUpcomingApplications] = useState([]); // New state for upcoming applications
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Navigation Handlers
  const goToApplications = () => navigate('/applications');
  const goToUpcomingEvents = () => navigate('/events?filter=upcoming'); // Assuming this filter works on your events page
  const goToProfile = () => navigate('/profile');
  const goToSupportInquiries = () => navigate('/support/inquiries');

  // Effect to fetch User Dashboard Data
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
        // Fetch data concurrently using Promise.all
        const [profileResponse, applicationsResponse, inquiriesResponse, upcomingAppsResponse] = await Promise.all([
          axios.get(`${backendUrl}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${backendUrl}/api/user/user/applications`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${backendUrl}/api/user/user/inquiries`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${backendUrl}/api/user/events/upcoming/my`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setProfileData(profileResponse.data);
        setEventApplications(applicationsResponse.data.applications || []);
        setUserInquiries(inquiriesResponse.data || []);
        setUpcomingApplications(upcomingAppsResponse.data.upcomingApplications || []); 

      } catch (err) {
        console.error('User Dashboard fetch error:', err.response?.data || err.message);
        const errorMessage = err.response?.data?.message || 'Failed to fetch your dashboard data.';
        setError(errorMessage);
        toast.error(errorMessage);

        // Handle unauthorized access (401 status code) by logging the user out
        if (err.response && err.response.status === 401) {
          setToken(false);
          setUserData(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } finally {
        setLoading(false); // Always set loading to false when done
      }
    };

    fetchUserDashboardData();
    // Dependencies for the effect
  }, [token, navigate, backendUrl, setToken, setUserData]);

  // Memoized data for components
  const profileStats = useMemo(() => {
    // Provide safe defaults if profileData is not yet loaded
    if (!profileData) return { current_semester: 'N/A', course: 'N/A' };
    return {
      current_semester: profileData.current_semester || 'N/A',
      course: profileData.course || 'N/A',
    };
  }, [profileData]);

  const applicationStats = useMemo(() => {
    return { total: eventApplications.length };
  }, [eventApplications]);
 
  const upcomingEventCount = useMemo(() => {
  const now = new Date(); 
  const activeUpcomingApplications = upcomingApplications.filter(app => { 
    const eventDate = new Date(app.eventDate);
    return eventDate >= now;
  });
  return activeUpcomingApplications.length;
}, [upcomingApplications]);


  const recentInquiries = useMemo(() => {
    // Sort inquiries by submission date (descending) and take the first 5
    const sortedInquiries = [...userInquiries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sortedInquiries.slice(0, 5);
  }, [userInquiries]);

  // Render Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: currentTheme.bgColor, color: currentTheme.textColor, fontFamily: currentTheme.fontFamily }}>
        <div className="flex items-center gap-3 text-lg">
          <SpinnerIcon className="h-8 w-8" style={{ color: currentTheme.primaryColor }} />
          <span>Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  // Render Error State
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: currentTheme.bgColor, color: currentTheme.textColor, fontFamily: currentTheme.fontFamily }}>
        <ErrorIcon />
        <p className="text-lg text-center mb-4 max-w-md">{error}</p>
        <button
          onClick={() => {
            setToken(false);
            setUserData(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          }}
          className="px-6 py-3 rounded-lg font-semibold text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 shadow-lg"
          style={{
            backgroundColor: currentTheme.primaryColor,
            color: currentTheme.background,
            boxShadow: `0 4px 6px -1px ${currentTheme.primaryColor}30`,
            fontFamily: currentTheme.fontFamily, // Ensure button uses theme font
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Render Dashboard Content
  return (
    <div
      className="min-h-screen p-8 transition-colors duration-500"
      style={{
        backgroundColor: currentTheme.bgColor,
        color: currentTheme.textColor,
        fontFamily: currentTheme.fontFamily, // Primary font family for the whole dashboard
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Welcome Banner */}
        {profileData && (
          <div className="mb-8 p-8 rounded-2xl shadow-lg transition-all duration-500 flex flex-col md:flex-row items-center justify-between"
               style={{ backgroundColor: currentTheme.accent, color: currentTheme.background, fontFamily: currentTheme.fontFamily }}>
            <div>
              <h2 className="text-4xl font-extrabold mb-2" style={{ fontFamily: currentTheme.fontFamily }}>Welcome Back, {profileData.name}!</h2>
              <p className="text-xl opacity-90" style={{ fontFamily: currentTheme.fontFamily }}>Your personalized dashboard summary.</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-4">
                <button
                  onClick={goToProfile}
                  className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 shadow-md hover:shadow-lg"
                  style={{
                    backgroundColor: currentTheme.background,
                    color: currentTheme.accent,
                    border: `2px solid ${currentTheme.background}`,
                    fontFamily: currentTheme.fontFamily, // Ensure button uses theme font
                  }}
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    setToken(false);
                    setUserData(null);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                  }}
                  className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 shadow-md hover:shadow-lg"
                  style={{
                    backgroundColor: 'transparent',
                    color: currentTheme.background,
                    border: `2px solid ${currentTheme.background}`,
                    fontFamily: currentTheme.fontFamily, // Ensure button uses theme font
                  }}
                >
                  Logout
                </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar: Profile Summary and Navigation */}
          <div className="lg:col-span-1 space-y-8">
            {/* Profile Card */}
            <div
              className="p-8 rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl text-center"
              style={{
                backgroundColor: currentTheme.cardBgColor, // This applies the theme's card background color
                color: currentTheme.textColor,
                fontFamily: currentTheme.fontFamily, // Apply font to card
              }}
            >
              <img
                src={profileData?.profile_photo || '/images/default-profile.png'}
                alt="Profile"
                className="w-36 h-36 rounded-full object-cover shadow-2xl mx-auto border-4 border-opacity-50 transition-transform duration-300 ease-in-out hover:scale-105"
                style={{ borderColor: currentTheme.primaryColor }}
                onError={(e) => { e.target.onerror = null; e.target.src='/images/default-profile.png'; }}
              />
              <h1 className="text-3xl font-extrabold mt-5 mb-1 transition-colors duration-300" style={{ color: currentTheme.primaryColor, fontFamily: currentTheme.fontFamily }}> {/* Apply font to heading */}
                {profileData?.name || 'User'}
              </h1>
              <p className="text-base text-gray-500 mb-6" style={{ fontFamily: currentTheme.fontFamily }}>{profileData?.email || 'No email available'}</p> {/* Apply font to paragraph */}

              <button
                onClick={goToProfile}
                className="px-6 py-3 rounded-lg font-semibold text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 shadow-md hover:shadow-lg"
                style={{
                  backgroundColor: currentTheme.primaryColor,
                  color: currentTheme.background,
                  boxShadow: `0 4px 6px -1px ${currentTheme.primaryColor}30`,
                  fontFamily: currentTheme.fontFamily, // Ensure button uses theme font
                }}
              >
                View Full Profile
              </button>
            </div>

            {/* Your Details Card */}
            <div className="p-8 rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl" style={{ backgroundColor: currentTheme.cardBgColor, color: currentTheme.textColor, fontFamily: currentTheme.fontFamily }}> {/* Apply font to card */}
              <h3 className="text-2xl font-bold mb-5" style={{ color: currentTheme.primaryColor, fontFamily: currentTheme.fontFamily }}>Your Details</h3> {/* Apply font to heading */}
              <div className="grid grid-cols-2 gap-4 text-center w-full">
                <div className="p-4 rounded-lg border transition-colors duration-300 hover:border-gray-300" style={{ backgroundColor: currentTheme.footerBg, borderColor: currentTheme.borderColor, fontFamily: currentTheme.fontFamily }}> {/* Apply font to stat box */}
                  <p className="text-2xl font-bold" style={{ color: currentTheme.primaryColor, fontFamily: currentTheme.fontFamily }}>{profileStats.current_semester}</p> {/* Apply font to stat value */}
                  <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: currentTheme.fontFamily }}>Semester</p> {/* Apply font to stat label */}
                </div>
                <div className="p-4 rounded-lg border transition-colors duration-300 hover:border-gray-300" style={{ backgroundColor: currentTheme.footerBg, borderColor: currentTheme.borderColor, fontFamily: currentTheme.fontFamily }}> {/* Apply font to stat box */}
                  <p className="text-2xl font-bold" style={{ color: currentTheme.primaryColor, fontFamily: currentTheme.fontFamily }}>{profileStats.course}</p> {/* Apply font to stat value */}
                  <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: currentTheme.fontFamily }}>Course</p> {/* Apply font to stat label */}
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="p-8 rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl" style={{ backgroundColor: currentTheme.cardBgColor, color: currentTheme.textColor, fontFamily: currentTheme.fontFamily }}> {/* Apply font to card */}
              <h3 className="text-2xl font-bold mb-5" style={{ color: currentTheme.primaryColor, fontFamily: currentTheme.fontFamily }}>Quick Actions</h3> {/* Apply font to heading */}
              <ul className="space-y-4">
                <li onClick={goToProfile} className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" style={{ color: currentTheme.textColor, fontFamily: currentTheme.fontFamily }}> {/* Apply font to list item */}
                  <UserIcon className="w-6 h-6 mr-3 opacity-70" />
                  My Profile
                </li>
                <li onClick={goToUpcomingEvents} className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" style={{ color: currentTheme.textColor, fontFamily: currentTheme.fontFamily }}> {/* Apply font to list item */}
                  <CalendarIcon className="w-6 h-6 mr-3 opacity-70" />
                  Upcoming Events
                </li>
                <li onClick={goToApplications} className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" style={{ color: currentTheme.textColor, fontFamily: currentTheme.fontFamily }}> {/* Apply font to list item */}
                  <DocumentIcon className="w-6 h-6 mr-3 opacity-70" />
                  My Applications
                </li>
                <li onClick={goToSupportInquiries} className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" style={{ color: currentTheme.textColor, fontFamily: currentTheme.fontFamily }}> {/* Apply font to list item */}
                  <MailIcon className="w-6 h-6 mr-3 opacity-70" />
                  My Inquiries
                </li>
              </ul>
            </div>
          </div>

          {/* Right Section: Metrics and Inquiries */}
          <div className="lg:col-span-2 space-y-8">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div
                onClick={goToApplications}
                className="p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer flex items-center justify-between"
                style={{ backgroundColor: currentTheme.cardBgColor, fontFamily: currentTheme.fontFamily }} // Apply font to metric card
              >
                <div>
                  <div className="flex items-center mb-3">
                    <div className="p-3 rounded-full mr-4" style={{ backgroundColor: currentTheme.primaryColor }}>
                      <DocumentIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-4xl font-bold" style={{ color: currentTheme.primaryColor, fontFamily: currentTheme.fontFamily }}>{applicationStats.total}</p> {/* Apply font to number */}
                      <h3 className="text-lg font-semibold mt-1" style={{ fontFamily: currentTheme.fontFamily }}>Event Applications</h3> {/* Apply font to label */}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: currentTheme.fontFamily }}>Total applications submitted</p> {/* Apply font to description */}
                </div>
              </div>

              {/* *** UPCOMING EVENTS CARD (Using the new upcomingApplications count) *** */}
              <div
                onClick={goToUpcomingEvents}
                className="p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer flex items-center justify-between"
                style={{ backgroundColor: currentTheme.cardBgColor, fontFamily: currentTheme.fontFamily }} // Apply font to metric card
              >
                <div>
                  <div className="flex items-center mb-3">
                    <div className="p-3 rounded-full mr-4" style={{ backgroundColor: currentTheme.accent }}>
                      <CalendarIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      {/* This will now display the count from upcomingApplications */}
                      <p className="text-4xl font-bold" style={{ color: currentTheme.accent, fontFamily: currentTheme.fontFamily }}>{upcomingEventCount}</p> {/* Apply font to number */}
                      <h3 className="text-lg font-semibold mt-1" style={{ fontFamily: currentTheme.fontFamily }}>Upcoming Events</h3> {/* Apply font to label */}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: currentTheme.fontFamily }}>Events you're attending</p> {/* Apply font to description */}
                </div>
              </div>
            </div>

            {/* User Inquiries Section */}
            <div className="p-8 rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl" style={{ backgroundColor: currentTheme.cardBgColor }}> {/* Base style for card */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold" style={{ color: currentTheme.primaryColor, fontFamily: currentTheme.fontFamily }}>Your Recent Inquiries</h3> {/* Apply font to heading */}
                <button
                  onClick={goToSupportInquiries}
                  className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
                  style={{ color: currentTheme.accent, fontFamily: currentTheme.fontFamily }} // Apply font to button
                >
                  View All →
                </button>
              </div>

              {recentInquiries.length > 0 ? (
                <div className="overflow-hidden rounded-lg shadow-sm">
                  <table className="min-w-full divide-y">
                    <thead style={{ backgroundColor: currentTheme.footerBg }}>
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: currentTheme.fontFamily }}>
                          Inquiry
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: currentTheme.fontFamily }}>
                          Date
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: currentTheme.fontFamily }}>
                          Status
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: currentTheme.fontFamily }}>
                          Replied By
                        </th>
                        <th scope="col" className="relative px-4 py-3">
                          <span className="sr-only">Details</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody style={{ backgroundColor: currentTheme.cardBgColor }}>
                      {recentInquiries.map((inquiry) => (
                        <tr key={inquiry._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 border-b" style={{ borderColor: currentTheme.borderColor, fontFamily: currentTheme.fontFamily }}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ fontFamily: currentTheme.fontFamily }}>
                            {inquiry.query ? inquiry.query.substring(0, 40) + (inquiry.query.length > 40 ? '...' : '') : 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ fontFamily: currentTheme.fontFamily }}>
                            {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                             ${inquiry.inquiryStatus === 'Pending' ? 'bg-orange-100 text-orange-800' :
                                               inquiry.inquiryStatus === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                               inquiry.inquiryStatus === 'Resolved' ? 'bg-green-100 text-green-800' :
                                               'bg-gray-200 text-gray-800'}`}
                            >
                              {inquiry.inquiryStatus || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ fontFamily: currentTheme.fontFamily }}>
                            {inquiry.resolvedBy?.firstName || inquiry.resolvedBy?.lastName
                              ? `${inquiry.resolvedBy.firstName} ${inquiry.resolvedBy.lastName}`
                              : 'Admin'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                            <button
                              onClick={() => navigate(`/support/inquiries/${inquiry._id}`)}
                              className="font-medium hover:underline transition duration-200"
                              style={{ color: currentTheme.accent, fontFamily: currentTheme.fontFamily }} // Apply font to button
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-6" style={{ fontFamily: currentTheme.fontFamily }}>No recent inquiries found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;