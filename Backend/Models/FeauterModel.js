// models/Event.js
import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date and time are required'],
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
    default: 'https://via.placeholder.com/300x200.png?text=Event+Image',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  isPaid: {
    type: Boolean,
    default: false,
  },
  eventVideoURL: {
    type: String,
    trim: true,
    validate: {
      validator: function(url) {
        return /^https?:\/\/.+/.test(url);
      },
      message: props => `${props.value} is not a valid URL!`,
    },
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  viewedByUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  organizerName: {
    type: String,
    trim: true,
    default: 'Admin',
  },

}, {
  timestamps: true,
});

// Ensure event date is in the future
eventSchema.pre('save', function(next) {
  if (this.isNew && this.eventDate <= new Date()) {
    return next(new Error('Event date must be in the future.'));
  }
  next();
});

// Method to increment view count
eventSchema.methods.incrementViewCount = async function(userId) {
  this.viewCount += 1;
  if (userId && !this.viewedByUsers.includes(userId)) {
    this.viewedByUsers.push(userId);
  }
  return await this.save();
};

// Correct model export
const futureModel = mongoose.model('featureevents', eventSchema);
export default futureModel;
