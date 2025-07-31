// src/pages/UserApplicationsPage.jsx
import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

// Placeholder icons (replace with actual imports if you have them)
const DocumentIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
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

const UserApplicationsPage = () => {
  const navigate = useNavigate();
  const { token, backendUrl } = useContext(AppContext);
  const { currentTheme } = useTheme();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      toast.warn('Please log in to view your applications.');
      navigate('/login');
      return;
    }

    const fetchApplications = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${backendUrl}/api/user/user/booked`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Assuming the response structure is { totalApplications, applications: [...] }
        setApplications(response.data.applications || []);
      } catch (err) {
        console.error('Error fetching applications:', err.response?.data || err.message);
        const errorMessage = err.response?.data?.message || 'Failed to fetch your applications.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [token, navigate, backendUrl]);

  // Memoize application count
  const totalApplications = useMemo(() => applications.length, [applications]);

  // --- Render Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: currentTheme.bgColor, color: currentTheme.textColor, fontFamily: currentTheme.fontFamily }}>
        <div className="flex items-center gap-3 text-lg">
          <SpinnerIcon className="h-8 w-8" style={{ color: currentTheme.primaryColor }} />
          <span>Loading your applications...</span>
        </div>
      </div>
    );
  }

  // --- Render Error State ---
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: currentTheme.bgColor, color: currentTheme.textColor, fontFamily: currentTheme.fontFamily }}>
        <ErrorIcon />
        <p className="text-lg text-center mb-4 max-w-md">{error}</p>
        <button
          onClick={() => navigate('/dashboard')} // Go back to dashboard or login
          className="px-6 py-3 rounded-lg font-semibold text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 shadow-lg"
          style={{
            backgroundColor: currentTheme.primaryColor,
            color: currentTheme.background,
            boxShadow: `0 4px 6px -1px ${currentTheme.primaryColor}30`,
            fontFamily: currentTheme.fontFamily,
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  // --- Render Content ---
  return (
    <div
      className="min-h-screen p-8 transition-colors duration-500"
      style={{
        backgroundColor: currentTheme.bgColor,
        color: currentTheme.textColor,
        fontFamily: currentTheme.fontFamily,
      }}
    >
      <div className="max-w-7xl mx-auto ">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-extrabold" style={{ color: currentTheme.primaryColor, fontFamily: currentTheme.fontFamily }}>
              Your Booked Events
            </h1>
            <p className="text-lg opacity-90" style={{ fontFamily: currentTheme.fontFamily }}>
              Total Bookings: {totalApplications}
            </p>
          </div>
          {/* Optional: Add a button to go back to dashboard */}
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
            style={{ color: currentTheme.accent, fontFamily: currentTheme.fontFamily }}
          >
            Go to Dashboard
          </button>
        </div>

        {/* Applications Table */}
        {applications.length > 0 ? (
          <div className="overflow-hidden rounded-2xl shadow-xl" style={{ backgroundColor: currentTheme.cardBgColor }}>
            <table className="min-w-full divide-y">
              <thead style={{ backgroundColor: currentTheme.footerBg }}>
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: currentTheme.fontFamily }}>
                    Event Name
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: currentTheme.fontFamily }}>
                    Event Date
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: currentTheme.fontFamily }}>
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: currentTheme.fontFamily }}>
                    Payment Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: currentTheme.fontFamily }}>
                    Applied On
                  </th>
                  <th scope="col" className="relative px-6 py-4">
                    <span className="sr-only">Details</span>
                  </th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: currentTheme.cardBgColor }}>
                {applications.map((app) => (
                  <tr key={app.applicationId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 border-b" style={{ borderColor: currentTheme.borderColor, fontFamily: currentTheme.fontFamily }}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ fontFamily: currentTheme.fontFamily }}>
                      {app.eventName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ fontFamily: currentTheme.fontFamily }}>
                      {app.eventDate ? new Date(app.eventDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                       ${app.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                         app.status === 'Pending' ? 'bg-orange-100 text-orange-800' :
                                         app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                         'bg-gray-200 text-gray-800'}`}
                      >
                        {app.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                       ${app.paymentStatus === 'Paid' ? 'bg-blue-100 text-blue-800' :
                                         app.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                         'bg-gray-200 text-gray-800'}`}
                      >
                        {app.paymentStatus || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ fontFamily: currentTheme.fontFamily }}>
                      {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <button
                        onClick={() => navigate(`/applications/${app.applicationId}`)}
 // Navigate to event details or application details
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
        ) : (
          <div className="text-center py-12" style={{ backgroundColor: currentTheme.cardBgColor, fontFamily: currentTheme.fontFamily }}>
            <DocumentIcon className="mx-auto h-20 w-20 opacity-50" style={{ color: currentTheme.textColor }} />
            <p className="text-lg mt-4" style={{ color: currentTheme.textColor }}>No event applications found.</p>
            <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: currentTheme.fontFamily }}>Start by exploring available events!</p>
            <button
              onClick={() => navigate('/events')} // Link to explore events
              className="mt-6 px-6 py-3 rounded-lg font-semibold text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 shadow-md hover:shadow-lg"
              style={{
                backgroundColor: currentTheme.primaryColor,
                color: currentTheme.background,
                boxShadow: `0 4px 6px -1px ${currentTheme.primaryColor}30`,
                fontFamily: currentTheme.fontFamily,
              }}
            >
              Explore Events
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserApplicationsPage;