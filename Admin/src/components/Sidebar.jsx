// Sidebar.jsx
import React, { useState, useContext, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { assets } from '../assets/assets';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';

// Chevron icon component
const ChevronIcon = ({ isOpen }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const Sidebar = () => {
  const { currentTheme } = useTheme();
  const location = useLocation();

  const {
    token: adminToken,
    dtoken: doctorToken,
    organizer: organizerToken,
    staffToken,
    profileData,
    isLoadingProfile,
    profileError,
    getProfileData,
  } = useContext(AdminContext);

  // Moved isOrganizer above
  const isOrganizer = !!organizerToken;
  const isAdmin = !!adminToken && !doctorToken && !staffToken;

  // Only fetch staff profile if needed
  useEffect(() => {
    if (staffToken && !profileData && !isLoadingProfile && !profileError && !isOrganizer) {
      getProfileData();
    }
  }, [isOrganizer, staffToken, profileData, getProfileData, isLoadingProfile, profileError]);

  const adminNavigation = [
    {
      label: 'Main',
      links: [
        { to: '/admin-dashboard', icon: assets.home_icon, label: 'Dashboard' },
        { to: '/users', icon: assets.appointment_icon, label: 'All Users' },
      ],
    },
    {
      label: 'Client Interactions',
      links: [
        { to: '/inquiries', icon: assets.add_icon, label: 'Inquiries' },
        { to: '/applications', icon: assets.list_icon, label: 'Applications' },
        { to: '/event-requests', icon: assets.add_icon, label: 'Event Requests' },
      ],
    },
    {
      label: 'Event Management',
      links: [
        { to: '/create-event', icon: assets.people_icon, label: 'Create Past Event' },
        { to: '/Future', icon: assets.list_icon, label: 'Create Future Event' },
        { to: '/FutureList', icon: assets.list_icon, label: 'Future Events List' },
      ],
    },
    {
      label: 'Content & Site',
      links: [
        { to: '/notices/create', icon: assets.list_icon, label: 'Create Notice' },
        { to: '/notices', icon: assets.list_icon, label: 'All Notices' },
        { to: '/highlight', icon: assets.list_icon, label: 'Highlights' },
        { to: '/manage-hero', icon: assets.list_icon, label: 'Manage Poster' },
        { to: '/organizers', icon: assets.list_icon, label: 'Manage Organizers' },
      ],
    },
    {
      label: 'Staff',
      links: [
        { to: '/create', icon: assets.list_icon, label: 'Create staff' },
        { to: '/AllOrganizer', icon: assets.list_icon, label: 'All Organizer' },
        { to: '/', icon: assets.list_icon, label: 'Highlights' },
        { to: '/', icon: assets.list_icon, label: 'Manage Poster' },
        { to: '/', icon: assets.list_icon, label: 'Manage Organizers' },
      ],
    },
  ];

  const organizerNavigation = [
    {
      label: 'Dashboard',
      links: [
        { to: '/organizer-dashboard', icon: assets.home_icon, label: 'Overview' },
      ],
    },
    {
      label: 'My Events',
      links: [
        { to: '/organizer/my-events', icon: assets.list_icon, label: 'My Events List' },
        { to: '/organizer/create-event', icon: assets.add_icon, label: 'Create New Event' },
      ],
    },
    {
      label: 'Account',
      links: [
        { to: '/organizer/profile', icon: assets.people_icon, label: 'My Profile' },
      ],
    },
  ];

  const navigationData = isAdmin ? adminNavigation : isOrganizer ? organizerNavigation : [];
  const panelTitle = isAdmin ? 'Admin Panel' : isOrganizer ? 'Organizer Panel' : '';

  const getInitialOpenState = () => {
    const initialState = {};
    const navToCheck = isAdmin ? adminNavigation : organizerNavigation;
    navToCheck.forEach(group => {
      if (group.links.some(link => location.pathname.startsWith(link.to))) {
        initialState[group.label] = true;
      }
    });
    if (Object.keys(initialState).length === 0 && navToCheck.length > 0) {
      initialState[navToCheck[0].label] = true;
    }
    return initialState;
  };

  const [openGroups, setOpenGroups] = useState(getInitialOpenState);

  useEffect(() => {
    setOpenGroups(getInitialOpenState());
  }, [location.pathname]);

  const toggleGroup = (label) => {
    setOpenGroups(prev => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const showSidebarContent = isAdmin || isOrganizer;

  return (
    <aside
      className={`w-60 h-screen fixed top-0 left-0 flex flex-col shadow-lg dark:shadow-gray-900/50 transition-colors duration-300 z-40 border-r border-gray-200 dark:border-gray-700 ${!showSidebarContent ? 'hidden' : ''}`}
      style={{ backgroundColor: currentTheme.sidebarBgColor }}
      aria-label="Sidebar"
    >
      {showSidebarContent && (
        <>
          <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <img src={assets.logo || '/logo.png'} alt="Logo" className="w-16" />
              <span style={{ color: currentTheme.textColor }} className="font-bold text-xl">YourApp</span>
            </div>
            <span style={{ color: currentTheme.textColor }} className="block text-xs opacity-70 mt-1">
              {panelTitle}
            </span>
          </div>

          <div className="px-3 py-4 flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent pb-10">
            {navigationData.map((group, groupIndex) => {
              const isOpen = !!openGroups[group.label];
              return (
                <div key={groupIndex} className="mb-2">
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    aria-expanded={isOpen}
                    aria-controls={`group-panel-${groupIndex}`}
                  >
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                      style={{ color: currentTheme.subtleTextColor || 'inherit' }}>
                      {group.label}
                    </h3>
                    <ChevronIcon isOpen={isOpen} />
                  </button>

                  <div
                    id={`group-panel-${groupIndex}`}
                    role="region"
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}
                  >
                    <ul className="space-y-1 mt-2 relative">
                      {group.links.map((item) => (
                        <li key={item.to}>
                          <NavLink
                            to={item.to}
                            style={({ isActive }) => ({
                              color: isActive ? '#FFFFFF' : currentTheme.textColor,
                              backgroundColor: isActive
                                ? currentTheme.accentColor
                                  ? `hsl(${currentTheme.accentColor.replace('hsl(', '').replace(')', '')}, 0.6)`
                                  : '#60A5FA'
                                : 'transparent',
                            })}
                            className={({ isActive }) =>
                              `flex items-center gap-3 p-3 w-full rounded-md transition-all duration-200 ease-in-out group relative ${isActive
                                ? 'font-semibold text-white shadow-inner'
                                : 'hover:bg-black/10 dark:hover:bg-white/10'
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
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
