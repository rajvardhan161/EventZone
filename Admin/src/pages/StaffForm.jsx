import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form'; // New: The core of our new form logic
import { AdminContext } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import {
  FaUser, FaEnvelope, FaIdCard, FaVenusMars, FaBirthdayCake, FaPhone,
  FaBook, FaBuilding, FaCalendarDay, FaUserTie, FaMapMarkedAlt,
  FaLightbulb, FaLock, FaUpload, FaSpinner, FaPlusCircle, FaEye, FaEyeSlash, FaTimes, FaExclamationCircle
} from 'react-icons/fa';

// Helper component for displaying validation errors
const ValidationError = ({ message }) => (
  <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
    <FaExclamationCircle />
    {message}
  </p>
);

const CreateOrganizerForm = () => {
  const { backendUrl, token } = useContext(AdminContext);
  const { isDarkMode } = useTheme();
  
  // --- React Hook Form Setup ---
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
    mode: "onBlur", // Validate fields when the user blurs (leaves) them
    defaultValues: {
      post: 'student',
      gender: 'male',
    }
  });

  // State for things outside the form data (UI state)
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Watch the 'post' field to conditionally render UI elements
  const postType = watch('post');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if(file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("Image size should not exceed 2MB.");
        return;
      }
      setImage(file);
      if (imagePreview) URL.revokeObjectURL(imagePreview); // Clean up previous preview
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    // Also reset the file input field in the form
    reset({ image: null }); 
  };
  
  // Clean up the object URL on component unmount
  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  // --- The function that runs on successful validation ---
  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      const form = new FormData();
      // Append all validated data from react-hook-form
      Object.keys(data).forEach(key => form.append(key, data[key]));
      if (image) form.append('image', image);

      const res = await axios.post(`${backendUrl}/api/organizer/create`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(res.data.message || 'Organizer created successfully!');
      reset(); // Reset the form using react-hook-form's method
      handleRemoveImage(); // Clear the image state
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to create organizer.');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic classes for input fields
  const inputClasses = `w-full p-2.5 rounded-lg border transition-colors duration-300 ${
    isDarkMode
      ? 'bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
      : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
  }`;

  const fieldsetClasses = `p-4 border rounded-lg transition-colors duration-300 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`;
  const legendClasses = `px-2 text-lg font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`;

  return (
    <div className={`p-4 md:p-8 max-w-4xl mx-auto rounded-lg shadow-2xl transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <h2 className={`text-3xl font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Create New Organizer
      </h2>
      
      {/* handleSubmit will validate before calling our onSubmit function */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Fieldset for better grouping and accessibility */}
        <fieldset className={fieldsetClasses}>
          <legend className={legendClasses}>Account Information</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium">Full Name</label>
              <input id="name" type="text" placeholder="John Doe" className={inputClasses} {...register("name", { required: "Full name is required" })} />
              {errors.name && <ValidationError message={errors.name.message} />}
            </div>
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium">Email Address</label>
              <input id="email" type="email" placeholder="john.doe@example.com" className={inputClasses} {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" } })} />
              {errors.email && <ValidationError message={errors.email.message} />}
            </div>
            <div>
              <label htmlFor="registrationNo" className="block mb-2 text-sm font-medium">Registration No.</label>
              <input id="registrationNo" type="text" placeholder="12320000" className={inputClasses} {...register("registrationNo", { required: "Registration number is required" })} />
              {errors.registrationNo && <ValidationError message={errors.registrationNo.message} />}
            </div>
            <div className="relative">
              <label htmlFor="password"  className="block mb-2 text-sm font-medium">Password</label>
              <input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className={inputClasses} {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.password && <ValidationError message={errors.password.message} />}
            </div>
          </div>
        </fieldset>

        <fieldset className={fieldsetClasses}>
            <legend className={legendClasses}>Personal & Professional Details</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label htmlFor="post" className="block mb-2 text-sm font-medium">I am a</label>
                  <select id="post" className={inputClasses} {...register("post")}>
                    <option value="student">Student</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="gender" className="block mb-2 text-sm font-medium">Gender</label>
                  <select id="gender" className={inputClasses} {...register("gender")}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="age" className="block mb-2 text-sm font-medium">Age</label>
                  <input id="age" type="number" placeholder="21" className={inputClasses} {...register("age", { required: "Age is required", valueAsNumber: true, min: { value: 16, message: "Age must be at least 16" } })} />
                  {errors.age && <ValidationError message={errors.age.message} />}
                </div>
                <div>
                  <label htmlFor="phone" className="block mb-2 text-sm font-medium">Phone Number</label>
                  <input id="phone" type="tel" placeholder="9876543210" className={inputClasses} {...register("phone", { required: "Phone number is required", pattern: { value: /^\d{10}$/, message: "Please enter a valid 10-digit phone number" } })} />
                  {errors.phone && <ValidationError message={errors.phone.message} />}
                </div>
                
                {/* Conditional Fields */}
                {postType === 'student' && (
                  <>
                    <div>
                      <label htmlFor="course" className="block mb-2 text-sm font-medium">Course</label>
                      <input id="course" type="text" placeholder="B.Tech" className={inputClasses} {...register("course", { required: "Course is required for students" })} />
                      {errors.course && <ValidationError message={errors.course.message} />}
                    </div>
                    <div>
                      <label htmlFor="year" className="block mb-2 text-sm font-medium">Year of Study</label>
                      <input id="year" type="text" placeholder="3rd Year" className={inputClasses} {...register("year", { required: "Year is required for students" })} />
                      {errors.year && <ValidationError message={errors.year.message} />}
                    </div>
                  </>
                )}
                {postType === 'staff' && (
                  <div className="md:col-span-2">
                    <label htmlFor="staffPosition" className="block mb-2 text-sm font-medium">Staff Position</label>
                    <input id="staffPosition" type="text" placeholder="Assistant Professor" className={inputClasses} {...register("staffPosition", { required: "Position is required for staff" })} />
                    {errors.staffPosition && <ValidationError message={errors.staffPosition.message} />}
                  </div>
                )}
            </div>
        </fieldset>

        <fieldset className={fieldsetClasses}>
          <legend className={legendClasses}>Additional Information</legend>
          <div className="space-y-6 mt-4">
            <div>
              <label htmlFor="department" className="block mb-2 text-sm font-medium">Department</label>
              <input id="department" type="text" placeholder="Computer Science" className={inputClasses} {...register("department")} />
            </div>
            <div>
              <label htmlFor="skills" className="block mb-2 text-sm font-medium">Skills (comma-separated)</label>
              <input id="skills" type="text" placeholder="React, Node.js, Leadership" className={inputClasses} {...register("skills")} />
            </div>
            <div>
              <label htmlFor="bio" className="block mb-2 text-sm font-medium">Bio</label>
              <textarea id="bio" rows="4" placeholder="A brief introduction..." className={inputClasses} {...register("bio")}></textarea>
            </div>
             <div>
              <label className="block mb-2 text-sm font-medium">Profile Image</label>
              <div className="flex items-center gap-4">
                <label htmlFor="image-upload" className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center gap-2">
                   <FaUpload />
                   <span>{image ? "Change File" : "Choose File"}</span>
                </label>
                <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                {imagePreview && (
                  <div className="flex items-center gap-2">
                    <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-blue-400"/>
                    <button type="button" onClick={handleRemoveImage} className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600">
                        <FaTimes/>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </fieldset>

        <div>
          <button type="submit" disabled={loading} className="w-full text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-lg px-5 py-3 text-center disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105">
            {loading ? (
              <><FaSpinner className="animate-spin" /><span>Creating Organizer...</span></>
            ) : (
              <><FaPlusCircle /><span>Create Organizer</span></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrganizerForm;