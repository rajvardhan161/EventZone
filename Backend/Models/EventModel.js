import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  eventName: { type: String, required: true, trim: true },
  eventDate: { type: Date, required: true },
  // Added: To specify the end date/time of the event
  eventEndDate: { type: Date, required: true },
  eventTime: { type: String, required: true }, // You might consider a single dateTime field instead of separate date/time
  eventDescription: { type: String, trim: true },
  location: { type: String, trim: true },
  isPaid: { type: Boolean, default: false },
  price: { type: Number, default: 0 },

  // --- Cloudinary File Details ---
  qrCodeImageURL: { type: String },       // URL for QR code uploaded by admin
  qrCodePublicId: { type: String },       // Public ID for QR code on Cloudinary

  eventImageURL: { type: String },        // URL for main event image/banner
  eventImagePublicId: { type: String },   // Public ID for event image on Cloudinary

  eventVideoURL: { type: String },        // URL for event video
  eventVideoPublicId: { type: String },   // Public ID for event video on Cloudinary
  // --- End Cloudinary File Details ---

  organizerName: { type: String, required: true, trim: true }, // Organizer if not user-ref
  organizerEmail: { type: String, lowercase: true, trim: true }, // Organizer email
  organizerPhone: { type: String, trim: true }, // Organizer phone
  query: { type: String, trim: true }, // Additional query details

  // If events are created by registered users (students/admins)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Or whatever your User model is called
    required: false, // Make it optional
    default: null // Or set a default if you prefer
  },

  // For managing student applications/attendance
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // List of student IDs attending

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexing for common queries
eventSchema.index({ eventDate: 1 });
eventSchema.index({ eventEndDate: 1 }); // Index for queries involving end dates
eventSchema.index({ eventName: 'text' }); // For searching event names

// Ensure the model is not recreated if it already exists in a hot-reloading environment
const EventModel = mongoose.models.Event || mongoose.model('Event', eventSchema);

export default EventModel;