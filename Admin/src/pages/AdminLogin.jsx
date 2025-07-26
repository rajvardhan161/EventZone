// src/pages/AdminLogin.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../context/AdminContext'; // Can be used for shared state like token
import { useTheme } from '../context/ThemeContext'; // For styling
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUserShield, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserTie } from 'react-icons/fa'; // Import FaUserTie for Organizer
import { assets } from '../assets/assets';

// --- Background Gradient Animation ---
const gradientColors = [
  '#4ade80', // Green-400
  '#3b82f6', // Blue-500
  '#f43f5e', // Red-500
  '#eab308', // Yellow-500
  '#8b5cf6', // Violet-500
];

const AdminLogin = () => {
  // Include userType and setUserType from context
  const { backendUrl, token, setToken, organizer, setOrganizer, userType, setUserType } = useContext(AdminContext);
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  // --- New: State for switching between Admin and Organizer login ---
  const [loginType, setLoginType] = useState('admin'); // 'admin' or 'organizer'

  // State for form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- Background Animation State ---
  const [bgGradient, setBgGradient] = useState(gradientColors[0]);
  const [nextBgGradientIndex, setNextBgGradientIndex] = useState(1);

  // --- Redirect if already logged in ---
  useEffect(() => {
    if (token || organizer) {
      const savedUserType = localStorage.getItem('userType');
      if (savedUserType === 'admin') {
        navigate('/admin-dashboard');
      } else if (savedUserType === 'organizer') {
        navigate('/Dashboard');
      }
    }
  }, [token, organizer, navigate]);

  // --- Background Animation Logic ---
  useEffect(() => {
    const intervalId = setInterval(() => {
      setBgGradient(gradientColors[nextBgGradientIndex]);
      setNextBgGradientIndex((prevIndex) => (prevIndex + 1) % gradientColors.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [nextBgGradientIndex]);

  // --- Login Handler ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!backendUrl) {
      toast.error("Configuration error: Backend URL is missing.");
      setIsLoading(false);
      return;
    }

    const payload = { email: username, password };
    let url = '';

    try {
      if (loginType === 'admin') {
        url = `${backendUrl}/api/admin/login`;
        const response = await axios.post(url, payload);

        if (response.data.success && response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('userType', 'admin'); // Store user type
          setToken(response.data.token);
          setUserType('admin'); // Set userType in context

          toast.success('Admin login successful!');
          navigate('/admin-dashboard');
        } else {
          setError(response.data.message || 'Login failed. Please check your credentials.');
          toast.error(response.data.message || 'Login failed.');
        }
      } else { // Organizer Login
        url = `${backendUrl}/api/organizer/organizers/login`;
        const response = await axios.post(url, payload);

        if (response.status === 200 && response.data.token) {
          localStorage.setItem('organizer', response.data.token);
          localStorage.setItem('userType', 'organizer');
          localStorage.setItem('organizerData', JSON.stringify(response.data.organizer));
          setOrganizer(response.data.token); // Set organizer token in context
          setUserType('organizer'); // Set userType in context

          toast.success('Organizer login successful!');
          navigate('/organizer-dashboard');
        } else {
          setError(response.data.message || 'Login failed. Please check your credentials.');
          toast.error(response.data.message || 'Login failed.');
        }
      }
    } catch (err) {
      console.error(`${loginType} Login error:`, err);
      const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic styles based on theme
  const inputStyles = {
    backgroundColor: currentTheme.bgColor || '#FFFFFF',
    color: currentTheme.textColor || '#333333',
    borderColor: currentTheme.textColor === '#FFFFFF' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
  };

  const buttonBaseStyles = `w-full py-3 rounded-lg font-semibold text-white text-lg shadow-md transition duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50`;
  const buttonLoadingStyles = `bg-gray-400 cursor-not-allowed`;
  const buttonDefaultStyles = `bg-green-500 hover:bg-green-600 focus:ring-green-500`;
  const buttonActiveStyles = isLoading ? buttonLoadingStyles : buttonDefaultStyles;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 transition-all duration-1000 ease-in-out"
      style={{ backgroundImage: `linear-gradient(to right, ${bgGradient}, ${currentTheme.primary || '#1E40AF'})`, backgroundSize: '200% 200%', animation: 'gradientShift 15s ease infinite' }}
    >
      <style>{`@keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}</style>

      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden border"
        style={{
          borderColor: currentTheme.textColor === '#FFFFFF' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)',
          backgroundColor: currentTheme.navbarBgColor || '#FFFFFF',
          color: currentTheme.textColor || '#333333',
          boxShadow: `0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)`
        }}
      >
        {/* LEFT SECTION (WELCOME/BRANDING) */}
        <div className="md:w-1/2 flex flex-col justify-between items-center p-8 text-white rounded-l-lg relative" style={{ backgroundColor: currentTheme.primary || '#1E40AF' }}>
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden rounded-l-lg">
            <div className="absolute top-0 left-0 w-full h-full bg-green-500 opacity-70 rounded-l-lg blur-xl"></div>
            <div className="absolute bottom-[-30%] left-[-15%] w-64 h-64 bg-white opacity-20 rounded-full transform scale-150 animate-pulse"></div>
          </div>

          <div className="relative z-10 text-center">
            <img src={assets.lo || '/logo.png'} alt="Logo" className="mx-auto h-16 w-auto mb-4" />
            <h1 className="text-4xl font-extrabold mb-2">Welcome Back!</h1>
            <p className="text-sm font-medium opacity-80">Access your dashboard and manage your world.</p>
          </div>
          <div className="relative z-10">
            <button onClick={() => navigate('/')} className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-white hover:text-green-600 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg">
              Return Home
            </button>
          </div>
          <div className="text-xs opacity-70 z-10">Creator Here | Creator Here</div>
        </div>

        {/* RIGHT SECTION (LOGIN FORM) */}
        <div className="md:w-1/2 flex flex-col justify-center items-center p-8 md:p-10">
          <div className="w-full max-w-sm">
            {/* --- Login Type Switcher --- */}
            <div className="flex border border-gray-300 rounded-lg p-1 mb-6">
              <button
                onClick={() => { setLoginType('admin'); setError(''); }}
                className={`w-1/2 py-2 text-center font-semibold rounded-md transition-colors duration-300 ${loginType === 'admin' ? 'bg-green-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Admin
              </button>
              <button
                onClick={() => { setLoginType('organizer'); setError(''); }}
                className={`w-1/2 py-2 text-center font-semibold rounded-md transition-colors duration-300 ${loginType === 'organizer' ? 'bg-green-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Organizer
              </button>
            </div>

            <div className="flex items-center gap-3 mb-2">
              {loginType === 'admin' ? <FaUserShield className="h-8 w-8 text-green-500" /> : <FaUserTie className="h-8 w-8 text-green-500" />}
              <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: currentTheme.textColor }}>
                {loginType === 'admin' ? 'Admin Login' : 'Organizer Login'}
              </h2>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-8">
              {loginType === 'admin' ? 'Access your admin dashboard' : 'Access your organizer dashboard'}
            </p>

            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md w-full text-center flex items-center" role="alert">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Email Input */}
              <div className="relative">
                <label htmlFor="auth-email-login" className="sr-only">Email</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="auth-email-login"
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 text-base border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-opacity-50 transition duration-200"
                  style={{ ...inputStyles, boxShadow: `0 0 0 2px ${currentTheme.primary ? currentTheme.primary + '30' : '#1E40AF30'}` }}
                  placeholder="Email..."
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <label htmlFor="auth-password-login" className="sr-only">Password</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="auth-password-login"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-11 pr-10 py-3 text-base border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-opacity-50 transition duration-200"
                  style={{ ...inputStyles, boxShadow: `0 0 0 2px ${currentTheme.primary ? currentTheme.primary + '30' : '#1E40AF30'}` }}
                  placeholder="Password..."
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>

              <div className="w-full flex items-center justify-end">
                <button type="button" onClick={() => navigate('/forgot-password')} className="text-sm font-semibold hover:underline" style={{ color: currentTheme.primary || '#007bff' }}>
                  Forgot your password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`${buttonBaseStyles} ${buttonActiveStyles}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center w-full">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Signing In...
                  </div>
                ) : (
                  'Login'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
