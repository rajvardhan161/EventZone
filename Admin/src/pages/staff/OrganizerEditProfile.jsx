import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { AdminContext } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiMapPin, FiAward, FiBookOpen, FiClock, FiTag, FiX, FiLoader } from 'react-icons/fi';

// --- Reusable Form Field Components ---

const InputField = ({ icon, label, ...props }) => (
  <div>
    <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        {icon}
      </div>
      <input
        {...props}
        className="w-full pl-10 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition"
      />
    </div>
  </div>
);

const SelectField = ({ icon, label, children, ...props }) => (
  <div>
    <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        {icon}
      </div>
       <select
        {...props}
        className="w-full pl-10 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition appearance-none"
      >
        {children}
      </select>
    </div>
  </div>
);


const SkillsInput = ({ skills, setSkills }) => {
  const [currentSkill, setCurrentSkill] = useState('');

  const handleKeyDown = (e) => {
    if (e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const value = currentSkill.trim();
    if (!value || skills.includes(value)) {
      setCurrentSkill('');
      return;
    };
    setSkills([...skills, value]);
    setCurrentSkill('');
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills</label>
      <div className="flex flex-wrap items-center gap-2 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
        {skills.map(skill => (
          <span key={skill} className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium">
            {skill}
            <button type="button" onClick={() => removeSkill(skill)} className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100">
              <FiX size={16} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={currentSkill}
          onChange={(e) => setCurrentSkill(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a skill and press Enter"
          className="flex-grow bg-transparent outline-none p-1 text-gray-900 dark:text-white"
        />
      </div>
       <p className="text-xs text-gray-500 mt-1">Separate skills with a comma or by pressing Enter.</p>
    </div>
  );
};


// --- Main Component ---

const OrganizerEditProfile = () => {
  const { backendUrl, organizer: organizerToken } = useContext(AdminContext);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    age: '',
    address: '',
    bio: '',
    skills: [],
    course: '',
    year: '',
    post: '' // Store post to conditionally render fields
  });

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use data passed from profile page for instant load, or fetch if accessed directly
  useEffect(() => {
    const loadProfile = async () => {
      // 1. Prioritize data from location state for instant UI
      if (location.state?.profileData) {
        const { profileData } = location.state;
        setFormData({
          name: profileData.name || '',
          gender: profileData.gender || '',
          age: profileData.age || '',
          address: profileData.address || '',
          bio: profileData.bio || '',
          skills: profileData.skills || [],
          course: profileData.course || '',
          year: profileData.year || '',
          post: profileData.post || '' // Important for conditional logic
        });
        setLoading(false);
        return;
      }

      // 2. Fallback to fetching from API
      try {
        const res = await axios.get(`${backendUrl}/api/organizer/profile`, {
          headers: { Authorization: `Bearer ${organizerToken}` }
        });
        const data = res.data.profile;
        setFormData({
          name: data.name || '',
          gender: data.gender || '',
          age: data.age || '',
          address: data.address || '',
          bio: data.bio || '',
          skills: data.skills || [],
          course: data.course || '',
          year: data.year || '',
          post: data.post || ''
        });
      } catch (error) {
        toast.error('Failed to load profile. Please try again.');
        console.error(error);
        navigate('/organizer/profile'); // Navigate back if loading fails
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [backendUrl, organizerToken, location.state, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (newSkills) => {
    setFormData(prev => ({ ...prev, skills: newSkills }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.put(`${backendUrl}/api/organizer/profile/edit`, formData, {
        headers: { Authorization: `Bearer ${organizerToken}` }
      });
      toast.success('Profile updated successfully!');
      navigate('/profile'); // Navigate back to profile view
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) return <p className="text-center mt-10 text-lg">Loading Profile Editor...</p>;

  return (
    <div className="max-w-4xl mx-auto my-10 px-4">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Edit Profile</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Update your personal details and skills.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" icon={<FiUser className="text-gray-400" />} />
            <InputField label="Age" name="age" type="number" value={formData.age} onChange={handleChange} placeholder="21" icon={<FiClock className="text-gray-400" />} />
            
            <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange} icon={<FiUser className="text-gray-400" />}>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </SelectField>

            <InputField label="Address" name="address" value={formData.address} onChange={handleChange} placeholder="123 Main St, Anytown" icon={<FiMapPin className="text-gray-400" />} className="md:col-span-2" />
            
            {/* Conditional fields for students */}
            {formData.post === 'student' && (
              <>
                <InputField label="Course" name="course" value={formData.course} onChange={handleChange} placeholder="B.Tech in CSE" icon={<FiBookOpen className="text-gray-400" />} />
                <InputField label="Year" name="year" type="number" value={formData.year} onChange={handleChange} placeholder="3" icon={<FiAward className="text-gray-400" />} />
              </>
            )}

            <div className="md:col-span-2">
               <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
               <textarea id="bio" name="bio" rows="4" value={formData.bio} onChange={handleChange} placeholder="Tell us something about yourself..." className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition"></textarea>
            </div>

            <SkillsInput skills={formData.skills} setSkills={handleSkillsChange} />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={() => navigate('/profile')} className="py-2 px-6 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex items-center justify-center py-2 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transition">
              {isSubmitting ? <FiLoader className="animate-spin mr-2" /> : null}
              {isSubmitting ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizerEditProfile;