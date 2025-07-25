// models/HeroModel.js
import mongoose from 'mongoose';

const heroSchema = new mongoose.Schema({
  image: { type: String, required: true },
  altText: { type: String, required: true },
  heading: { type: String, required: true },
  subheading: { type: String, required: true },
  button: {
    text: { type: String, required: true },
    link: { type: String, required: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const HeroModel = mongoose.model('HeroSlide', heroSchema);
export default HeroModel;
