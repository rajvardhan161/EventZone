import React, { useEffect, useContext, useState, useCallback, Fragment } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiAward, FiBriefcase,
  FiBookOpen, FiClock, FiCheckCircle, FiXCircle, FiEdit, FiAlertTriangle,
  FiShare2, FiCopy, FiLinkedin, FiTwitter, FiGithub, FiLink
} from 'react-icons/fi';
import { Transition } from '@headlessui/react';

// --- Helper Functions ---

const getInitials = (name = '') => {
  const words = name.split(' ');
  if (words.length > 1 && words[0] && words[1]) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// --- Enhanced & New Sub-components ---

/**
 * A versatile card component with built-in transition and optional header.
 */
const Card = ({ children, className = '', isVisible, title, icon }) => (
  <Transition
    show={isVisible}
    as="div"
    enter="transition-all duration-500 ease-out"
    enterFrom="opacity-0 translate-y-5"
    enterTo="opacity-100 translate-y-0"
    className={`bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden ${className}`}
  >
    {title && (
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
        {icon && React.cloneElement(icon, { className: 'h-6 w-6 text-blue-500' })}
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </Transition>
);

const ProfileHeader = ({ profile }) => (
  <div className="flex flex-col items-center text-center p-6 bg-gray-50 dark:bg-gray-800/50">
    <div className="relative mb-4">
      {profile.photoUrl ? (
        <img
          src={profile.photoUrl}
          alt={profile.name}
          className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md"
        />
      ) : (
        <div className="w-32 h-32 rounded-full bg-blue-500 dark:bg-blue-700 flex items-center justify-center text-white text-4xl font-bold border-4 border-white dark:border-gray-700 shadow-md">
          {getInitials(profile.name)}
        </div>
      )}
      <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-700 rounded-full shadow-md">
        <StatusBadge status={profile.isVerified ? 'verified' : (profile.isBlocked ? 'blocked' : 'pending')} />
      </div>
    </div>
    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{profile.name}</h1>
    <p className="text-md text-gray-500 dark:text-gray-400 mt-1">{profile.post || 'Organizer'}</p>
  </div>
);

/**
 * A more robust DetailItem with built-in copy functionality.
 */
const DetailItem = ({ icon, label, value, isEmail = false }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!value) return;
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    const Wrapper = isEmail ? 'button' : 'div';
    const wrapperProps = isEmail ? { onClick: handleCopy, className: "w-full text-left" } : {};

    return (
        <Wrapper {...wrapperProps}>
            <div className={`flex items-center space-x-4 p-2 rounded-lg transition-colors ${isEmail ? 'hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer' : ''}`}>
                <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 p-3 rounded-full text-gray-600 dark:text-gray-300">
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{value || 'N/A'}</p>
                </div>
                {isEmail && (
                    <div className="text-gray-400 dark:text-gray-500 transition-opacity">
                        {copied ? <FiCheckCircle className="text-green-500" /> : <FiCopy />}
                    </div>
                )}
            </div>
        </Wrapper>
    );
};

/**
 * A scalable StatusBadge that uses a config object.
 */
const StatusBadge = ({ status }) => {
  const statusConfig = {
    verified: { icon: <FiCheckCircle />, text: 'Verified', className: 'text-green-500' },
    blocked: { icon: <FiXCircle />, text: 'Blocked', className: 'text-red-500' },
    pending: { icon: <FiClock />, text: 'Pending', className: 'text-yellow-500' },
  };
  const currentStatus = statusConfig[status] || statusConfig.pending;
  return (
    <span className={currentStatus.className} title={currentStatus.text}>
      {currentStatus.icon}
    </span>
  );
};


const EditProfileButton = ({ onClick }) => (
  <div className="fixed bottom-10 right-10 group z-50">
    <button
      onClick={onClick}
      className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
      aria-label="Edit Profile"
    >
      <FiEdit size={24} />
    </button>
    <div className="absolute bottom-1/2 right-full mr-4 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
      Edit Profile
    </div>
  </div>
);

const SkeletonLoader = () => (
    <div className="max-w-6xl mx-auto mt-10 p-4 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-gray-200 dark:bg-gray-700 shadow-lg rounded-xl p-6 h-64"></div>
                <div className="bg-gray-200 dark:bg-gray-700 shadow-lg rounded-xl p-6 h-48"></div>
            </div>
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-200 dark:bg-gray-700 shadow-lg rounded-xl p-6 h-80"></div>
                <div className="bg-gray-200 dark:bg-gray-700 shadow-lg rounded-xl p-6 h-32"></div>
            </div>
        </div>
    </div>
);

const ErrorDisplay = ({ message, onRetry }) => (
    <div className="max-w-3xl mx-auto mt-10 p-6 text-center">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-red-200 dark:border-red-700">
            <FiAlertTriangle className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-lg font-medium text-red-800 dark:text-red-300">Profile Error</h3>
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{message}</p>
            <button
                onClick={onRetry}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
                Try Again
            </button>
        </div>
    </div>
);

const SocialLinks = ({ socials }) => {
    if (!socials || Object.keys(socials).length === 0) return null;
    
    const socialIcons = {
        linkedin: <FiLinkedin />,
        twitter: <FiTwitter />,
        github: <FiGithub />,
        website: <FiLink />,
    };

    return (
        <div className="flex justify-center space-x-4 mt-4">
            {Object.entries(socials).map(([key, value]) => value && (
                <a
                    key={key}
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors"
                    aria-label={`Visit ${key} profile`}
                >
                    {socialIcons[key] || <FiLink />}
                </a>
            ))}
        </div>
    );
};


// --- Main Enhanced Component ---

const OrganizerProfile = () => {
  const { backendUrl, organizer: organizerToken } = useContext(AdminContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${backendUrl}/api/organizer/profile`, {
        headers: { Authorization: `Bearer ${organizerToken}` },
      });
      // Simulate network delay to see animations
      // await new Promise(resolve => setTimeout(resolve, 500)); 
      setProfile(res.data.profile);
    } catch (err) {
      console.error('Error fetching organizer profile:', err);
      setError(err.response?.data?.message || 'Could not fetch profile data.');
    } finally {
      setLoading(false);
    }
  }, [backendUrl, organizerToken]);

  useEffect(() => {
    if (organizerToken) {
        fetchProfile();
    } else {
        setLoading(false);
        setError("Not authenticated. No organizer token found.");
    }
  }, [fetchProfile, organizerToken]);

  useEffect(() => {
    if (!loading && profile) {
      // Small delay to allow initial layout paint before triggering animations
      const timer = setTimeout(() => setIsReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading, profile]);
  
  const handleNavigateToEdit = useCallback(() => {
    navigate('/edit', { state: { profileData: profile } });
  }, [navigate, profile]);

  if (loading) return <SkeletonLoader />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchProfile} />;
  if (!profile) return <p className="text-center text-red-500 mt-10">No profile data found.</p>;

  // Data-driven approach for details to avoid repetitive JSX
  const professionalDetails = [
    { label: "Registration No.", value: profile.registrationNo, icon: <FiBriefcase size={20} /> },
    { label: "Course", value: profile.course, icon: <FiBookOpen size={20} /> },
    { label: "Department", value: profile.department, icon: <FiBriefcase size={20} /> },
    { label: "Year", value: profile.year, icon: <FiClock size={20} /> },
    { label: "Staff Position", value: profile.staffPosition, icon: <FiAward size={20} /> },
  ].filter(item => item.value); // Filter out items with no value

  return (
    <div className="max-w-6xl mx-auto my-10 px-4">
      <EditProfileButton onClick={handleNavigateToEdit} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Header & Core Info */}
        <div className="lg:col-span-1 space-y-8">
          <Card isVisible={isReady} className="p-0">
              <ProfileHeader profile={profile} />
              <div className="p-6 space-y-4">
                  <DetailItem icon={<FiMail size={20} />} label="Email" value={profile.email} isEmail />
                  <DetailItem icon={<FiPhone size={20} />} label="Phone" value={profile.phone} />
                  <DetailItem icon={<FiUser size={20} />} label="Gender" value={profile.gender} />
                  <DetailItem icon={<FiAward size={20} />} label="Age" value={profile.age} />
                  <DetailItem icon={<FiClock size={20} />} label="Joined" value={formatDate(profile.createdAt)} />
              </div>
              <SocialLinks socials={profile.socials} />
              <div className="p-4"></div>
          </Card>
        </div>

        {/* Right Column: Bio, Details, Skills */}
        <div className="lg:col-span-2 space-y-8">
          {profile.bio && (
            <Card isVisible={isReady} title="About Me">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
            </Card>
          )}

          {professionalDetails.length > 0 && (
            <Card isVisible={isReady} title="Professional Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {professionalDetails.map((item, index) => (
                    <DetailItem key={index} {...item} />
                ))}
              </div>
            </Card>
          )}
          
          <Card isVisible={isReady} title="Skills">
            {profile.skills && profile.skills.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {profile.skills.map((skill, idx) => (
                  <li key={idx} className="px-3 py-1.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium transition-transform duration-200 hover:scale-105 cursor-default">
                    {skill}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No skills listed.</p>
            )}
          </Card>

          {profile.address && (
              <Card isVisible={isReady} title="Location">
                <DetailItem icon={<FiMapPin size={20} />} label="Address" value={profile.address} />
              </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerProfile;