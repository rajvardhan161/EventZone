// models/ImageHighlight.js
import mongoose from 'mongoose';

const imageHighlightSchema = new mongoose.Schema({
  image: {
    type: String,
    required: [true, 'Image URL is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const ImageHighlight = mongoose.model('ImageHighlight', imageHighlightSchema);
export default ImageHighlight;
