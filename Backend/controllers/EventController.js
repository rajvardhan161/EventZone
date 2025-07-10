 // Adjust the path as per your project structure
import cloudinary from '../config/cloudinaryConfig.js'; // Assume you have a cloudinary config file
import fs from 'fs'; // For deleting temporary files
import EventModel from '../Models/EventModel.js';

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

export { deleteEvent,createEvent,getAllEvents,getEventById,updateEvent}