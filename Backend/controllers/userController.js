import userModel from '../Models/usermodel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import cloudinary from 'cloudinary';
import multer from 'multer';
import crypto from 'crypto'; // For generating subscription tokens
import EventModel from '../Models/EventModel.js';
import ApplicationModel from '../Models/Application.js';
import InquiryModel from '../Models/InquiryModel.js';
import HeroModel from '../Models/HeroSlide.js';
import OrganizerModel from '../Models/organizerModel.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_for_dev';
const OTP_EXPIRY_MINUTES = 5;
const OTP_LENGTH = 6;
const TOKEN_EXPIRY = '30d';
const BASE_URL = process.env.BASE_URL || 'http://localhost:4000'; // Your API base URL

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,                // "mail.mednova.store"
  port: parseInt(process.env.EMAIL_PORT),      // 465 for SSL or 587 for TLS
  secure: process.env.EMAIL_SECURE === 'true', // true if using port 465
  auth: {
    user: process.env.EMAIL_USER,              // "potfolio@mednova.store"
    pass: process.env.EMAIL_PASS,              // your actual email password
  },
});

const sendOtp = async (user) => {
  try {
    const otp = otpGenerator.generate(OTP_LENGTH, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Save OTP and metadata to user model
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.lastOtpSentTime = new Date();
    user.otpResendCount = (user.otpResendCount || 0) + 1;
    await user.save();

    await transporter.sendMail({
      from: `"Your College App" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Email OTP',
      html: `
        <p>Hello ${user.name},</p>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>This code will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
        <p>If you did not request this code, please ignore this email or contact support.</p>
      `,
    });

    console.log('OTP sent successfully to', user.email);
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP. Please try again later.');
  }
};
// Token generator function for subscription
const generateSubscriptionToken = () => {
  return crypto.randomBytes(20).toString('hex'); // Creates a 40-character token
};


const signup = async (req, res) => {
  const {
    name,
    student_id,
    dob,
    gender,
    address,
    phone_no,
    email,
    course,
    year_of_admission,
    current_semester,
    password,
  } = req.body;

  try {
    // 1. Validation: check for missing fields
    if (
      !name || !student_id || !dob || !gender || !address ||
      !phone_no || !email || !course || !year_of_admission ||
      !current_semester || !password
    ) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // 2. Check for existing user
    const existingUser = await userModel.findOne({ $or: [{ email }, { student_id }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or student ID already exists.' });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Set default profile image
    let profilePhotoURL = 'https://res.cloudinary.com/demo/image/upload/v1690000000/default-user.png';

    // 5. Upload to Cloudinary if file is uploaded
    if (req.file && req.file.path) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'college-id-users',
          resource_type: 'image',
        });
        profilePhotoURL = result.secure_url;
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        return res.status(500).json({ message: 'Failed to upload profile image.' });
      }
    } else {
      console.log("No profile image uploaded. Using default.");
    }

    // 6. Create new user
    const newUser = new userModel({
      name,
      student_id,
      dob,
      gender,
      address,
      phone_no,
      email,
      course,
      year_of_admission,
      current_semester,
      password: hashedPassword,
      profile_photo: profilePhotoURL,
      subscriptionToken: generateSubscriptionToken(), // Generate token for subscription
      isSubscribed: true, // Default to subscribed
    });

    // 7. Send OTP and save user
    await sendOtp(newUser); // sendOtp will save the user and attach otp fields
    await newUser.save();   // Save again for safety (optional)

    // 8. Respond
    res.status(201).json({
      message: 'User registered successfully. Please check your email for verification code.',
      userId: newUser._id,
      email: newUser.email,
    });

  } catch (err) {
    console.error('Signup error:', err.message);

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    // Handle Multer upload errors
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    }

    // Fallback server error
    res.status(500).json({ message: 'Server error during signup.' });
  }
};


const requestOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified.' });
    }

    if (user.lastOtpSentTime && (Date.now() - user.lastOtpSentTime.getTime() < 60000)) {
      return res.status(429).json({ message: 'Please wait before requesting another OTP.' });
    }

    await sendOtp(user);
    res.status(200).json({ message: 'OTP sent successfully. Please check your email.' });

  } catch (err) {
    console.error('Request OTP error:', err.message);
    res.status(500).json({ message: err.message || 'Server error while requesting OTP.' });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified.' });
    }

    if (!otp) {
      return res.status(400).json({ message: 'OTP is required.' });
    }

    if (user.otp !== otp) {
      user.otpResendCount = (user.otpResendCount || 0) + 1;
      await user.save();
      return res.status(400).json({ message: 'Invalid OTP. Please check the code and try again.' });
    }

    if (new Date() > user.otpExpiry) {
      user.otp = undefined;
      user.otpExpiry = undefined;
      user.lastOtpSentTime = undefined;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.lastOtpSentTime = undefined;
    user.otpResendCount = 0;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, roles: user.roles },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.status(200).json({
      message: 'Email verified successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        isEmailVerified: user.isEmailVerified,
        isBlocked: user.isBlocked,
      },
    });

  } catch (err) {
    console.error('Verify OTP error:', err.message);
    res.status(500).json({ message: err.message || 'Server error during OTP verification.' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'Please verify your email address first.', redirect: '/verify-email', userEmail: user.email });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked. Please contact administration.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { userId: user._id, roles: user.roles },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        isEmailVerified: user.isEmailVerified,
        isBlocked: user.isBlocked,
      },
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;  // ✅ from token

    const user = await userModel.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err.message);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
};

const updateProfile = async (req, res) => {
  const userId = req.user.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const { name, dob, gender, address, phone_no, course, year_of_admission, current_semester, major } = req.body;

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update fields if provided in the request body
    if (name !== undefined) user.name = name;
    if (dob !== undefined) user.dob = dob;
    if (gender !== undefined) user.gender = gender;
    if (address !== undefined) user.address = address;
    if (phone_no !== undefined) user.phone_no = phone_no;
    if (course !== undefined) user.course = course;
    if (year_of_admission !== undefined) user.year_of_admission = year_of_admission;
    if (current_semester !== undefined) user.current_semester = current_semester;
    if (major !== undefined) user.major = major; // Assuming 'major' field exists in your user model

    // Handle profile photo update if a new file is uploaded
    if (req.file && req.file.path) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'college-id-users',
          resource_type: 'image',
        });
        user.profile_photo = result.secure_url;
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error during profile update:', cloudinaryError);
        return res.status(500).json({ message: 'Failed to upload new profile image.' });
      }
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: 'Profile updated successfully!',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        major: updatedUser.major,
        gender: updatedUser.gender,
        dob: updatedUser.dob,
        address: updatedUser.address,
        current_semester: updatedUser.current_semester,
        profile_photo: updatedUser.profile_photo,
        phone_no: updatedUser.phone_no,
        course: updatedUser.course,
        year_of_admission: updatedUser.year_of_admission,
      },
    });

  } catch (err) {
    console.error('Update profile error:', err.message);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error updating profile.' });
  }
};

// New function for subscribing
const subscribe = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required for subscription.' });
  }

  try {
    let user = await userModel.findOne({ email });

    if (!user) {
      // If user doesn't exist, create one with subscription enabled.
      // Ensure your user model can handle this (e.g., default values for password etc. if necessary)
      // For simplicity here, we create a basic user. You might want to integrate with signup.
      const newUser = new userModel({
        email,
        name: 'New Subscriber', // Placeholder name
        // Provide a dummy password or handle password generation/requirement differently
        // For a pure subscription, password might not be needed if it's just for email list
        password: await bcrypt.hash("dummy_password_for_subscription", 10),
        isEmailVerified: true, // Assume verified for email list opt-in
        isSubscribed: true,
        subscriptionToken: generateSubscriptionToken(),
      });
      user = await newUser.save();
      console.log(`New subscriber created: ${email}`);
    } else {
      // If user exists, update their subscription status and token
      user.isSubscribed = true;
      user.subscriptionToken = generateSubscriptionToken(); // Generate a new token
      user = await user.save();
      console.log(`Existing subscriber updated: ${email}`);
    }

    // Ideally, send a confirmation email here with the unsubscribe link
    // For this example, we'll just confirm subscription and provide the link/token info

    res.status(200).json({
      message: 'You have been subscribed. You will receive an email shortly with a confirmation and unsubscribe link.',
      // You could optionally return the token or a link for the user to see
      // unsubscribeLink: getUnsubscribeLink(user) // This might be too sensitive for a direct response
    });

  } catch (err) {
    console.error('Subscribe error:', err.message);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error during subscription.' });
  }
};

// New function for unsubscribing
const unsubscribe = async (req, res) => {
  const { token } = req.query; // Expecting token as a query parameter

  if (!token) {
    // If no token, it might be a direct access or an invalid link
    return res.status(400).json({ message: 'Unsubscribe link is invalid or missing.' });
  }

  try {
    const user = await userModel.findOne({ subscriptionToken: token });

    if (!user) {
      // Token not found, or user already unsubscribed/token expired
      return res.status(404).json({ message: 'Invalid or expired unsubscribe link. You may have already unsubscribed.' });
    }

    // Update user status
    user.isSubscribed = false;
    user.subscriptionToken = undefined; // Clear the token after successful unsubscription
    await user.save();

    // Respond with a confirmation message or redirect to a confirmation page.
    // For an API, a JSON response is standard.
    // For a web app, you would typically redirect to a frontend page:
    // res.redirect('/unsubscribed-confirmation');
    res.status(200).json({ message: 'You have been successfully unsubscribed from our emails. You will no longer receive notifications from us.' });

  } catch (err) {
    console.error('Unsubscribe error:', err.message);
    res.status(500).json({ message: 'Server error during unsubscription process.' });
  }
};


const getAllEvents = async (req, res) => {
  try {
    const events = await EventModel.find().sort({ eventDate: 1 });
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};

const getUpcomingEvents = async (req, res) => {
  try {
    const now = new Date();
    const upcomingEvents = await EventModel.find({ eventDate: { $gte: now } }).sort({ eventDate: 1 });
    res.status(200).json(upcomingEvents);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ message: 'Failed to fetch upcoming events', error: error.message });
  }
};
const getLatestEvents = async (req, res) => {
  try {
    const latestEvents = await EventModel.find().sort({ _id: -1 });
    res.status(200).json(latestEvents);
  } catch (error) {
    console.error('Error fetching latest events:', error);
    res.status(500).json({ message: 'Failed to fetch latest events', error: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await EventModel.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Failed to fetch event', error: error.message });
  }
};


const applyForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Participant limit check
    if (event.participantLimit !== null && event.participantLimit !== undefined && event.participantLimit >= 0) {
      if (event.currentApplications >= event.participantLimit) {
        return res.status(409).json({ message: 'This event is currently full. You cannot apply at this time.' });
      }
    }

    // Check for existing application
    const existingApplication = await ApplicationModel.findOne({ eventId, userId });
    if (existingApplication) {
      return res.status(409).json({ message: 'You have already applied for this event.' });
    }

    const user = await userModel.findById(userId);

    const newApplication = new ApplicationModel({
      eventId,
      userId,
      userName: user.name,
      userEmail: user.email,
      gender: user.gender,
      phone_no: user.phone_no,
      course: user.course,
      profile_photo: user.profile_photo,
      eventName: event.eventName,
      eventDate: event.eventDate,
      eventEndDate:event.eventEndDate,
      isPaid: event.price > 0,
      price: event.price,
      eventImageURL: event.eventImageURL,
      qrCodeImageURL: event.qrCodeImageURL || null,
      paymentStatus: event.price === 0 ? 'Verified' : 'Unverified',
      status: 'Pending',
      notes: req.body.notes || ''
    });

    await newApplication.save();

    await EventModel.findByIdAndUpdate(
      eventId,
      { $inc: { currentApplications: 1 } },
      { new: true }
    );

    res.status(201).json({
      message: 'Application submitted successfully!',
      application: newApplication
    });

  } catch (error) {
    console.error('Error applying for event:', error);
    res.status(500).json({ message: 'Something went wrong while applying for the event.' });
  }
};



// GET /api/user/events/:eventId/details
 const getEventAndUserDetails = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required.' });
    }

    const event = await EventModel.findById(eventId);
    const user = await userModel.findById(userId);

    if (!event || !user) {
      return res.status(404).json({ message: 'Event or User not found' });
    }

    res.status(200).json({ event, user });
  } catch (error) {
    console.error('Error fetching event/user data:', error);
    res.status(500).json({ message: 'Failed to fetch event and user data' });
  }
};

const getUserApplications = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required. User ID not found.' });
    }

    const applications = await ApplicationModel.find({ userId }).sort({ eventDate: 1 });

    res.status(200).json({ applications });
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ message: 'Failed to fetch your applications.', error: error.message });
  }
};
const getUserInquiries = async (req, res) => {
  try {
    const userId = req.user.userId; // Get userId from the authenticated user's token
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required. User ID not found.' });
    }

    // 1. Fetch the logged-in user to get their student_id
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const studentId = user.student_id;

    if (!studentId) {
      // This case should ideally not happen if student_id is required and the user exists
      return res.status(400).json({ message: 'User profile is incomplete. Student ID not found.' });
    }

    // 2. Find inquiries using the fetched student_id
    // Make sure your InquiryModel schema has a 'student_id' field.
    const userInquiries = await InquiryModel.find({ student_id: studentId }).sort({ createdAt: -1 }); // Sort by newest first

    if (!userInquiries || userInquiries.length === 0) {
      return res.status(200).json([]); // Return an empty array if no inquiries are found
    }

    res.status(200).json(userInquiries);

  } catch (error) {
    console.error('Error fetching user inquiries:', error);
    res.status(500).json({ message: 'Failed to fetch your inquiries.', error: error.message });
  }
};


const getApplications = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required. User ID not found.' });
    }

    // Fetch applications sorted by event date (ascending)
    const applications = await ApplicationModel.find({ userId }).sort({ eventDate: 1 });

    // Count total applications
    const totalApplications = applications.length;

    res.status(200).json({
      totalApplications,
      applications: applications.map(app => ({
        applicationId: app._id,
        eventName: app.eventName,
        eventDate: app.eventDate,
        status: app.status,
        paymentStatus: app.paymentStatus,
        appliedAt: app.createdAt,
      }))
    });

  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ message: 'Failed to fetch your applications.', error: error.message });
  }
};

const getSpecificApplication = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { applicationId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required. User ID not found.' });
    }

    const application = await ApplicationModel.findOne({ _id: applicationId, userId: userId })
      .populate('eventId')
      .lean();

    if (!application) {
      return res.status(404).json({ message: 'Application not found or you do not have access to it.' });
    }

    const responseData = {
      _id: application._id,
      userId: application.userId,
      userName: application.userName,
      userEmail: application.userEmail,
      gender: application.gender,
      phone_no: application.phone_no,
      course: application.course,
      profile_photo: application.profile_photo,
      eventName: application.eventName || (application.eventId ? application.eventId.name : 'N/A'),
      eventDate: application.eventDate || (application.eventId ? application.eventId.startDate : 'N/A'),
      eventEndDate:application.eventEndDate || (application.eventId ? application.eventId.endDate: 'N/A'),
      
      isPaid: application.isPaid,
      price: application.price,
      eventImageURL: application.eventImageURL,
      eventImagePublicId: application.eventImagePublicId,
      qrCodeImageURL: application.qrCodeImageURL,
      qrCodePublicId: application.qrCodePublicId,
      status: application.status,
      paymentScreenshotURL: application.paymentScreenshotURL,
      paymentStatus: application.paymentStatus,
      notes: application.notes,
      applicationDate: application.applicationDate,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      __v: application.__v,
      eventDetails: application.eventId ? {
        eventId: application.eventId._id,
        name: application.eventId.name,
        description: application.eventId.description,
        startDate: application.eventId.startDate,
        endDate: application.eventId.endDate,
        location: application.eventId.location,
        eventImageURL: application.eventId.eventImageURL,
      } : null,
    };

    res.status(200).json(responseData);

  } catch (error) {
    console.error('Error fetching specific application:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid Application ID format.' });
    }
    res.status(500).json({ message: 'Failed to fetch application details.', error: error.message });
  }
};

const getUserUpcomingApplications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();

    const upcomingApplications = await ApplicationModel.find({
      userId,
      eventDate: { $gte: now }
    }).sort({ eventDate: 1 });

    res.status(200).json({ upcomingApplications });
  } catch (error) {
    console.error('Error fetching user upcoming applications:', error);
    res.status(500).json({ message: 'Failed to fetch upcoming events.' });
  }
};

const getAllHeroSlides = async (req, res) => {
  try {
    const slides = await HeroModel.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json({ slides });
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    res.status(500).json({ message: 'Server error while fetching slides.' });
  }
};

const getAllOrganizersPublic = async (req, res) => {
  try {
    const organizers = await OrganizerModel.find().sort({ createdAt: -1 }); // Newest first
    res.status(200).json(organizers);
  } catch (error) {
    console.error('Error fetching public organizers:', error);
    res.status(500).json({ message: 'Failed to fetch organizers.' });
  }
};
export {
  signup, requestOtp, verifyOtp, login, getProfile, updateProfile, subscribe, unsubscribe,
  getAllEvents, getEventById, getUpcomingEvents, getLatestEvents,    applyForEvent,getEventAndUserDetails,getUserApplications,getUserInquiries,
  getApplications,getSpecificApplication,getUserUpcomingApplications,getAllHeroSlides,getAllOrganizersPublic,
};