import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';

const InquiryDetail = () => {
  const { inquiryId } = useParams(); // Get the inquiry ID from the URL
  const navigate = useNavigate();
  const { token, backendUrl } = useContext(AppContext);
  const { currentTheme } = useTheme();

  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      toast.warn('Please log in to view inquiry details.');
      navigate('/login');
      return;
    }

    const fetchInquiryDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${backendUrl}/api/user/user/inquiries/${inquiryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInquiry(response.data);
      } catch (err) {
        console.error('Error fetching inquiry details:', err.response?.data || err.message);
        const errorMessage = err.response?.data?.message || 'Failed to fetch inquiry details.';
        setError(errorMessage);
        toast.error(errorMessage);
        if (err.response && err.response.status === 401) {
          // Handle unauthorized access if needed, though likely already handled by ProtectedRoute
        }
      } finally {
        setLoading(false);
      }
    };

    if (inquiryId) {
      fetchInquiryDetails();
    }
  }, [inquiryId, token, navigate, backendUrl]);

  const handleBackToDashboard = () => {
    navigate('/dashboard'); // Or navigate('/support/inquiries') if you want to go to the list
  };

  // --- Render Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: currentTheme.bgColor, fontFamily: currentTheme.fontFamily }}>
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" style={{ color: currentTheme.primaryColor }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 8l3-3.709z"></path>
          </svg>
          <p className="text-lg" style={{ color: currentTheme.textColor }}>Loading inquiry details...</p>
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
          onClick={handleBackToDashboard}
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // --- Render Inquiry Details ---
  return (
    <div
      className="min-h-screen p-8 transition-colors duration-500"
      style={{
        backgroundColor: currentTheme.bgColor,
        color: currentTheme.textColor,
        fontFamily: currentTheme.fontFamily,
      }}
    >
      <div className="max-w-3xl mx-auto p-8 rounded-xl shadow-xl transition-shadow duration-500 hover:shadow-2xl" style={{
            backgroundColor: currentTheme.cardBgColor,
            color: currentTheme.textColor,
            fontFamily: currentTheme.fontFamily,
          }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold" style={{ color: currentTheme.primaryColor }}>Inquiry Details</h2>
          <button
            onClick={handleBackToDashboard}
            className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200"
            style={{
              backgroundColor: currentTheme.secondaryColor || '#e5e7eb', // Fallback to light gray
              color: currentTheme.textColor,
              borderColor: currentTheme.borderColor || '#d1d5db',
              borderWidth: '1px',
              borderStyle: 'solid'
            }}
          >
            Back to Dashboard
          </button>
        </div>

        {inquiry ? (
          <div>
            {/* Inquiry Title/Query */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2" style={{ color: currentTheme.primaryColor }}>Your Query:</h3>
              <p className="text-lg">{inquiry.query}</p>
            </div>

            {/* Submission Details */}
            <div className="mb-6 border-t pt-4">
              <h3 className="text-xl font-semibold mb-2" style={{ color: currentTheme.primaryColor }}>Submission Info:</h3>
              <p className="text-sm mb-1">
                <strong>Submitted:</strong> {inquiry.createdAt && inquiry.createdAt.$date ? new Date(inquiry.createdAt.$date).toLocaleString() : 'N/A'}
              </p>
              <p className="text-sm mb-1">
                <strong>Status:</strong>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold
                                  ${inquiry.inquiryStatus === 'Pending' ? 'bg-orange-100 text-orange-800' :
                                    inquiry.inquiryStatus === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                    inquiry.inquiryStatus === 'Resolved' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'}`}>
                  {inquiry.inquiryStatus || 'N/A'}
                </span>
              </p>
            </div>

            {/* Resolution Details (if resolved) */}
            {(inquiry.inquiryStatus === 'Resolved' || inquiry.resolutionDetails) && (
              <div className="mb-6 border-t pt-4">
                <h3 className="text-xl font-semibold mb-2" style={{ color: currentTheme.primaryColor }}>Resolution:</h3>
                <p className="text-sm mb-1">
                  <strong>Resolved At:</strong> {inquiry.resolvedAt && inquiry.resolvedAt.$date ? new Date(inquiry.resolvedAt.$date).toLocaleString() : 'N/A'}
                </p>
                <p className="text-sm mb-1">
                  <strong>Resolved By:</strong>{' '}
                  {inquiry.resolvedBy && inquiry.resolvedBy.firstName ? `${inquiry.resolvedBy.firstName} ${inquiry.resolvedBy.lastName || ''}` : 'Support Team'}
                </p>
                <p className="text-sm mt-2">
                  <strong>Details:</strong>
                </p>
                <p className="text-base mt-1">{inquiry.resolutionDetails || 'No specific resolution details provided.'}</p>
              </div>
            )}

            {/* You could also display other inquiry fields here if available */}
          </div>
        ) : (
          <p className="text-center text-gray-500">Could not load inquiry details.</p>
        )}
      </div>
    </div>
  );
};

export default InquiryDetail;