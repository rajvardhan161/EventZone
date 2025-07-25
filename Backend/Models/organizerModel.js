import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
});

const organizerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logoUrl: { type: String, required: true },
  tagline: { type: String, required: true },
  description: { type: String, required: true },
  website: { type: String, required: true },
  contactEmail: { type: String, required: true },
  events: [eventSchema],
}, { timestamps: true });

 
const OrganizerModel = mongoose.model('Organizer', organizerSchema);

export default OrganizerModel;