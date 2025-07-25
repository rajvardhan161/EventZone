import React, { useContext, useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';

// Helper to judge if color is very light for border
const isLightColor = (hex) => {
  if (!hex || !hex.startsWith('#') || hex.length !== 7) return false;
  const r = parseInt(hex.substr(1, 2), 16);
  const g = parseInt(hex.substr(3, 2), 16);
  const b = parseInt(hex.substr(5, 2), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 220;
};

const ColorPicker = ({ title, colors, selectedColor, onColorChange, theme }) => (
  <div className="mb-3">
    <h4 className="text-sm font-semibold mb-2" style={{ color: theme.textColor }}>{title}</h4>
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onColorChange(color)}
          className={
            `w-6 h-6 rounded-full cursor-pointer transition-transform transform hover:scale-110
             ${selectedColor === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`
          }
          style={{
            backgroundColor: color,
            border: isLightColor(color) ? '1px solid #ccc' : 'none'
          }}
          title={color}
        />
      ))}
    </div>
  </div>
);

const Navbar = ({ onToggleSidebar }) => {
  const { token, setToken } = useContext(AdminContext);
  const navigate = useNavigate();
  const {
    currentTheme,
    themeOptions,
    showThemeOptions,
    setShowThemeOptions,
    handleTextColorChange,
    handleBgColorChange,
    resetTheme,
  } = useTheme();

  // The key is "organizer" (not "organizerToken") in your storage as per your screenshot
  const organizerToken = localStorage.getItem('organizer');
  const isAdmin = !!token;
  const isOrganizer = !!organizerToken;

  const [showAdminMenu1, setShowAdminMenu1] = useState(false);
  const themeButtonRef = useRef(null);
  const themePanelRef = useRef(null);
  const adminMenu1ButtonRef = useRef(null);
  const adminMenu1PanelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showThemeOptions &&
        !themeButtonRef.current?.contains(e.target) &&
        !themePanelRef.current?.contains(e.target)
      )
        setShowThemeOptions(false);
      if (
        showAdminMenu1 &&
        !adminMenu1ButtonRef.current?.contains(e.target) &&
        !adminMenu1PanelRef.current?.contains(e.target)
      )
        setShowAdminMenu1(false);
    };
    if (showThemeOptions || showAdminMenu1) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showThemeOptions, showAdminMenu1, setShowThemeOptions, setShowAdminMenu1]);

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');       // admin
    localStorage.removeItem('organizer');
    localStorage.removeItem('userType');   // organizer
    localStorage.removeItem('organizerData'); 
    localStorage.removeItem('appTheme'); 
    setShowAdminMenu1(false);
    navigate('/');
  };

  const dropdownPanelStyle = {
    backgroundColor: currentTheme.navbarBgColor || '#FFFFFF',
    borderColor: currentTheme.textColor === '#FFFFFF'
      ? 'rgba(255,255,255,0.2)'
      : 'rgba(0,0,0,0.1)',
  };

  // Show navbar only for Admin or Organizer
  if (!isAdmin && !isOrganizer) return null;

  return (
    <nav
      className="sticky top-0 left-0 right-0 z-50 flex justify-between items-center px-4 sm:px-8 py-1 border-b shadow-md"
      style={{
        backgroundColor: currentTheme.navbarBgColor,
        color: currentTheme.textColor,
        borderColor: currentTheme.textColor === '#FFFFFF'
          ? 'rgba(255,255,255,0.2)'
          : 'rgba(0,0,0,0.1)',
        transition: 'background-color .3s, color .3s, border-color .3s',
      }}
    >
      {/* LEFT */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 md:hidden"
          title="Open Menu"
        >
          <img src={assets.menu_icon || '/menu-icon.svg'} alt="Menu" className="w-5 h-5" />
        </button>
        <img
          className="w-20 md:w-20 cursor-pointer"
          src={assets.lo || '/logo.png'}
          alt="Logo"
          onClick={() => navigate('/')}
        />
        <p
          className="border px-2 py-0.5 rounded-full text-xs sm:text-sm whitespace-nowrap"
          style={{ borderColor: currentTheme.textColor, color: currentTheme.textColor }}
        >
          {isAdmin ? 'Admin' : 'Organizer'}
        </p>
      </div>
      {/* RIGHT */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* THEME BUTTON */}
        <div className="relative">
          <button
            ref={themeButtonRef}
            onClick={() => setShowThemeOptions(!showThemeOptions)}
            className="p-2 rounded-full hover:bg-black hover:bg-opacity-10 transition duration-200"
            title="Customize Theme"
            aria-haspopup="true"
            aria-expanded={showThemeOptions}
          >
            <img src={assets.sky || '/theme-icon.svg'} alt="Customize Theme" className="w-5 h-5" />
          </button>
          {showThemeOptions && (
            <div
              ref={themePanelRef}
              className="absolute top-full right-0 mt-2 w-72 max-h-[70vh] overflow-y-auto z-50 p-4 rounded-md shadow-xl border"
              style={dropdownPanelStyle}
              role="dialog"
              aria-label="Theme customization"
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: currentTheme.textColor }}>
                Customize Theme
              </h3>
              <ColorPicker title="Text Color" colors={themeOptions.textColors}
                           selectedColor={currentTheme.textColor}
                           onColorChange={handleTextColorChange} theme={currentTheme} />
              <ColorPicker title="Background Color" colors={themeOptions.bgColors}
                           selectedColor={currentTheme.bgColor}
                           onColorChange={(color) => handleBgColorChange(color, 'main')}
                           theme={currentTheme} />
              <ColorPicker title="Sidebar Color" colors={themeOptions.sidebarColors}
                           selectedColor={currentTheme.sidebarBgColor}
                           onColorChange={(color) => handleBgColorChange(color, 'sidebar')}
                           theme={currentTheme} />
              <ColorPicker title="Navbar Color" colors={themeOptions.navbarColors}
                           selectedColor={currentTheme.navbarBgColor}
                           onColorChange={(color) => handleBgColorChange(color, 'navbar')}
                           theme={currentTheme} />
              <hr className="my-3" style={{
                borderColor: currentTheme.textColor === '#FFFFFF'
                    ? 'rgba(255,255,255,0.2)'
                    : 'rgba(0,0,0,0.1)'
              }}/>
              <button
                onClick={resetTheme}
                className="w-full text-center px-4 py-2 rounded-md text-sm transition hover:opacity-80"
                style={{
                  backgroundColor: currentTheme.textColor === '#FFFFFF'
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.05)',
                  color: currentTheme.textColor,
                }}
              >
                Reset to Default
              </button>
            </div>
          )}
        </div>
        {/* LOGOUT */}
        <button
          onClick={logout}
          className="text-xs sm:text-sm px-4 py-1.5 rounded-full transition"
          style={{
            backgroundColor: currentTheme.textColor === '#FFFFFF'
              ? 'rgba(255,255,255,0.8)'
              : 'rgba(0,0,0,0.6)',
            color: currentTheme.textColor === '#FFFFFF'
              ? '#000000'
              : '#FFFFFF',
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

