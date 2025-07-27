// src/pages/AllOrganizers.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AdminContext } from '../context/AdminContext'; // Adjust path as needed

// SVG Icons (for simplicity, typically imported from an icon library)
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-blue-400 hover:text-blue-500 cursor-pointer"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-yellow-400 hover:text-yellow-500 cursor-pointer"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const UnlockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-cyan-400 hover:text-cyan-500 cursor-pointer"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
    />
  </svg>
);

const DeleteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-red-400 hover:text-red-500 cursor-pointer"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const ChevronLeftIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = ({ className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);


const AllOrganizers = () => {
  const { token, backendUrl } = useContext(AdminContext);

  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [currentOrganizer, setCurrentOrganizer] = useState(null); // Always editing when modal opens from table

  // Form state for update (removed password for edit modal)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    regNo: '',
    phone: '',
    age: '',
    department: '',
    post: '',
    gender: '',
    course: '',
    year: '',
    address: '',
    skills: '', // Comma-separated string
    bio: '',
    photo: null, // File object for upload
    photoUrlPreview: '', // For displaying image preview
  });

  // --- Fetch Organizers ---
  const fetchOrganizers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/organizer/all`, { // Check backend route: /organizers/all or /api/organizer/all
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setOrganizers(data);
    } catch (err) {
      console.error('Error fetching organizers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && backendUrl) {
      fetchOrganizers();
    }
  }, [token, backendUrl]);

  // --- Form Handling ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrlPreview: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, photo: null, photoUrlPreview: '' }));
    }
  };

  // --- Modal Open/Close ---
  const handleOpenEditModal = (organizer) => {
    setCurrentOrganizer(organizer);
    setFormData({
      name: organizer.name || '',
      email: organizer.email || '',
      regNo: organizer.regNo || '',
      phone: organizer.phone || '',
      age: organizer.age || '',
      department: organizer.department || '',
      post: organizer.post || '',
      gender: organizer.gender || '',
      course: organizer.course || '',
      year: organizer.year || '',
      address: organizer.address || '',
      skills: (organizer.skills && Array.isArray(organizer.skills)) ? organizer.skills.join(', ') : (organizer.skills || ''), // Handle array or string skills
      bio: organizer.bio || '',
      photo: null,
      photoUrlPreview: organizer.photoUrl || '',
    });
    setError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentOrganizer(null);
    setFormData({ // Reset form to initial empty state
      name: '', email: '', regNo: '', phone: '', age: '', department: '',
      post: '', gender: '', course: '', year: '', address: '', skills: '', bio: '',
      photo: null, photoUrlPreview: ''
    });
    setError(null);
  };

  // --- Submit Form (Update) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const url = `${backendUrl}/api/organizer/update/${currentOrganizer._id}`; // Check backend route: /organizers/update/:id or /api/organizer/update/:id
    const method = 'PUT';

    const data = new FormData();
    // Append all form data fields
    Object.keys(formData).forEach(key => {
      if (key !== 'photo' && key !== 'photoUrlPreview') {
        data.append(key, formData[key]);
      }
    });
    // Append the photo file if a new one is selected
    if (formData.photo) {
      data.append('image', formData.photo); // 'image' because backend expects upload.single('image')
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      await fetchOrganizers(); // Re-fetch to get the latest data after mutation
      handleCloseModal();
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Delete Organizer ---
  const handleDeleteOrganizer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this organizer? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/organizer/delete/${id}`, { // Check backend route: /organizers/delete/:id or /api/organizer/delete/:id
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setOrganizers(prev => prev.filter(org => org._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Block/Unblock Organizer ---
  const handleToggleBlock = async (organizerId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/organizer/block/${organizerId}`, { // Check backend route: /organizers/block/:id or /api/organizer/block/:id
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const updatedData = await response.json();
      setOrganizers(prev =>
        prev.map(org =>
          org._id === organizerId ? { ...org, isBlocked: updatedData.isBlocked } : org
        )
      );
    } catch (err) {
      console.error('Block/Unblock error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter organizers based on search term (frontend filtering)
  const filteredOrganizers = organizers.filter(organizer =>
    organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    organizer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Render Logic for Initial Load/Error/No Context ---
  if (!token || !backendUrl) {
    return (
      <div className="p-5 max-w-6xl mx-auto my-5 bg-gray-700 rounded-xl shadow-xl min-h-[500px] flex items-center justify-center">
        <p className="text-red-300 text-center text-lg">
          Please log in as an admin or ensure backend URL is configured.
        </p>
      </div>
    );
  }
  if (loading && organizers.length === 0) {
    return (
      <div className="p-5 max-w-6xl mx-auto my-5 bg-gray-700 rounded-xl shadow-xl min-h-[500px] flex items-center justify-center">
        <p className="text-white text-center text-lg">Loading organizers...</p>
      </div>
    );
  }
  if (error && !organizers.length) {
    return (
      <div className="p-5 max-w-6xl mx-auto my-5 bg-gray-700 rounded-xl shadow-xl min-h-[500px] flex items-center justify-center">
        <p className="text-red-500 text-center font-bold text-lg">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto my-8 bg-gray-800 rounded-xl shadow-xl text-white">
      {/* Header and Search Bar */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Manage Organizers</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="pl-10 pr-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </div>
        </div>
      </div>

      {error && <p className="text-red-400 font-bold text-center mt-4 mb-4">{error}</p>}
      {loading && organizers.length > 0 && <p className="text-gray-400 text-center mt-4">Updating data...</p>}

      {filteredOrganizers.length === 0 && !loading ? (
        <p className="text-center text-gray-400 mt-5">No organizers found matching your search.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full bg-gray-700">
            <thead className="bg-gray-600 text-gray-300 uppercase text-sm">
              <tr>
                <th className="px-4 py-3 text-left">
                  <div className="flex items-center">
                    ORGANIZER
                    {/* Add sorting icon here if needed */}
                    {/* <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg> */}
                  </div>
                </th>
                <th className="px-4 py-3 text-left">ROLE / DEPT</th>
                <th className="px-4 py-3 text-left">
                  <div className="flex items-center">
                    STATUS
                    {/* <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg> */}
                  </div>
                </th>
                <th className="px-4 py-3 text-left">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrganizers.map(organizer => (
                <tr key={organizer._id} className="border-b border-gray-600 even:bg-gray-700 hover:bg-gray-600">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      {organizer.photoUrl ? (
                        <img
                          src={organizer.photoUrl}
                          alt={organizer.name}
                          className="w-12 h-12 object-cover rounded-full border-2 border-gray-500"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center text-xs text-gray-300 text-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-lg text-gray-100">{organizer.name}</div>
                        <div className="text-sm text-gray-400">{organizer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-100">{organizer.course}</div>
                    <div className="text-sm text-gray-400">{organizer.department}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        organizer.isBlocked ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                      }`}
                    >
                      {organizer.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap space-x-3">
                    <button onClick={() => handleOpenEditModal(organizer)} title="Edit">
                      <EditIcon />
                    </button>
                    <button onClick={() => handleToggleBlock(organizer._id)} title={organizer.isBlocked ? 'Unblock' : 'Block'}>
                      {organizer.isBlocked ? <UnlockIcon /> : <LockIcon />}
                    </button>
                    <button onClick={() => handleDeleteOrganizer(organizer._id)} title="Delete">
                      <DeleteIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination (Visual only for "Page 1 of 1" based on screenshot) */}
      <div className="flex justify-between items-center mt-6 text-sm text-gray-400">
        <span>Page 1 of 1</span>
        <div className="flex space-x-2">
          <button className="p-2 rounded-md bg-gray-700 text-gray-400 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
            <ChevronLeftIcon />
          </button>
          <button className="p-2 rounded-md bg-gray-700 text-gray-400 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      {/* Modal for Update (Create is removed from this specific UI) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-lg w-11/12 max-w-2xl relative">
            <h3 className="text-2xl font-semibold text-gray-800 text-center mb-6">
              Edit Organizer Profile
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                {/* Row 1: Name, Email */}
                <div>
                  <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
                    required
                  />
                </div>

                {/* Row 2: Reg. No, Phone */}
                <div>
                  <label htmlFor="regNo" className="block text-gray-700 text-sm font-medium mb-1">
                    Reg. No
                  </label>
                  <input
                    type="text"
                    id="regNo"
                    name="regNo"
                    value={formData.regNo}
                    onChange={handleFormChange}
                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-gray-700 text-sm font-medium mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
                  />
                </div>

                {/* Row 3: Age, Department */}
                <div>
                  <label htmlFor="age" className="block text-gray-700 text-sm font-medium mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleFormChange}
                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
                  />
                </div>
                <div>
                  <label htmlFor="department" className="block text-gray-700 text-sm font-medium mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleFormChange}
                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
                  />
                </div>

                {/* Row 4: Post, Gender (Dropdowns) */}
                <div>
                  <label htmlFor="post" className="block text-gray-700 text-sm font-medium mb-1">
                    Post
                  </label>
                  <select
                    id="post"
                    name="post"
                    value={formData.post}
                    onChange={handleFormChange}
                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 bg-white"
                  >
                    <option value="">Select Post</option>
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Staff">Staff</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="gender" className="block text-gray-700 text-sm font-medium mb-1">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleFormChange}
                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 bg-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Row 5: Course, Year */}
                <div>
                  <label htmlFor="course" className="block text-gray-700 text-sm font-medium mb-1">
                    Course
                  </label>
                  <input
                    type="text"
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleFormChange}
                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
                  />
                </div>
                <div>
                  <label htmlFor="year" className="block text-gray-700 text-sm font-medium mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleFormChange}
                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
                  />
                </div>

                {/* Row 6: Address (full width) */}
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-gray-700 text-sm font-medium mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
                  />
                </div>

                {/* Row 7: Skills (full width) */}
                <div className="md:col-span-2">
                  <label htmlFor="skills" className="block text-gray-700 text-sm font-medium mb-1">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleFormChange}
                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
                    placeholder="e.g., Leadership, Event Planning, Communication"
                  />
                </div>

                {/* Row 8: Bio (full width, textarea) */}
                <div className="md:col-span-2">
                  <label htmlFor="bio" className="block text-gray-700 text-sm font-medium mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleFormChange}
                    rows="3"
                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 resize-y"
                  ></textarea>
                </div>

                {/* Profile Image (full width) */}
                <div className="md:col-span-2 flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {formData.photoUrlPreview || (currentOrganizer?.photoUrl && !formData.photo) ? (
                      <img
                        src={formData.photoUrlPreview || currentOrganizer.photoUrl}
                        alt="Profile Preview"
                        className="w-20 h-20 object-cover rounded-full border border-gray-300"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border border-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="photo" className="sr-only">Change Image</label>
                    <input
                      type="file"
                      id="photo"
                      name="photo"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden" // Hide default file input
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('photo').click()}
                      className="py-2 px-4 bg-gray-700 text-white text-sm rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200 ease-in-out"
                    >
                      Change Image
                    </button>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-500 text-center text-sm mb-4">{error}</p>}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="py-2 px-4 bg-gray-500 text-white rounded-md font-semibold hover:bg-gray-600 transition-colors duration-200 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="py-2 px-4 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors duration-200 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllOrganizers;