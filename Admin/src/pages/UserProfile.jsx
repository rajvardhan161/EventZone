import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaUserEdit, FaShieldAlt, FaTrash, FaEnvelope, FaPhone, FaCalendarAlt, FaMapMarkerAlt, FaGraduationCap, FaCalendarCheck, FaBell, FaTimesCircle, FaUserAlt } from 'react-icons/fa';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [roles, setRoles] = useState(['User']);

  const { token, setToken, backendUrl } = useContext(AdminContext);
  const { currentTheme } = useTheme();

  // --- DEBUGGING LOGS ---
  console.log("UserProfile: userId from useParams:", userId);
  console.log("UserProfile: token from context:", token);
  console.log("UserProfile: backendUrl from context:", backendUrl);
  // --- END DEBUGGING LOGS ---

  const styles = {
    container: { backgroundColor: currentTheme.backgroundColor || '#ffffff', color: currentTheme.textColor || '#333', borderColor: currentTheme.borderColor || '#ddd' },
    input: { backgroundColor: currentTheme.inputBg || '#fff', color: currentTheme.textColor || '#333', borderColor: currentTheme.borderColor || '#ccc' },
    disabledInput: { backgroundColor: currentTheme.disabledInputBg || '#f8f9fa', color: currentTheme.disabledInputColor || '#6c757d', borderColor: currentTheme.borderColor || '#ccc' },
    buttonPrimary: { backgroundColor: currentTheme.primaryButtonBg || '#007bff', color: currentTheme.buttonTextColor || '#fff' },
    buttonSecondary: { backgroundColor: currentTheme.secondaryButtonBg || '#6c757d', color: currentTheme.buttonTextColor || '#fff' },
    buttonDanger: { backgroundColor: currentTheme.dangerButtonBg || '#dc3545', color: currentTheme.buttonTextColor || '#fff' },
    buttonSuccess: { backgroundColor: currentTheme.successButtonBg || '#28a745', color: currentTheme.buttonTextColor || '#fff' },
    buttonWarning: { backgroundColor: currentTheme.warningButtonBg || '#ffc107', color: currentTheme.buttonTextColor || '#333' },
    buttonInfo: { backgroundColor: currentTheme.infoButtonBg || '#17a2b8', color: currentTheme.buttonTextColor || '#fff' },
    highlightColor: currentTheme.highlightColor || '#007bff',
  };

  useEffect(() => {
    const fetchUser = async () => {
      // Check if userId is valid before proceeding
      if (!userId || userId === 'undefined') {
        setError('Invalid User ID provided.');
        setLoading(false);
        return;
      }

      if (!token) {
        Swal.fire({
          icon: 'warning',
          title: 'Not Logged In',
          text: 'Please log in to access this page.',
        }).then(() => navigate('/'));
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log(`UserProfile: Fetching user with ID: ${userId}`); // Log before fetch
        const response = await fetch(`${backendUrl}/api/admin/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log(`UserProfile: Fetch response status: ${response.status}`); // Log response status

        if (!response.ok) {
          const errorData = await response.json();
          console.error("UserProfile: Fetch error response:", errorData); // Log error response body

          if (response.status === 401 || response.status === 403) {
            Swal.fire({
              icon: 'error',
              title: 'Access Denied',
              text: errorData.message || 'Your session may have expired or you do not have admin privileges.',
            }).then(() => {
              setToken(null);
              navigate('/');
            });
            return;
          }
          if (response.status === 404) {
            setError('User not found.');
          } else {
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
        } else {
          const data = await response.json();
          console.log("UserProfile: Successfully fetched user data:", data); // Log fetched data
          setUser(data);
          setFormData({
            name: data.name || '',
            student_id: data.student_id || '',
            dob: data.dob ? data.dob.split('T')[0] : '',
            gender: data.gender || '',
            address: data.address || '',
            phone_no: data.phone_no || '',
            course: data.course || '',
            year_of_admission: data.year_of_admission || '',
            current_semester: data.current_semester || '',
          });
          setRoles(data.roles || ['User']);
        }
      } catch (err) {
        setError(err.message);
        console.error("UserProfile: Caught error in fetchUser:", err);
        Swal.fire('Error!', err.message || 'Failed to load user profile.', 'error');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if userId is available and token is present
    if (userId && token) {
        fetchUser();
    } else if (!token) {
        // If token is missing, handle redirection (already done inside fetchUser, but for clarity)
        // This branch might be hit if the component mounts with no token initially
         Swal.fire({
            icon: 'warning',
            title: 'Not Logged In',
            text: 'Please log in to access this page.',
          }).then(() => navigate('/'));
    }
     else if (!userId) {
         setError('User ID is missing from the URL.');
         setLoading(false);
     }

  }, [userId, token, navigate, backendUrl, setToken]);

  // ... rest of your component (handleInputChange, handleSaveProfile, etc.) ...
  // Make sure all your handler functions also check for token and userId if they use them directly

  // Handle input changes for editing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle roles change
  const handleRolesChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setRoles(prev => [...prev, value].filter((v,i,a)=>a.indexOf(v)===i));
    } else {
      setRoles(prev => prev.filter(role => role !== value));
    }
  };

  // Handle saving edited profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!token || !userId) {
        console.error("UserProfile: Cannot save profile, token or userId missing.");
        return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setUser(result.user);
      setIsEditing(false);
      Swal.fire('Success!', 'Profile updated successfully.', 'success');
    } catch (err) {
      console.error("UserProfile: Error updating profile:", err);
      Swal.fire('Error!', err.message || 'Failed to update profile.', 'error');
    }
  };

  // Handle saving roles
  const handleSaveRoles = async () => {
    if (!token || !userId) {
        console.error("UserProfile: Cannot save roles, token or userId missing.");
        return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roles: roles }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setUser(prevUser => ({ ...prevUser, roles: result.user.roles }));
      Swal.fire('Success!', 'User roles updated successfully.', 'success');
    } catch (err) {
      console.error("UserProfile: Error updating roles:", err);
      Swal.fire('Error!', err.message || 'Failed to update roles.', 'error');
    }
  };

  // Handle toggling user block
  const handleToggleBlock = async () => {
    if (!user || !token || !userId) return;
    const currentStatus = user.isBlocked;
    const confirmResult = await Swal.fire({
      title: `Are you sure you want to ${currentStatus ? 'unblock' : 'block'} this user?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `${currentStatus ? 'Unblock' : 'Block'}`,
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (confirmResult.isConfirmed) {
      try {
        const response = await fetch(`${backendUrl}/api/admin/users/${userId}/block`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isBlocked: !currentStatus }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setUser(prevUser => ({ ...prevUser, isBlocked: !currentStatus }));
        Swal.fire('Success!', result.message, 'success');
      } catch (err) {
        console.error("UserProfile: Error toggling block:", err);
        Swal.fire('Error!', err.message || 'Failed to update user status.', 'error');
      }
    }
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!user || !token || !userId) return;
    const confirmResult = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete this user!',
      cancelButtonText: 'Cancel',
    });

    if (confirmResult.isConfirmed) {
      try {
        const response = await fetch(`${backendUrl}/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        await response.json();
        Swal.fire('Deleted!', 'User has been deleted.', 'success');
        navigate('/users');
      } catch (err) {
        console.error("UserProfile: Error deleting user:", err);
        Swal.fire('Error!', err.message || 'Failed to delete user.', 'error');
      }
    }
  };

  // Handle toggling subscription
  const handleToggleSubscription = async () => {
      if (!user || !token || !userId) return;
      const currentStatus = user.isSubscribed;
      const confirmResult = await Swal.fire({
          title: `Are you sure you want to ${currentStatus ? 'unsubscribe' : 'subscribe'} this user?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: currentStatus ? 'Unsubscribe' : 'Subscribe',
          cancelButtonText: 'Cancel',
          reverseButtons: true,
      });

      if (confirmResult.isConfirmed) {
          try {
              const response = await fetch(`${backendUrl}/api/admin/users/${userId}/subscribe`, {
                  method: 'PATCH',
                  headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ isSubscribed: !currentStatus }),
              });

              if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
              }

              const result = await response.json();
              setUser(prevUser => ({ ...prevUser, isSubscribed: !currentStatus }));
              Swal.fire('Success!', result.message, 'success');
          } catch (err) {
              console.error("UserProfile: Error toggling subscription:", err);
              Swal.fire('Error!', err.message || 'Failed to update subscription status.', 'error');
          }
      }
  };


  if (loading) return <div className="text-center p-5" style={styles.container}>Loading user profile...</div>;
  if (error) return <div className="text-center p-5 text-danger" style={styles.container}>Error: {error}</div>;
  // If userId is undefined or invalid, and we've already set an error, this will show the error.
  // If there's no error set but userId is missing, show a specific message.
  if (!userId) return <div className="text-center p-5" style={styles.container}>User ID is missing from the URL.</div>;
  if (!user) return <div className="text-center p-5" style={styles.container}>User data could not be loaded or user not found.</div>;


  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto p-4" style={styles.container}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: styles.highlightColor }}>User Profile</h1>
        <div className="flex space-x-4">
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="flex items-center px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50" style={{ ...styles.buttonInfo, color: currentTheme.buttonTextColor }}>
              <FaUserEdit className="mr-2" /> Edit Profile
            </button>
          )}
          {/* Make sure the path here matches your App.js routing */}
          <Link to="/users" className="flex items-center px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50" style={{ backgroundColor: currentTheme.secondaryButtonBg || '#6c757d', color: currentTheme.buttonTextColor || '#fff' }}>
            Back to Users
          </Link>
        </div>
      </div>

      {!isEditing ? (
        <div className="p-8 rounded-lg shadow-lg border border-gray-200" style={styles.container}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {user.profile_photo ? (
                <img src={user.profile_photo} alt="Profile Photo" className="w-48 h-48 rounded-full object-cover mx-auto mb-4 border-4 border-gray-300 shadow-md" />
              ) : (
                <div className="w-48 h-48 rounded-full bg-gray-300 flex items-center justify-center mx-auto mb-4 border-4 border-gray-300 shadow-md">
                  <FaUserAlt className="text-gray-600 text-6xl" />
                </div>
              )}
              <h2 className="text-3xl font-bold text-center mb-2" style={{ color: styles.highlightColor }}>{user.name || 'Unknown Name'}</h2>
              <p className="text-center text-gray-600 mb-6">{user.email}</p>

              <div className="mb-4 flex items-center text-gray-700" style={styles.container}>
                <FaGraduationCap className="mr-2" style={{ color: styles.highlightColor }} />
                <span className="font-semibold">Course:</span> {user.course || 'N/A'}
              </div>
              <div className="mb-4 flex items-center text-gray-700" style={styles.container}>
                <FaCalendarCheck className="mr-2" style={{ color: styles.highlightColor }} />
                <span className="font-semibold">Year of Admission:</span> {user.year_of_admission || 'N/A'}
              </div>
              <div className="mb-4 flex items-center text-gray-700" style={styles.container}>
                <FaCalendarAlt className="mr-2" style={{ color: styles.highlightColor }} />
                <span className="font-semibold">Date of Birth:</span> {formatDate(user.dob)}
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center text-gray-700" style={styles.container}>
                <FaMapMarkerAlt className="mr-2" style={{ color: styles.highlightColor }} />
                <span className="font-semibold">Address:</span> {user.address || 'N/A'}
              </div>
              <div className="mb-4 flex items-center text-gray-700" style={styles.container}>
                <FaPhone className="mr-2" style={{ color: styles.highlightColor }} />
                <span className="font-semibold">Phone:</span> {user.phone_no || 'N/A'}
              </div>
              <div className="mb-4 flex items-center text-gray-700" style={styles.container}>
                <FaUserAlt className="mr-2" style={{ color: styles.highlightColor }} />
                <span className="font-semibold">Gender:</span> {user.gender || 'N/A'}
              </div>
              <div className="mb-4 flex items-center text-gray-700" style={styles.container}>
                <FaShieldAlt className="mr-2" style={{ color: styles.highlightColor }} />
                <span className="font-semibold">Student ID:</span> {user.student_id || 'N/A'}
              </div>
               <div className="mb-4 flex items-center text-gray-700" style={styles.container}>
                <FaCalendarAlt className="mr-2" style={{ color: styles.highlightColor }} />
                <span className="font-semibold">Current Semester:</span> {user.current_semester || 'N/A'}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200" style={{ borderColor: styles.container.borderColor }}>
                <h3 className="text-xl font-semibold mb-3" style={{ color: styles.highlightColor }}>Admin Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleToggleBlock}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium`}
                    style={user.isBlocked ? styles.buttonWarning : styles.buttonPrimary}
                  >
                    {user.isBlocked ? <><FaShieldAlt className="mr-1" /> Unblock </> : <><FaShieldAlt className="mr-1" /> Block </>}
                  </button>

                  <button
                    onClick={handleToggleSubscription}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium`}
                    style={user.isSubscribed ? styles.buttonInfo : styles.buttonSecondary}
                  >
                    {user.isSubscribed ? <><FaBell className="mr-1" /> Unsubscribe User </> : <><FaBell className="mr-1" /> Subscribe User </>}
                  </button>

                  <button
                    onClick={handleDeleteUser}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium"
                    style={styles.buttonDanger}
                  >
                    <FaTrash className="mr-1" /> Delete User
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200" style={{ borderColor: styles.container.borderColor }}>
                 <h3 className="text-xl font-semibold mb-3" style={{ color: styles.highlightColor }}>Manage Roles</h3>
                 <div className="flex flex-wrap gap-4 items-center">
                    <div>
                        <label className="inline-flex items-center mr-4">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5"
                                style={{ color: styles.highlightColor, accentColor: styles.highlightColor }}
                                value="Admin"
                                checked={roles.includes('Admin')}
                                onChange={handleRolesChange}
                            />
                            <span className="ml-2 text-gray-700" style={styles.container}>Admin</span>
                        </label>
                        <label className="inline-flex items-center mr-4">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5"
                                style={{ color: styles.highlightColor, accentColor: styles.highlightColor }}
                                value="User"
                                checked={roles.includes('User')}
                                onChange={handleRolesChange}
                            />
                            <span className="ml-2 text-gray-700" style={styles.container}>User</span>
                        </label>
                        {/* Add other roles if they exist */}
                    </div>
                    <button
                        onClick={handleSaveRoles}
                        className="px-4 py-2 rounded-md text-sm font-medium"
                        style={styles.buttonSuccess}
                    >
                        Save Roles
                    </button>
                 </div>
              </div>

            </div>
          </div>
        </div>
      ) : (
        // Edit Form
        <div className="p-8 rounded-lg shadow-lg border border-gray-200" style={styles.container}>
          <h2 className="text-3xl font-bold mb-6" style={{ color: styles.highlightColor }}>Edit User Profile</h2>
          <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} required className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2" style={styles.input} />
              </div>
            </div>
            <div>
              <label htmlFor="student_id" className="block text-sm font-medium text-gray-700">Student ID</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input type="text" name="student_id" id="student_id" value={formData.student_id} onChange={handleInputChange} required className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2" style={styles.input} />
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} disabled className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2" style={styles.disabledInput} />
              </div>
            </div>
            <div>
              <label htmlFor="phone_no" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input type="text" name="phone_no" id="phone_no" value={formData.phone_no} onChange={handleInputChange} className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2" style={styles.input} />
              </div>
            </div>

            {/* Academic Info */}
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700">Course</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input type="text" name="course" id="course" value={formData.course} onChange={handleInputChange} className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2" style={styles.input} />
              </div>
            </div>
            <div>
              <label htmlFor="year_of_admission" className="block text-sm font-medium text-gray-700">Year of Admission</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input type="number" name="year_of_admission" id="year_of_admission" value={formData.year_of_admission} onChange={handleInputChange} className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2" style={styles.input} />
              </div>
            </div>
            <div>
              <label htmlFor="current_semester" className="block text-sm font-medium text-gray-700">Current Semester</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input type="number" name="current_semester" id="current_semester" value={formData.current_semester} onChange={handleInputChange} className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2" style={styles.input} />
              </div>
            </div>

            {/* Personal Info */}
             <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input type="date" name="dob" id="dob" value={formData.dob} onChange={handleInputChange} className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2" style={styles.input} />
              </div>
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <select name="gender" id="gender" value={formData.gender} onChange={handleInputChange} className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2" style={styles.input}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <textarea name="address" id="address" rows="3" value={formData.address} onChange={handleInputChange} className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2" style={styles.input}></textarea>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 flex justify-end space-x-4">
              <button type="button" onClick={() => { setIsEditing(false); setFormData({}); }} className="px-6 py-2 rounded-md font-medium" style={styles.buttonSecondary}>
                Cancel
              </button>
              <button type="submit" className="px-6 py-2 rounded-md font-medium" style={styles.buttonSuccess}>
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserProfile;