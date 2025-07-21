// Sidebar.jsx
import React, { useContext, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
  const { currentTheme } = useTheme();

  // Access all tokens from AdminContext for role determination
  const {
    token: adminToken, // This is the token used to identify Admins
    dtoken: doctorToken, // Assuming this is for Doctors
    staffToken, // Assuming this is for Staff
    setToken, // For logout if needed within Sidebar, but typically handled elsewhere
    setDtoken,
    setStaffToken,
    profileData, // Assuming this holds staff role info
    isLoadingProfile,
    profileError,
    getProfileData, // Function to fetch staff profile
  } = useContext(AdminContext);

  // --- Determine User Role ---
  // Re-using the isAdmin logic from the Navbar example for clarity
  const isAdmin = !!adminToken && !doctorToken && !staffToken;
  // Determine if any user is logged in
  const isLoggedIn = !!(adminToken || doctorToken || staffToken);

  // --- Fetch profile data when needed (only for Staff role) ---
  useEffect(() => {
    // Fetch staff profile ONLY if the user is staff, profile isn't loaded,
    // it's not currently loading, and there was no previous error.
    if (staffToken && !profileData && !isLoadingProfile && !profileError) {
      console.log("Sidebar: Fetching staff profile data...");
      getProfileData();
    }
  }, [staffToken, profileData, getProfileData, isLoadingProfile, profileError]);

  // --- Link Definitions for ADMIN role ONLY ---
  const adminLinks = [
    { to: '/admin-dashboard', icon: assets.home_icon, label: 'Dashboard' },
    { to: '/users', icon: assets.appointment_icon, label: 'allUsers' }, 
    { to: '/inquiries', icon: assets.add_icon, label: 'inquiries' },
    { to: '/event-requests', icon: assets.add_icon, label: 'event requests' },
    { to: '/create-event', icon: assets.people_icon, label: 'create event' },
    { to: '/applications', icon: assets.list_icon, label: 'applications List' },
    { to: '/notices/create', icon: assets.list_icon, label: 'notices create' },
    { to: '/notices', icon: assets.list_icon, label: 'All notices' },
    { to: '/AllUser', icon: assets.list_icon, label: 'User' },
  ];

  // --- Link Rendering Function ---
  const renderLinks = (links) => (
    <ul className="space-y-1.5 mt-4 relative">
      {links.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            // Applying theme colors to NavLink styles
            style={({ isActive }) => ({
              color: isActive ? '#FFFFFF' : currentTheme.textColor, // Highlight active link with white, otherwise use theme text color
              backgroundColor: isActive ? currentTheme.accentColor ? `hsl(${currentTheme.accentColor.replace('hsl(','').replace(')','')}, 0.6)` : '#60A5FA' // Example accent color, adjust if theme provides it
                                : currentTheme.sidebarBgColor,
              // If you need a dynamic border color or specific hover effects, add them here
              // For example:
              // borderColor: isActive ? currentTheme.accentColor ? `hsl(${currentTheme.accentColor.replace('hsl(','').replace(')','')})` : '#3B82F6' : 'transparent',
              // borderWidth: isActive ? '4px' : '0px',
              // borderRightWidth: isActive ? '4px' : '0px',
              // borderRightStyle: isActive ? 'solid' : 'none',
              // color: isActive ? 'white' : currentTheme.textColor, // For active link text
            })}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 w-full rounded-md transition-all duration-200 ease-in-out group relative ${
                isActive
                  ? `font-semibold text-white shadow-inner` // Simplified active styles, adjust if needed
                  : `hover:bg-black/10 dark:hover:bg-white/10`
              }`
            }
            title={item.label}
          >
            <img
              className="w-5 h-5 flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
              src={item.icon}
              alt=""
              role="img"
              aria-hidden="true"
            />
            <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              {item.label}
            </span>
          </NavLink>
        </li>
      ))}
    </ul>
  );

  // --- Determine what to display ---
  const showSidebarContent = isAdmin; // Sidebar content is ONLY shown if isAdmin is true

  return (
    <aside
      className={`w-60 h-screen fixed top-0 left-0 flex flex-col shadow-lg dark:shadow-gray-900/50 transition-colors duration-300 z-40 border-r border-gray-200 dark:border-gray-700 ${!showSidebarContent ? 'hidden' : ''}`}
      style={{ backgroundColor: currentTheme.sidebarBgColor }}
      aria-label="Admin Navigation"
    >
      {showSidebarContent ? ( // Only render the content if the user is an Admin
        <>
          <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 text-center">
            {/* Logo and Title */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <img
                src={assets.logo || '/logo.png'} // Fallback to a generic logo if not found
                alt="Logo"
                className="w-16"
              />
              <span style={{ color: currentTheme.textColor }} className="font-bold text-xl">YourApp</span>
            </div>
            {/* User Role Display */}
            <span style={{ color: currentTheme.textColor }} className="block text-xs opacity-70 mt-1">Admin Panel</span>
          </div>

          {/* Render Admin Links if they exist */}
          {adminLinks.length > 0 ? (
            <div className="px-3 py-4 flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent pb-10">
              {renderLinks(adminLinks)}
            </div>
          ) : (
            // Message if no admin links are defined (shouldn't happen if adminLinks is populated)
            <div className="px-3 py-4 flex-grow">
              <p className="p-4 text-center text-xs" style={{ color: currentTheme.textColor }}>No admin links available.</p>
            </div>
          )}
        </>
      ) : (
        // --- Content to show if NOT an admin ---
        // Since the requirement is "only admin, rest remove", this part will be hidden
        // because the parent <aside> has `hidden` class if !showSidebarContent.
        // However, if you wanted to show a different message or a very minimal sidebar
        // for non-admins, you would put it here.
        // For now, we rely on the parent `hidden` class.
        null
      )}
    </aside>
  );
};

export default Sidebar;