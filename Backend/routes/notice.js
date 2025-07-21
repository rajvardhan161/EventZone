import express from 'express'
import authAdmin from '../middlewares/authAdmin.js';
import { createPublicNotice, deleteNotice, getActivePublicNotices, getAllPublicNotices, getNoticeById, updateNotice } from '../controllers/adminNoticeController.js';
import authUser from '../middlewares/authUser.js';



const noticeRouter = express.Router();

// Route to create public notice
noticeRouter.post('/notices', authAdmin, createPublicNotice);

// Route to get all public notices
noticeRouter.get('/get/notices', authAdmin, getAllPublicNotices);
noticeRouter.get('/user/notices', authUser, getActivePublicNotices);
noticeRouter.get('/get/:id', authAdmin, getNoticeById);
noticeRouter.put('/update/:id', authAdmin, updateNotice);
noticeRouter.delete('/delete/:id', authAdmin, deleteNotice);

export default noticeRouter;
