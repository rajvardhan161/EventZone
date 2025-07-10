// models/Inquiry.js
import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  student_id: {
    type: String,
    required: [true, 'Student ID is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)@\w+([.-]?\w+)\.\w{2,}$/, 'Please enter a valid email address'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  query: {
    type: String,
    required: [true, 'Your problem description is required'],
    trim: true,
  },

  // --- New Fields for Inquiry Status and Replies ---
  isResolved: {
    type: Boolean,
    default: false, // Whether the inquiry has been resolved
  },
  inquiryStatus: {
    type: String,
    enum: ['Open', 'In Progress', 'Awaiting Reply', 'Resolved', 'Closed'], // Possible states for an inquiry
    default: 'Open', // Initial status
  },
  resolutionDetails: {
    type: String,
    trim: true,
    default: '', // Details about how it was resolved, or a reply to the user
  },
  resolvedAt: {
    type: Date,
    default: null, // When the inquiry was marked as resolved
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the user who resolved it
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
const InquiryModel = mongoose.model('Inquiry', inquirySchema);

export default InquiryModel;