// models/EventOrganization.js
import mongoose from "mongoose";

const eventOrganizationSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
  },
  student_id: {
    type: String,
    required: [true, 'Student ID is required'],
    trim: true,
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required'],
  },
  eventTime: {
    type: String,
    required: [true, 'Event time is required'],
    trim: true,
  },
  eventDescription: {
    type: String,
    trim: true,
    default: '',
  },
  organizerName: {
    type: String,
    required: [true, 'Organizer name is required'],
    trim: true,
  },
  organizerEmail: {
    type: String,
    required: [true, 'Organizer email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)@\w+([.-]?\w+)\.\w{2,}$/, 'Please enter a valid email address'],
  },
  organizerPhone: {
    type: String,
    required: [true, 'Organizer phone number is required'],
    trim: true,
  },
  query: {
    type: String,
    trim: true,
    default: '',
  },
  // --- New Fields for Completion Status and Replies ---
  isCompleted: {
    type: Boolean,
    default: false, // By default, an event organization request is not completed
  },
  completionStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'], // Possible states
    default: 'Pending', // Initial status
  },
  rejectionReason: {
    type: String,
    trim: true,
    default: '', // Reason for rejection, if applicable
  },
  replyMessage: {
    type: String,
    trim: true,
    default: '', // Any message or feedback from the admin/organizer
  },
  repliedAt: {
    type: Date,
    default: null, // When the reply was sent
  },
  repliedBy: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the admin/user who replied
    ref: 'User', // Assuming you have a 'User' model
    default: null,
  },
  // --- End of New Fields ---

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the model
const EventOrganization = mongoose.model('EventOrganization', eventOrganizationSchema);

export default EventOrganization;