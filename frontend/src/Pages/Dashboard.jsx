// src/pages/UserDashboard.jsx
import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import {
  FaClipboardList, FaCalendarAlt, FaLink, FaExpandArrowsAlt, FaUserCircle,
  FaSpinner, FaExclamationTriangle, FaFileAlt, FaEnvelopeOpen, FaTasks, FaBell
} from 'react-icons/fa'; // Added more icons

// --- Reusable Icons (Themed) ---
const ThemedIcon = ({ IconComponent, className = "w-6 h-6", themeColor, ...props }) => (
  <IconComponent className={`${className} transition-colors duration-300`} style={{ color: themeColor }} {...props} />
);

const Spinner = ({ className = "animate-spin h-8 w-8", themeColor }) => (
  <svg className={className} viewBox="0 0 24 24" style={{ color: themeColor }}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 8l3-3.709z"></path>
  </svg>
);

const ErrorDisplay = ({ message, theme }) => (
  <div className="flex flex-col items-center justify-center py-10" style={{ fontFamily: theme.fontFamily }}>
    <FaExclamationTriangle className="h-12 w-12 mb-4" style={{ color: theme.errorColor || '#dc2626' }} />
    <p className="text-lg text-center" style={{ color: theme.errorColor || '#dc2626' }}>
      {message || 'An unexpected error occurred.'}
    </p>
  </div>
);

// --- Notice Card Component ---
const NoticeCard = ({ notice, theme, onClick }) => {
  const createdAt = new Date(notice.createdAt);
  const expiresAt = notice.expiresAt ? new Date(notice.expiresAt) : null;
  const isExpired = expiresAt && expiresAt < new Date();

  let statusText;
  let statusStyles;

  if (isExpired) {
    statusText = 'Expired';
    statusStyles = { color: theme.errorColor || '#dc2626', fontWeight: '600' };
  } else if (notice.status === 'Draft') {
    statusText = 'Draft';
    statusStyles = { color: theme.textColorMuted || '#6c757d', fontWeight: '600' };
  } else {
    statusText = 'Posted';
    statusStyles = { color: theme.successColor || '#10b981', fontWeight: '600' };
  }

  const noticeTitleLinkStyles = {
    color: theme.accentColor || theme.primaryColor || '#4f46e5',
    textDecoration: 'none',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'color 0.3s ease',
    fontFamily: theme.fontFamily,
    fontSize: '0.9rem',
  };

  return (
    <div
      className="p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer flex items-center justify-between border"
      style={{
        backgroundColor: theme.cardBgColor,
        fontFamily: theme.fontFamily,
        borderColor: theme.borderColor,
      }}
      onClick={() => onClick(notice)}
    >
      <div className="flex-grow flex items-center">
        <ThemedIcon IconComponent={FaBell} themeColor={theme.primaryColor} className="w-8 h-8 mr-4 p-2 rounded-full" style={{ backgroundColor: theme.primaryColor + '20' }} />
        <div>
          <p className="text-lg font-bold transition-colors duration-300" style={{ color: theme.primaryColor, fontFamily: theme.fontFamily }}>{notice.title}</p>
          <h3 className="text-base font-semibold mt-1 transition-colors duration-300" style={{ color: theme.textColor, fontFamily: theme.fontFamily }}>
            {notice.message.substring(0, 60)}
            {notice.message.length > 60 ? '...' : ''}
          </h3>
          <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: theme.fontFamily }}>
            {createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end ml-4">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full`} style={statusStyles}>
          {statusText}
        </span>
        {notice.link && (
          <span className="flex items-center gap-1 mt-2" style={noticeTitleLinkStyles}>
            <FaLink className="text-xs" /> Link
          </span>
        )}
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const { token, setToken, setUserData, backendUrl } = useContext(AppContext);
  const { currentTheme } = useTheme();

  const [profileData, setProfileData] = useState(null);
  const [eventApplications, setEventApplications] = useState([]);
  const [userInquiries, setUserInquiries] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]); // Renamed for clarity
  const [notices, setNotices] = useState([]);

  const [selectedNotice, setSelectedNotice] = useState(null);

  const [loadingStates, setLoadingStates] = useState({
    profile: true,
    applications: true,
    inquiries: true,
    upcomingEvents: true,
    notices: true,
  });

  const [errorStates, setErrorStates] = useState({
    profile: '',
    applications: '',
    inquiries: '',
    upcomingEvents: '',
    notices: '',
  });
  const [generalError, setGeneralError] = useState('');

  const goToProfile = () => navigate('/profile');
  const goToApplications = () => navigate('/applications');
  const goToUpcomingEvents = () => navigate('/event');
  const goToSupportInquiries = () => navigate('/support/inquiries');
  const goToPublicNotices = () => navigate('/public-notices');

  useEffect(() => {
    if (!token) {
      toast.warn('Please log in to view your dashboard.');
      navigate('/login');
      return;
    }
    const fetchUserDashboardData = async () => {
      setLoadingStates({ profile: true, applications: true, inquiries: true, upcomingEvents: true, notices: true });
      setErrorStates({ profile: '', applications: '', inquiries: '', upcomingEvents: '', notices: '' });
      setGeneralError('');

      try {
        const requests = {
          profile: axios.get(`${backendUrl}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } }),
          applications: axios.get(`${backendUrl}/api/user/user/applications`, { headers: { Authorization: `Bearer ${token}` } }),
          inquiries: axios.get(`${backendUrl}/api/user/user/inquiries`, { headers: { Authorization: `Bearer ${token}` } }),
          upcomingEvents: axios.get(`${backendUrl}/api/user/events/upcoming/my`, { headers: { Authorization: `Bearer ${token}` } }),
          notices: axios.get(`${backendUrl}/api/notice/user/notices`, { headers: { Authorization: `Bearer ${token}` } }),
        };

        const responses = await Promise.allSettled(
          Object.entries(requests).map(([key, promise]) =>
            promise.catch(err => {
              setErrorStates(prev => ({ ...prev, [key]: err.response?.data?.message || `Failed to load ${key}.` }));
              throw err; // Re-throw to trigger Promise.allSettled error handling
            })
          )
        );

        // Process successful responses
        responses.forEach((result, index) => {
          const key = Object.keys(requests)[index];
          if (result.status === 'fulfilled') {
            const data = result.value.data;
            if (key === 'profile') setProfileData(data);
            else if (key === 'applications') setEventApplications(data.applications || []);
            else if (key === 'inquiries') setUserInquiries(data || []);
            else if (key === 'upcomingEvents') setUpcomingEvents(data.upcomingApplications || []);
            else if (key === 'notices') setNotices(data);
          }
        });

      } catch (err) {
        // This catch block will only be hit if Promise.allSettled itself fails,
        // or if an error is re-thrown and not caught by individual .catch
        setGeneralError('An error occurred while fetching dashboard data.');
        toast.error('Failed to load dashboard data. Please try again.');
        if (err.response && err.response.status === 401) {
          setToken(false);
          setUserData(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } finally {
        setLoadingStates({
          profile: false,
          applications: false,
          inquiries: false,
          upcomingEvents: false,
          notices: false,
        });
      }
    };
    fetchUserDashboardData();
  }, [token, navigate, backendUrl, setToken, setUserData]);

  const profileStats = useMemo(() => {
    if (!profileData) return { current_semester: 'N/A', course: 'N/A' };
    return {
      current_semester: profileData.current_semester || 'N/A',
      course: profileData.course || 'N/A',
    };
  }, [profileData]);

  const applicationCount = eventApplications.length;
  const upcomingEventCount = useMemo(() => {
    const now = new Date();
    return upcomingEvents.filter(app => new Date(app.eventDate) >= now).length;
  }, [upcomingEvents]);

  const latestNotices = useMemo(() => {
    const sortedNotices = [...notices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sortedNotices.slice(0, 3);
  }, [notices]);

  const recentInquiries = useMemo(() => {
    const sortedInquiries = [...userInquiries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sortedInquiries.slice(0, 5);
  }, [userInquiries]);

  const handleOpenNoticeFullscreen = (notice) => {
    setSelectedNotice(notice);
    document.body.style.overflow = 'hidden'; // Prevent scrolling while modal is open
  };

  const handleCloseNoticeFullscreen = () => {
    setSelectedNotice(null);
    document.body.style.overflow = ''; // Restore scrolling
  };

  // --- Themed Styles for Fullscreen Modal ---
  const fullscreenOverlayStyles = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center',
    alignItems: 'center', zIndex: 1000,
  };

  const fullscreenContentStyles = {
    backgroundColor: currentTheme.cardBgColor, padding: '40px', borderRadius: '20px',
    boxShadow: `0 25px 60px rgba(0,0,0,0.3), 0 0 0 2px ${currentTheme.borderColor}`,
    maxWidth: '90%', maxHeight: '85vh', overflowY: 'auto', position: 'relative',
    fontFamily: currentTheme.fontFamily, color: currentTheme.textColor,
  };

  const fullscreenTitleStyles = {
    fontSize: '2.5rem', fontWeight: '700', marginBottom: '20px', fontFamily: currentTheme.fontFamily,
    color: currentTheme.primaryColor,
  };

  const fullscreenMessageStyles = {
    fontSize: '1.15rem', lineHeight: '1.8', marginBottom: '30px', opacity: '0.9',
    fontFamily: currentTheme.fontFamily, color: currentTheme.textColor,
  };

  const fullscreenLinkStyles = {
    color: currentTheme.accentColor, fontWeight: '600', textDecoration: 'none',
    borderBottom: `2px solid ${currentTheme.accentColor}`, paddingBottom: '4px',
    transition: 'color 0.3s ease, border-color 0.3s ease', display: 'inline-flex',
    alignItems: 'center', gap: '10px', fontSize: '1.05rem', fontFamily: currentTheme.fontFamily,
  };

  const fullscreenCloseButtonStyles = {
    position: 'absolute', top: '20px', right: '20px', fontSize: '2rem',
    cursor: 'pointer', background: 'none', border: 'none',
    color: currentTheme.textColor,
  };

  const detailCardStyles = (theme) => ({
    backgroundColor: theme.cardBgColor,
    color: theme.textColor,
    fontFamily: theme.fontFamily,
    borderColor: theme.borderColor,
  });

  const sectionTitleStyles = (theme) => ({
    color: theme.primaryColor,
    fontFamily: theme.fontFamily,
  });

  const sectionErrorStyles = (theme) => ({
    fontFamily: theme.fontFamily,
    color: theme.errorColor || '#dc2626',
  });

  const sectionEmptyStyles = (theme) => ({
    fontFamily: theme.fontFamily,
    color: theme.textColor,
    opacity: '0.7',
  });

  const statCardStyles = (theme, highlightColor) => ({
    backgroundColor: theme.cardBgColor,
    borderColor: theme.borderColor,
    fontFamily: theme.fontFamily,
    color: theme.textColor,
    '& .stat-value': { color: highlightColor, fontFamily: theme.fontFamily, fontWeight: 'bold' },
    '& .stat-label': { color: theme.textColorMuted || '#6c757d', fontFamily: theme.fontFamily, fontSize: '0.875rem' },
  });

  const renderSection = ({ title, data, isLoading, errorMsg, children, onClick, sectionId, iconComponent: IconComponent }) => {
    const hasData = data && data.length > 0;
    const showViewAll = onClick && hasData;

    return (
      <section id={sectionId} className="p-8 rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl"
        style={{ backgroundColor: currentTheme.cardBgColor, fontFamily: currentTheme.fontFamily }}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            {IconComponent && <IconComponent className="w-7 h-7 mr-3 opacity-70" style={{ color: currentTheme.primaryColor }} />}
            <h3 className="text-2xl font-bold" style={sectionTitleStyles(currentTheme)}>
              {title}
            </h3>
          </div>
          {showViewAll && (
            <button
              onClick={onClick}
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
              style={{ color: currentTheme.accentColor, fontFamily: currentTheme.fontFamily }}
            >
              View All →
            </button>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-10">
            <Spinner themeColor={currentTheme.primaryColor} />
            <span className="ml-3" style={sectionEmptyStyles(currentTheme)}>Loading...</span>
          </div>
        )}

        {!isLoading && errorMsg && (
          <ErrorDisplay message={errorMsg} theme={currentTheme} />
        )}

        {!isLoading && !errorMsg && !hasData && (
          <p className="text-center py-6" style={sectionEmptyStyles(currentTheme)}>
            No {title.toLowerCase()} found.
          </p>
        )}

        {!isLoading && !errorMsg && hasData && children}
      </section>
    );
  };

  return (
    <div
      className="min-h-screen p-8 transition-colors duration-500"
      style={{
        backgroundColor: currentTheme.bgColor,
        color: currentTheme.textColor,
        fontFamily: currentTheme.fontFamily,
      }}
    >
      <div className="max-w-7xl mx-auto">
        {profileData && !loadingStates.profile && !errorStates.profile && (
          <div className="mb-8 p-8 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between transition-all duration-500"
            style={{
              backgroundColor: currentTheme.accentColor,
              color: currentTheme.background,
              fontFamily: currentTheme.fontFamily,
            }}>
            <div>
              <h2 className="text-4xl font-extrabold mb-2" style={{ fontFamily: currentTheme.fontFamily }}>Welcome Back, {profileData.name || 'User'}!</h2>
              <p className="text-xl opacity-90" style={{ fontFamily: currentTheme.fontFamily }}>Your personalized dashboard summary.</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <button
                onClick={goToProfile}
                className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 shadow-md hover:shadow-lg"
                style={{
                  backgroundColor: currentTheme.background,
                  color: currentTheme.accentColor,
                  border: `2px solid ${currentTheme.background}`,
                  fontFamily: currentTheme.fontFamily,
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
                  toast.info('You have been logged out.');
                }}
                className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 shadow-md hover:shadow-lg"
                style={{
                  backgroundColor: 'transparent',
                  color: currentTheme.background,
                  border: `2px solid ${currentTheme.background}`,
                  fontFamily: currentTheme.fontFamily,
                }}
              >
                Logout
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            {renderSection({
              title: "Profile Overview",
              sectionId: "profile-overview",
              data: profileData ? [profileData] : [],
              isLoading: loadingStates.profile,
              errorMsg: errorStates.profile,
              onClick: goToProfile,
              iconComponent: FaUserCircle,
              children: (
                <div
                  className="p-8 rounded-2xl shadow-xl text-center border transition-all duration-500 hover:shadow-2xl"
                  style={detailCardStyles(currentTheme)}
                >
                  <img
                    src={profileData?.profile_photo || '/images/default-profile.png'}
                    alt="Profile"
                    className="w-36 h-36 rounded-full object-cover shadow-2xl mx-auto border-4 border-opacity-50 transition-transform duration-300 ease-in-out hover:scale-105"
                    style={{ borderColor: currentTheme.primaryColor }}
                    onError={(e) => { e.target.onerror = null; e.target.src='/images/default-profile.png'; }}
                  />
                  <h1 className="text-3xl font-extrabold mt-5 mb-1 transition-colors duration-300" style={{ color: currentTheme.primaryColor, fontFamily: currentTheme.fontFamily }}>
                    {profileData?.name || 'User'}
                  </h1>
                  <p className="text-base opacity-80 mb-6" style={{ fontFamily: currentTheme.fontFamily }}>{profileData?.email || 'No email available'}</p>

                  <button
                    onClick={goToProfile}
                    className="px-6 py-3 rounded-lg font-semibold text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 shadow-md hover:shadow-lg"
                    style={{
                      backgroundColor: currentTheme.primaryColor,
                      color: currentTheme.background,
                      boxShadow: `0 4px 6px -1px ${currentTheme.primaryColor}30`,
                      fontFamily: currentTheme.fontFamily,
                    }}
                  >
                    View Full Profile
                  </button>
                </div>
              )
            })}

            {renderSection({
              title: "Your Details",
              sectionId: "user-details",
              data: profileData ? [profileStats] : [],
              isLoading: loadingStates.profile,
              errorMsg: errorStates.profile,
              iconComponent: FaClipboardList,
              children: (
                <div className="grid grid-cols-2 gap-4 text-center w-full">
                  <div className="p-5 rounded-lg border transition-colors duration-300 hover:shadow-sm" style={statCardStyles(currentTheme, currentTheme.primaryColor)}>
                    <p className="text-3xl stat-value">{(profileStats.current_semester.length > 3) ? profileStats.current_semester.slice(0,3) + '..' : profileStats.current_semester}</p>
                    <p className="text-sm stat-label mt-1">Semester</p>
                  </div>
                  <div className="p-5 rounded-lg border transition-colors duration-300 hover:shadow-sm" style={statCardStyles(currentTheme, currentTheme.accentColor)}>
                    <p className="text-3xl stat-value">{profileStats.course || 'N/A'}</p>
                    <p className="text-sm stat-label mt-1">Course</p>
                  </div>
                </div>
              )
            })}

            {renderSection({
              title: "Quick Actions",
              sectionId: "quick-actions",
              data: [{}], // Dummy data to show section if no other data exists
              children: (
                <ul className="space-y-4">
                  <li onClick={goToProfile} className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" style={{ fontFamily: currentTheme.fontFamily, color: currentTheme.textColor }}>
                    <ThemedIcon IconComponent={FaUserCircle} themeColor={currentTheme.textColorMuted} className="w-6 h-6 mr-3" />
                    My Profile
                  </li>
                  <li onClick={goToUpcomingEvents} className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" style={{ fontFamily: currentTheme.fontFamily, color: currentTheme.textColor }}>
                    <ThemedIcon IconComponent={FaCalendarAlt} themeColor={currentTheme.textColorMuted} className="w-6 h-6 mr-3" />
                    Upcoming Events
                  </li>
                  <li onClick={goToApplications} className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" style={{ fontFamily: currentTheme.fontFamily, color: currentTheme.textColor }}>
                    <ThemedIcon IconComponent={FaFileAlt} themeColor={currentTheme.textColorMuted} className="w-6 h-6 mr-3" />
                    My Applications
                  </li>
                  <li onClick={goToSupportInquiries} className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" style={{ fontFamily: currentTheme.fontFamily, color: currentTheme.textColor }}>
                    <ThemedIcon IconComponent={FaEnvelopeOpen} themeColor={currentTheme.textColorMuted} className="w-6 h-6 mr-3" />
                    My Inquiries
                  </li>
                </ul>
              )
            })}
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {renderSection({
                title: "Event Applications",
                sectionId: "event-applications",
                data: applicationCount > 0 ? [{}]: [], // Only show if there's data
                isLoading: loadingStates.applications,
                errorMsg: errorStates.applications,
                onClick: goToApplications,
                iconComponent: FaTasks,
                children: (
                  <div
                    className="p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer flex items-center justify-between border"
                    style={detailCardStyles(currentTheme)}
                  >
                    <div>
                      <div className="flex items-center mb-3">
                        <ThemedIcon IconComponent={FaFileAlt} themeColor={currentTheme.primaryColor} className="w-8 h-8 mr-4 p-2 rounded-full" style={{ backgroundColor: currentTheme.primaryColor + '20' }} />
                        <div>
                          <p className="text-4xl font-bold" style={{ color: currentTheme.primaryColor, fontFamily: currentTheme.fontFamily }}>{applicationCount}</p>
                          <h3 className="text-lg font-semibold mt-1" style={{ fontFamily: currentTheme.fontFamily }}>Event Applications</h3>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: currentTheme.fontFamily }}>Total applications submitted</p>
                    </div>
                  </div>
                )
              })}

              {renderSection({
                title: "Upcoming Events",
                sectionId: "upcoming-events",
                data: upcomingEventCount > 0 ? [{}]: [], // Only show if there's data
                isLoading: loadingStates.upcomingEvents,
                errorMsg: errorStates.upcomingEvents,
                onClick: goToUpcomingEvents,
                iconComponent: FaCalendarAlt,
                children: (
                  <div
                    className="p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer flex items-center justify-between border"
                    style={detailCardStyles(currentTheme)}
                  >
                    <div>
                      <div className="flex items-center mb-3">
                        <ThemedIcon IconComponent={FaCalendarAlt} themeColor={currentTheme.accentColor} className="w-8 h-8 mr-4 p-2 rounded-full" style={{ backgroundColor: currentTheme.accentColor + '20' }} />
                        <div>
                          <p className="text-4xl font-bold" style={{ color: currentTheme.accentColor, fontFamily: currentTheme.fontFamily }}>{upcomingEventCount}</p>
                          <h3 className="text-lg font-semibold mt-1" style={{ fontFamily: currentTheme.fontFamily }}>Upcoming Events</h3>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: currentTheme.fontFamily }}>Events you're attending</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {renderSection({
              title: "Latest Announcements",
              sectionId: "latest-announcements",
              data: latestNotices,
              isLoading: loadingStates.notices,
              errorMsg: errorStates.notices,
              onClick: goToPublicNotices,
              iconComponent: FaBell,
              children: (
                <div className="space-y-4">
                  {latestNotices.map((notice) => (
                    <NoticeCard
                      key={notice._id}
                      notice={notice}
                      theme={currentTheme}
                      onClick={handleOpenNoticeFullscreen}
                    />
                  ))}
                </div>
              )
            })}

            {renderSection({
              title: "Your Recent Inquiries",
              sectionId: "recent-inquiries",
              data: recentInquiries,
              isLoading: loadingStates.inquiries,
              errorMsg: errorStates.inquiries,
              onClick: goToSupportInquiries,
              iconComponent: FaEnvelopeOpen,
              children: (
                <div className="overflow-hidden rounded-lg shadow-sm border" style={{ borderColor: currentTheme.borderColor }}>
                  <table className="min-w-full divide-y" style={{ backgroundColor: currentTheme.cardBgColor, borderColor: currentTheme.borderColor }}>
                    <thead style={{ backgroundColor: currentTheme.footerBg, fontFamily: currentTheme.fontFamily }}>
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Inquiry
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Replied By
                        </th>
                        <th scope="col" className="relative px-4 py-3">
                          <span className="sr-only">Details</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: currentTheme.borderColor }}>
                      {recentInquiries.map((inquiry) => (
                        <tr key={inquiry._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200" style={{ fontFamily: currentTheme.fontFamily }}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ color: currentTheme.textColor }}>
                            {inquiry.query ? inquiry.query.substring(0, 40) + (inquiry.query.length > 40 ? '...' : '') : 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ color: currentTheme.textColor }}>
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
                          <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ color: currentTheme.textColor }}>
                            {inquiry.resolvedBy?.firstName || inquiry.resolvedBy?.lastName
                              ? `${inquiry.resolvedBy.firstName} ${inquiry.resolvedBy.lastName}`
                              : 'Admin'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                            <button
                              onClick={() => navigate(`/support/inquiries/${inquiry._id}`)}
                              className="font-medium hover:underline transition duration-200"
                              style={{ color: currentTheme.accentColor, fontFamily: currentTheme.fontFamily }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Fullscreen Notice Modal */}
      {selectedNotice && (
        <div style={fullscreenOverlayStyles} onClick={handleCloseNoticeFullscreen}>
          <div style={fullscreenContentStyles} onClick={(e) => e.stopPropagation()}>
            <button style={fullscreenCloseButtonStyles} onClick={handleCloseNoticeFullscreen}>×</button>
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
                    e.currentTarget.style.color = currentTheme.accentColor;
                    e.currentTarget.style.borderColor = currentTheme.accentColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = currentTheme.primaryColor;
                    e.currentTarget.style.borderColor = currentTheme.primaryColor;
                  }}
                >
                  {selectedNotice.linkText || 'View Link'} <FaLink className="text-xs" />
                </a>
              </div>
            )}
            <div className="mt-auto pt-6 border-t" style={{ ...{ fontFamily: currentTheme.fontFamily, color: currentTheme.textColor, opacity: '0.8', display: 'flex', alignItems: 'center', gap: '15px', fontSize: '0.9rem' }, borderTopColor: currentTheme.borderColor }}>
              <div className="flex items-center gap-2">
                <ThemedIcon IconComponent={FaUserCircle} themeColor={currentTheme.textColorMuted} className="text-xl" />
                <p>
                  Sent by: <strong className="font-semibold">{selectedNotice.sentByAdminId?.username || 'Admin'}</strong>
                </p>
              </div>
              {selectedNotice.expiresAt && (
                <div className="flex items-center gap-1">
                  <ThemedIcon IconComponent={FaCalendarAlt} themeColor={currentTheme.textColorMuted} className="text-base" />
                  Expires: {new Date(selectedNotice.expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;