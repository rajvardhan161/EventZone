import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';
import { FaCalendarPlus, FaUsers, FaArrowRight, FaTag, FaMapMarkerAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import axios from 'axios';

// --- Reusable Sub-components for a Cleaner and More Maintainable UI ---

// A more visually engaging "Empty State" when no events are found
const EmptyState = ({ onCreateClick }) => (
  <div className="text-center py-16 px-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
    <FaCalendarPlus className="mx-auto text-5xl text-blue-400 mb-4" />
    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">No Events Found</h3>
    <p className="mt-2 text-md text-gray-500 dark:text-gray-400">
      It looks like you haven't created any events yet. Let's change that!
    </p>
    <button
      onClick={onCreateClick}
      className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-all transform hover:scale-105"
    >
      <FaCalendarPlus />
      <span>Create Your First Event</span>
    </button>
  </div>
);

// A dynamic status badge based on the event date
const EventStatusBadge = ({ dateString }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today's date
  const eventDate = new Date(dateString);
  eventDate.setHours(0, 0, 0, 0); // Normalize event date

  let status = { text: 'Upcoming', color: 'blue' };
  if (eventDate < today) {
    status = { text: 'Completed', color: 'gray' };
  } else if (eventDate.getTime() === today.getTime()) {
    status = { text: 'Active Today', color: 'green' };
  }

  const colors = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status.color]}`}>
      <span className={`h-2 w-2 rounded-full bg-${status.color}-500`}></span>
      {status.text}
    </span>
  );
};

// A visual progress bar for participant count
const ParticipantProgressBar = ({ count, limit }) => {
  if (limit === null || limit === 0) { // Handle unlimited participants
    return (
      <div className="flex items-center gap-2">
        <FaUsers className="text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{count} Registered</span>
      </div>
    );
  }
  const percentage = Math.min((count / limit) * 100, 100);
  
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {count} / {limit}
        </span>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{Math.round(percentage)}% Full</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
        <div 
          className="bg-blue-600 h-2 rounded-full" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};


// A safe date formatting utility to prevent crashes
const safeFormatDate = (dateString, formatString = 'MMM d, yyyy') => {
  try {
    if (!dateString || isNaN(new Date(dateString))) return 'N/A';
    return format(new Date(dateString), formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

// --- Main EventManage Component ---

const EventManage = () => {
  const { backendUrl, organizer } = useContext(AdminContext);
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyEvents = useCallback(async () => {
    // ... (fetching logic remains the same, it's already well-written)
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${backendUrl}/api/organizer/allevents`, {
        headers: {
          Authorization: `Bearer ${organizer}`,
        },
      });
      // Sort events by date, upcoming first
      const sortedEvents = (response.data.events || []).sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
      setEvents(sortedEvents);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch your events.';
      console.error('Error fetching your events:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, organizer]);

  useEffect(() => {
    if (organizer && backendUrl) {
      fetchMyEvents();
    } else {
      setLoading(false);
      setError("You must be logged in as an organizer to see your events.");
    }
  }, [fetchMyEvents, organizer, backendUrl]);

  const handleNavigate = (path) => { 
    navigate(path);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <p className="text-lg font-semibold text-red-700 dark:text-red-400">Oops! Something went wrong.</p>
        <p className="mt-1 text-red-600 dark:text-red-400/80">{error}</p>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 lg:p-8 rounded-lg ${currentTheme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* --- Header Section --- */}
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-black">Event Dashboard</h1>
            <p className="mt-1 text-md text-gray-600 dark:text-gray-800">
              A complete overview of all your created events.
            </p>
          </div>
          <button 
            onClick={() => handleNavigate('/organizer/create-event')} 
            className="flex-shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
          >
            <FaCalendarPlus />
            <span>Create New Event</span>
          </button>
        </div>
      </header>
      
      {/* --- Main Content: Empty State or Events List --- */}
      {events.length === 0 ? (
        <EmptyState onCreateClick={() => handleNavigate('/organizer/create-event')} />
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event._id}
              className="group grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg border border-transparent hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-all duration-300"
              onClick={() => handleNavigate(`/my-events/${event._id}`)}
            >
              {/* Event Date */}
              <div className="md:col-span-1 text-center">
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{safeFormatDate(event.eventDate, 'MMM')}</p>
                <p className="text-2xl font-extrabold text-gray-800 dark:text-gray-200">{safeFormatDate(event.eventDate, 'dd')}</p>
              </div>

              {/* Event Info */}
              <div className="md:col-span-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {event.eventName}
                </h3>
                <p className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <FaMapMarkerAlt /> {event.location || 'Online Event'}
                </p>
              </div>

              {/* Status */}
              <div className="md:col-span-2 flex justify-start md:justify-center">
                <EventStatusBadge dateString={event.eventDate} />
              </div>

              {/* Price */}
              <div className="md:col-span-1 flex justify-start md:justify-center">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${event.isPaid ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                    <FaTag /> {event.isPaid ? `₹${event.price}` : 'Free'}
                  </span>
              </div>

              {/* Participants */}
              <div className="md:col-span-3">
                {/* --- THIS IS THE CORRECTED LINE --- */}
                <ParticipantProgressBar count={event.currentApplications ?? 0} limit={event.participantLimit} />
              </div>

              {/* Action */}
              <div className="md:col-span-1 flex justify-end">
                <FaArrowRight className="text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventManage;