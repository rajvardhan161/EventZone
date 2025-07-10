import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext'; // Adjust path as per your project structure

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation(); // To potentially capture email from query params or state
  const { backendUrl } = useContext(AppContext);

  const [stage, setStage] = useState('request'); // 'request' or 'reset'
  const [email, setEmail] = useState('');
  const [requestError, setRequestError] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);

  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Check if email is already provided (e.g., from a login redirect)
  useEffect(() => {
    if (location.state?.emailToVerify) {
      setEmail(location.state.emailToVerify);
      setStage('reset'); // Automatically go to reset stage if email is known
    }
  }, [location.state]);

  // --- Handler for Requesting Reset ---
  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setRequestError('Please enter your email address.');
      return;
    }

    setRequestLoading(true);
    setRequestError('');
    toast.dismiss();

    try {
      await axios.post(`${backendUrl}/api/user/forgot-password`, { email }); // Your backend endpoint for initiating reset
      toast.success('Password reset email sent! Please check your inbox.');
      setStage('reset'); // Move to the next stage
    } catch (err) {
      console.error('Forgot Password request error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || 'Failed to send reset request. Please try again.';
      setRequestError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setRequestLoading(false);
    }
  };

  // --- Handler for Resetting Password ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetCode || !newPassword || !confirmPassword) {
      setResetError('Please enter the reset code and new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    setResetLoading(true);
    setResetError('');
    toast.dismiss();

    try {
      await axios.post(`${backendUrl}/api/user/reset-password`, {
        email, // Still need email to identify user on backend
        resetCode,
        newPassword,
      });

      toast.success('Password reset successfully!');
      navigate('/login'); // Redirect to login page
    } catch (err) {
      console.error('Password Reset error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || 'Password reset failed. Please check the code or try again.';
      setResetError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-xl overflow-hidden p-8 md:p-12">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {stage === 'request' ? 'Forgot Password?' : 'Reset Your Password'}
        </h3>

        {stage === 'request' ? (
          <form onSubmit={handleRequestReset} className="space-y-6">
            <p className="text-center text-gray-600 mb-6">Enter your email address and we'll send you a link or code to reset your password.</p>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            {requestError && <p className="text-red-500 text-sm text-center">{requestError}</p>}
            <button
              type="submit"
              disabled={requestLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {requestLoading ? 'Sending...' : 'Send Reset Instructions'}
            </button>
            <p className="text-center text-sm text-gray-500 mt-4">
              Remember your password? <a href="/login" className="text-blue-600 hover:underline">Login Here</a>
            </p>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <p className="text-center text-gray-600 mb-6">Please enter the code sent to <strong className="text-blue-700">{email}</strong> and your new password.</p>
            <div>
              <label htmlFor="resetCode" className="block text-sm font-medium text-gray-700">Reset Code</label>
              <input
                type="text"
                id="resetCode"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength="6"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            {resetError && <p className="text-red-500 text-sm text-center">{resetError}</p>}
            <button
              type="submit"
              disabled={resetLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetLoading ? 'Resetting...' : 'Reset Password'}
            </button>
            <p className="text-center text-sm text-gray-500 mt-4">
              Didn't get the code? <a href="#" onClick={handleRequestReset} className="text-blue-600 hover:underline">Request Again</a>
            </p>
            <p className="text-center text-sm text-gray-500 mt-2">
              Not your email? <a href="/login" className="text-blue-600 hover:underline">Login Page</a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;