// routes/eventRoutes.js
import express from 'express'; 
import { uploadFields } from '../middlewares/upload.js';
import { createEvent, deleteEvent, getAllEvents, getEventById, updateEvent } from '../controllers/eventController.js';

const eventrouter = express.Router();
 eventrouter.post('/create', uploadFields, createEvent);
eventrouter.get('/allevent', getAllEvents);
eventrouter.get('/event/:id', getEventById);
eventrouter.put('/update/:id', uploadFields, updateEvent); 
eventrouter.delete('/event/delete/:id', deleteEvent);
export default eventrouter;
