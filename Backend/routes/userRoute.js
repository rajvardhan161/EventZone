import express from 'express';
import { applyForEvent,  getAllEvents, getEventAndUserDetails, getEventById, getLatestEvents,   getProfile, getUpcomingEvents, getUserApplications, getUserInquiries, login, requestOtp, signup, subscribe, unsubscribe, updateProfile, verifyOtp } from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';
import upload from '../config/multer.js';
import { getInquiryById, submitEventOrganizationRequest, submitInquiry } from '../controllers/contactController.js';


const userrouter = express.Router();
userrouter.post('/signup',upload.single('image'),signup);
userrouter.post('/request-otp', requestOtp);
userrouter.post('/verify-otp', verifyOtp);
userrouter.post('/login', login);
userrouter.get('/profile', authUser, getProfile);
userrouter.put('/profile', authUser, updateProfile);
userrouter.post('/subscribe', subscribe);
userrouter.get('/unsubscribe', unsubscribe);
userrouter.post('/inquiry', submitInquiry);
 
userrouter.post('/event-organization', submitEventOrganizationRequest);
userrouter.get('/user/events', getAllEvents); 
userrouter.get('/events/upcoming', getUpcomingEvents);
userrouter.get('/events/latest', getLatestEvents);
userrouter.get('/events/:id', getEventById);


userrouter.post('/events/:eventId/apply',authUser,upload.single('paymentScreenshot'),applyForEvent);
userrouter.get('/events/:eventId/details', authUser, getEventAndUserDetails);
userrouter.get('/user/applications', authUser, getUserApplications);
userrouter.get('/user/inquiries', authUser, getUserInquiries);
userrouter.get('/user/inquiries/:inquiryId',  getInquiryById);
export default userrouter;