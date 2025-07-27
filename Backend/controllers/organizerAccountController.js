 
import bcrypt from 'bcryptjs';
import cloudinary from '../config/cloudinaryConfig.js'; // Assume you have a cloudinary config file
import fs from 'fs';
import OrganizerAccountModel from '../Models/Organizer.js';
import jwt from 'jsonwebtoken';



const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto', // Automatically detect resource type (image, video, etc.)
    });
    return { url: result.secure_url, public_id: result.public_id };
  } catch (error) {
    console.error(`Error uploading to Cloudinary (${folder}):`, error);
    throw error; // Re-throw to be handled by the calling function
  } finally {
    // Clean up the temporary file after upload
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error deleting temporary file ${filePath}:`, err);
      }
    });
  }
};

const createOrganizerAccount = async (req, res) => {
  try {
    const {
      name,
      email,
      registrationNo,
      post,
      gender,
      age,
      phone,
      course,
      department,
      year,
      staffPosition,
      address,
      bio,
      skills, // The raw skills string from the request
      password,
    } = req.body;

    // Check required fields
    if (!name || !email || !registrationNo || !post || !gender || !age || !phone || !password) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Check uniqueness
    const existing = await OrganizerAccountModel.findOne({
      $or: [{ email }, { registrationNo }],
    });
    if (existing) {
      return res.status(400).json({ message: 'Email or Registration No already exists' });
    }

    // Upload photo to Cloudinary (if present)
    let photoUrl = '';
    if (req.file) {
      // NOTE: I'm assuming uploadToCloudinary is correct and not showing it again for brevity
      const result = await uploadToCloudinary(req.file.path, 'organizers');
      photoUrl = result.url;
    }
    
    // --- START OF THE FIX ---
   let parsedSkills = [];
if (skills) {
  if (Array.isArray(skills)) {
    // Already an array, use it directly
    parsedSkills = skills;
  } else if (typeof skills === 'string') {
    try {
      parsedSkills = JSON.parse(skills); // Try to parse JSON array string
      if (!Array.isArray(parsedSkills)) {
        // If it's not an array after parsing, fallback to split
        parsedSkills = skills.split(',').map(s => s.trim());
      }
    } catch {
      // If parsing fails, treat it as comma-separated string
      parsedSkills = skills.split(',').map(s => s.trim());
    }
  }
}

    // --- END OF THE FIX ---

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create organizer object
    const newOrganizer = new OrganizerAccountModel({
      name,
      email,
      registrationNo,
      post,
      gender,
      age,
      photoUrl,
      phone,
      course: post === 'student' ? course : undefined,
      department,
      year: post === 'student' ? year : undefined,
      staffPosition: post === 'staff' ? staffPosition : undefined,
      address,
      bio,
      skills: parsedSkills, // Use the safely parsed array here
      password: hashedPassword,
    });

    await newOrganizer.save();
    res.status(201).json({ message: 'Organizer account created successfully', newOrganizer });
  } catch (error) {
    // This will now catch other errors, not the JSON.parse one
    console.error('Error creating organizer:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};



 
// GET all organizers
  const getAllOrganizers = async (req, res) => {
  try {
    const organizers = await OrganizerAccountModel.find();
    res.status(200).json(organizers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching organizers', error: error.message });
  }
};

// GET organizer by ID
  const getOrganizerById = async (req, res) => {
  try {
    const organizer = await OrganizerAccountModel.findById(req.params.id);
    if (!organizer) return res.status(404).json({ message: 'Organizer not found' });
    res.status(200).json(organizer);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching organizer', error: error.message });
  }
};

const updateOrganizer = async (req, res) => {
  try {
    const organizerId = req.params.id;
    const updates = req.body;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'organizers',
      });

      updates.photoUrl = result.secure_url;

      // Remove temp file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    const updated = await OrganizerAccountModel.findByIdAndUpdate(
      organizerId,
      updates,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    res.status(200).json({ message: 'Organizer updated successfully', updated });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

// DELETE organizer
  const deleteOrganizer = async (req, res) => {
  try {
    const deleted = await OrganizerAccountModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Organizer not found' });
    res.status(200).json({ message: 'Organizer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};

// BLOCK or UNBLOCK organizer
  const blockOrganizer = async (req, res) => {
  try {
    const organizer = await OrganizerAccountModel.findById(req.params.id);
    if (!organizer) return res.status(404).json({ message: 'Organizer not found' });

    organizer.isBlocked = !organizer.isBlocked;
    await organizer.save();

    res.status(200).json({
      message: `Organizer has been ${organizer.isBlocked ? 'blocked' : 'unblocked'}`,
      isBlocked: organizer.isBlocked
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating block status', error: error.message });
  }
};

const loginOrganizer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const organizer = await OrganizerAccountModel.findOne({ email });
    if (!organizer) {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, organizer.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Optionally check if blocked
    if (organizer.isBlocked) {
      return res.status(403).json({ message: 'Organizer is blocked' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: organizer._id, email: organizer.email, post: organizer.post },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Send back token and user info
    res.status(200).json({
      message: 'Login successful',
      token,
      organizer: {
        id: organizer._id,
        name: organizer.name,
        email: organizer.email,
        post: organizer.post,
        photoUrl: organizer.photoUrl,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};



const getStaffProfile = async (req, res) => {
  try {
    const staffId = req.user?.id;

    if (!staffId) {
      return res.status(401).json({ message: 'Unauthorized: No staff ID found in token' });
    }

    const staff = await OrganizerAccountModel.findById(staffId).select('-password');
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    res.status(200).json({ profile: staff });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get profile', error: error.message });
  }
};



const updateOrganizerProfile = async (req, res) => {
  try {
    const organizerId = req.user?.id;

    if (!organizerId) {
      return res.status(401).json({ message: 'Unauthorized: No organizer ID found in token' });
    }

    const organizer = await OrganizerAccountModel.findById(organizerId);
    if (!organizer) {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    // Fields allowed to update
    const {
      name,
      gender,
      age,
      address,
      bio,
      skills,
      course,
      year
    } = req.body;

    // Only update allowed fields
    if (name) organizer.name = name;
    if (gender) organizer.gender = gender;
    if (age) organizer.age = age;
    if (address) organizer.address = address;
    if (bio) organizer.bio = bio;
    if (Array.isArray(skills)) organizer.skills = skills;
    if (organizer.post === 'student') {
      if (course) organizer.course = course;
      if (year) organizer.year = year;
    }

    await organizer.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      updatedProfile: {
        name: organizer.name,
        gender: organizer.gender,
        age: organizer.age,
        address: organizer.address,
        bio: organizer.bio,
        skills: organizer.skills,
        course: organizer.course,
        year: organizer.year
      }
    });
  } catch (error) {
    console.error('Error updating organizer profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export {createOrganizerAccount,getAllOrganizers,getOrganizerById,updateOrganizer,deleteOrganizer,blockOrganizer,
  loginOrganizer,getStaffProfile,updateOrganizerProfile,

}