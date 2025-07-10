// src/pages/AdminLogin.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext'; // For styling
import axios from 'axios';
import { toast } from 'react-toastify'; // Make sure react-toastify is installed and imported
import { FaUserShield, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'; // Import icons
import { assets } from '../assets/assets';

// --- New: Background Gradient Animation ---
const gradientColors = [
  '#4ade80', // Green-400
  '#3b82f6', // Blue-500
  '#f43f5e', // Red-500
  '#eab308', // Yellow-500
  '#8b5cf6', // Violet-500
];

const AdminLogin = () => {
  // Only get necessary context for Admin login
  const {
    backendUrl,
    token, // To check if already logged in
    setToken,
  } = useContext(AdminContext);

  const { currentTheme } = useTheme(); // For styling

  const navigate = useNavigate();

  // State for form inputs
  const [username, setUsername] = useState(''); // Assuming email is used as username for admin
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // For password visibility toggle
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- New: Background Animation State ---
  const [bgGradient, setBgGradient] = useState(gradientColors[0]);
  const [nextBgGradientIndex, setNextBgGradientIndex] = useState(1);

  // Redirect to dashboard if already logged in as Admin
  useEffect(() => {
    if (token) { // This token is assumed to be the admin token
      navigate('/admin-dashboard'); // Adjust the path as needed
    }
  }, [token, navigate]);

  // --- New: Background Animation Logic ---
  useEffect(() => {
    const intervalId = setInterval(() => {
      setBgGradient(gradientColors[nextBgGradientIndex]);
      setNextBgGradientIndex((prevIndex) => (prevIndex + 1) % gradientColors.length);
    }, 5000); // Change color every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [nextBgGradientIndex]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Ensure backendUrl is available
    if (!backendUrl) {
      toast.error("Configuration error: Backend URL is missing.");
      setIsLoading(false);
      return;
    }

    const url = `${backendUrl}/api/admin/login`;
    const payload = { email: username, password }; // Assuming 'email' is used as username for admin login

    try {
      const response = await axios.post(url, payload);

      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token); // Admin token key
        setToken(response.data.token); // Set token in context
        toast.success('Admin login successful!');
        navigate('/admin-dashboard'); // Redirect to admin dashboard
      } else {
        // Handle cases where success is false but no specific message is provided
        setError(response.data.message || 'Login failed. Please check your credentials.');
        toast.error(response.data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Admin Login error:', error);
      // Extract a user-friendly error message
      const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred.";
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

  const buttonBaseStyles = `w-full py-2.5 rounded-lg font-semibold text-white text-lg shadow-md transition duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50`;
  const buttonLoadingStyles = `bg-gray-400 cursor-not-allowed`;
  // Using a fixed green color for buttons as per the image, as theme.primary might be different
  const buttonDefaultStyles = `bg-green-500 hover:bg-green-600 focus:ring-green-500`;

  const buttonActiveStyles = isLoading ? buttonLoadingStyles : buttonDefaultStyles;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 transition-all duration-1000 ease-in-out"
      // --- New: Apply background gradient and animation ---
      style={{
        backgroundImage: `linear-gradient(to right, ${bgGradient}, ${currentTheme.primary || '#1E40AF'})`,
        backgroundSize: '200% 200%', // For gradient animation
        animation: 'gradientShift 15s ease infinite', // Apply animation
      }}
    >
      {/* --- New: Keyframes for gradient animation --- */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden border"
        style={{
          borderColor: currentTheme.textColor === '#FFFFFF' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)',
          backgroundColor: currentTheme.navbarBgColor || '#FFFFFF', // Card background
          color: currentTheme.textColor || '#333333',
          // Add a subtle shadow to the card itself
          boxShadow: `0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)`,
        }}
      >
        {/* LEFT SECTION (WELCOME/BRANDING) */}
        <div
          className="md:w-1/2 flex flex-col justify-between items-center p-8 text-white rounded-l-lg relative"
          style={{ backgroundColor: currentTheme.primary || '#1E40AF' /* Default to a dark blue if primary is not set */ }}
        >
          {/* Curved background effect for the left side */}
          <div className="absolute inset-0 overflow-hidden rounded-l-lg">
            {/* This overlay adds a more dynamic visual to the left section */}
            <div className="absolute top-0 left-0 w-full h-full bg-green-500 opacity-70 rounded-l-lg blur-xl"></div> {/* Soft green blur */}
            <div className="absolute bottom-[-30%] left-[-15%] w-64 h-64 bg-white opacity-20 rounded-full transform scale-150 animate-pulse"></div> {/* Pulsating white circle */}
          </div>

          <div className="relative z-10 text-center">
            <img
              src={assets.lo || '/logo.png'} // Fallback to a generic logo
              alt="Admin Logo"
              className="mx-auto h-16 w-auto mb-4"
              aria-label="Admin Logo"
            />
            <h1 className="text-4xl font-extrabold mb-2 welcome-back-text">Welcome Back!</h1> {/* Added custom class for potential styling */}
            <p className="text-sm font-medium opacity-80">
              To stay connected with us,<br />please Login with your personal info
            </p>
          </div>

          <div className="relative z-10">
            <button
              onClick={() => navigate('/')} // Changed to navigate to homepage as SIGN IN on this side might be decorative
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-white hover:text-green-600 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
              style={{ borderColor: 'white', color: 'white' }}
            >
              Admin Login
            </button>
          </div>

          <div className="text-xs opacity-70 z-10">
            Creator Here | Creator Here
          </div>
        </div>

        {/* RIGHT SECTION (LOGIN FORM) */}
        <div className="md:w-1/2 flex flex-col justify-center items-center p-8 md:p-10">
          <div className="w-full max-w-sm"> {/* Constrain width of form elements */}
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 text-left" style={{ color: currentTheme.textColor }}>
              Login
            </h2>
            <p className="text-sm font-medium text-gray-500 mb-8">
              Access your admin dashboard
            </p>

            <form onSubmit={handleLogin} className="space-y-6"> {/* Use space-y for vertical spacing */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6 w-full text-center flex items-center" role="alert">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span className="font-semibold mr-1">Error:</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Username (Email) Input */}
              <div className="relative">
                <label htmlFor="admin-username-login" className="sr-only">Username/Email</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="admin-username-login"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full pl-11 pr-4 py-3 text-base border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-opacity-50 transition duration-200 ease-in-out border-gray-300"
                  style={{
                    ...inputStyles,
                    // Focus styles for better UX
                    borderColor: currentTheme.primary || '#1E40AF',
                    boxShadow: `0 0 0 2px ${currentTheme.primary ? currentTheme.primary + '30' : '#1E40AF30'}`,
                  }}
                  aria-label="Admin Username or Email"
                  placeholder="Email........"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <label htmlFor="admin-password-login" className="sr-only">Password</label>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="admin-password-login"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-11 pr-10 py-3 text-base border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-opacity-50 transition duration-200 ease-in-out border-gray-300"
                  style={{
                    ...inputStyles,
                    // Focus styles for better UX
                    borderColor: currentTheme.primary || '#1E40AF',
                    boxShadow: `0 0 0 2px ${currentTheme.primary ? currentTheme.primary + '30' : '#1E40AF30'}`,
                  }}
                  aria-label="Admin Password"
                  placeholder="Password........"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>

              {/* Forgot Password Link */}
              <div className="w-full flex items-center justify-end">
                <button
                  type="button" // Important to be type="button" to not submit the form
                  onClick={() => navigate('/forgot-password')} // You need to create this route and component
                  className="text-sm font-semibold hover:underline transition duration-200"
                  style={{ color: currentTheme.primary || '#007bff' }}
                  aria-label="Forgot password"
                >
                  Forgot your password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`${buttonBaseStyles} ${buttonActiveStyles}`}
                style={{
                  // Directly apply background color from Tailwind class name if possible,
                  // otherwise fallback to theme.primary for consistency or a hardcoded value.
                  backgroundColor: currentTheme.primary || '#1E40AF', // Fallback to primary theme color
                  color: 'white', // Ensure text color is white
                  padding: '10px 15px', // Adjust padding for better visual
                  fontSize: '1.1rem', // Larger font size for button
                }}
                // Enhanced hover effect
                onMouseEnter={(e) => {
                  if (!isLoading) e.currentTarget.style.backgroundColor = currentTheme.hoverPrimary || '#0056b3'; // Use theme hover color or a fallback
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) e.currentTarget.style.backgroundColor = currentTheme.primary || '#1E40AF'; // Reset to default
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center w-full">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
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