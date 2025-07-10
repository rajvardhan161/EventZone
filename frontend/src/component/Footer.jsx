import React, { useContext } from 'react';
import { useTheme } from '../context/ThemeContext'; // Assuming ThemeContext is in ../context/ThemeContext

const Footer = () => {
  const { currentTheme } = useTheme();

  // Destructure theme colors for easy access
  const {
    footerBg = '#1f2937', // Default to gray-800 if not provided
    footerText = '#9ca3af', // Default to gray-400
    footerTitleColor = '#ffffff', // Default to white for titles
    footerLinkHoverColor = '#ffffff', // Default to white for link hover
    primaryColor = '#3b82f6', // Example primary color, adjust as needed
    secondaryColor = '#6366f1', // Example secondary color, adjust as needed
    accentColor = '#ec4899', // Example accent color, adjust as needed
  } = currentTheme; // Destructure theme colors, providing defaults

  // --- Dynamic Style Helpers ---
  const getThemedStyle = (colorProp) => ({
    color: currentTheme[colorProp] || colorProp, // Use theme color or fallback to prop name
    fontFamily: currentTheme.fontFamily || 'inherit',
  });

  const getThemedBgStyle = (colorProp) => ({
    backgroundColor: currentTheme[colorProp] || colorProp,
  });

  const linkHoverStyle = {
    color: currentTheme[footerLinkHoverColor] || footerLinkHoverColor,
    transition: 'color 0.3s ease-in-out',
  };

  return (
    <footer className="py-16" style={getThemedBgStyle(footerBg)}>
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-around">
          {/* Footer About */}
          <div className="w-full md:w-1/3 lg:w-1/4 mb-8 md:mb-0 text-center md:text-left px-4">
            <h3 className="text-3xl font-bold mb-4" style={{ color: footerTitleColor }}>Eventify</h3>
            <p className="text-gray-400" style={{ color: footerText }}>Your go-to platform for discovering and booking amazing events.</p>
          </div>

          {/* Footer Links */}
          <div className="w-full md:w-1/4 mb-8 md:mb-0 px-4">
            <h4 className="text-xl font-semibold mb-5" style={{ color: footerTitleColor }}>Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="/" className="hover:text-white transition-colors duration-200" style={linkHoverStyle}>Home</a></li>
              <li><a href="/events" className="hover:text-white transition-colors duration-200" style={linkHoverStyle}>Events</a></li>
              <li><a href="/about" className="hover:text-white transition-colors duration-200" style={linkHoverStyle}>About Us</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors duration-200" style={linkHoverStyle}>Contact</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors duration-200" style={linkHoverStyle}>Privacy Policy</a></li>
            </ul>
          </div>

          {/* Footer Social */}
          <div className="w-full md:w-1/4 mb-8 md:mb-0 px-4">
            <h4 className="text-xl font-semibold mb-5" style={{ color: footerTitleColor }}>Follow Us</h4>
            <div className="flex space-x-4 justify-center md:justify-start">
              {/* Using theme colors for social links */}
              <a href="#" className="hover:text-white transition-colors duration-200" style={linkHoverStyle}>Facebook</a>
              <a href="#" className="hover:text-white transition-colors duration-200" style={linkHoverStyle}>Twitter</a>
              <a href="#" className="hover:text-white transition-colors duration-200" style={linkHoverStyle}>Instagram</a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t pt-8 mt-12 text-center" style={{ borderColor: currentTheme.footerBorderColor || '#4b5563' /* Default to gray-700 */ }}>
          <p className="text-gray-500" style={getThemedStyle(footerText)}>© 2024 Eventify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;