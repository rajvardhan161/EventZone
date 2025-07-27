import mongoose from "mongoose";
const Schema = mongoose.Schema;

const applicationSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required for application'],
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required for application'],
    index: true,
  },
  userName: {
    type: String,
    required: [true, 'User name is required'],
    trim: true,
  },
  userEmail: {
    type: String,
    required: [true, 'User email is required'],
    lowercase: true,
    trim: true,
  },
  userstudent_id: {type: String, required: true,},

  // 🧑 Student Details
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    required: true,
  },
  phone_no: {
    type: String,
    required: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'],
  },
  course: {
    type: String,
    required: true,
    trim: true,
  },
  profile_photo: {
    type: String, // URL or file path
    default: null,
  },

  // 🗓️ Event Info Snapshot (redundant for history, optional)
  eventName: {
    type: String,
    required: true,
    trim: true,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  eventEndDate:{
    type: Date,
    required: true,

  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  price: {
    type: Number,
    default: 0,
  },
  eventImageURL: {
    type: String,
    default: null,
  },
  eventImagePublicId: {
    type: String,
    default: null,
  },
  qrCodeImageURL: {
    type: String,
    default: null,
  },
  qrCodePublicId: {
    type: String,
    default: null,
  },

  // 💳 Application Fields
  applicationDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'],
    default: 'Pending',
    index: true,
  },
  paymentScreenshotURL: {
    type: String,
    default: null,
  },
  paymentStatus: {
    type: String,
    enum: ['Unverified', 'Verified', 'Refunded', 'Failed'],
    default: 'Unverified',
    index: true,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
  }
}, { timestamps: true });

// Ensure one application per user per event
applicationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

const ApplicationModel = mongoose.model('BookedEvent', applicationSchema);
export default ApplicationModel;
