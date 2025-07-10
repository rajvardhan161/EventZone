import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext'; // Adjust path as per your project structure

function Login() {
  const navigate = useNavigate();
  const { backendUrl, setToken, setUserData, token } = useContext(AppContext);

  const [isLoginView, setIsLoginView] = useState(true); // Toggle between login and signup

  // --- Login State ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // --- Signup State ---
  const [signupFormData, setSignupFormData] = useState({
    name: '',
    student_id: '',
    dob: '', // Format as YYYY-MM-DD
    gender: '',
    address: '',
    phone_no: '',
    email: '',
    course: '',
    year_of_admission: new Date().getFullYear(),
    // Make current_semester a string initially for the select placeholder
    current_semester: '',
    password: '',
    confirmPassword: '',
  });
  const [profileImage, setProfileImage] = useState(null); // For file upload
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const {
    name, student_id, dob, gender, address, phone_no, email,
    course, year_of_admission, current_semester, password, confirmPassword // Added current_semester here
  } = signupFormData;

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (token) {
      navigate('/dashboard'); // Or your protected route
    }
  }, [token, navigate]);

  // --- Handlers for Login ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter both email and password.');
      return;
    }

    setLoginLoading(true);
    setLoginError('');
    toast.dismiss(); // Clear previous toasts

    try {
      const res = await axios.post(`${backendUrl}/api/user/login`, {
        email: loginEmail,
        password: loginPassword,
      });

      toast.success('Login successful!');
      setToken(res.data.token);
      setUserData(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard'); // Redirect after successful login

    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';

      if (err.response?.data?.redirect) {
        // If backend sends a redirect to verify-email
        navigate('/login', { state: { emailToVerify: loginEmail } });
      } else {
        setLoginError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // --- Handlers for Signup ---
  const handleSignupInputChange = (e) => {
    setSignupFormData({ ...signupFormData, [e.target.name]: e.target.value });
    setSignupError(''); // Clear error on input change
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setProfileImage(e.target.files[0]);
      setSignupError(''); // Clear error if a new file is selected
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }

    // Basic client-side validation for required fields
    if (!name || !student_id || !dob || !gender || !address || !phone_no || !email || !course || !year_of_admission || !current_semester || !password || !profileImage) {
      setSignupError('Please fill in all required fields, including profile image and current semester.');
      return;
    }

    setSignupLoading(true);
    setSignupError('');
    toast.dismiss();

    const formDataToSend = new FormData();
    formDataToSend.append('name', name);
    formDataToSend.append('student_id', student_id);
    formDataToSend.append('dob', dob);
    formDataToSend.append('gender', gender);
    formDataToSend.append('address', address);
    formDataToSend.append('phone_no', phone_no);
    formDataToSend.append('email', email);
    formDataToSend.append('course', course);
    formDataToSend.append('year_of_admission', year_of_admission);
    formDataToSend.append('current_semester', current_semester); // Use the state value
    formDataToSend.append('password', password);
    formDataToSend.append('image', profileImage); // Append the image file

    try {
      const res = await axios.post(`${backendUrl}/api/user/signup`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Registration successful! Please verify your email.');
      setVerificationEmail(email); // Store email for OTP stage
      setShowOtpForm(true); // Show OTP form after successful initial signup
      setSignupFormData({ // Reset form except for verification email
        name: '', student_id: '', dob: '', gender: '', address: '',
        phone_no: '', email: '', course: '', year_of_admission: new Date().getFullYear(),
        current_semester: '', // Reset semester
        password: '', confirmPassword: ''
      });
      setProfileImage(null); // Clear selected image

    } catch (err) {
      console.error('Signup error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || 'Signup failed. Please try again.';
      setSignupError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSignupLoading(false);
    }
  };

  // --- Handlers for OTP Verification ---
  const handleRequestOtp = async () => {
    if (!verificationEmail) return;
    setOtpLoading(true);
    setOtpError('');
    toast.dismiss();

    try {
      await axios.post(`${backendUrl}/api/user/request-otp`, { email: verificationEmail });
      toast.success('OTP resent. Please check your email.');
    } catch (err) {
      console.error('Request OTP error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || 'Failed to send OTP. Please try again.';
      setOtpError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || !verificationEmail) {
      setOtpError('OTP is required.');
      return;
    }

    setOtpLoading(true);
    setOtpError('');
    toast.dismiss();

    try {
      const res = await axios.post(`${backendUrl}/api/user/verify-otp`, {
        email: verificationEmail,
        otp: otp,
      });

      toast.success('Email verified successfully!');
      setToken(res.data.token);
      setUserData(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard'); // Redirect after successful verification

    } catch (err) {
      console.error('OTP Verification error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || 'OTP verification failed. Please try again.';
      setOtpError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    // Clear errors and reset form states when switching
    setLoginError('');
    setSignupError('');
    setOtpError('');
    setOtp('');
    setShowOtpForm(false); // Ensure OTP form is hidden when switching
    // Consider resetting all signup form fields if switching from signup
    if (!isLoginView) { // If switching from signup to login
      setSignupFormData({ // Reset form fields
        name: '', student_id: '', dob: '', gender: '', address: '',
        phone_no: '', email: '', course: '', year_of_admission: new Date().getFullYear(),
        current_semester: '', // Ensure semester is reset
        password: '', confirmPassword: ''
      });
      setProfileImage(null);
    }
  };

  // Helper to generate semester options (e.g., 1 to 8 for a 4-year course)
  const renderSemesterOptions = () => {
    const options = [];
    for (let i = 1; i <= 8; i++) { // Assuming a max of 8 semesters (4 years)
      options.push(
        <option key={i} value={i}>
          {i}
        </option>
      );
    }
    return options;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl overflow-hidden flex flex-col md:flex-row transition-all duration-700">

        {/* Left Side - Form Container */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center transition-opacity duration-700 ease-in-out">
          <div className="flex justify-center mb-6 space-x-4">
            <button
              className={`px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300
                ${isLoginView ? 'bg-blue-600 text-white shadow-md scale-105' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={toggleView}
            >
              Login
            </button>
            <button
              className={`px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300
                ${!isLoginView ? 'bg-blue-600 text-white shadow-md scale-105' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={toggleView}
            >
              Signup
            </button>
          </div>

          {/* Dynamic Form Rendering */}
          {!isLoginView && showOtpForm ? (
            <div className="otp-verification-form animate-fadeIn"> {/* Add fade-in animation */}
              <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">Verify Your Email</h3>
              <p className="text-center text-gray-600 mb-6">An OTP has been sent to: <strong className="text-blue-700">{verificationEmail}</strong></p>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Enter OTP</label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                {otpError && <p className="text-red-500 text-sm text-center">{otpError}</p>}
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpLoading ? 'Verifying...' : 'Verify Email'}
                </button>
              </form>
              <button onClick={handleRequestOtp} disabled={otpLoading} className="mt-4 w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium transition-all duration-300
                bg-gray-500 hover:bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">
                {otpLoading ? 'Resending...' : 'Resend OTP'}
              </button>
              <p className="text-center text-sm text-gray-500 mt-4">
                Didn't receive OTP? Click Resend OTP or <a href="#" onClick={() => { setShowOtpForm(false); setIsLoginView(false); }} className="text-blue-600 hover:underline">Go back to Signup</a>
              </p>
            </div>
          ) : (
            // Login or Signup Form
            isLoginView ? (
              <form onSubmit={handleLoginSubmit} className="space-y-6 animate-fadeIn"> {/* Add fade-in animation */}
                <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Student Login</h3>
                <div>
                  <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="loginEmail"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    id="loginPassword"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loginLoading ? 'Logging in...' : 'Login'}
                </button>
                <p className="text-center text-sm text-gray-500">Forgot your password? <a href="/forgot-password" className="text-blue-600 hover:underline">Reset Password</a></p>
                <p className="text-center text-sm text-gray-500">Don't have an account? <a href="#" onClick={toggleView} className="text-blue-600 hover:underline">Sign Up Here</a></p>
              </form>
            ) : (
              // Signup Form
              <form onSubmit={handleSignupSubmit} encType="multipart/form-data" className="space-y-4 animate-fadeIn"> {/* Add fade-in animation */}
                <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">Student Signup</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" id="name" name="name" value={name} onChange={handleSignupInputChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="student_id" className="block text-sm font-medium text-gray-700">Student ID</label>
                    <input type="text" id="student_id" name="student_id" value={student_id} onChange={handleSignupInputChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input type="date" id="dob" name="dob" value={dob} onChange={handleSignupInputChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                    <select id="gender" name="gender" value={gender} onChange={handleSignupInputChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                    <input type="text" id="address" name="address" value={address} onChange={handleSignupInputChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="phone_no" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="tel" id="phone_no" name="phone_no" value={phone_no} onChange={handleSignupInputChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" id="email" name="email" value={email} onChange={handleSignupInputChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="course" className="block text-sm font-medium text-gray-700">Course</label>
                    <input type="text" id="course" name="course" value={course} onChange={handleSignupInputChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="year_of_admission" className="block text-sm font-medium text-gray-700">Year of Admission</label>
                    <input type="number" id="year_of_admission" name="year_of_admission" value={year_of_admission} onChange={handleSignupInputChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>

                  {/* --- Semester Select Field --- */}
                  <div>
                    <label htmlFor="current_semester" className="block text-sm font-medium text-gray-700">Current Semester</label>
                    <select
                      id="current_semester"
                      name="current_semester"
                      value={current_semester}
                      onChange={handleSignupInputChange}
                      required
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select Semester</option>
                      {renderSemesterOptions()}
                    </select>
                  </div>
                  {/* --- End Semester Select Field --- */}

                  <div className="md:col-span-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" id="password" name="password" value={password} onChange={handleSignupInputChange} required minLength="6" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" value={confirmPassword} onChange={handleSignupInputChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="profile_photo" className="block text-sm font-medium text-gray-700">Profile Photo</label>
                    <input
                      type="file"
                      id="profile_photo"
                      onChange={handleImageChange}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer file:hover:bg-blue-700"
                    />
                  </div>
                </div>
                {signupError && <p className="text-red-500 text-sm text-center mt-4">{signupError}</p>}
                <button
                  type="submit"
                  disabled={signupLoading}
                  className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {signupLoading ? 'Registering...' : 'Register'}
                </button>
                <p className="text-center text-sm text-gray-500 mt-4">Already have an account? <a href="#" onClick={toggleView} className="text-blue-600 hover:underline">Login Here</a></p>
              </form>
            )
          )}
        </div>

        {/* Right Side - Image/Welcome */}
        <div className="w-full md:w-1/2 bg-blue-600 text-white flex flex-col items-center justify-center p-8 md:p-12 transition-all duration-700 ease-in-out">
          <h2 className="text-4xl font-bold mb-4 transition-opacity duration-700 ease-in-out">
            {isLoginView ? "Welcome Back!" : "Join Our Community!"}
          </h2>
          <p className="text-xl text-center mb-8 transition-opacity duration-700 ease-in-out">
            {isLoginView
              ? "Login to access your account and academic resources."
              : "Create your account to get started and manage your academic journey."}
          </p>
          {/* You can add an image here if you want */}
          {/* <img src="/path/to/your/image.svg" alt="Campus Illustration" className="w-48 h-48 md:w-64 md:h-64 mb-8" /> */}
        </div>
      </div>
    </div>
  );
}

export default Login;
