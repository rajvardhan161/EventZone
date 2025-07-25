import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx'; // For conditional class names

// --- Reusable Spinner for Loading ---
const Spinner = ({ className = "w-8 h-8", color = "text-blue-600" }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 8l3-3.709z" fill="currentColor" className="opacity-75"></path>
  </svg>
);

function ProfilePage() {
  const navigate = useNavigate();
  const { token, setToken, setUserData, backendUrl } = useContext(AppContext);
  const { currentTheme } = useTheme(); // Access theme properties

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Separate state for form submission

  const [editFormData, setEditFormData] = useState({
    major: '',
    gender: '',
    dob: '',
    address: '',
    current_semester: '',
    profile_photo: null, // For file upload
  });

  // --- Style Definitions (Consolidated and Enhanced) ---
  const getThemedStyles = () => ({
    pageContainer: {
      // backgroundColor: currentTheme.background || '#ffffff', // Default to white if not set
      color: currentTheme.text || '#333333', // Default text color
      fontFamily: currentTheme.fontFamily || 'sans-serif',
    },
    card: {
      backgroundColor: currentTheme.cardBgColor || '#ffffff',
      color: currentTheme.text || '#333333',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      borderColor: currentTheme.borderColor || '#e0e0e0',
    },
    primaryButton: {
      backgroundColor: currentTheme.primary || '#007bff', // Use primary theme color
      color: currentTheme.onPrimary || '#ffffff', // Text color for primary button
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      borderColor: currentTheme.primary || '#007bff',
      boxShadow: `0 2px 5px 0 ${currentTheme.primary}80`, // Themed shadow
    },
    secondaryButton: {
      color: currentTheme.accent || currentTheme.primary || '#6c757d', // Use accent or primary for secondary
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      borderColor: currentTheme.accent || currentTheme.primary || '#6c757d',
    },
    input: {
      borderColor: currentTheme.borderColor || '#cccccc',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      color: currentTheme.text || '#333333',
      backgroundColor: currentTheme.cardBgColor || '#ffffff',
      '&:focus': {
        borderColor: currentTheme.primary || '#007bff',
        boxShadow: `0 0 0 1px ${currentTheme.primary || '#007bff'}`,
      },
    },
    errorMessage: {
      color: currentTheme.errorColor || '#dc3545',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
    },
    progressBackground: {
      backgroundColor: currentTheme.borderColor || '#e0e0e0', // Use border color for progress track
    },
    progressBar: {
      backgroundColor: currentTheme.accent || currentTheme.primary || '#17a2b8', // Use accent for progress bar fill
    },
    completionText: {
      color: currentTheme.textMuted || '#6c757d', // A muted text color for completion percentage
      fontFamily: currentTheme.fontFamily || 'sans-serif',
    },
    warningBanner: {
      backgroundColor: currentTheme.warningBgColor || '#fff3cd',
      color: currentTheme.warningTextColor || '#856404',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      borderColor: currentTheme.warningBorderColor || '#ffeeba',
    },
    formFieldLabel: {
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      color: currentTheme.text || '#333333',
    },
    formInput: {
      borderColor: currentTheme.borderColor || '#ced4da',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      color: currentTheme.text || '#333333',
      backgroundColor: currentTheme.cardBgColor || '#ffffff',
      '&::placeholder': {
        color: currentTheme.placeholderColor || '#6c757d',
      },
      '&:focus': {
        borderColor: currentTheme.primary || '#80bdff',
        boxShadow: `0 0 0 0.2rem ${currentTheme.primary}20`
      }
    },
    selectInput: {
      borderColor: currentTheme.borderColor || '#ced4da',
      fontFamily: currentTheme.fontFamily || 'sans-serif',
      color: currentTheme.text || '#333333',
      backgroundColor: currentTheme.cardBgColor || '#ffffff',
      '&:focus': {
        borderColor: currentTheme.primary || '#80bdff',
        boxShadow: `0 0 0 0.2rem ${currentTheme.primary}20`
      }
    },
  });

  const styles = getThemedStyles();

  const calculateProfileCompletion = (data) => {
    const fields = [
      'student_id', 'course', 'major', 'gender', 'dob', 'phone_no', 'address',
      'year_of_admission', 'current_semester', 'profile_photo', 'academic_advisor',
    ];
    let filled = 0;
    fields.forEach((field) => {
      if (field === 'academic_advisor') {
        if (data[field]?.name || data[field]?.username) filled++; // Check for name or username
      } else if (data[field]) {
        filled++;
      }
    });
    return Math.round((filled / fields.length) * 100);
  };

  useEffect(() => {
    if (!token) {
      toast.warn('Please log in to view your profile.');
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${backendUrl}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fetchedData = response.data;
        setProfileData(fetchedData);
        setEditFormData({
          major: fetchedData.major || '',
          gender: fetchedData.gender || '',
          dob: fetchedData.dob ? fetchedData.dob.split('T')[0] : '', // Format for date input
          address: fetchedData.address || '',
          current_semester: fetchedData.current_semester || '',
          profile_photo: null, // Reset photo upload when fetching data
        });
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch profile data.';
        setError(errorMessage);
        toast.error(errorMessage);
        if (err.response?.status === 401) {
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

    fetchProfile();
  }, [token, navigate, backendUrl, setToken, setUserData]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value, // Handle file input separately
    }));
    setError(''); // Clear error on input change
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Basic validation for required fields before submission
    if (!editFormData.major || !editFormData.gender || !editFormData.dob || !editFormData.current_semester) {
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('major', editFormData.major);
      formData.append('gender', editFormData.gender);
      formData.append('dob', editFormData.dob);
      formData.append('address', editFormData.address);
      formData.append('current_semester', editFormData.current_semester);

      if (editFormData.profile_photo) {
        formData.append('profile_photo', editFormData.profile_photo);
      }

      const response = await axios.put(`${backendUrl}/api/user/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Profile updated successfully!');
      setProfileData(response.data.user);
      setIsEditing(false);
      setEditFormData({ ...editFormData, profile_photo: null });

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Profile update failed.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={styles.pageContainer}>
        <div className="flex flex-col items-center space-y-2">
          <Spinner color={`text-${currentTheme.primary}-500` || "text-blue-500"} />
          <p className="text-lg" style={{ color: currentTheme.text }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  // --- Render Error State ---
  if (error && !profileData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={styles.pageContainer}>
        <p className="text-lg text-center mb-4" style={styles.errorMessage}>{error}</p>
        <button
          onClick={() => navigate('/login')}
          className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors duration-200 shadow-md hover:shadow-lg"
          style={styles.primaryButton}
        >
          Go to Login
        </button>
      </div>
    );
  }

  // --- Render if no profile data ---
  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={styles.pageContainer}>
        <p className="text-lg opacity-70" style={{ color: currentTheme.text }}>No profile data available.</p>
      </div>
    );
  }

  const profileCompletion = calculateProfileCompletion(profileData);
  const isProfileIncomplete = profileCompletion < 100;

  return (
    <div
      className="min-h-screen p-8 flex items-center justify-center"
      style={styles.pageContainer}
    >
      <div
        className="max-w-4xl w-full mx-auto p-8 rounded-2xl shadow-lg border"
        style={styles.card}
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Profile Picture & Actions */}
          <div className="flex flex-col items-center">
            <img
              src={profileData.profile_photo || '/images/default-profile.png'}
              alt="Profile"
              className="w-36 h-36 rounded-full object-cover shadow-2xl border-4 transition-transform duration-300 ease-in-out hover:scale-105"
              style={{ borderColor: currentTheme.primary }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/default-profile.png';
              }}
            />
            {isEditing ? (
              <div className="mt-4 w-full max-w-[144px]">
                <label
                  htmlFor="profile_photo"
                  className="block text-center text-sm font-medium cursor-pointer rounded-lg py-2 px-3 transition-colors duration-200"
                  style={styles.primaryButton}
                >
                  Upload Photo
                </label>
                <input
                  type="file"
                  id="profile_photo"
                  name="profile_photo"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="hidden"
                />
                {editFormData.profile_photo && (
                  <p className="text-xs mt-1 text-center truncate" style={styles.completionText}>
                    {editFormData.profile_photo.name}
                  </p>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                title="Edit your profile"
                className="mt-4 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors duration-200 shadow-md hover:shadow-lg"
                style={styles.primaryButton}
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Information */}
          <div className="flex-1 text-center md:text-left">
            <div className="mb-4">
              <h1 className="text-4xl font-extrabold mb-1" style={{ color: currentTheme.primary, fontFamily: currentTheme.fontFamily }}>
                {profileData.name || 'User Name'}
              </h1>
              <p className="text-lg opacity-80" style={{ fontFamily: currentTheme.fontFamily }}>{profileData.email || 'No email available'}</p>
            </div>

            {/* Profile Completion Indicator */}
            <div className="w-full mb-4">
              <h3 className="text-sm mb-1" style={styles.completionText}>Profile Completion</h3>
              <div className="w-full bg-gray-300 rounded-full h-3" style={styles.progressBackground}>
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${profileCompletion}%`,
                    ...styles.progressBar,
                  }}
                ></div>
              </div>
              <p className="text-xs mt-1 text-right" style={styles.completionText}>{profileCompletion}% complete</p>
            </div>

            {/* Prompt for incomplete profile */}
            {isProfileIncomplete && (
              <div className="p-3 rounded-lg text-sm mb-4 border" style={styles.warningBanner}>
                Your profile is incomplete. Fill in the missing fields to enhance your experience.
              </div>
            )}

            {!isEditing ? (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {[
                  { label: 'Student ID', value: profileData.student_id },
                  { label: 'Course', value: profileData.course },
                  { label: 'Major', value: profileData.major },
                  { label: 'Gender', value: profileData.gender },
                  { label: 'Date of Birth', value: profileData.dob ? new Date(profileData.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '' },
                  { label: 'Phone Number', value: profileData.phone_no },
                  { label: 'Address', value: profileData.address },
                  { label: 'Admission Year', value: profileData.year_of_admission },
                  { label: 'Current Semester', value: profileData.current_semester },
                  { label: 'Academic Advisor', value: profileData.academic_advisor?.name || profileData.academic_advisor?.username },
                ].map((item, index) => (
                  <div key={index}>
                    <h4 className="text-lg font-semibold mb-1" style={{ color: currentTheme.primary, fontFamily: currentTheme.fontFamily }}>{item.label}</h4>
                    <p className={clsx('text-base opacity-80', {
                      'text-red-500 italic': !item.value,
                    })} style={{ fontFamily: currentTheme.fontFamily }}>
                      {item.value || 'Not provided'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
                {/* Editable Fields */}
                {['major', 'gender', 'dob', 'address', 'current_semester'].map((field) => {
                  const label = {
                    major: 'Major',
                    gender: 'Gender',
                    dob: 'Date of Birth',
                    address: 'Address',
                    current_semester: 'Current Semester',
                  }[field];

                  return (
                    <div key={field}>
                      <label htmlFor={field} className="block text-sm font-medium mb-1" style={styles.formFieldLabel}>{label}</label>
                      {field === 'gender' ? (
                        <select
                          id={field}
                          name={field}
                          value={editFormData.gender}
                          onChange={handleInputChange}
                          className="py-3 px-4 block w-full rounded-lg border focus:ring-2 focus:outline-none transition duration-200"
                          style={styles.selectInput}
                          required // Make gender selection required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      ) : (
                        <input
                          type={field === 'dob' ? 'date' : field === 'current_semester' ? 'number' : 'text'}
                          id={field}
                          name={field}
                          value={editFormData[field]}
                          onChange={handleInputChange}
                          min={field === 'current_semester' ? '1' : undefined}
                          placeholder={`Enter your ${label.toLowerCase()}`}
                          className="py-3 px-4 block w-full rounded-lg border focus:ring-2 focus:outline-none transition duration-200"
                          style={styles.formInput}
                          required={field === 'major' || field === 'dob' || field === 'current_semester'} // Mark key fields as required
                        />
                      )}
                    </div>
                  );
                })}

                {error && <p className="text-sm text-center py-2" style={styles.errorMessage}>{error}</p>}

                <div className="flex justify-center gap-4 pt-4">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-lg font-semibold text-sm transition-colors duration-200 shadow-md hover:shadow-lg"
                    style={styles.primaryButton}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditFormData({
                        major: profileData.major || '',
                        gender: profileData.gender || '',
                        dob: profileData.dob ? profileData.dob.split('T')[0] : '',
                        address: profileData.address || '',
                        current_semester: profileData.current_semester || '',
                        profile_photo: null,
                      });
                      toast.info('Edit cancelled');
                    }}
                    className="px-6 py-3 rounded-lg font-semibold text-sm transition-colors duration-200 shadow-md hover:shadow-lg"
                    style={{
                      backgroundColor: 'transparent',
                      color: currentTheme.text,
                      borderColor: currentTheme.borderColor || '#cccccc',
                      fontFamily: currentTheme.fontFamily,
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;