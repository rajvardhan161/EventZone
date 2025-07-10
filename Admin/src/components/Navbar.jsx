// src/components/Navbar.jsx
import React, { useContext, useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ onToggleSidebar }) => {
  // Only get Admin-specific context
  const { token, setToken } = useContext(AdminContext);

  const navigate = useNavigate();

  // Theme context hooks
  const {
    currentTheme,
    themeOptions,
    showThemeOptions,
    setShowThemeOptions,
    handleTextColorChange,
    handleBgColorChange,
    resetTheme,
  } = useTheme();

  // Admin menu states and refs
  const [showAdminMenu1, setShowAdminMenu1] = useState(false);
  const [showAdminMenu2, setShowAdminMenu2] = useState(false);
  const [showAdminMenu3, setShowAdminMenu3] = useState(false);

  const themeButtonRef = useRef(null);
  const themePanelRef = useRef(null);
  const adminMenu1ButtonRef = useRef(null);
  const adminMenu1PanelRef = useRef(null);
  const adminMenu2ButtonRef = useRef(null);
  const adminMenu2PanelRef = useRef(null);
  const adminMenu3ButtonRef = useRef(null);
  const adminMenu3PanelRef = useRef(null);

  // Define admin links here. These will be rendered conditionally.
  // IMPORTANT: If you don't want any dropdown menus in the navbar,
  // you can either remove the `adminLinks` array, or set it to an empty array `[]`.
  // If you remove it, the corresponding `adminMenuXLinks` variables below
  // will also be undefined, and the menu buttons won't render.
 
  const isAdmin = !!token; // User is an admin if a token exists in AdminContext

  // Click Outside Handlers
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Theme panel handler
      if (
        showThemeOptions &&
        !themeButtonRef.current?.contains(e.target) &&
        !themePanelRef.current?.contains(e.target)
      )
        setShowThemeOptions(false);

      // Admin menu handlers
      if (
        showAdminMenu1 &&
        !adminMenu1ButtonRef.current?.contains(e.target) &&
        !adminMenu1PanelRef.current?.contains(e.target)
      )
        setShowAdminMenu1(false);
      if (
        showAdminMenu2 &&
        !adminMenu2ButtonRef.current?.contains(e.target) &&
        !adminMenu2PanelRef.current?.contains(e.target)
      )
        setShowAdminMenu2(false);
      if (
        showAdminMenu3 &&
        !adminMenu3ButtonRef.current?.contains(e.target) &&
        !adminMenu3PanelRef.current?.contains(e.target)
      )
        setShowAdminMenu3(false);
    };

    if (showThemeOptions || showAdminMenu1 || showAdminMenu2 || showAdminMenu3) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [
    showThemeOptions,
    showAdminMenu1,
    showAdminMenu2,
    showAdminMenu3,
    setShowThemeOptions,
    setShowAdminMenu1,
    setShowAdminMenu2,
    setShowAdminMenu3,
  ]);

  const closeAllMenus = () => {
    setShowThemeOptions(false);
    setShowAdminMenu1(false);
    setShowAdminMenu2(false);
    setShowAdminMenu3(false);
  };

  const toggleTheme = () => {
    const newState = !showThemeOptions;
    closeAllMenus();
    setShowThemeOptions(newState);
  };

  const toggleAdminMenu1 = () => {
    const newState = !showAdminMenu1;
    closeAllMenus();
    setShowAdminMenu1(newState);
  };

  const toggleAdminMenu2 = () => {
    const newState = !showAdminMenu2;
    closeAllMenus();
    setShowAdminMenu2(newState);
  };

  const toggleAdminMenu3 = () => {
    const newState = !showAdminMenu3;
    closeAllMenus();
    setShowAdminMenu3(newState);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    closeAllMenus();
    navigate('/');
  };

  const dropdownPanelStyle = {
    color: ['#000000', '#1F2937', '#0F172A'].includes(currentTheme.navbarBgColor)
      ? '#FFFFFF'
      : '#1F2937',
    backgroundColor: currentTheme.navbarBgColor || '#FFFFFF',
    borderColor: currentTheme.textColor === '#FFFFFF' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
  };

  const renderLinks = (links, closeFunction) => (
    <nav className="py-1">
      {links.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          onClick={() => {
            closeFunction();
            closeAllMenus();
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150"
          style={{ color: currentTheme.textColor }}
        >
          {l.icon && <img src={l.icon} alt="" className="w-4 h-4 opacity-70" />}
          {l.label}
        </Link>
      ))}
    </nav>
  );

  // --- Render ONLY if the user is an Admin ---
  if (!isAdmin) {
    return null;
  }

  /* -------------- JSX -------------- */
  return (
    // The Navbar itself should be full width.
    // The main layout in AdminDashboard has the sidebar which pushes content over.
    // This Navbar needs to sit *above* that layout structure, or be part of a container that allows full width.
    // For simplicity, we'll keep it as a fixed element at the top.
    <nav
      className="sticky top-0 left-0 right-0 z-50 flex justify-between items-center px-4 sm:px-8 py-1 border-b shadow-md"
      style={{
        backgroundColor: currentTheme.navbarBgColor,
        color: currentTheme.textColor,
        borderColor: currentTheme.textColor === '#FFFFFF' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
        transition: 'background-color .3s, color .3s, border-color .3s',
      }}
    >
      {/* ---------- LEFT SECTION ---------- */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Logo */}
        <img
          className="w-20 md:w-20 cursor-pointer"
          src={assets.lo || assets.admin_logo || '/placeholder-logo.png'}
          alt="Logo"
          onClick={() => navigate('/')}
        />

        {/* Admin Label */}
        <p
          className="border px-2 py-0.5 rounded-full text-xs sm:text-sm whitespace-nowrap"
          style={{ borderColor: currentTheme.textColor, color: currentTheme.textColor }}
        >
          Admin
        </p>
      </div>


      {/* ---------- RIGHT SECTION ---------- */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Theme Customization Button */}
        <div className="relative">
          <button
            ref={themeButtonRef}
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-black hover:bg-opacity-10 transition duration-200"
            title="Customize Theme"
            style={{ color: currentTheme.textColor }}
          >
            <img src={assets.sky|| '/theme-icon.svg'} alt="Customize Theme" className="w-5 h-5" />
          </button>
          {showThemeOptions && (
            <div
              ref={themePanelRef}
              className="absolute top-full right-0 mt-2 w-64 z-50 p-4 rounded-md shadow-xl border"
              style={dropdownPanelStyle}
            >
              <div>
                <p className="text-xs font-semibold mb-1">Text Color:</p>
                <div className="flex flex-wrap gap-2">
                  {themeOptions?.textColors?.map((c) => (
                    <button
                      key={'text-' + c}
                      onClick={() => handleTextColorChange(c)}
                      className={`w-6 h-6 rounded-full border-2 ${
                        currentTheme.textColor === c
                          ? 'ring-2 ring-offset-1 ring-current scale-110'
                          : 'border-gray-400'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1">Main Background:</p>
                <div className="flex flex-wrap gap-2">
                  {themeOptions?.bgColors?.map((c) => (
                    <button
                      key={'bg-main-' + c}
                      onClick={() => handleBgColorChange(c, 'main')}
                      className={`w-6 h-6 rounded-full border-2 ${
                        currentTheme.bgColor === c
                          ? 'ring-2 ring-offset-1 ring-current scale-110'
                          : 'border-gray-400'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1">Sidebar Background:</p>
                <div className="flex flex-wrap gap-2">
                  {themeOptions?.bgColors?.map((c) => (
                    <button
                      key={'bg-sidebar-' + c}
                      onClick={() => handleBgColorChange(c, 'sidebar')}
                      className={`w-6 h-6 rounded-full border-2 ${
                        currentTheme.sidebarBgColor === c
                          ? 'ring-2 ring-offset-1 ring-current scale-110'
                          : 'border-gray-400'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1">Navbar Background:</p>
                <div className="flex flex-wrap gap-2">
                  {themeOptions?.bgColors?.map((c) => (
                    <button
                      key={'bg-navbar-' + c}
                      onClick={() => handleBgColorChange(c, 'navbar')}
                      className={`w-6 h-6 rounded-full border-2 ${
                        currentTheme.navbarBgColor === c
                          ? 'ring-2 ring-offset-1 ring-current scale-110'
                          : 'border-gray-400'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={resetTheme}
                className="text-xs w-full px-2 py-1 rounded border mt-3 hover:bg-black/10"
                style={{ color: currentTheme.textColor }}
              >
                Reset to Default
              </button>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="text-xs sm:text-sm px-4 py-1.5 rounded-full transition"
          style={{
            backgroundColor:
              currentTheme.textColor === '#FFFFFF'
                ? 'rgba(255,255,255,0.8)'
                : 'rgba(0,0,0,0.6)',
            color:
              currentTheme.textColor === '#FFFFFF' ? '#000000' : '#FFFFFF',
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;