import express from 'express'
import { adminToggleSubscription, bulkUpdateApplicationStatus, deleteUser, getAllUsers, getApplications, getApplicationsByEvent, getApplicationStats, getApplicationSummary, getEventCount, getRecentApplications, getUpcomingEvents, getUpcomingEventsCount, getUserById, getUserCount, initiateRefund, loginAdmin, toggleUserBlock, updateApplicationStatus, updateApplicationStatuss, updatePaymentStatus, updateUserRole } from '../controllers/adminController.js'
import authAdmin from '../middlewares/authAdmin.js';
import { adminGetAllEventRequests, adminGetEventRequestById, adminReplyToEventRequest, getAllInquiries, getInquiryById, replyToInquiry } from '../controllers/contactController.js';
import { getEventByIdorgan } from '../controllers/eventController.js';
 
const adminRouter =express.Router()

adminRouter.post('/login',loginAdmin)
adminRouter.get('/users', authAdmin, getAllUsers);
adminRouter.get('/users/count', getUserCount);
adminRouter.get('/users/:userId', authAdmin,getUserById); 

adminRouter.put('/users/:userId/role', authAdmin, updateUserRole);
adminRouter.patch('/users/:userId/block', authAdmin, toggleUserBlock);
adminRouter.delete('/users/:userId', authAdmin, deleteUser);
adminRouter.patch('/users/:userId/subscribe', authAdmin, adminToggleSubscription);
adminRouter.get('/inquiries',authAdmin, getAllInquiries);  
adminRouter.get('/inquiries/:inquiryId',authAdmin, getInquiryById);  
adminRouter.put('/inquiries/:inquiryId', replyToInquiry);
adminRouter.get('/event-requests',authAdmin, adminGetAllEventRequests);
adminRouter.get('/event-requests/:requestId', adminGetEventRequestById);
adminRouter.put('/event-requests/:requestId', adminReplyToEventRequest);

adminRouter.get('/applications', authAdmin, getApplications);
adminRouter.get('/applications/event/:eventId', authAdmin, getApplicationsByEvent);
adminRouter.post('/applications/:applicationId/status', authAdmin, updateApplicationStatus);
adminRouter.post('/applications/:applicationId/payment-status',authAdmin,updatePaymentStatus)


adminRouter.get('/applications/summary', getApplicationSummary);
adminRouter.get('/summary', authAdmin, getApplicationStats)

adminRouter.get('/applicationssex', getRecentApplications); // This also handles the /api/admin/applications?limit=5
 
adminRouter.post('/applications/:appId/status', updateApplicationStatuss);
adminRouter.get('/count', getEventCount);
adminRouter.post('/applications/bulk-action',bulkUpdateApplicationStatus)
adminRouter.post('/:applicationId/refund', initiateRefund);
adminRouter.get('/upcoming', authAdmin, getUpcomingEvents);
adminRouter.get('/upcoming/count', getUpcomingEventsCount);
adminRouter.get('/eventss/:id',authAdmin, getEventByIdorgan);

  
export default adminRouter