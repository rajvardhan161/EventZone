import express from 'express'; 

import upload from '../config/multer.js';
import authAdmin from '../middlewares/authAdmin.js';
import { blockOrganizer, createOrganizerAccount, deleteOrganizer, getAllOrganizers, getOrganizerById, getStaffProfile, loginOrganizer, updateOrganizer, updateOrganizerProfile } from '../controllers/organizerAccountController.js';
import authOrgan from '../middlewares/authOrgan.js';
import { uploadFields } from '../middlewares/upload.js';
import { createEvent,   getEventByIdorgan, getEvents } from '../controllers/eventController.js';

const organizerRoutes = express.Router();

// Create organizer (admin only) — includes photo upload
organizerRoutes.post('/create', authAdmin, upload.single('image'), createOrganizerAccount);

organizerRoutes.get('/all', authAdmin, getAllOrganizers);    
organizerRoutes.get('/get/:id', authAdmin, getOrganizerById);
organizerRoutes.put('/update/:id', authAdmin, upload.single('image'), updateOrganizer);
organizerRoutes.delete('/delete/:id', authAdmin, deleteOrganizer);
organizerRoutes.put('/block/:id', authAdmin, blockOrganizer);
organizerRoutes.post('/organizers/login', loginOrganizer);
organizerRoutes.get('/profile', authOrgan, getStaffProfile);
organizerRoutes.put('/profile/edit', authOrgan, updateOrganizerProfile);
organizerRoutes.post('/creates',authOrgan, uploadFields, createEvent);
organizerRoutes.get('/allevents',authOrgan, getEvents);
organizerRoutes.get('/events/:id',authOrgan, getEventByIdorgan);
  
export default organizerRoutes;
