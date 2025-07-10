// src/components/Navbar.jsx
import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { assets } from '../assets/assets'; // Adjust path if needed
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext'; // Adjust path if needed
import { useTheme } from '../context/ThemeContext'; // Adjust path if needed
import clsx from 'clsx'; // Import clsx

// --- Constants ---
const MOBILE_MENU_ID = 'mobile-menu';
const PROFILE_MENU_ID = 'profile-menu';
const THEME_MENU_ID = 'theme-menu';
const MOBILE_MENU_TITLE_ID = 'mobile-menu-title';
const THEME_PANEL_TITLE_ID = 'theme-panel-title';

const Navbar = () => {
    const navigate = useNavigate();
    const { token, setToken, userData } = useContext(AppContext);
    const {
        currentTheme,
        themeOptions,
        showThemeOptions,
        setShowThemeOptions,
        handleTextColorChange,
        handleBgColorChange,
        handleFontChange,
        resetTheme,
    } = useTheme();

    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // --- Refs ---
    const profileMenuRef = useRef(null);
    const profileButtonRef = useRef(null);
    const themeMenuRef = useRef(null);
    const themeButtonRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const mobileMenuButtonRef = useRef(null);
    const mobileMenuCloseButtonRef = useRef(null);

    // --- Navigation Links ---
    const navLinks = [
        { path: '/', label: 'Home', requiresAuth: false },
        { path: '/event', label: 'Event', requiresAuth: false },
        { path: '/about', label: 'About', requiresAuth: false },
        { path: '/contact', label: 'Contact', requiresAuth: false },
        // These links are only shown if token exists
        { path: '/dashboard', label: 'Dashboard', requiresAuth: true },
        { path: '/profile', label: 'My Profile', requiresAuth: true },
    ];

    const visibleNavLinks = navLinks.filter(link => !link.requiresAuth || token);

    // --- Functions ---
    const closeMobileMenu = useCallback(() => {
        setShowMobileMenu(false);
        requestAnimationFrame(() => { // Restore focus to the button that opened the menu
            mobileMenuButtonRef.current?.focus();
        });
    }, []);

    const openMobileMenu = () => {
        setShowMobileMenu(true);
        requestAnimationFrame(() => { // Focus the close button within the menu
            mobileMenuCloseButtonRef.current?.focus();
        });
    };

    const handleMobileNavigate = (path) => {
        navigate(path);
        closeMobileMenu();
    };

    const logout = () => {
        setToken(false);
        localStorage.removeItem('token');
        setShowProfileMenu(false);
        setShowThemeOptions(false);
        closeMobileMenu();
        navigate('/login');
    };

    // --- Effects ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close Profile Menu
            if (showProfileMenu && profileMenuRef.current && !profileMenuRef.current.contains(event.target) && profileButtonRef.current && !profileButtonRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
            // Close Theme Menu
            if (showThemeOptions && themeMenuRef.current && !themeMenuRef.current.contains(event.target) && themeButtonRef.current && !themeButtonRef.current.contains(event.target)) {
                setShowThemeOptions(false);
            }
            // Close Mobile Menu
            if (showMobileMenu && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && mobileMenuButtonRef.current && !mobileMenuButtonRef.current.contains(event.target)) {
                closeMobileMenu();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showProfileMenu, showThemeOptions, showMobileMenu, setShowThemeOptions, closeMobileMenu]);

    // Accessibility: Close menus on Escape key and manage focus trap
    useEffect(() => {
        const handleKeyDown = (event) => {
             // Close Profile Menu on Escape
             if (showProfileMenu && event.key === 'Escape') {
                 setShowProfileMenu(false);
                 profileButtonRef.current?.focus();
                 event.stopPropagation();
             }
             // Close Theme Menu on Escape
             if (showThemeOptions && event.key === 'Escape') {
                 setShowThemeOptions(false);
                 themeButtonRef.current?.focus();
                 event.stopPropagation();
             }
             // Close Mobile Menu on Escape
             if (showMobileMenu && event.key === 'Escape') {
                 closeMobileMenu();
                 event.stopPropagation();
             }

             // Basic Focus Trap for Mobile Menu
             if (showMobileMenu && mobileMenuRef.current && event.key === 'Tab') {
                 const focusableElements = mobileMenuRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                 if (focusableElements.length === 0) return;

                 const firstElement = focusableElements[0];
                 const lastElement = focusableElements[focusableElements.length - 1];

                 if (event.shiftKey) { // Shift + Tab
                     if (document.activeElement === firstElement) {
                         lastElement.focus();
                         event.preventDefault();
                     }
                 } else { // Tab
                     if (document.activeElement === lastElement) {
                         firstElement.focus();
                         event.preventDefault();
                     }
                 }
             }
        };

        // Add listener if any menu is open, remove otherwise.
        // Also manage body scroll lock.
        const anyMenuOpen = showProfileMenu || showThemeOptions || showMobileMenu;
        if (anyMenuOpen) {
             document.addEventListener('keydown', handleKeyDown);
             // Lock scroll only when the mobile menu is open
             if (showMobileMenu) {
                document.body.style.overflow = 'hidden';
             }
        } else {
             document.removeEventListener('keydown', handleKeyDown);
             document.body.style.overflow = ''; // Ensure scroll is restored when all menus are closed
        }

        // Cleanup: Ensure scroll is restored if component unmounts while menu is open
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };

    }, [showProfileMenu, showThemeOptions, showMobileMenu, closeMobileMenu]);

    // --- Styling Functions ---
    const getNavLinkClass = ({ isActive }) => clsx(
        'py-2 hover:text-primary transition-colors duration-300 relative',
        'after:content-[""] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300',
        isActive ? 'text-primary font-semibold after:w-full' : 'text-inherit',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-current rounded-sm'
    );

    const getMobileNavLinkClass = ({ isActive }) => clsx(
        'py-3 block text-center transition-colors duration-200 w-full text-lg rounded-md',
        isActive ? 'text-primary font-semibold bg-primary/10' : 'text-gray-700 hover:text-primary hover:bg-gray-100',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white'
    );

    // Function to determine filter for the mobile menu icon based on navbar background
    const getMobileMenuIconFilter = () => {
        // Define your light background colors. Adjust this array as needed.
        const lightThemes = ['#ffffff', '#FFFFFF', '#f9fafb', '#f3f4f6', 'rgb(255,255,255)', 'rgb(249,250,251)', 'rgb(243,244,246)'];
        if (lightThemes.includes(currentTheme.navbarBgColor)) {
            return 'invert(0)'; // No filter for light backgrounds (icon appears dark)
        }
        return 'invert(1)'; // Invert for dark backgrounds (icon appears white)
    };

    const userFirstName = userData?.name?.split(' ')[0] || 'User';
    const userImage = userData?.image || assets.default_avatar;

    // --- Render ---
    return (
        <nav
            className="sticky top-0 z-50 shadow-md rounded-b-lg sm:rounded-full flex items-center justify-between text-sm border border-gray-200/30 px-4 sm:px-6 py-2 m-0 sm:m-2 transition-colors duration-300 ease-in-out"
            style={{
                backgroundColor: currentTheme.navbarBgColor,
                color: currentTheme.textColor,
                fontFamily: currentTheme.fontFamily,
            }}
        >
            {/* Logo */}
            <NavLink to="/" aria-label="WellNest Home">
                 <img
                    className='w-20 sm:w-14 h-auto cursor-pointer flex-shrink-0 block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded'
                    src={assets.lo}
                    alt="WellNest Logo"
                 />
            </NavLink>

            {/* Desktop Navigation */}
            <ul className='hidden md:flex items-center gap-5 lg:gap-7 font-medium'>
                {visibleNavLinks.map(link => (
                    <li key={`desktop-${link.path}`}>
                        <NavLink to={link.path} className={getNavLinkClass}>
                            {link.label}
                        </NavLink>
                    </li>
                ))}
            </ul>

            <div className='flex items-center gap-2 sm:gap-3'>

                {/* --- Theme Button (Desktop) --- */}
                {/* Removed 'token &&' so theme button is always visible on desktop */}
                <div className="relative">
                    <button
                        ref={themeButtonRef}
                        onClick={() => setShowThemeOptions(prev => !prev)}
                        className="p-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-current rounded-full hover:bg-gray-500/10 transition-colors"
                        aria-label="Customize theme" aria-controls={THEME_MENU_ID} aria-haspopup="dialog" aria-expanded={showThemeOptions}
                    >
                        <img src={assets.sky} alt="Theme icon" className="w-6 h-6" aria-hidden="true" />
                    </button>

                    {/* Theme Options Panel */}
                    <div className={clsx('absolute top-full right-0 mt-2 w-72 origin-top-right z-20', 'transition ease-out duration-100 transform', showThemeOptions ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none')}>
                        <div ref={themeMenuRef} id={THEME_MENU_ID} className="bg-white shadow-xl rounded-lg border border-gray-200 p-4" role="dialog" aria-modal="true" aria-labelledby={THEME_PANEL_TITLE_ID}>
                            <h3 id={THEME_PANEL_TITLE_ID} className="text-sm font-semibold text-gray-800 mb-3 text-center">Customize Theme</h3>
                            {/* Text Color */}
                            <div className="mb-4"><label className="block text-xs font-medium text-gray-600 mb-2">Text Color</label><div className="flex flex-wrap gap-2">{themeOptions.textColors.map(color => (<button key={`text-${color}`} aria-label={`Set text color to ${color}`} onClick={() => handleTextColorChange(color)} className={clsx('w-6 h-6 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary transition-all', currentTheme.textColor === color ? 'ring-2 ring-primary ring-offset-1 scale-110' : 'hover:scale-110')} style={{ backgroundColor: color }}></button>))}</div></div>
                            {/* Main Background */}
                            <div className="mb-4"><label className="block text-xs font-medium text-gray-600 mb-2">Main Background</label><div className="flex flex-wrap gap-2">{themeOptions.bgColors.map(color => (<button key={`bg-main-${color}`} aria-label={`Set main background to ${color}`} onClick={() => handleBgColorChange(color, 'main')} className={clsx('w-6 h-6 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary transition-all', currentTheme.bgColor === color ? 'ring-2 ring-primary ring-offset-1 scale-110' : 'hover:scale-110')} style={{ backgroundColor: color }}></button>))}</div></div>
                            {/*Navbar Background */}
                            <div className="mb-4"><label className="block text-xs font-medium text-gray-600 mb-2">Navbar Background</label><div className="flex flex-wrap gap-2">{themeOptions.bgColors.map(color => (<button key={`bg-nav-${color}`} aria-label={`Set navbar background to ${color}`} onClick={() => handleBgColorChange(color, 'navbar')} className={clsx('w-6 h-6 rounded-full border border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary transition-all', currentTheme.navbarBgColor === color ? 'ring-2 ring-primary ring-offset-1 scale-110' : 'hover:scale-110')} style={{ backgroundColor: color }}></button>))}</div></div>
                            {/* Font Selection */}
                            <div className="mb-4"><label htmlFor="font-select" className="block text-xs font-medium text-gray-600 mb-2">Font Style</label><div className="relative"><select id="font-select" value={currentTheme.fontFamily} onChange={(e) => handleFontChange(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:ring-1 focus:ring-primary focus:border-primary appearance-none bg-white pr-8 cursor-pointer" style={{ fontFamily: currentTheme.fontFamily }}>{themeOptions.fonts.map(font => (<option key={font} value={font} style={{ fontFamily: font }}>{font.split(',')[0].replace(/['"]/g, '')}</option>))}</select><div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"><svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg></div></div></div>
                            {/* Reset Button */}
                            <button onClick={() => { resetTheme(); setShowThemeOptions(false); }} className="w-full mt-2 px-4 py-1.5 text-xs text-center text-gray-700 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">Reset to Default</button>
                        </div>
                    </div>
                </div> {/* End Theme Switcher */}

                {/* --- Profile/Login --- */}
                {token ? (
                    <div className='relative'>
                        <button ref={profileButtonRef} onClick={() => setShowProfileMenu(prev => !prev)} aria-haspopup="menu" aria-controls={PROFILE_MENU_ID} aria-expanded={showProfileMenu} aria-label="User menu" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-current rounded-full flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 border border-transparent hover:border-gray-300/50 transition">
                            <img src={userImage} className='w-full h-full rounded-full object-cover border border-gray-300/50' alt={userData ? 'User Profile' : 'Loading user profile'} onError={(e) => { e.target.onerror = null; e.target.src = assets.default_avatar; }}/>
                        </button>
                         {/* Profile Dropdown */}
                        <div className={clsx('absolute top-full right-0 mt-2 w-48 origin-top-right z-10', 'transition ease-out duration-100 transform', showProfileMenu ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none')}>
                            <div ref={profileMenuRef} id={PROFILE_MENU_ID} className='bg-white shadow-xl rounded-lg border border-gray-200 py-2' role="menu" aria-orientation="vertical" aria-labelledby={profileButtonRef.current?.id}>
                                <div className="px-4 py-2 text-sm text-gray-700 font-medium border-b border-gray-100 mb-1 flex items-center gap-2">
                                     <img src={userImage} className='w-5 h-5 rounded-full object-cover border border-gray-200 flex-shrink-0' alt='' onError={(e) => { e.target.onerror = null; e.target.src = assets.default_avatar; }}/>
                                    <span className="truncate">Hi, {userFirstName}</span>
                                </div>
                                <button onClick={() => { navigate('/my-profile'); setShowProfileMenu(false); }} className='block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:bg-gray-100 focus:text-gray-900 rounded-none' role="menuitem">My Profile</button>
                                <button onClick={logout} className='block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:bg-red-50 focus:text-red-700 font-medium rounded-none' role="menuitem">Logout</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Login button (Desktop & Mobile)
                    <button onClick={() => navigate('/login')} className='bg-primary text-white px-4 sm:px-5 py-1.5 rounded-full font-medium text-xs sm:text-sm hidden md:block hover:bg-primary-dark transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-current'>
                        Login / Sign Up
                    </button>
                )}

                {/* Mobile Menu Icon */}
                <button ref={mobileMenuButtonRef} onClick={openMobileMenu} className='md:hidden p-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-current rounded-md hover:bg-gray-500/10 transition-colors' aria-label="Open main menu" aria-controls={MOBILE_MENU_ID} aria-expanded={showMobileMenu} aria-haspopup="dialog">
                    <img className='w-6 h-6' src={assets.menu_icon} alt='' aria-hidden="true" style={{ filter: getMobileMenuIconFilter() }}/>
                </button>
            </div>

            {/* --- Mobile Menu Overlay --- */}
            <div
                ref={mobileMenuRef}
                id={MOBILE_MENU_ID}
                className={clsx(
                    "fixed inset-0 z-40 flex flex-col bg-white/95 backdrop-blur-sm md:hidden",
                    "transition-transform duration-300 ease-in-out",
                    showMobileMenu ? "translate-x-0" : "translate-x-full",
                    !showMobileMenu && "invisible" // Use invisible to keep it in DOM for accessibility but hide visually
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby={MOBILE_MENU_TITLE_ID}
                style={{ color: '#333', fontFamily: currentTheme.fontFamily }}
            >
                {/* Mobile Menu Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
                    <h2 id={MOBILE_MENU_TITLE_ID} className="sr-only">Main Menu</h2>
                    <img onClick={() => handleMobileNavigate('/')} className='w-24 h-auto cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded' src={assets.logo} alt="WellNest Logo"/>
                    <button ref={mobileMenuCloseButtonRef} onClick={closeMobileMenu} className="p-2 -mr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 rounded-full hover:bg-gray-100 transition-colors" aria-label="Close main menu">
                         <img className='w-5 h-5 text-gray-600' src={assets.cross_icon} alt='' aria-hidden="true" />
                    </button>
                </div>
                {/* Scrollable Content Area */}
                <div className="flex-grow overflow-y-auto flex flex-col">
                    {/* Mobile Menu Links (Main) */}
                    <ul className='flex flex-col items-center gap-2 px-4 pt-6 pb-4 flex-shrink-0'>
                        {visibleNavLinks.map(link => (
                            <li key={`mobile-${link.path}`} className="w-full">
                                <NavLink to={link.path} className={getMobileNavLinkClass} onClick={closeMobileMenu}>
                                    {link.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>

                    <div className="flex-grow"></div> {/* Spacer */}
                    {/* Mobile Auth Section */}
                    <div className="px-4 py-6 border-t border-gray-200 flex-shrink-0">
                         {token ? (
                            <div className="flex flex-col items-center gap-3 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 w-full justify-center mb-2">
                                     <img src={userImage} className='w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0' alt='' onError={(e) => { e.target.onerror = null; e.target.src = assets.default_avatar; }}/>
                                    <p className="text-sm text-gray-800 font-medium truncate">Hi, {userFirstName}</p>
                                </div>
                                <button onClick={() => handleMobileNavigate('/my-profile')} className="w-full py-2.5 px-4 text-sm text-center text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md transition-colors" aria-label="Go to My Profile">My Profile</button>
                                <button onClick={logout} className="w-full py-2.5 px-4 text-sm text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded-md font-semibold transition-colors" aria-label="Logout">Logout</button>
                           </div>
                         ) : (
                             <button onClick={() => handleMobileNavigate('/login')} className='w-full bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary-dark transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'>Login / Sign Up</button>
                         )}
                    </div>
                </div> {/* End Scrollable Area */}
            </div> {/* End Mobile Menu Overlay */}
        </nav>
    );
};

export default Navbar;