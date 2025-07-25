import mongoose from 'mongoose';

const organizerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  registrationNo: { type: String, required: true, unique: true },
  post: { type: String, enum: ['student', 'staff'], required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  age: { type: Number, required: true },
  photoUrl: { type: String }, // Store Cloudinary or external image URL
  phone: { type: String, required: true },
  course: { type: String }, // Only required if student
  department: { type: String }, // e.g., CSE, ECE, ME
  year: { type: Number }, // Academic year if student
  staffPosition: { type: String }, // For staff: e.g., Coordinator, Professor
  address: { type: String }, // Optional - residential or contact address
  bio: { type: String }, // Short bio about the organizer
  skills: [{ type: String }], // List of skills
  password: { type: String, required: true },
  isBlocked: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false }, // If account is verified by admin
   
  createdAt: { type: Date, default: Date.now }
});


const OrganizerAccountModel = mongoose.model('OrganizerAccount', organizerSchema);

export default OrganizerAccountModel;
 