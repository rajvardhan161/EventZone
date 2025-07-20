import validator from 'validator';
import bcrypt from 'bcrypt';

import { v2 as cloudinary } from 'cloudinary';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import mongoose from 'mongoose';
import userModel from '../Models/usermodel.js';
import ApplicationModel from '../Models/Application.js';
import EventModel from '../Models/EventModel.js';


const isAdmin = (roles) => {
  // Ensure roles is always an array before checking
  return Array.isArray(roles) && roles.includes('Admin');
};

// --- In adminController.js, modify loginAdmin ---

// Assuming you have the admin user object fetched or identified here.
// If not, you might need to fetch it based on ADMIN_EMAIL/PASSWORD.
// For simplicity, let's assume you have 'adminUser' object.
// Example: const adminUser = { email: process.env.ADMIN_EMAIL, roles: ['Admin'], _id: 'someAdminId' };

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            // You need to associate roles with this admin.
            // If you have a user model for admin, fetch it and get its roles.
            // For this specific 'single admin email' approach, we can hardcode roles:
            const adminRoles = ['Admin']; // Or fetch from a config/admin model if you have one.

            // Generate the token with userId (optional but good practice), email, and roles
            const token = jwt.sign(
                {
                    userId: 'admin-user-id', // You might want to have a specific admin ID
                    email: email,
                    roles: adminRoles // <<< ADD ROLES HERE
                },
                process.env.JWT_SECRET,
                { expiresIn: "365d" }
            );
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get all users
 const getAllUsers = async (req, res) => {
  // Optional: Check if the requesting user is an admin
  if (!isAdmin(req.user.roles)) {
    return res.status(403).json({ message: 'Access forbidden. Only admins can view all users.' });
  }

  try {
    const users = await userModel.find().select('-password'); // Exclude password
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found.' });
    }
    res.status(200).json(users);
  } catch (err) {
    console.error('Get all users error:', err.message);
    res.status(500).json({ message: 'Server error while fetching all users.' });
  }
};

// Get a specific user by ID
 const getUserById = async (req, res) => {
  const { userId } = req.params;

  // Optional: Check if the requesting user is an admin
  if (!isAdmin(req.user.roles)) {
    // Allow a user to view their own profile if not an admin
    if (req.user.userId !== userId) {
      return res.status(403).json({ message: 'Access forbidden. You can only view your own profile or have admin rights.' });
    }
  }

  try {
    const user = await userModel.findById(userId).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error('Get user by ID error:', err.message);
    res.status(500).json({ message: 'Server error while fetching user by ID.' });
  }
};

// Update a user's role (Admin functionality)
 const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { roles } = req.body; // Expecting an array of roles, e.g., ["User", "Admin"]

  // Ensure the logged-in user is an admin
  if (!isAdmin(req.user.roles)) {
    return res.status(403).json({ message: 'Access forbidden. Only admins can change user roles.' });
  }

  // Basic validation for roles
  if (!Array.isArray(roles) || roles.length === 0) {
    return res.status(400).json({ message: 'Roles must be provided as a non-empty array.' });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Prevent self-demotion from admin to non-admin if that's a restriction you want
    if (user._id.toString() === req.user.userId && !isAdmin(roles)) {
       return res.status(400).json({ message: 'You cannot remove your own admin privileges.' });
    }

    user.roles = roles; // Update the roles
    await user.save();

    res.status(200).json({
      message: 'User roles updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (err) {
    console.error('Update user role error:', err.message);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error while updating user roles.' });
  }
};

// Block/Unblock a user
  const toggleUserBlock = async (req, res) => {
  const { userId } = req.params;

  // Ensure the logged-in user is an admin
  if (!isAdmin(req.user.roles)) {
    return res.status(403).json({ message: 'Access forbidden. Only admins can block/unblock users.' });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Prevent self-blocking
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({ message: 'You cannot block yourself.' });
    }

    user.isBlocked = !user.isBlocked; // Toggle the block status
    await user.save();

    res.status(200).json({
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully.`,
      user: {
        id: user._id,
        name: user.name,
        isBlocked: user.isBlocked,
      },
    });
  } catch (err) {
    console.error('Toggle user block error:', err.message);
    res.status(500).json({ message: 'Server error while blocking/unblocking user.' });
  }
};

// Delete a user (Admin functionality)
 const deleteUser = async (req, res) => {
  const { userId } = req.params;

  // Ensure the logged-in user is an admin
  if (!isAdmin(req.user.roles)) {
    return res.status(403).json({ message: 'Access forbidden. Only admins can delete users.' });
  }

  try {
    const user = await userModel.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }

    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Delete user error:', err.message);
    res.status(500).json({ message: 'Server error while deleting user.' });
  }
};

// Example: Admin can manage subscriptions - toggle subscribe/unsubscribe
  const adminToggleSubscription = async (req, res) => {
    const { userId } = req.params;
    const { isSubscribed } = req.body; // Expecting boolean true/false

    if (!isAdmin(req.user.roles)) {
        return res.status(403).json({ message: 'Access forbidden. Only admins can manage subscriptions.' });
    }

    if (isSubscribed === undefined || typeof isSubscribed !== 'boolean') {
        return res.status(400).json({ message: 'isSubscribed must be a boolean (true/false).' });
    }

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Prevent admin from changing their own subscription status if it's restricted
        // if (user._id.toString() === req.user.userId) {
        //     return res.status(400).json({ message: 'Admins cannot manage their own subscription status this way.' });
        // }

        user.isSubscribed = isSubscribed;
        // Optionally clear/regenerate subscriptionToken if needed
        if (!isSubscribed) {
            user.subscriptionToken = undefined; // Clear token if unsubscribed
        } else {
            // Consider if you need to regenerate a token or just set it to true
            // For simplicity, we'll just set it to true. If a new token is always required on admin action:
            // user.subscriptionToken = generateSubscriptionToken(); // (You'd need to import generateSubscriptionToken)
        }
        await user.save();

        res.status(200).json({
            message: `User subscription status updated to ${isSubscribed}.`,
            user: {
                id: user._id,
                name: user.name,
                isSubscribed: user.isSubscribed,
            },
        });

    } catch (err) {
        console.error('Admin toggle subscription error:', err.message);
        res.status(500).json({ message: 'Server error while updating user subscription status.' });
    }
};




const getApplications = async (req, res) => {
  try {
    const { eventId } = req.query;
    let query = {};
    if (eventId) {
      query.eventId = eventId;
    }

    const applications = await ApplicationModel.find(query).lean();
    res.status(200).json(applications);
  } catch (error) {
    console.error('Admin Error: Failed to fetch applications:', error);
    res.status(500).json({ message: 'Server error fetching applications.' });
  }
};

const getApplicationsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required in params.' });
    }

    const applications = await ApplicationModel.find({ eventId }).lean();
    res.status(200).json(applications);
  } catch (error) {
    console.error(`Admin Error: Failed to fetch applications for event ${eventId}:`, error);
    res.status(500).json({ message: `Server error fetching applications for event ${eventId}.` });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, paymentStatus } = req.body;

    if (!applicationId) {
      return res.status(400).json({ message: 'Application ID is required in params.' });
    }

    const updateFields = {};
    if (status !== undefined) {
      updateFields.status = status;
    }
    if (paymentStatus !== undefined) {
      updateFields.paymentStatus = paymentStatus;
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update (status or paymentStatus).' });
    }

    const updatedApplication = await ApplicationModel.findByIdAndUpdate(
      applicationId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedApplication) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    res.status(200).json({
      message: 'Application status updated successfully!',
      application: updatedApplication,
    });

  } catch (error) {
    console.error(`Admin Error: Failed to update application ${applicationId}:`, error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed.', errors: messages });
    }

    res.status(500).json({ message: 'Server error updating application status.' });
  }
};



const getApplicationSummary = async (req, res) => {
  try {
    const totalApplications = await ApplicationModel.countDocuments();
    const pendingApplications = await ApplicationModel.countDocuments({ status: 'Pending' }); // IMPORTANT: Ensure 'Pending' matches your status string

    res.status(200).json({ totalApplications, pendingApplications });
  } catch (err) {
    console.error("Error in getApplicationSummary controller:", err);
    res.status(500).json({ message: "Failed to fetch application summary stats." });
  }
};

const getUserCount = async (req, res) => {
  try {
    const totalUsers = await userModel.countDocuments();
    res.status(200).json({ totalUsers });
  } catch (err) {
    console.error("Error in getUserCount controller:", err);
    res.status(500).json({ message: "Failed to fetch user count." });
  }
};



// Update getRecentApplications to populate user and event
const getRecentApplications = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;

    const applications = await ApplicationModel.find()
      .sort({ applicationDate: -1 })
      .limit(limit)
      .populate('userId', 'name')   // assuming 'fullName' exists in User model
      .populate('eventId', 'eventName')     // assuming 'title' exists in Event model
      .lean();

    res.status(200).json(applications);
  } catch (err) {
    console.error("Error in getRecentApplications controller:", err);
    res.status(500).json({ message: "Failed to fetch recent applications." });
  }
};


// Note: You'll likely have other controllers for updating status, etc.
// For example, for your /api/admin/applications/:appId/status route:
const updateApplicationStatuss = async (req, res) => {
  try {
    const { appId } = req.params;
    const { status } = req.body;

    // Validate status input if necessary
    const allowedStatuses = ['Pending', 'Approved', 'Rejected']; // Ensure these match your enum/schema
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed statuses are: ${allowedStatuses.join(', ')}` });
    }

    const updatedApplication = await ApplicationModel.findByIdAndUpdate(
      appId,
      { status: status },
      { new: true } // Return the updated document
    );

    if (!updatedApplication) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    res.status(200).json(updatedApplication);
  } catch (err) {
    console.error(`Error updating application status for ${appId}:`, err);
    res.status(500).json({ message: 'Failed to update application status.' });
  }
};


const updatePaymentStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { paymentStatus } = req.body; // Expecting 'Verified', 'Unverified', etc.

    if (!applicationId) {
      return res.status(400).json({ message: 'Application ID is required in params.' });
    }
    if (paymentStatus === undefined) {
      return res.status(400).json({ message: 'Payment status is required in body.' });
    }

    // --- Frontend Payment Status Constants Mapping ---
    // Ensure these match the frontend's PAYMENT_STATUS constants EXACTLY
    const validPaymentStatuses = ['Unverified', 'Verified', 'Pending', 'Failed']; // Add any other valid statuses
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: `Invalid payment status provided. Allowed statuses are: ${validPaymentStatuses.join(', ')}` });
    }
    // --- End Frontend Payment Status Constants Mapping ---


    const updatedApplication = await ApplicationModel.findByIdAndUpdate(
      applicationId,
      { $set: { paymentStatus: paymentStatus } }, // Only update the paymentStatus field
      { new: true, runValidators: true }
    ).lean();

    if (!updatedApplication) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    res.status(200).json({
      message: 'Application payment status updated successfully!',
      application: updatedApplication,
    });

  } catch (error) {
    console.error(`Admin Error: Failed to update application payment status ${req.params.applicationId}:`, error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed.', errors: messages });
    }

    res.status(500).json({ message: 'Server error updating application payment status.' });
  }
};

const bulkUpdateApplicationStatus = async (req, res) => {
  try {
    const { applicationIds, action } = req.body;

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of application IDs.' });
    }
    if (!action) {
      return res.status(400).json({ message: 'Please provide an action (approve, reject, cancel).' });
    }

    const allowedActions = ['approve', 'reject', 'cancel'];
    if (!allowedActions.includes(action.toLowerCase())) {
      return res.status(400).json({ message: `Invalid action. Allowed actions are: ${allowedActions.join(', ')}.` });
    }

    let targetStatus;
    switch (action.toLowerCase()) {
      case 'approve':
        targetStatus = 'Approved';
        break;
      case 'reject':
        targetStatus = 'Rejected';
        break;
      case 'cancel':
        targetStatus = 'Cancelled';
        break;
      default:
        return res.status(400).json({ message: 'Internal error: Action mapping failed.' });
    }

    const results = {
      processed: 0,
      success: 0,
      failed: 0,
      errors: [],
      updatedApplications: [],
    };

    for (const appId of applicationIds) {
      results.processed++;
      try {
        const updatedApplication = await ApplicationModel.findByIdAndUpdate(
          appId,
          { $set: { status: targetStatus } },
          { new: true, runValidators: true, lean: true }
        );

        if (!updatedApplication) {
          results.failed++;
          results.errors.push({ id: appId, message: 'Application not found.' });
        } else {
          results.success++;
          results.updatedApplications.push({ id: appId, status: updatedApplication.status });
        }
      } catch (err) {
        results.failed++;
        console.error(`Error updating status for application ${appId} to ${targetStatus}:`, err);

        let errorMessage = 'An unknown error occurred.';
        if (err.name === 'ValidationError') {
          errorMessage = Object.values(err.errors).map(e => e.message).join(', ');
        } else if (err.kind === 'ObjectId') {
          errorMessage = 'Invalid application ID format.';
        }

        results.errors.push({ id: appId, message: errorMessage });
      }
    }

    if (results.failed > 0) {
      res.status(207).json({
        message: `Bulk operation completed with ${results.failed} failures.`,
        summary: {
          processed: results.processed,
          success: results.success,
          failed: results.failed,
        },
        details: results.errors,
      });
    } else {
      res.status(200).json({
        message: `All ${results.success} applications were ${action.toLowerCase()}d successfully.`,
        summary: {
          processed: results.processed,
          success: results.success,
          failed: results.failed,
        },
      });
    }

  } catch (error) {
    console.error('Admin Error: Bulk application status update failed:', error);
    res.status(500).json({ message: 'Server error performing bulk application status update.' });
  }
};


const getEventCount = async (req, res) => {
  try {
    const totalEvents = await EventModel.countDocuments();
    res.status(200).json({ totalEvents });
  } catch (error) {
    console.error('Error fetching event count:', error);
    res.status(500).json({ message: 'Server error fetching event count.' });
  }
};



const getApplicationStats = async (req, res) => {
  try {
    // Use Promise.all to fetch all counts concurrently
    const [
      totalApplications,
      pendingApplications,
      approvedApplications, // Added
      rejectedApplications, // Added
      totalUsers,
      totalEvents // Added
    ] = await Promise.all([
      ApplicationModel.countDocuments(),
      ApplicationModel.countDocuments({ status: 'Pending' }),
      ApplicationModel.countDocuments({ status: 'Approved' }), // Count approved
      ApplicationModel.countDocuments({ status: 'Rejected' }), // Count rejected
      userModel.countDocuments(), // Assuming this is handled in userController, but can be here too
      EventModel.countDocuments(), // Assuming this is handled in eventController, but can be here too
    ]);

    res.status(200).json({
      totalApplications,
      pendingApplications,
      approvedApplications, // Return approved count
      rejectedApplications, // Return rejected count
      totalUsers,           // Kept from before
      totalEvents,          // Kept from before
    });
  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({ message: 'Server error fetching application stats.' });
  }
};


const STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};
const PAYMENT_STATUS = {
  UNVERIFIED: 'Unverified',
  VERIFIED: 'Verified',
  PENDING: 'Pending',
  FAILED: 'Failed',
};

const isRefundApplicable = (application) => {
  const isPaidAndSuccessful = application.isPaid && (application.paymentStatus === PAYMENT_STATUS.VERIFIED || application.paymentStatus === PAYMENT_STATUS.PENDING);
  const isOutcomeRefundable = application.status === STATUS.REJECTED || application.status === STATUS.CANCELLED;
  return isPaidAndSuccessful && isOutcomeRefundable;
};

const initiateRefund = async (req, res) => {
  const { applicationId } = req.params;

  try {
    let application = await ApplicationModel.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    if (!isRefundApplicable(application)) {
      return res.status(400).json({
        message: 'Refund is not applicable for this application based on its current status or payment.',
        details: {
          isPaid: application.isPaid,
          paymentStatus: application.paymentStatus,
          status: application.status
        }
      });
    }

    console.log(`Simulating refund for Application ID: ${applicationId}, Price: ${application.price}`);

    application.refundStatus = 'Initiated';
    await application.save();

    res.status(200).json({
      message: 'Refund initiated successfully.',
      applicationId: applicationId
    });

  } catch (err) {
    console.error('Error initiating refund:', err);

    if (err.name === 'PaymentGatewayError') {
      return res.status(500).json({ message: `Payment gateway error: ${err.message}` });
    }

    return res.status(500).json({
      message: 'Server error while initiating refund. Please try again later.',
      error: err.message
    });
  }
};


const getUpcomingEvents = async (req, res) => {
  try {
    const today = new Date();

    const upcomingEvents = await EventModel.find({
      eventDate: { $gte: today }
    }).sort({ eventDate: 1 }); // Earliest first

    res.json({ upcomingEvents });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ message: 'Failed to fetch upcoming events.' });
  }
};



const getUpcomingEventsCount = async (req, res) => {
  try {
    const now = new Date();

    const count = await EventModel.countDocuments({ eventDate: { $gte: now } });

    res.status(200).json({ upcomingEventsCount: count });
  } catch (error) {
    console.error('Error fetching upcoming events count:', error);
    res.status(500).json({
      message: 'Failed to fetch upcoming events count',
      error: error.message,
    });
  }
};

export {loginAdmin,getAllUsers,getUserById,updateUserRole,toggleUserBlock,deleteUser,
    adminToggleSubscription,updateApplicationStatus,getApplicationsByEvent,getApplications,getApplicationSummary,
  updateApplicationStatuss,getRecentApplications,getUserCount,updatePaymentStatus,getEventCount,getApplicationStats,
  bulkUpdateApplicationStatus,initiateRefund,getUpcomingEventsCount,getUpcomingEvents,
}