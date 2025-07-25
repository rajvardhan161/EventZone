 // Adjust the path as per your project structure
import cloudinary from '../config/cloudinaryConfig.js'; // Assume you have a cloudinary config file
import fs from 'fs'; // For deleting temporary files
import EventModel from '../Models/EventModel.js';
import futureModel from '../Models/FeauterModel.js';
import ImageHighlight from '../Models/Highlight.js';
import HeroModel from '../Models/HeroSlide.js';

/**
 * Uploads a single file to Cloudinary.
 * @param {string} filePath - The local path to the file.
 * @param {string} folder - The Cloudinary folder to upload to.
 * @returns {Promise<{url: string, public_id: string} | null>} - Cloudinary URL and public ID, or null if upload fails.
 */
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

/**
 * Creates a new event with uploaded files.
 * @param {Express.Request} req - The request object.
 * @param {Express.Response} res - The response object.
 */
 const createEvent = async (req, res) => {
  try {
    // Access uploaded files from req.files
    const { image, video, qrCode } = req.files;

    let eventImageURL = null;
    let eventVideoURL = null;
    let qrCodeImageURL = null;

    // Upload image if present
    if (image && image[0]) {
      const imageUploadResult = await uploadToCloudinary(image[0].path, 'event_images');
      eventImageURL = imageUploadResult.url;
    }

    // Upload video if present
    if (video && video[0]) {
      const videoUploadResult = await uploadToCloudinary(video[0].path, 'event_videos');
      eventVideoURL = videoUploadResult.url;
    }

    // Upload QR code if present
    if (qrCode && qrCode[0]) {
      const qrCodeUploadResult = await uploadToCloudinary(qrCode[0].path, 'qr_codes');
      qrCodeImageURL = qrCodeUploadResult.url;
    }

    // Extract other event details from req.body
    const {
      eventName,
      eventDate,
      eventEndDate,
      eventTime,
      eventDescription,
      location,
      isPaid,
      price,
      organizerName,
      organizerEmail,
      organizerPhone,
      query,
      participantLimit,
      allowDutyLeave,
    } = req.body;

    // Create the event object
    const newEvent = new EventModel({
      eventName,
      eventDate,
      eventEndDate,
      eventTime,
      eventDescription,
      location,
      isPaid: isPaid === 'true', // Ensure boolean conversion if sent as string
      price: price ? parseFloat(price) : 0, // Ensure price is a number
      participantLimit: participantLimit ? parseInt(participantLimit) : null,
      allowDutyLeave: allowDutyLeave === 'true',
      qrCodeImageURL,
      eventImageURL,
      eventVideoURL,
      organizerName,
      organizerEmail,
      organizerPhone,
      query,
      
      // If you have authenticated users and want to link the creator:
      // createdBy: req.user.id, // Assuming req.user is populated by auth middleware
    });

    // Save the event to the database
    const savedEvent = await newEvent.save();

    res.status(201).json({
      message: 'Event created successfully!',
      event: savedEvent,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    // If there was an error during Cloudinary upload, the files might still exist locally
    // The uploadToCloudinary function should handle local file cleanup.

    res.status(500).json({
      message: 'Failed to create event',
      error: error.message,
    });
  }
};

// --- Example of other controller functions ---

/**
 * Gets all events.
 * @param {Express.Request} req - The request object.
 * @param {Express.Response} res - The response object.
 */
 const getAllEvents = async (req, res) => {
  try {
    const events = await EventModel.find();
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};

/**
 * Gets a single event by ID.
 * @param {Express.Request} req - The request object.
 * @param {Express.Response} res - The response object.
 */
const getEventById = async (req, res) => {
  try {
    const event = await EventModel.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Failed to fetch event', error: error.message });
  }
};

/**
 * Updates an event.
 * Note: This example doesn't handle re-uploading files. You'd need to add logic
 * for deleting old Cloudinary files and uploading new ones if files are updated.
 * @param {Express.Request} req - The request object.
 * @param {Express.Response} res - The response object.
 */
 const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const updateData = req.body;

    // Basic update - you might need to handle file updates separately
    // if you want to allow replacing images/videos.
    // For file updates, you'd typically get the new files, upload them,
    // get their URLs, and then update the event document. You'd also
    // need to delete the old files from Cloudinary using their public_ids.

    const updatedEvent = await EventModel.findByIdAndUpdate(eventId, updateData, { new: true });

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({
      message: 'Event updated successfully!',
      event: updatedEvent,
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Failed to update event', error: error.message });
  }
};

/**
 * Deletes an event.
 * Note: This example doesn't handle deleting files from Cloudinary.
 * You'd need to fetch the event, get its file public_ids, delete them from Cloudinary,
 * and then delete the event from the database.
 * @param {Express.Request} req - The request object.
 * @param {Express.Response} res - The response object.
 */
 const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    // Fetch the event to get file details for deletion from Cloudinary
    const eventToDelete = await EventModel.findById(eventId);

    if (!eventToDelete) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // --- Cloudinary File Deletion (Optional but recommended) ---
    const publicIdsToDelete = [];
    if (eventToDelete.eventImageURL) {
      const publicIdMatch = eventToDelete.eventImageURL.match(/\/([^\/]+)\.\w{3}$/); // Basic extraction, might need refinement
      if (publicIdMatch && publicIdMatch[1]) {
        // If your folder structure is like 'event_images/public_id.ext'
        // You might need to extract the public_id more carefully from the URL
        // Or store public_ids directly in your schema.
        // For simplicity, let's assume a direct public_id storage in schema for robust deletion:
        // If you added `eventImagePublicId` to your schema:
        // if (eventToDelete.eventImagePublicId) publicIdsToDelete.push({ public_id: eventToDelete.eventImagePublicId, type: 'upload' });
        // For this example, let's try a URL-based deletion if public_id isn't stored.
        // Note: Direct URL deletion is less reliable and might not work if URL structure changes.
        // It's STRONGLY recommended to store public_ids.
      }
    }
    if (eventToDelete.eventVideoURL) {
      // Similar logic for video public ID
    }
    if (eventToDelete.qrCodeImageURL) {
      // Similar logic for QR code public ID
    }

    // Example of deleting using public_ids (if stored in schema)
    // For this to work, you need to have `eventImagePublicId`, `eventVideoPublicId`, `qrCodePublicId` in your EventSchema
    // and populate them during upload.
    // if (publicIdsToDelete.length > 0) {
    //   await cloudinary.api.delete_resources(publicIdsToDelete.map(item => item.public_id), { type: 'upload', resource_type: 'auto' });
    //   console.log('Deleted associated files from Cloudinary.');
    // }


    // Delete the event from the database
    await EventModel.findByIdAndDelete(eventId);

    res.status(200).json({ message: 'Event deleted successfully!' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  }
};



const createFutureEvent = async (req, res) => {
  try {
    const { image, video } = req.files;

    let eventImageURL = null;
    let eventVideoURL = null;

    if (image && image[0]) {
      const uploadResult = await uploadToCloudinary(image[0].path, 'event_images');
      eventImageURL = uploadResult.url;
    }

    if (video && video[0]) {
      const uploadResult = await uploadToCloudinary(video[0].path, 'event_videos');
      eventVideoURL = uploadResult.url;
    }

    const {
      eventName,
      eventDate,
      location,
      description,
      isPaid,
      organizerName,
    } = req.body;

    if (new Date(eventDate) <= new Date()) {
      return res.status(400).json({ message: 'Event date must be in the future.' });
    }

    const newEvent = new futureModel({
      eventName,
      eventDate,
      location,
      description,
      isPaid: isPaid === 'true',
      organizerName,
      imageUrl: eventImageURL,
      eventVideoURL,
    });

    const savedEvent = await newEvent.save();

    res.status(201).json({
      message: 'Future event created successfully!',
      event: savedEvent,
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
};


const getAllFutureEvents = async (req, res) => {
  try {
    const currentDate = new Date();

    const futureEvents = await futureModel.find({
      eventDate: { $gt: currentDate }
    }).sort({ eventDate: 1 }); // Optional: Sort by upcoming date

    res.status(200).json({
      message: 'Future events fetched successfully!',
      events: futureEvents
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch future events',
      error: error.message
    });
  }
};


const deleteFutureEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await futureModel.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Optional: Delete files from Cloudinary
    if (event.eventImagePublicId) {
      await cloudinary.uploader.destroy(event.eventImagePublicId);
    }

    if (event.eventVideoPublicId) {
      await cloudinary.uploader.destroy(event.eventVideoPublicId, {
        resource_type: 'video',
      });
    }

    await futureModel.findByIdAndDelete(eventId);

    res.status(200).json({ message: 'Future event deleted successfully.' });

  } catch (error) {
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  }
};


// controllers/futureEventController.js

const editFutureEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await futureModel.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const { image, video } = req.files;

    // If a new image is uploaded, delete old image and upload new one
    if (image && image[0]) {
      if (event.eventImagePublicId) {
        await cloudinary.uploader.destroy(event.eventImagePublicId);
      }
      const result = await uploadToCloudinary(image[0].path, 'event_images');
      event.imageUrl = result.url;
      event.eventImagePublicId = result.public_id;
    }

    // If a new video is uploaded, delete old video and upload new one
    if (video && video[0]) {
      if (event.eventVideoPublicId) {
        await cloudinary.uploader.destroy(event.eventVideoPublicId, { resource_type: 'video' });
      }
      const result = await uploadToCloudinary(video[0].path, 'event_videos');
      event.eventVideoURL = result.url;
      event.eventVideoPublicId = result.public_id;
    }

    const {
      eventName,
      eventDate,
      location,
      description,
      isPaid,
      organizerName,
    } = req.body;

    if (eventDate && new Date(eventDate) <= new Date()) {
      return res.status(400).json({ message: 'Event date must be in the future.' });
    }

    event.eventName = eventName || event.eventName;
    event.eventDate = eventDate || event.eventDate;
    event.location = location || event.location;
    event.description = description || event.description;
    event.isPaid = isPaid !== undefined ? (isPaid === 'true' || isPaid === true) : event.isPaid;
    event.organizerName = organizerName || event.organizerName;

    const updatedEvent = await event.save();

    res.status(200).json({
      message: 'Event updated successfully!',
      event: updatedEvent,
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to update event', error: error.message });
  }
};


 const getFutureEventsPublic = async (req, res) => {
  try {
    const futureEvents = await futureModel.find({ eventDate: { $gt: new Date() } })
      .sort({ eventDate: 1 })
      .limit(5)
      .select('eventName eventDate location imageUrl isPaid organizerName eventVideoURL description')
      .lean();

    res.status(200).json({
      message: 'Next 5 future events fetched successfully!',
      events: futureEvents,
    });

  } catch (error) {
    console.error('Error fetching future events:', error);
    res.status(500).json({ message: 'Failed to fetch future events', error: error.message });
  }
};


  const getEventDetailsPublic = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user?.userId || null; // Optional, if user is logged in (token-based)

    const event = await futureModel.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Increment view count and track unique viewers (optional)
    if (userId) {
      if (!event.viewedByUsers.includes(userId)) {
        event.viewCount += 1;
        event.viewedByUsers.push(userId);
        await event.save();
      }
    } else {
      // No user tracking — increment on every access
      event.viewCount += 1;
      await event.save();
    }

    const eventData = event.toObject();
    delete eventData.eventImagePublicId;
    delete eventData.eventVideoPublicId;
    delete eventData.viewedByUsers;
    delete eventData.__v;

    res.status(200).json({
      message: 'Event details fetched successfully!',
      event: eventData,
    });

  } catch (error) {
    console.error('Error fetching event details:', error);
    res.status(500).json({ message: 'Failed to fetch event details', error: error.message });
  }
};


const createImageHighlights = async (req, res) => {
  try {
    const images = req.files; // assuming images uploaded via multipart/form-data

    if (!images || images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required.' });
    }

    const savedHighlights = [];

    for (const img of images) {
      const uploadResult = await uploadToCloudinary(img.path, 'event_images');

      const newHighlight = new ImageHighlight({
        image: uploadResult.url,
      });

      await newHighlight.save();
      savedHighlights.push(newHighlight);
    }

    res.status(201).json({
      message: 'Images uploaded and highlights created successfully.',
      highlights: savedHighlights,
    });

  } catch (error) {
    console.error('Error creating image highlights:', error);
    res.status(500).json({ message: 'Server error while uploading images.' });
  }
};

const getHighlights = async (req, res) => {
  try {
    const highlights = await ImageHighlight.find().sort({ createdAt: -1 }); // Latest first
    res.status(200).json({
      message: 'Highlights fetched successfully.',
      highlights, // Ensure this sends an array under a 'highlights' key
    });
  } catch (error) {
    console.error('Error fetching highlights:', error);
    res.status(500).json({ message: 'Server error while fetching highlights.' });
  }
};


const deleteHighlight = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL parameter

    // Find and delete the highlight from the database
    const highlight = await ImageHighlight.findByIdAndDelete(id);

    if (!highlight) {
      return res.status(404).json({ message: 'Highlight not found.' });
    }

 
    res.status(200).json({ message: 'Highlight deleted successfully.' });

  } catch (error) {
    console.error('Error deleting highlight:', error);
    // Check if the error is a CastError (invalid ID format)
    if (error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid highlight ID format.' });
    }
    res.status(500).json({ message: 'Server error while deleting highlight.' });
  }
};

 const getPublicHighlights = async (req, res) => {
  try {
    const highlights = await ImageHighlight.find().sort({ createdAt: -1 });

    res.status(200).json(highlights); // Publicly return array of highlights
  } catch (error) {
    console.error('Error fetching public highlights:', error);
    res.status(500).json({ message: 'Server error while fetching highlights.' });
  }
};


const createHeroSlide = async (req, res) => {
  try {
    const { heading, subheading, altText, buttonText, buttonLink } = req.body;
    const image = req.file;

    // Validation
    if (!heading) return res.status(400).json({ message: 'Heading is required.' });
    if (!subheading) return res.status(400).json({ message: 'Subheading is required.' });
    if (!altText) return res.status(400).json({ message: 'Alt text is required.' });
    if (!buttonText || !buttonLink) return res.status(400).json({ message: 'Button text and link are required.' });
    if (!image) return res.status(400).json({ message: 'Image file is required.' });

    // Upload image
    const result = await cloudinary.uploader.upload(image.path, {
      folder: 'hero_slides',
    });

    const slide = new HeroModel({
      image: result.secure_url,
      altText,
      heading,
      subheading,
      button: {
        text: buttonText,
        link: buttonLink,
      }
    });

    await slide.save();

    res.status(201).json({ message: 'Hero slide created successfully', slide });
  } catch (error) {
    console.error('Error creating slide:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


 const getAllHeroSlides = async (req, res) => {
  try {
    const slides = await HeroModel.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json({ slides });
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    res.status(500).json({ message: 'Server error while fetching slides' });
  }
};

const deleteGovNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await HeroModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Notice not found.' });
    }

    res.status(200).json({ message: 'Notice deleted successfully.' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};


export { deleteEvent,createEvent,getAllEvents,getEventById,updateEvent,createFutureEvent,getAllFutureEvents,
  deleteFutureEvent,editFutureEvent,getEventDetailsPublic,getFutureEventsPublic,createImageHighlights,getHighlights,
  deleteHighlight,getPublicHighlights,getAllHeroSlides,createHeroSlide,deleteGovNotice,
}