// routes/eventRoutes.js
import express from 'express'; 
import upload, { uploadFields } from '../middlewares/upload.js';
import { createEvent, createFutureEvent, createHeroSlide, createImageHighlights, deleteEvent, deleteFutureEvent, deleteGovNotice, deleteHighlight, editFutureEvent, getAllEvents, getAllFutureEvents, getAllHeroSlides, getEventById, getHighlights, getPublicHighlights, updateEvent } from '../controllers/eventController.js';
import authAdmin from '../middlewares/authAdmin.js';
import { createOrganizer, deleteOrganizer, getAllOrganizers, updateOrganizer } from '../controllers/adminNoticeController.js';

const eventrouter = express.Router();
 eventrouter.post('/create',authAdmin, uploadFields, createEvent);
eventrouter.get('/allevent',authAdmin, getAllEvents);
eventrouter.get('/event/:id',authAdmin, getEventById);
eventrouter.put('/update/:id',authAdmin, uploadFields, updateEvent); 
eventrouter.delete('/event/delete/:id',authAdmin, deleteEvent);
eventrouter.post('/future-events',authAdmin,upload.fields([{ name: 'image' }, { name: 'video' }]),createFutureEvent);
eventrouter.get('/get/future-events',authAdmin, getAllFutureEvents);
eventrouter.delete('/future-events/:id',authAdmin, deleteFutureEvent);
eventrouter.put(
  '/future-events/:id',authAdmin,
  upload.fields([{ name: 'image' }, { name: 'video' }]),
  editFutureEvent
);

eventrouter.post('/highlights', authAdmin,upload.array('image', 10), createImageHighlights);
eventrouter.get('/highlights',authAdmin, getHighlights);
eventrouter.delete('/highlights/:id',authAdmin, deleteHighlight);
eventrouter.get('/public/highlights', getPublicHighlights);

eventrouter.post('/hero/create',authAdmin, upload.single('image'), createHeroSlide);
eventrouter.get('/get/hero',authAdmin,getAllHeroSlides)
eventrouter.delete('/hero/:id', deleteGovNotice);
eventrouter.post('/organizers',authAdmin,upload.single('image') ,createOrganizer);
eventrouter.get('/organizers',authAdmin, getAllOrganizers);
eventrouter.delete('/organizers/:id', authAdmin, deleteOrganizer);
eventrouter.put('/organizers/:id', upload.single('image'), authAdmin, updateOrganizer);

export default eventrouter;
