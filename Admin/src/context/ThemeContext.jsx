// src/context/ThemeContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { assets } from '../assets/assets';

const themeOptions = {
  textColors: [
    '#FFFFFF', '#000000', '#1F2937', '#3B82F6', '#DC2626', '#16A34A', '#D97706', '#6D28D9', '#EC4899', '#F59E0B',
    '#0D9488', '#64748B', '#FF5722', '#9C27B0', '#4CAF50', '#FFC107', '#FFEB3B', '#607D8B', '#795548', '#8B5CF6'
  ],
  bgColors: [
    '#0F172A', // dark slate
    '#1E293B', // blue slate
    '#111827', // charcoal
    '#1C1C1E', // dark neutral
    '#2E2E2E', // dim gray
    '#374151', // dark cool gray
    '#1A1A1A', // deep dark
    '#2D2D2D', // dim mode
    '#2C2F36', // dark grayish blue
    '#3F3F46', // muted zinc
    '#4B5563', // slate
    '#334155', // twilight slate
    '#3C3C3C', // dark neutral
    '#232323', // ultra dark
    '#1F1F1F' ,'#F3F4F6', '#E0F2FE', '#CFFAFE', '#FDE68A', '#A7F3D0',
  '#DDD6FE', '#FBCFE8', '#FAE8FF' // subtle dark
  ]
,  
  
sidebarColors: [
  '#1E1E1E', '#1C1C1E', '#2E2E2E', '#111827', '#1F2937',
  '#2C2F36', '#232323', '#2D2D2D', '#3C3C3C', '#1A1A1A'
]
,
  navbarColors: [
    '#FFFFFF', '#F8F9FA', '#EBE8DB', '#F3E8FF', '#D1FAE5', '#FFE4E6', '#E0F2F1', '#FFEB3B', '#1F2937', '#000000'
  ],
  defaultTheme: {
    textColor: '#1F2937',
    bgColor: '#F8F9FD',
    sidebarBgColor: '#EBE8DB',
    navbarBgColor: '#FFFFFF',
  },
  themeIcon: assets.palette_icon || 'path/to/default/palette_icon.png'
};

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(themeOptions.defaultTheme);
  const [showThemeOptions, setShowThemeOptions] = useState(false);
  const [showMoreColors, setShowMoreColors] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('appTheme');
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        if (parsedTheme.textColor && parsedTheme.bgColor && parsedTheme.sidebarBgColor && parsedTheme.navbarBgColor) {
          setCurrentTheme(parsedTheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('appTheme', JSON.stringify(currentTheme));
  }, [currentTheme]);

  const handleTextColorChange = (color) => {
    setCurrentTheme((prev) => ({ ...prev, textColor: color }));
  };

  const handleBgColorChange = (color, target = 'main') => {
    setCurrentTheme((prev) => {
      switch (target) {
        case 'sidebar': return { ...prev, sidebarBgColor: color };
        case 'navbar': return { ...prev, navbarBgColor: color };
        default: return { ...prev, bgColor: color };
      }
    });
  };

  const resetTheme = () => {
    setCurrentTheme(themeOptions.defaultTheme);
    setShowThemeOptions(false);
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme, themeOptions, showThemeOptions, setShowThemeOptions,
      showMoreColors, setShowMoreColors, handleTextColorChange, handleBgColorChange, resetTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
