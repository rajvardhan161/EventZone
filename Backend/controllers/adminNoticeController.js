import mongoose from 'mongoose';
import PublicNoticeModel from "../Models/PublicNoticeModel.js";
import HeroModel from '../Models/HeroSlide.js';
import OrganizerModel from '../Models/organizerModel.js';
import connectCloudinary from '../config/cloudinary.js';
import cloudinary from '../config/cloudinaryConfig.js';
import fs from 'fs'; 

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

// ✅ Create a new public notice (Admin only)
const createPublicNotice = async (req, res) => {
  const { title, message, expiresAt, link, linkText } = req.body;

  if (!title || !message) {
    return res.status(400).json({ message: 'Title and message are required.' });
  }

  try {
    const adminId = req.user.userId;  // ✅ From token (should be ObjectId string)

    const newNotice = new PublicNoticeModel({
      title,
      message, 
sentByAdminId:req.user.email  
,   // ✅ Must be ObjectId or valid string
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      link: link?.trim() || null,
      linkText: linkText?.trim() || null,
    });

    const savedNotice = await newNotice.save();

    const populatedNotice = await PublicNoticeModel.findById(savedNotice._id)
                                                   .populate('sentByAdminId', 'username');

    res.status(201).json({
      message: 'Public notice created successfully!',
      notice: populatedNotice
    });

  } catch (error) {
    console.error('Error creating public notice:', error);
    res.status(500).json({ message: error.message || 'Failed to create public notice.' });
  }
};



// ✅ Get all public notices (Admin View)
const getAllPublicNotices = async (req, res) => {
  try {
    const notices = await PublicNoticeModel.find()
                                           .populate('sentByAdminId', 'username')
                                           .sort({ createdAt: -1 });

    res.status(200).json(notices);

  } catch (error) {
    console.error('Error fetching admin notices:', error);
    res.status(500).json({ message: 'Failed to fetch notices.' });
  }
};



// ✅ Get active public notices (User View)
const getActivePublicNotices = async (req, res) => {
  try {
    const now = new Date();

    const notices = await PublicNoticeModel.find({
      $or: [
        { expiresAt: null },
        { expiresAt: { $gte: now } }
      ]
    })
    .populate('sentByAdminId', 'username')
    .sort({ createdAt: -1 });

    res.status(200).json(notices);

  } catch (error) {
    console.error('Error fetching user notices:', error);
    res.status(500).json({ message: 'Failed to fetch public notices.' });
  }
};


  const getNoticeById = async (req, res) => {
  const { id } = req.params;

  try {
    const notice = await PublicNoticeModel.findById(id).populate('sentByAdminId', 'username');
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found.' });
    }
    res.json(notice);
  } catch (error) {
    console.error('Error fetching notice:', error);
    res.status(500).json({ message: 'Server error while fetching notice.' });
  }
};

// Update Notice by ID
  const updateNotice = async (req, res) => {
  const { id } = req.params;
  const { title, message, expiresAt, link, linkText } = req.body;

  if (!title || !message) {
    return res.status(400).json({ message: 'Title and message are required.' });
  }

  try {
    const notice = await PublicNoticeModel.findById(id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found.' });
    }

    notice.title = title;
    notice.message = message;
    notice.expiresAt = expiresAt || null;
    notice.link = link || '';
    notice.linkText = linkText || '';

    await notice.save();

    res.json({ message: 'Notice updated successfully.', notice });
  } catch (error) {
    console.error('Error updating notice:', error);
    res.status(500).json({ message: 'Server error while updating notice.' });
  }
};

const deleteNotice = async (req, res) => {
  const { id } = req.params;

  try {
    const notice = await PublicNoticeModel.findById(id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found.' });
    }

    await notice.deleteOne();

    res.json({ message: 'Notice deleted successfully.' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).json({ message: 'Server error while deleting notice.' });
  }
};

 
const createOrganizer = async (req, res) => {
  const image = req.file;

  try {
    const {
      name,
      tagline,
      description,
      website,
      contactEmail,
      events,
    } = req.body;

    // Validate fields
    if (!name || !tagline || !description || !website || !contactEmail || !events) {
      return res.status(400).json({ message: 'All fields are required including events.' });
    }

    if (!image || !image.path) {
      return res.status(400).json({ message: 'Image is required.' });
    }

    // ✅ Upload image to Cloudinary using file path
    const cloudResult = await uploadToCloudinary(image.path, 'organizers');

    // ✅ Create new organizer document
    const newOrganizer = new OrganizerModel({
      name,
      logoUrl: cloudResult.url,
      tagline,
      description,
      website,
      contactEmail,
      events: JSON.parse(events), // parsed array from string
    });

    await newOrganizer.save();

    res.status(201).json({
      message: 'Organizer created successfully',
      organizer: newOrganizer,
    });

  } catch (error) {
    console.error('Create Organizer Error:', error);
    res.status(500).json({ message: 'Server error while creating organizer.' });
  }
};


const getAllOrganizers = async (req, res) => {
  try {
    const organizers = await OrganizerModel.find().sort({ createdAt: -1 });
    res.status(200).json(organizers);
  } catch (error) {
    console.error('Fetch Organizers Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteOrganizer = async (req, res) => {
  try {
    const organizerId = req.params.id;
    const deleted = await OrganizerModel.findByIdAndDelete(organizerId);

    if (!deleted) {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    res.status(200).json({ message: 'Organizer deleted successfully' });
  } catch (error) {
    console.error('Delete Organizer Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateOrganizer = async (req, res) => {
  try {
    const organizerId = req.params.id;
    const { name, tagline, description, website, contactEmail } = req.body;
    const events = JSON.parse(req.body.events);

    const updateData = {
      name,
      tagline,
      description,
      website,
      contactEmail,
      events,
    };

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'organizers',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      updateData.logoUrl = uploadResult.secure_url;
    }

    const updatedOrganizer = await OrganizerModel.findByIdAndUpdate(
      organizerId,
      updateData,
      { new: true }
    );

    if (!updatedOrganizer) {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    res.status(200).json({
      message: 'Organizer updated successfully',
      organizer: updatedOrganizer,
    });

  } catch (error) {
    console.error('Update Organizer Error:', error);
    res.status(500).json({ message: 'Server error while updating organizer.' });
  }
};



export {
  createPublicNotice,deleteNotice,createOrganizer,updateOrganizer,
  getAllPublicNotices,updateNotice,getAllOrganizers,
  getActivePublicNotices,getNoticeById,deleteOrganizer,
};
