// src/pages/OrganizerDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AdminContext } from '../../context/AdminContext'; // For logout functionality
import { 
  FaTachometerAlt, 
  FaCalendarAlt, 
  FaUserCog, 
  FaSignOutAlt, 
  FaClipboardList, 
  FaChalkboardTeacher, 
  FaUsers,
  FaChartLine
} from 'react-icons/fa';

// Placeholder for the user's avatar if no photoUrl is available
const defaultAvatar = "https://i.pravatar.cc/150?u=a042581f4e29026704d";

// --- Main Dashboard Component ---
const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const { setToken } = useContext(AdminContext);
  const [organizer, setOrganizer] = useState(null);

  // Effect to load organizer data from localStorage on component mount
  useEffect(() => {
    const organizerData = localStorage.getItem('organizerData');
    if (organizerData) {
      setOrganizer(JSON.parse(organizerData));
    } else {
      // If no data, user is not logged in properly. Redirect.
      toast.error("Authentication error. Please log in.");
      navigate('../'); 
    }
  }, [navigate]);

  const handleLogout = () => {
    // Clear all session-related data
    localStorage.removeItem('organizer');
    localStorage.removeItem('userType');
    localStorage.removeItem('organizerData');
    setToken(null); // Update context
    toast.success("You have been logged out successfully.");
    navigate('/admin-login'); // Redirect to the unified login page
  };

  // Show a loading state while fetching data
  if (!organizer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg font-semibold">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* --- Sidebar Navigation --- */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 border-b text-center">
          <img 
            src={organizer.photoUrl || defaultAvatar} 
            alt="Organizer Avatar"
            className="w-24 h-24 rounded-full mx-auto border-4 border-green-400" 
          />
          <h3 className="mt-4 text-xl font-semibold text-gray-800">{organizer.name}</h3>
          <p className="text-sm text-gray-500">{organizer.email}</p>
          <span className="mt-2 inline-block bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize">
            {organizer.post}
          </span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <a href="#" className="flex items-center px-4 py-2 text-gray-700 bg-gray-200 rounded-md">
            <FaTachometerAlt className="mr-3" /> Dashboard
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-md">
            <FaCalendarAlt className="mr-3" /> Manage Events
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-md">
            <FaUserCog className="mr-3" /> Profile Settings
          </a>
        </nav>
        <div className="p-4 border-t">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center px-4 py-2 text-red-600 hover:bg-red-100 rounded-md"
          >
            <FaSignOutAlt className="mr-3" /> Logout
          </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 p-6 md:p-10">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Welcome, {organizer.name}!</h1>
          <p className="text-gray-600 mt-1">Here's what's happening today.</p>
        </header>
        
        {/* --- Conditional Rendering Based on Organizer's Post --- */}
        <div>
          {organizer.post === 'student' && <StudentOrganizerView />}
          {organizer.post === 'staff' && <StaffOrganizerView />}
          
          {/* A fallback view if post is neither 'student' nor 'staff' */}
          {organizer.post !== 'student' && organizer.post !== 'staff' && (
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="text-xl font-semibold">General Dashboard</h2>
              <p>Your dashboard view is not yet configured.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// --- View for "Student" Organizers ---
const StudentOrganizerView = () => (
  <div>
    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Student Organizer Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Card 1: My Events */}
      <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow">
        <FaCalendarAlt className="text-3xl text-blue-500 mb-4" />
        <h3 className="text-xl font-bold">My Events</h3>
        <p className="text-gray-600 mt-2">View and manage the events you have created.</p>
        <button className="mt-4 text-blue-500 font-semibold">Go to My Events →</button>
      </div>
      {/* Card 2: Participants */}
      <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow">
        <FaUsers className="text-3xl text-green-500 mb-4" />
        <h3 className="text-xl font-bold">Participants</h3>
        <p className="text-gray-600 mt-2">See who has registered for your events.</p>
        <button className="mt-4 text-green-500 font-semibold">View Participants →</button>
      </div>
      {/* Card 3: Create New Event */}
      <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow">
        <FaClipboardList className="text-3xl text-purple-500 mb-4" />
        <h3 className="text-xl font-bold">Create New Event</h3>
        <p className="text-gray-600 mt-2">Start planning your next successful event.</p>
        <button className="mt-4 text-purple-500 font-semibold">Create Now →</button>
      </div>
    </div>
  </div>
);

// --- View for "Staff" Organizers ---
const StaffOrganizerView = () => (
  <div>
    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Staff Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Card 1: Overall Analytics */}
      <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow">
        <FaChartLine className="text-3xl text-indigo-500 mb-4" />
        <h3 className="text-xl font-bold">Overall Analytics</h3>
        <p className="text-gray-600 mt-2">View analytics for all events across the organization.</p>
        <button className="mt-4 text-indigo-500 font-semibold">View Analytics →</button>
      </div>
      {/* Card 2: Approve Events */}
      <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow">
        <FaChalkboardTeacher className="text-3xl text-red-500 mb-4" />
        <h3 className="text-xl font-bold">Event Approvals</h3>
        <p className="text-gray-600 mt-2">Review and approve new event submissions from students.</p>
        <button className="mt-4 text-red-500 font-semibold">Review Submissions →</button>
      </div>
      {/* Card 3: Manage Organizers */}
      <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow">
        <FaUsers className="text-3xl text-yellow-500 mb-4" />
        <h3 className="text-xl font-bold">Manage Organizers</h3>
        <p className="text-gray-600 mt-2">View and manage all student organizers.</p>
        <button className="mt-4 text-yellow-500 font-semibold">Go to Organizer List →</button>
      </div>
    </div>
  </div>
);

export default OrganizerDashboard;