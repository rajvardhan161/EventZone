// src/pages/UserDashboard.jsx
import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import {
  FaClipboardList, FaCalendarAlt, FaLink, FaExpandArrowsAlt, FaUserCircle,
  FaSpinner, FaExclamationTriangle
} from 'react-icons/fa';

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

const NoticeCard = ({ notice, theme, onClick }) => {
  const createdAt = new Date(notice.createdAt);
  const expiresAt = notice.expiresAt ? new Date(notice.expiresAt) : null;
  const isExpired = expiresAt && expiresAt < new Date();

  let statusText;
  let statusStyles;

  if (isExpired) {
    statusText = 'Expired';
    statusStyles = { color: '#dc2626', fontWeight: '500' };
  } else if (notice.status === 'Draft') {
    statusText = 'Draft';
    statusStyles = { color: '#6b7280', fontWeight: '500' };
  } else {
    statusText = 'Posted';
    statusStyles = { color: '#10b981', fontWeight: '500' };
  }

  const postDateStyles = {
    fontSize: '0.85rem',
    opacity: '0.7',
    fontFamily: theme.fontFamily,
  };

  const noticeTitleLinkStyles = {
    color: theme.primaryColor || '#4f46e5',
    textDecoration: 'none',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'color 0.3s ease',
    fontFamily: theme.fontFamily,
  };

  return (
    <div
      className="p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer flex items-center justify-between"
      style={{ backgroundColor: theme.cardBgColor, fontFamily: theme.fontFamily }}
      onClick={() => onClick(notice)}
    >
      <div className="flex-grow flex items-center">
        <div className="p-1 rounded-full mr-4" style={{ backgroundColor: theme.primaryColor }}>
          <FaClipboardList className="w-8 h-8 text-white" />
        </div>
        <div>
          <p className="text-xl font-bold" style={{ color: theme.primaryColor, fontFamily: theme.fontFamily }}>{notice.title}</p>
          <h3 className="text-base font-semibold mt-1" style={{ fontFamily: theme.fontFamily }}>
            {notice.message.substring(0, 60)}
            {notice.message.length > 60 ? '...' : ''}
          </h3>
          <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: theme.fontFamily }}>{createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { token, setToken, setUserData, backendUrl } = useContext(AppContext);
  const { currentTheme } = useTheme();

  const [profileData, setProfileData] = useState(null);
  const [eventApplications, setEventApplications] = useState([]);
  const [userInquiries, setUserInquiries] = useState([]);
  const [upcomingApplications, setUpcomingApplications] = useState([]);
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);

  const [profileLoading, setProfileLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [inquiriesLoading, setInquiriesLoading] = useState(true);
  const [upcomingEventsLoading, setUpcomingEventsLoading] = useState(true);
  const [noticesLoading, setNoticesLoading] = useState(true);

  const [profileError, setProfileError] = useState('');
  const [applicationsError, setApplicationsError] = useState('');
  const [inquiriesError, setInquiriesError] = useState('');
  const [upcomingEventsError, setUpcomingEventsError] = useState('');
  const [noticesError, setNoticesError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const goToApplications = () => navigate('/applications');
  const goToUpcomingEvents = () => navigate('/event');
  const goToProfile = () => navigate('/profile');
  const goToSupportInquiries = () => navigate('/support/inquiries');
  const goToPublicNotices = () => navigate('/public-notices');

  useEffect(() => {
    if (!token) {
      toast.warn('Please log in to view your dashboard.');
      navigate('/login');
      return;
    }
    const fetchUserDashboardData = async () => {
      setProfileLoading(true); setApplicationsLoading(true); setInquiriesLoading(true); setUpcomingEventsLoading(true); setNoticesLoading(true);
      setProfileError(''); setApplicationsError(''); setInquiriesError(''); setUpcomingEventsError(''); setNoticesError('');
      setGeneralError('');
      try {
        const [profileResponse, applicationsResponse, inquiriesResponse, upcomingAppsResponse, noticesResponse] = await Promise.all([
          axios.get(`${backendUrl}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } }).catch(err => { setProfileError(err.response?.data?.message || 'Failed to load profile.'); throw err; }),
          axios.get(`${backendUrl}/api/user/user/applications`, { headers: { Authorization: `Bearer ${token}` } }).catch(err => { setApplicationsError(err.response?.data?.message || 'Failed to load applications.'); throw err; }),
          axios.get(`${backendUrl}/api/user/user/inquiries`, { headers: { Authorization: `Bearer ${token}` } }).catch(err => { setInquiriesError(err.response?.data?.message || 'Failed to load inquiries.'); throw err; }),
          axios.get(`${backendUrl}/api/user/events/upcoming/my`, { headers: { Authorization: `Bearer ${token}` } }).catch(err => { setUpcomingEventsError(err.response?.data?.message || 'Failed to load upcoming events.'); throw err; }),
          axios.get(`${backendUrl}/api/notice/user/notices`, { headers: { Authorization: `Bearer ${token}` } }).catch(err => { setNoticesError(err.response?.data?.message || 'Failed to load notices.'); throw err; }),
        ]);
        setProfileData(profileResponse.data);
        setEventApplications(applicationsResponse.data.applications || []);
        setUserInquiries(inquiriesResponse.data || []);
        setUpcomingApplications(upcomingAppsResponse.data.upcomingApplications || []);
        setNotices(noticesResponse.data);
      } catch (err) {
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
        setProfileLoading(false);
        setApplicationsLoading(false);
        setInquiriesLoading(false);
        setUpcomingEventsLoading(false);
        setNoticesLoading(false);
      }
    };
    fetchUserDashboardData();
  }, [token, navigate, backendUrl, setToken, setUserData]);

  const profileStats = useMemo(() => {
    if (!profileData || profileError) return { current_semester: 'N/A', course: 'N/A' };
    return {
      current_semester: profileData.current_semester || 'N/A',
      course: profileData.course || 'N/A',
    };
  }, [profileData, profileError]);

  const applicationStats = useMemo(() => {
    if (applicationsError) return { total: 'Error' };
    return { total: eventApplications.length };
  }, [eventApplications, applicationsError]);

  const upcomingEventCount = useMemo(() => {
    if (upcomingEventsError) return 'Error';
    const now = new Date();
    const activeUpcomingApplications = upcomingApplications.filter(app => {
      const eventDate = new Date(app.eventDate);
      return eventDate >= now;
    });
    return activeUpcomingApplications.length;
  }, [upcomingApplications, upcomingEventsError]);

  const latestNotices = useMemo(() => {
    if (noticesError) return [];
    const sortedNotices = [...notices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sortedNotices.slice(0, 3);
  }, [notices, noticesError]);

  const recentInquiries = useMemo(() => {
    if (inquiriesError) return [];
    const sortedInquiries = [...userInquiries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sortedInquiries.slice(0, 5);
  }, [userInquiries, inquiriesError]);

  const handleOpenNoticeFullscreen = (notice) => {
    setSelectedNotice(notice);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseNoticeFullscreen = () => {
    setSelectedNotice(null);
    document.body.style.overflow = '';
  };

  const fullscreenOverlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const fullscreenContentStyles = {
    backgroundColor: currentTheme.cardBgColor || '#fff',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
    maxWidth: '90%',
    maxHeight: '85vh',
    overflowY: 'auto',
    position: 'relative',
    fontFamily: currentTheme.fontFamily,
  };

  const fullscreenTitleStyles = {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: currentTheme.primaryColor || '#4f46e5',
    marginBottom: '20px',
    fontFamily: currentTheme.fontFamily,
  };

  const fullscreenMessageStyles = {
    fontSize: '1.15rem',
    lineHeight: '1.8',
    marginBottom: '30px',
    opacity: '0.9',
    color: currentTheme.textColor || '#333333',
    fontFamily: currentTheme.fontFamily,
  };

  const fullscreenLinkStyles = {
    color: currentTheme.secondaryColor || '#3b82f6',
    fontWeight: '600',
    textDecoration: 'none',
    borderBottom: `2px solid ${currentTheme.secondaryColor || '#3b82f6'}`,
    paddingBottom: '4px',
    transition: 'color 0.3s ease, border-color 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '1.05rem',
    fontFamily: currentTheme.fontFamily,
  };

  const fullscreenCloseButtonStyles = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    fontSize: '2rem',
    color: currentTheme.textColor || '#333333',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
  };

  const renderSection = ({ title, data, isLoading, errorMsg, children, onClick }) => {
    const sectionStyle = {
      backgroundColor: currentTheme.cardBgColor,
      color: currentTheme.textColor,
      fontFamily: currentTheme.fontFamily,
    };
    const titleStyle = {
      color: currentTheme.primaryColor,
      fontFamily: currentTheme.fontFamily,
    };
    const sectionErrorStyle = {
      fontFamily: currentTheme.fontFamily,
      color: currentTheme.errorColor || '#dc2626',
    }
    const sectionEmptyStyle = {
      fontFamily: currentTheme.fontFamily,
      color: currentTheme.textColor,
      opacity: '0.7',
    }
    return (
      <div className="p-8 rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl" style={sectionStyle}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold" style={titleStyle}>
            {title}
          </h3>
          {onClick && (
            <button
              onClick={onClick}
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
              style={{ color: currentTheme.accent, fontFamily: currentTheme.fontFamily }}
            >
              View All →
            </button>
          )}
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <SpinnerIcon className="h-8 w-8" style={{ color: currentTheme.primaryColor }} />
            <span className="ml-3">Loading...</span>
          </div>
        ) : errorMsg ? (
          <p className="text-center py-6" style={sectionErrorStyle}>
            {errorMsg}
          </p>
        ) : data && data.length > 0 ? (
          children
        ) : (
          <p className="text-center py-6" style={sectionEmptyStyle}>
            No {title.toLowerCase()} found.
          </p>
        )}
      </div>
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
        {profileData && !profileError && (
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
              title: "Profile Summary",
              data: profileData ? [profileData] : [],
              isLoading: profileLoading,
              errorMsg: profileError,
              onClick: goToProfile,
              children: (
                <div
                  className="p-8 rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl text-center"
                  style={{
                    backgroundColor: currentTheme.cardBgColor,
                    color: currentTheme.textColor,
                    fontFamily: currentTheme.fontFamily,
                  }}
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
                  <p className="text-base text-gray-500 mb-6" style={{ fontFamily: currentTheme.fontFamily }}>{profileData?.email || 'No email available'}</p>

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
              data: profileData ? [profileStats] : [],
              isLoading: profileLoading,
              errorMsg: profileError,
              children: (
                <div className="grid grid-cols-2 gap-4 text-center w-full">
                  <div className="p-4 rounded-lg border transition-colors duration-300 hover:border-gray-300" style={{ backgroundColor: currentTheme.footerBg, borderColor: currentTheme.borderColor, fontFamily: currentTheme.fontFamily }}>
                    <p className="text-2xl font-bold" style={{ color: currentTheme.primaryColor, fontFamily: currentTheme.fontFamily }}>{profileStats.current_semester}</p>
                    <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: currentTheme.fontFamily }}>Semester</p>
                  </div>
                  <div className="p-4 rounded-lg border transition-colors duration-300 hover:border-gray-300" style={{ backgroundColor: currentTheme.footerBg, borderColor: currentTheme.borderColor, fontFamily: currentTheme.fontFamily }}>
                    <p className="text-2xl font-bold" style={{ color: currentTheme.primaryColor, fontFamily: currentTheme.fontFamily }}>{profileStats.course}</p>
                    <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: currentTheme.fontFamily }}>Course</p>
                  </div>
                </div>
              )
            })}

            {renderSection({
              title: "Quick Actions",
              data: [{}],
              children: (
                <ul className="space-y-4">
                  <li onClick={goToProfile} className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" style={{ color: currentTheme.textColor, fontFamily: currentTheme.fontFamily }}>
                    <UserIcon className="w-6 h-6 mr-3 opacity-70" />
                    My Profile
                  </li>
                  <li onClick={goToUpcomingEvents} className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" style={{ color: currentTheme.textColor, fontFamily: currentTheme.fontFamily }}>
                    <CalendarIcon className="w-6 h-6 mr-3 opacity-70" />
                    Upcoming Events
                  </li>
                  <li onClick={goToApplications} className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" style={{ color: currentTheme.textColor, fontFamily: currentTheme.fontFamily }}>
                    <DocumentIcon className="w-6 h-6 mr-3 opacity-70" />
                    My Applications
                  </li>
                  <li onClick={goToSupportInquiries} className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" style={{ color: currentTheme.textColor, fontFamily: currentTheme.fontFamily }}>
                    <MailIcon className="w-6 h-6 mr-3 opacity-70" />
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
                data: applicationStats.total !== 'Error' ? Array(applicationStats.total).fill({}) : [],
                isLoading: applicationsLoading,
                errorMsg: applicationsError,
                onClick: goToApplications,
                children: (
                  <div
                    className="p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer flex items-center justify-between"
                    style={{ backgroundColor: currentTheme.cardBgColor, fontFamily: currentTheme.fontFamily }}
                  >
                    <div>
                      <div className="flex items-center mb-3">
                        <div className="p-3 rounded-full mr-4" style={{ backgroundColor: currentTheme.primaryColor }}>
                          <DocumentIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <p className="text-4xl font-bold" style={{ color: currentTheme.primaryColor, fontFamily: currentTheme.fontFamily }}>{applicationStats.total === 'Error' ? '!' : applicationStats.total}</p>
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
                data: typeof upcomingEventCount === 'number' && upcomingEventCount !== 'Error' ? Array(upcomingEventCount).fill({}) : [],
                isLoading: upcomingEventsLoading,
                errorMsg: upcomingEventsError,
                onClick: goToUpcomingEvents,
                children: (
                  <div
                    className="p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer flex items-center justify-between"
                    style={{ backgroundColor: currentTheme.cardBgColor, fontFamily: currentTheme.fontFamily }}
                  >
                    <div>
                      <div className="flex items-center mb-3">
                        <div className="p-3 rounded-full mr-4" style={{ backgroundColor: currentTheme.accent }}>
                          <CalendarIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <p className="text-4xl font-bold" style={{ color: currentTheme.accent, fontFamily: currentTheme.fontFamily }}>{upcomingEventCount === 'Error' ? '!' : upcomingEventCount}</p>
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
              data: latestNotices,
              isLoading: noticesLoading,
              errorMsg: noticesError,
              onClick: goToPublicNotices,
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
              data: recentInquiries,
              isLoading: inquiriesLoading,
              errorMsg: inquiriesError,
              onClick: goToSupportInquiries,
              children: (
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
                              style={{ color: currentTheme.accent, fontFamily: currentTheme.fontFamily }}
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
                    e.currentTarget.style.color = currentTheme.secondaryColor || '#3b82f6';
                    e.currentTarget.style.borderColor = currentTheme.secondaryColor || '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = currentTheme.primaryColor || '#4f46e5';
                    e.currentTarget.style.borderColor = currentTheme.primaryColor || '#4f46e5';
                  }}
                >
                  {selectedNotice.linkText || 'View Link'} <FaLink className="text-xs" />
                </a>
              </div>
            )}
            <div className="mt-auto pt-6 border-t" style={{ ...{ fontFamily: currentTheme.fontFamily, color: currentTheme.textColor, opacity: '0.8', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }, borderTopColor: currentTheme.borderColor || '#e0e0e0' }}>
              <div className="flex items-center gap-2">
                <FaUserCircle className="text-xl opacity-70" />
                <p>
                  Sent by: <strong className="font-semibold">{selectedNotice.sentByAdminId?.username || ' Admin'}</strong>
                </p>
              </div>
              {selectedNotice.expiresAt && (
                <div className="flex items-center gap-1">
                  <FaCalendarAlt />
                  Expires: {new Date(selectedNotice.expiresAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
