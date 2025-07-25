// src/context/ThemeContext.js
import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { assets } from '../assets/assets'; // Adjust path if necessary

// --- Theme Color Palettes ---
// Organize colors by theme type (light, dark, or custom palettes)
const colorPalettes = {
    light: {
        primary: '#007bff',       // Primary Blue
        secondary: '#6c757d',     // Secondary Gray
        background: '#FFFFFF',    // White background
        textColor: '#343a40',     // Dark Gray text
        accent: '#17a2b8',        // Teal accent
        hoverPrimary: '#0056b3',  // Darker Primary Blue for hover
        hoverSecondary: '#545b62',// Darker Secondary Gray for hover
        footerBg: '#f8f9fa',      // Light Gray footer background
        footerLink: '#007bff',    // Primary Blue for footer links
        testimonialBg: '#f8f9fa', // Light Gray for testimonials
        cardBgColor: '#FFFFFF',
    },
    darkNavy: {
        primary: '#00bfff',       // Bright Cyan/Sky Blue
        secondary: '#1e3a8a',     // Darker blue for gradients
        background: '#0b132b',    // Very Dark Navy Blue
        textColor: '#e0e0e0',     // Light Gray text on dark background
        accent: '#00f2ea',        // Neon Cyan/Aqua for CTAs
        hoverPrimary: '#4dcbff',
        hoverSecondary: '#2e52a3',
        footerBg: '#1c253f',
        footerLink: '#8ab4f8',
         cardBgColor: '#FFFFFF', 
        testimonialBg: '#1c253f',
    },
    // Add more themes here as needed (e.g., 'dark', 'emerald', 'rose')
    // dark: { ... },
};


// --- Font Definitions ---
const fontList = [
    "'Inter', sans-serif", "'Roboto', sans-serif", "'Poppins', sans-serif",
    "'Lato', sans-serif", "'Georgia', serif", "'Times New Roman', serif",
    "'Arial', sans-serif", "'Verdana', sans-serif", "'Courier New', monospace"
];

// --- Available Color Options for User Selection ---
// This expands on the palettes to offer individual color choices
const availableColors = {
    textColors: [
        '#FFFFFF', '#F3F4F6', '#D1D5DB', '#4B5563', '#1F2937', '#111827', '#000000',
        '#3B82F6', '#2563EB', '#DC2626', '#B91C1C', '#16A34A', '#0F766E', '#D97706', '#EA580C',
        '#9333EA', '#EC4899', '#9C27B0', '#4CAF50', '#FFC107', '#FF5722', '#3E2723',
        '#673AB7', '#00BCD4', '#607D8B', '#795548', '#FF9800', '#009688'
    ],
    bgColors: [
        '#FFFFFF', '#F8FAFC', '#E5E7EB', '#EFF6FF', '#E0F2FE', '#F0FDF4',
        '#FEF3C7', '#FFF7ED', '#FCE7F3', '#EDE9FE', '#F1F5F9', '#FDE68A', '#FCA5A5',
        '#86EFAC', '#A78BFA', '#7DD3FC', '#FDBA74', '#111827', '#1E293B', '#0F172A',
        '#042F2E', '#4A044E', '#312E81', '#78350F', '#000000', '#FFEB3B', '#607D8B',
        '#B3E5FC', '#D1C4E9', '#F8BBD0', '#DCEDC8', '#CFD8DC'
    ],
    fonts: fontList,
};

// --- Default Theme Configuration ---
const defaultThemeConfig = {
    theme: 'light', // Default theme name
    textColor: availableColors.textColors[3], // e.g., '#4B5563'
    bgColor: availableColors.bgColors[2],     // e.g., '#E5E7EB'
    navbarBgColor: availableColors.bgColors[0], // e.g., '#FFFFFF'
    fontFamily: availableColors.fonts[0],     // e.g., "'Inter', sans-serif"
    // Add other properties that might be theme-specific, e.g., border radius, spacing
};

// --- Context ---
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    // Initialize state from localStorage or use the default theme
    const [currentTheme, setCurrentTheme] = useState(() => {
        const savedTheme = localStorage.getItem('appTheme');
        if (savedTheme) {
            try {
                const parsed = JSON.parse(savedTheme);
                // Validate parsed theme against available options
                const isValid = parsed.textColor && availableColors.textColors.includes(parsed.textColor) &&
                                parsed.bgColor && availableColors.bgColors.includes(parsed.bgColor) &&
                                parsed.navbarBgColor && availableColors.bgColors.includes(parsed.navbarBgColor) &&
                                parsed.fontFamily && availableColors.fonts.includes(parsed.fontFamily) &&
                                parsed.theme && Object.keys(colorPalettes).includes(parsed.theme); // Check if theme name is valid

                if (isValid) return parsed;
                console.warn("Invalid theme found in localStorage, falling back to default.");
            } catch (e) {
                console.error("Failed to parse theme from localStorage:", e);
            }
        }
        return defaultThemeConfig; // Fallback to default if nothing valid is found
    });

    // State for managing UI visibility of theme options
    const [showThemeOptions, setShowThemeOptions] = useState(false);
    const [showMoreColors, setShowMoreColors] = useState(false); // For expanded color pickers

    // --- Effects ---
    // Save the current theme to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('appTheme', JSON.stringify(currentTheme));
        } catch (e) {
            console.error("Failed to save theme to localStorage:", e);
        }
    }, [currentTheme]);

    // --- Handlers ---
    const handleColorChange = (color, property, target = 'main') => {
        let palette = availableColors[property]; // e.g., textColors, bgColors
        if (!palette || !palette.includes(color)) return; // Ignore invalid colors

        let updateKey;
        if (property === 'textColors') updateKey = 'textColor';
        else if (property === 'bgColors') {
            updateKey = target === 'navbar' ? 'navbarBgColor' : 'bgColor';
        } else return; // Only handle textColors and bgColors for now

        setCurrentTheme((prev) => ({ ...prev, [updateKey]: color }));
    };

    const handleTextColorChange = (color) => handleColorChange(color, 'textColors');
    const handleBgColorChange = (color, target) => handleColorChange(color, 'bgColors', target);
    const handleFontChange = (font) => {
        if (availableColors.fonts.includes(font)) {
            setCurrentTheme((prev) => ({ ...prev, fontFamily: font }));
        }
    };

    // Function to apply a predefined theme by name
    const setThemeByName = (themeName) => {
        const theme = colorPalettes[themeName];
        if (theme) {
            // Merge theme properties into currentTheme, keeping user customizations if desired
            // For simplicity here, we'll replace it entirely. You might want to merge.
            setCurrentTheme({
                ...defaultThemeConfig, // Start with defaults
                ...theme,              // Apply predefined theme palette
                fontFamily: theme.fontFamily || defaultThemeConfig.fontFamily, // Ensure font is set
                textColor: theme.textColor || defaultThemeConfig.textColor, // Ensure text color is set
                bgColor: theme.bgColor || defaultThemeConfig.bgColor, // Ensure bg color is set
                navbarBgColor: theme.navbarBgColor || defaultThemeConfig.navbarBgColor, // Ensure navbar bg color is set
                theme: themeName, // Store the active theme name
            });
            setShowThemeOptions(false); // Close options after setting theme
        }
    };

    const resetTheme = () => {
        setCurrentTheme(defaultThemeConfig);
        localStorage.removeItem('appTheme'); // Clear saved theme on reset
        setShowThemeOptions(false);
    };

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        currentTheme,
        themeOptions: availableColors, // Expose available colors and fonts
        showThemeOptions,
        setShowThemeOptions,
        showMoreColors,
        setShowMoreColors,
        handleTextColorChange,
        handleBgColorChange,
        handleFontChange,
        resetTheme,
        setThemeByName, // Expose function to set themes by name
        defaultTheme: defaultThemeConfig, // Expose default theme
    }), [currentTheme, showThemeOptions, showMoreColors]); // Dependencies for memoization

    return (
        <ThemeContext.Provider value={contextValue}>
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