 
import mongoose from 'mongoose'
import InquiryModel from '../Models/InquiryModel.js';
import EventOrganization from '../models/EventOrganization.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();

// --- Nodemailer Transporter Setup (Integrated into Controller) ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const MY_DOMAIN_EMAIL = process.env.MY_DOMAIN_EMAIL; // Your primary email to receive messages

/**
 * Sends an email directly from the controller.
 * @param {object} options - Email options.
 * @param {string} options.from - Sender address.
 * @param {string} options.to - Recipient address.
 * @param {string} options.subject - Email subject.
 * @param {string} options.html - Email body in HTML format.
 * @returns {Promise<void>}
 */
const sendEmail = async (options) => {
  const mailOptions = {
    from: options.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email'); // Re-throw to be handled by the controller method
  }
};

/**
 * Handles submission of the General Inquiry / Problem Report form.
 * Saves to MongoDB and sends an email notification.
 */
const submitInquiry = async (req, res) => {
  const { firstName, lastName, student_id, email, phone, query } = req.body;

  try {
    // Server-side validation
    if (!firstName || !lastName || !student_id || !email || !phone || !query) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    // Save to MongoDB
    const newInquiry = new InquiryModel({
      firstName,
      lastName,
      student_id,
      email,
      phone,
      query,
    });
    const savedInquiry = await newInquiry.save();

    // Send email notification
    const mailOptions = {
      from: `"New Inquiry from ${firstName} ${lastName}" <${MY_DOMAIN_EMAIL}>`,
      to: MY_DOMAIN_EMAIL,
      subject: `New Inquiry Received - ${firstName} ${lastName}`,
      html: `
        <h2>New Inquiry Received</h2>
        <p><strong>First Name:</strong> ${firstName}</p>
        <p><strong>Last Name:</strong> ${lastName}</p>
        <p><strong>Student ID:</strong> ${student_id}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Problem Description:</strong> ${query}</p>
        <p><small>Database ID: ${savedInquiry._id}</small></p>
        <p><small>Submitted at: ${savedInquiry.createdAt.toLocaleString()}</small></p>
      `,
    };

    await sendEmail(mailOptions);
    res.status(201).json({ message: 'Inquiry submitted and email sent successfully!' });

  } catch (error) {
    console.error('Error handling inquiry submission:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Failed to submit inquiry. Please try again later.' });
  }
};

 
const submitEventOrganizationRequest = async (req, res) => {
  const {
    eventName,
    student_id,
    eventDate,
    eventTime,
    eventDescription,
    organizerName,
    organizerEmail,
    organizerPhone,
    query
  } = req.body;

  try {
    // Server-side validation
    if (!eventName || !student_id || !eventDate || !eventTime || !organizerName || !organizerEmail || !organizerPhone) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    // Convert eventDate string to a Date object for Mongoose
    const parsedEventDate = new Date(eventDate);
    if (isNaN(parsedEventDate.getTime())) {
      return res.status(400).json({ message: 'Invalid event date format.' });
    }

    // Save to MongoDB
    const newEventRequest = new EventOrganization({
      eventName,
      student_id,
      eventDate: parsedEventDate,
      eventTime,
      eventDescription,
      organizerName,
      organizerEmail,
      organizerPhone,
      query,
    });
    const savedRequest = await newEventRequest.save();

    // Send email notification
    const mailOptions = {
      from: `"Event Org Request from ${organizerName}" <${MY_DOMAIN_EMAIL}>`,
      to: MY_DOMAIN_EMAIL,
      subject: `New Event Organization Request - ${eventName}`,
      html: `
        <h2>New Event Organization Request Received</h2>
        <p><strong>Event Name:</strong> ${eventName}</p>
        <p><strong>Student ID:</strong> ${student_id}</p>
        <p><strong>Event Date:</strong> ${eventDate}</p>
        <p><strong>Event Time:</strong> ${eventTime}</p>
        <p><strong>Event Description:</strong> ${eventDescription || 'N/A'}</p>
        <p><strong>Organizer Name:</strong> ${organizerName}</p>
        <p><strong>Organizer Email:</strong> ${organizerEmail}</p>
        <p><strong>Organizer Phone:</strong> ${organizerPhone}</p>
        <p><strong>Additional Query/Details:</strong> ${query || 'N/A'}</p>
        <p><small>Database ID: ${savedRequest._id}</small></p>
        <p><small>Submitted at: ${savedRequest.createdAt.toLocaleString()}</small></p>
      `,
    };

    await sendEmail(mailOptions);
    res.status(201).json({ message: 'Event organization request submitted and email sent successfully!' });

  } catch (error) {
    console.error('Error handling event organization request:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Failed to submit event organization request. Please try again later.' });
  }
};



const getAllInquiries = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status && ['Open', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
      filter.inquiryStatus = status;
    } else if (status === 'all') {
    } else {
        filter.inquiryStatus = { $ne: 'Resolved' };
    }

    const inquiries = await InquiryModel.find(filter)
      .populate('resolvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    if (!inquiries || inquiries.length === 0) {
      return res.status(404).json({ message: 'No inquiries found.' });
    }

    res.status(200).json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ message: 'Failed to fetch inquiries. Please try again later.' });
  }
};

const getInquiryById = async (req, res) => {
  const { inquiryId } = req.params;

  try {
    const inquiry = await InquiryModel.findById(inquiryId)
      .populate('resolvedBy', 'firstName lastName');

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found.' });
    }

    res.status(200).json(inquiry);
  } catch (error) {
    console.error('Error fetching inquiry by ID:', error);
    res.status(500).json({ message: 'Failed to fetch inquiry. Please try again later.' });
  }
};

const replyToInquiry = async (req, res) => {
  const { inquiryId } = req.params;
  const { resolutionDetails, inquiryStatus } = req.body;

  try {
    const inquiry = await InquiryModel.findById(inquiryId);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found.' });
    }

    if (resolutionDetails !== undefined) {
      inquiry.resolutionDetails = resolutionDetails;
    }
    if (inquiryStatus && ['Open', 'In Progress', 'Resolved', 'Closed'].includes(inquiryStatus)) {
      inquiry.inquiryStatus = inquiryStatus;
      if (inquiryStatus === 'Resolved' || inquiryStatus === 'Closed') {
        inquiry.resolvedAt = new Date();
        if (req.user && req.user.userId) {
          inquiry.resolvedBy = req.user.userId;
        } else {
          console.warn("Admin user info not available in token to mark inquiry as resolved.");
        }
      } else {
        inquiry.resolvedAt = null;
        inquiry.resolvedBy = null;
        inquiry.resolutionDetails = "";
      }
    } else if (resolutionDetails && !inquiryStatus) {
        if (inquiry.inquiryStatus === 'Open') {
            inquiry.inquiryStatus = 'In Progress';
        }
    }

    await inquiry.save();

    if (resolutionDetails && inquiry.email) {
      const mailOptions = {
        from: `"Your Inquiry Update" <${MY_DOMAIN_EMAIL}>`,
        to: inquiry.email,
        subject: `Update on Your Inquiry - ${inquiry.firstName} ${inquiry.lastName}`,
        html: `
          <h2>Inquiry Status Update</h2>
          <p>Your inquiry regarding: "${inquiry.query.substring(0, 100)}..." has been updated.</p>
          <p><strong>Current Status:</strong> ${inquiry.inquiryStatus}</p>
          ${resolutionDetails ? `<p><strong>Reply from Admin:</strong> ${resolutionDetails}</p>` : ''}
          <p><small>You can view your inquiry status on our portal or by contacting support.</small></p>
        `,
      };
      sendEmail(mailOptions).catch(emailErr => console.error("Failed to send user update email:", emailErr));
    }

    res.status(200).json({
      message: 'Inquiry updated successfully.',
      inquiry: {
        id: inquiry._id,
        inquiryStatus: inquiry.inquiryStatus,
        resolutionDetails: inquiry.resolutionDetails,
        resolvedBy: inquiry.resolvedBy,
        resolvedAt: inquiry.resolvedAt,
      },
    });

  } catch (error) {
    console.error('Error replying to inquiry:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Failed to update inquiry. Please try again later.' });
  }
};

const adminGetAllEventRequests = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};

    const validStatuses = ['Pending', 'In Progress', 'Approved', 'Rejected', 'Completed'];

    if (status && validStatuses.includes(status)) {
      filter.completionStatus = status;
    } else if (status === 'all') {
    } else {
      filter.completionStatus = { $in: ['Pending', 'In Progress', 'Approved'] };
    }

    const eventRequests = await EventOrganization.find(filter)
      .populate('repliedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    if (!eventRequests || eventRequests.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(eventRequests);
  } catch (error) {
    console.error('Error fetching event organization requests:', error);
    res.status(500).json({ message: 'Failed to fetch event organization requests. Please try again later.' });
  }
};

const adminGetEventRequestById = async (req, res) => {
  const { requestId } = req.params;

  try {
    const eventRequest = await EventOrganization.findById(requestId)
      .populate('repliedBy', 'firstName lastName');

    if (!eventRequest) {
      return res.status(404).json({ message: 'Event organization request not found.' });
    }

    res.status(200).json(eventRequest);
  } catch (error) {
    console.error('Error fetching event organization request by ID:', error);
    res.status(500).json({ message: 'Failed to fetch event organization request. Please try again later.' });
  }
};

const adminReplyToEventRequest = async (req, res) => {
  const { requestId } = req.params;
  const { replyMessage, completionStatus, rejectionReason } = req.body;

  const validStatuses = ['Pending', 'In Progress', 'Approved', 'Rejected', 'Completed'];

  try {
    const eventRequest = await EventOrganization.findById(requestId);
    if (!eventRequest) {
      return res.status(404).json({ message: 'Event organization request not found.' });
    }

    if (replyMessage !== undefined) {
      eventRequest.replyMessage = replyMessage;
    }
    if (completionStatus && validStatuses.includes(completionStatus)) {
      eventRequest.completionStatus = completionStatus;

      if (completionStatus === 'Rejected' || completionStatus === 'Completed' || completionStatus === 'Approved') {
        eventRequest.repliedAt = new Date();
        if (req.user && req.user.userId) {
          eventRequest.repliedBy = req.user.userId;
        } else {
          console.warn("Admin user info not available in token for event request action.");
        }
      } else {
        eventRequest.repliedAt = null;
        eventRequest.repliedBy = null;
        eventRequest.rejectionReason = "";
      }
    }

    if (rejectionReason !== undefined && completionStatus === 'Rejected') {
      eventRequest.rejectionReason = rejectionReason;
    } else if (completionStatus !== 'Rejected') {
      eventRequest.rejectionReason = "";
    }

    await eventRequest.save();

    if (replyMessage && eventRequest.organizerEmail) {
      const mailOptions = {
        from: `"Event Org Update" <${MY_DOMAIN_EMAIL}>`,
        to: eventRequest.organizerEmail,
        subject: `Update on Your Event Request - ${eventRequest.eventName}`,
        html: `
          <h2>Event Organization Request Update</h2>
          <p>Your request for "${eventRequest.eventName}" has been updated.</p>
          <p><strong>Current Status:</strong> ${eventRequest.completionStatus}</p>
          ${replyMessage ? `<p><strong>Admin Reply:</strong> ${replyMessage}</p>` : ''}
          ${(completionStatus === 'Rejected' && rejectionReason) ? `<p><strong>Rejection Reason:</strong> ${rejectionReason}</p>` : ''}
          <p><small>Please check our portal or contact support for more details.</small></p>
        `,
      };
      sendEmail(mailOptions).catch(emailErr => console.error("Failed to send event request update email:", emailErr));
    }

    res.status(200).json({
      message: 'Event organization request updated successfully.',
      eventRequest: {
        id: eventRequest._id,
        completionStatus: eventRequest.completionStatus,
        replyMessage: eventRequest.replyMessage,
        rejectionReason: eventRequest.rejectionReason,
        repliedBy: eventRequest.repliedBy,
        repliedAt: eventRequest.repliedAt,
      },
    });

  } catch (error) {
    console.error('Error replying to event organization request:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Failed to update event organization request. Please try again later.' });
  }
};



export {submitInquiry, submitEventOrganizationRequest
  , getAllInquiries, getInquiryById,replyToInquiry,adminGetAllEventRequests,adminReplyToEventRequest,adminGetEventRequestById,}