import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { FaUserAlt, FaShieldAlt, FaTrash, FaEye, FaEdit } from 'react-icons/fa'; // Added more icons

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { token, setToken, backendUrl } = useContext(AdminContext);
  const { currentTheme } = useTheme();

  // --- Enhanced Styles based on Theme ---
  const styles = {
    container: {
      backgroundColor: currentTheme.backgroundColor || '#ffffff',
      color: currentTheme.textColor || '#333',
      minHeight: '100vh',
      padding: '1.5rem 1rem', // Responsive padding
    },
    header: {
      color: currentTheme.highlightColor || '#007bff',
      fontSize: '1.875rem', // text-2xl
      fontWeight: 'bold',
      marginBottom: '1rem', // mb-4
    },
    tableContainer: {
      overflowX: 'auto',
      borderRadius: '0.5rem', // rounded-lg
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // shadow-md
      borderColor: currentTheme.borderColor || '#ddd',
    },
    tableHeader: {
      backgroundColor: currentTheme.tableHeaderColor || '#f8f9fa',
      color: currentTheme.textColor || '#333',
      borderBottom: `1px solid ${currentTheme.borderColor || '#ddd'}`,
    },
    tableCell: {
      borderColor: currentTheme.borderColor || '#ddd',
    },
    actionButton: {
      padding: '0.375rem 0.75rem', // px-3 py-1.5
      fontSize: '0.875rem', // text-sm
      fontWeight: 'medium',
      borderRadius: '0.25rem', // rounded
      transition: 'background-color 0.2s ease',
    },
    statusBadge: {
      padding: '0.375rem 0.75rem', // px-3 py-1.5
      fontSize: '0.8125rem', // text-xs
      borderRadius: '9999px', // rounded-full
      fontWeight: '600', // font-semibold
    },
    activeStatus: {
      backgroundColor: currentTheme.activeBg || '#d1fae5', // green-100
      color: currentTheme.activeColor || '#065f46',       // green-800
    },
    blockedStatus: {
      backgroundColor: currentTheme.blockedBg || '#fee2e2', // red-100
      color: currentTheme.blockedColor || '#7f1d1d',       // red-800
    },
    // Dynamically set button colors from theme or fallbacks
    blockButton: {
      ...{
        backgroundColor: currentTheme.blockButtonBg || '#28a745',
        color: currentTheme.buttonTextColor || '#fff',
      },
      ...{
        ':hover': {
          backgroundColor: currentTheme.blockButtonHoverBg || '#218838',
        },
      },
    },
    unblockButton: {
      ...{
        backgroundColor: currentTheme.unblockButtonBg || '#ffc107',
        color: currentTheme.buttonTextColor || '#333',
      },
      ...{
        ':hover': {
          backgroundColor: currentTheme.unblockButtonHoverBg || '#e0a800',
        },
      },
    },
    deleteButton: {
      ...{
        backgroundColor: currentTheme.deleteButtonBg || '#dc3545',
        color: currentTheme.buttonTextColor || '#fff',
      },
      ...{
        ':hover': {
          backgroundColor: currentTheme.deleteButtonHoverBg || '#c82333',
        },
      },
    },
    viewButton: {
      color: currentTheme.viewLinkColor || '#007bff',
      padding: '0.375rem 0.75rem',
      fontSize: '0.875rem',
      fontWeight: 'medium',
      transition: 'color 0.2s ease',
    },
    editButton: {
      color: currentTheme.editLinkColor || '#17a2b8',
      padding: '0.375rem 0.75rem',
      fontSize: '0.875rem',
      fontWeight: 'medium',
      transition: 'color 0.2s ease',
    },
    profilePic: {
      width: '40px',
      height: '40px',
      borderRadius: '9999px', // rounded-full
      objectFit: 'cover',
      marginRight: '0.75rem', // mr-3
      backgroundColor: currentTheme.hoverBackgroundColor || '#f0f0f0', // Fallback for missing image
    },
    noUsersMessage: {
      textAlign: 'center',
      padding: '2rem 0', // py-8
      color: currentTheme.textColor || '#333',
    },
    loadingMessage: {
      textAlign: 'center',
      padding: '3rem 0', // py-12
      color: currentTheme.textColor || '#333',
    },
    errorMessage: {
      textAlign: 'center',
      padding: '3rem 0', // py-12
      color: 'red', // Standard error color
    },
  };

  // Fetch all users when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      // --- Authentication and Authorization Checks ---
      if (!token) {
        Swal.fire({
          icon: 'warning',
          title: 'Not Logged In',
          text: 'Please log in to access this page.',
          confirmButtonColor: currentTheme.highlightColor || '#007bff',
        }).then(() => navigate('/')); // Adjust login route if different
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${backendUrl}/api/admin/users`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          let errorMsg = `HTTP error! Status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
          } catch (e) { /* ignore if response is not JSON */ }

          if (response.status === 401 || response.status === 403) {
            Swal.fire({
              icon: 'error',
              title: 'Access Denied',
              text: errorMsg,
              confirmButtonColor: currentTheme.highlightColor || '#007bff',
            }).then(() => {
              setToken(null);
              navigate('/');
            });
          } else {
            setError(errorMsg);
            Swal.fire({
              icon: 'error',
              title: 'Failed to Load Users',
              text: errorMsg,
              confirmButtonColor: currentTheme.highlightColor || '#007bff',
            });
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        const errorMessage = err.message || 'An unknown error occurred.';
        setError(errorMessage);
        console.error("Error fetching users:", err);
        Swal.fire({
          icon: 'error',
          title: 'Fetch Error',
          text: `Could not load users: ${errorMessage}`,
          confirmButtonColor: currentTheme.highlightColor || '#007bff',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, navigate, backendUrl, setToken, currentTheme.highlightColor]); // Added currentTheme.highlightColor as dependency

  // --- Handlers for Actions ---

  const handleToggleBlock = async (userId, currentStatus) => {
    if (!token) return;

    const confirmResult = await Swal.fire({
      title: `Are you sure you want to ${currentStatus ? 'unblock' : 'block'} this user?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: currentStatus ? 'Unblock' : 'Block',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      confirmButtonColor: currentTheme.highlightColor || '#007bff',
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
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        Swal.fire('Success!', result.message, 'success');
        // Optimistically update the state
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId ? { ...user, isBlocked: !currentStatus } : user
          )
        );
      } catch (err) {
        console.error("Error toggling block:", err);
        Swal.fire('Error!', err.message || 'Failed to update user status.', 'error');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!token) return;

    const confirmResult = await Swal.fire({
      title: 'Are you sure you want to delete this user?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: currentTheme.deleteButtonBg || '#dc3545',
      cancelButtonColor: currentTheme.borderColor || '#007bff',
      confirmButtonText: 'Yes, delete!',
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
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        Swal.fire('Deleted!', result.message, 'success');
        // Remove the user from the state
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      } catch (err) {
        console.error("Error deleting user:", err);
        Swal.fire('Error!', err.message || 'Failed to delete user.', 'error');
      }
    }
  };

  // --- Rendering Logic ---

  if (loading) {
    return <div style={styles.loadingMessage}>Loading users...</div>;
  }

  if (error) {
    return <div style={styles.errorMessage}>Error: {error}</div>;
  }

  return (
    <div style={styles.container}>
      <div className="flex justify-between items-center mb-6">
        <h1 style={styles.header}>All Users</h1>
        {/* Optional: Add a button to navigate to a 'Create User' page if that exists */}
      </div>

      {users.length === 0 ? (
        <div style={styles.noUsersMessage}>
          <p>No users found. Add some users to see them here!</p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table className="min-w-full" style={{ borderColor: styles.tableContainer.borderColor }}>
            <thead style={styles.tableHeader}>
              <tr>
                <th scope="col" className="py-3 px-4 text-left" style={{ ...styles.tableHeader, ...styles.tableCell }}>
                  Profile
                </th>
                <th scope="col" className="py-3 px-4 text-left" style={{ ...styles.tableHeader, ...styles.tableCell }}>
                  Name
                </th>
                <th scope="col" className="py-3 px-4 text-left" style={{ ...styles.tableHeader, ...styles.tableCell }}>
                  Student ID
                </th>
                <th scope="col" className="py-3 px-4 text-left" style={{ ...styles.tableHeader, ...styles.tableCell }}>
                  Email
                </th>
                <th scope="col" className="py-3 px-4 text-left" style={{ ...styles.tableHeader, ...styles.tableCell }}>
                  Course
                </th>
                <th scope="col" className="py-3 px-4 text-left" style={{ ...styles.tableHeader, ...styles.tableCell }}>
                  Status
                </th>
                <th scope="col" className="py-3 px-4 text-left" style={{ ...styles.tableHeader, ...styles.tableCell }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" style={{ borderBottom: `1px solid ${styles.tableCell.borderColor}`, backgroundColor: styles.container.backgroundColor }}>
                  <td className="py-3 px-4" style={styles.tableCell}>
                    {user.profile_photo ? (
                      <img
                        src={user.profile_photo}
                        alt={`${user.name}'s profile`}
                        style={styles.profilePic}
                        className="object-cover"
                      />
                    ) : (
                      <div
                        className="flex items-center justify-center"
                        style={{ ...styles.profilePic, backgroundColor: currentTheme.hoverBackgroundColor || '#f0f0f0' }}
                      >
                        <FaUserAlt className="text-xl" style={{ color: currentTheme.textColor || '#333' }} />
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4" style={styles.tableCell}>{user.name || 'N/A'}</td>
                  <td className="py-3 px-4" style={styles.tableCell}>{user.student_id || 'N/A'}</td>
                  <td className="py-3 px-4" style={styles.tableCell}>{user.email}</td>
                  <td className="py-3 px-4" style={styles.tableCell}>{user.course || 'N/A'}</td>
                  <td className="py-3 px-4" style={styles.tableCell}>
                    <span
                      className="inline-flex items-center"
                      style={{
                        ...styles.statusBadge,
                        ...(user.isBlocked ? styles.blockedStatus : styles.activeStatus),
                      }}
                    >
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex items-center space-x-2" style={styles.tableCell}>
                    {/* View Button */}
                    <Link to={`/users/${user._id}`} className="flex items-center" style={styles.viewButton}>
                      <FaEye className="mr-1" /> View
                    </Link>
                    {/* Block/Unblock Button */}
                    <button
                      onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                      className="flex items-center"
                      style={{
                        ...styles.actionButton,
                        ...(user.isBlocked ? styles.unblockButton : styles.blockButton),
                      }}
                    >
                      {user.isBlocked ? <><FaShieldAlt className="mr-1" /> Unblock </> : <><FaShieldAlt className="mr-1" /> Block </>}
                    </button>
                    {/* Edit Button (example, you'd link to edit page) */}
                    <Link
                        to={`/users/${user._id}/edit`} // Assuming an edit route exists
                        className="flex items-center"
                        style={styles.editButton}
                        onClick={(e) => { /* Optional: Prevent navigation if it's a confirmation step */ }}
                    >
                        <FaEdit className="mr-1"/> Edit
                    </Link>
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="flex items-center"
                      style={{ ...styles.actionButton, ...styles.deleteButton }}
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllUsers;