import express from 'express'; 

import upload from '../config/multer.js';
import authAdmin from '../middlewares/authAdmin.js';
import { blockOrganizer, createOrganizerAccount, deleteOrganizer, getAllOrganizers, getOrganizerById, loginOrganizer, updateOrganizer } from '../controllers/organizerAccountController.js';

const organizerRoutes = express.Router();

// Create organizer (admin only) — includes photo upload
organizerRoutes.post('/create', authAdmin, upload.single('image'), createOrganizerAccount);

organizerRoutes.get('/all', authAdmin, getAllOrganizers);    
organizerRoutes.get('/get/:id', authAdmin, getOrganizerById);
organizerRoutes.put('/update/:id', authAdmin, upload.single('image'), updateOrganizer);
organizerRoutes.delete('/delete/:id', authAdmin, deleteOrganizer);
organizerRoutes.put('/block/:id', authAdmin, blockOrganizer);
organizerRoutes.post('/organizers/login', loginOrganizer);
export default organizerRoutes;
