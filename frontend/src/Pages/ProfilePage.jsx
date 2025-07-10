import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';

function ProfilePage() {
  const navigate = useNavigate();
  const { token, setToken, setUserData, backendUrl } = useContext(AppContext);
  const { currentTheme } = useTheme();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [editFormData, setEditFormData] = useState({
    major: '',
    gender: '',
    dob: '',
    address: '',
    current_semester: '',
  });

  const calculateProfileCompletion = (data) => {
    const fields = [
      'student_id',
      'course',
      'major',
      'gender',
      'dob',
      'phone_no',
      'address',
      'year_of_admission',
      'current_semester',
      'profile_photo',
    ];
    let filled = 0;
    fields.forEach((field) => {
      if (field === 'academic_advisor') {
        if (data[field]?.name) filled++;
      } else if (data[field]) {
        filled++;
      }
    });
    return Math.round((filled / fields.length) * 100);
  };

  useEffect(() => {
    if (!token) {
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
          dob: fetchedData.dob ? fetchedData.dob.split('T')[0] : '',
          address: fetchedData.address || '',
          current_semester: fetchedData.current_semester || '',
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
    const { name, value } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setError('');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${backendUrl}/api/user/profile`, editFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      toast.success('Profile updated successfully!');
      setProfileData(response.data.user);
      setIsEditing(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Profile update failed.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
        <p className="text-lg text-red-500 text-center mb-4">{error}</p>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-500">No profile data available.</p>
      </div>
    );
  }

  const profileCompletion = calculateProfileCompletion(profileData);

  return (
    <div
      className="min-h-screen p-8"
      style={{
        backgroundColor: currentTheme.bgColor,
        color: currentTheme.textColor,
        fontFamily: currentTheme.fontFamily,
      }}
    >
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex flex-col items-center">
            <img
              src={profileData.profile_photo || '/images/default-profile.png'}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-blue-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/default-profile.png';
              }}
            />
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                title="Edit your profile"
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-transform transform hover:scale-105"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="mb-4">
              <h1 className="text-4xl font-bold">{profileData.name}</h1>
              <p className="text-xl text-gray-600">{profileData.email}</p>
            </div>

            {/* Profile Completion Indicator */}
            <div className="w-full mb-4">
              <h3 className="text-sm text-gray-500 mb-1">Profile Completion</h3>
              <div className="w-full bg-gray-300 rounded-full h-3">
                <div
                  className="h-3 bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{profileCompletion}% complete</p>
            </div>

            {profileCompletion < 100 && (
              <div className="bg-yellow-100 text-yellow-800 p-3 rounded-md text-sm mb-4">
                Your profile is {profileCompletion}% complete. Please update missing fields to improve your experience.
              </div>
            )}

            {!isEditing ? (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {[
                  { label: 'Student ID', value: profileData.student_id },
                  { label: 'Course', value: profileData.course },
                  { label: 'Major', value: profileData.major },
                  { label: 'Gender', value: profileData.gender },
                  { label: 'Date of Birth', value: profileData.dob ? new Date(profileData.dob).toLocaleDateString() : '' },
                  { label: 'Phone Number', value: profileData.phone_no },
                  { label: 'Address', value: profileData.address },
                  { label: 'Admission Year', value: profileData.year_of_admission },
                  { label: 'Current Semester', value: profileData.current_semester },
                ].map((item, index) => (
                  <div key={index}>
                    <h4 className="text-lg font-semibold text-gray-700">{item.label}</h4>
                    <p className={clsx('text-sm', {
                      'text-gray-500': item.value,
                      'text-red-500 italic': !item.value,
                    })}>
                      {item.value || 'Not provided'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
                {['major', 'gender', 'dob', 'address', 'current_semester'].map((field, idx) => {
                  const label = {
                    major: 'Major',
                    gender: 'Gender',
                    dob: 'Date of Birth',
                    address: 'Address',
                    current_semester: 'Current Semester',
                  }[field];

                  return (
                    <div key={idx}>
                      <label htmlFor={field} className="block text-sm font-medium text-gray-700">{label}</label>
                      {field === 'gender' ? (
                        <select
                          id="gender"
                          name="gender"
                          value={editFormData.gender}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                          className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      )}
                    </div>
                  );
                })}

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <div className="flex justify-center gap-4 pt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      toast.info('Edit cancelled');
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
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
