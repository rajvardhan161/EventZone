import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminContext } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaArrowLeft, FaEdit, FaTrash, FaTimes, FaSearch, FaTicketAlt, FaUserCheck, FaBullseye } from 'react-icons/fa';
import { format } from 'date-fns';
import axios from 'axios';
import Modal from 'react-modal';

Modal.setAppElement('#root');

// Helper functions and sub-components
const safeFormatDate = (dateString, formatString = 'PPPPp') => {
  try {
    if (!dateString || isNaN(new Date(dateString))) return 'Date not available';
    return format(new Date(dateString), formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

const StatCard = ({ icon, title, value }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md flex items-center gap-4">
    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-600 dark:text-indigo-300">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const ParticipantModal = ({ isOpen, onRequestClose, participants, theme }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParticipants = useMemo(() => {
    if (!searchTerm) return participants;
    const lowercasedFilter = searchTerm.toLowerCase();
    return participants.filter(p =>
      p.name.toLowerCase().includes(lowercasedFilter) ||
      p.email.toLowerCase().includes(lowercasedFilter) ||
      p.student_id?.toLowerCase().includes(lowercasedFilter)
    );
  }, [searchTerm, participants]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1000 },
        content: {
          top: '50%', left: '50%', right: 'auto', bottom: 'auto',
          marginRight: '-50%', transform: 'translate(-50%, -50%)',
          width: '90%', maxWidth: '800px',
          maxHeight: '90vh',
          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          border: 'none',
          borderRadius: '1rem',
          padding: '2rem'
        }
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Participants ({filteredParticipants.length})</h2>
        <button onClick={onRequestClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white transition">
          <FaTimes size={24} />
        </button>
      </div>
      <div className="relative mb-4">
        <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, or Reg No."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Reg. No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredParticipants.length > 0 ? filteredParticipants.map(p => (
              <tr key={p._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{p.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.student_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.email}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" className="text-center py-8 text-gray-500">No participants match your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};


const EventDetailSkeleton = () => (
  <div className="max-w-7xl mx-auto animate-pulse">
    <div className="mb-8">
      <div className="h-5 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
      <div className="flex justify-between items-start">
        <div>
          <div className="h-10 w-80 bg-gray-400 dark:bg-gray-600 rounded mb-3"></div>
          <div className="h-5 w-96 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-10 w-24 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-8 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <div className="w-full h-80 bg-gray-300 dark:bg-gray-700 rounded-lg mb-6"></div>
          <div className="h-8 w-1/3 bg-gray-400 dark:bg-gray-600 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const EventDetailManage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { backendUrl, organizer } = useContext(AdminContext);
  const { currentTheme } = useTheme();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEventDetails = useCallback(async () => {
    if (!id || !organizer) {
      setError("Event ID or authorization is missing.");
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const response = await axios.get(`${backendUrl}/api/organizer/events/${id}`, {
        headers: { Authorization: `Bearer ${organizer}` },
      });
      setEvent(response.data.event || response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch event details.';
      console.error('Error fetching event details:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id, backendUrl, organizer]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  const latestParticipants = useMemo(() => {
    if (!event?.participants) return [];
    return [...event.participants].reverse().slice(0, 5);
  }, [event]);

  if (loading) {
    return (
      <div className={`p-4 md:p-8 min-h-screen ${currentTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <EventDetailSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex justify-center items-center min-h-screen p-4 ${currentTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">An Error Occurred</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/organizer/event-manage')}
            className="flex items-center justify-center w-full gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
          >
            <FaArrowLeft />
            <span>Back to My Events</span>
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return <div className="text-center p-10">Event could not be found.</div>;
  }

  // --- MAIN COMPONENT RENDER ---
  // This is the part that was missing.
  return (
    <div className={`p-4 md:p-8 min-h-screen ${currentTheme === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <button onClick={() => navigate('/organizer/event-manage')} className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-4 font-semibold">
            <FaArrowLeft />
            Back to All Events
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-black">{event.eventName}</h1>
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-2"><FaCalendarAlt /> {safeFormatDate(event.eventDate)}</span>
                <span className="flex items-center gap-2"><FaMapMarkerAlt /> {event.location || 'Location TBD'}</span>
              </div>
            </div>
            {/* <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold transition"><FaEdit /> Edit</button>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900 rounded-lg font-semibold transition"><FaTrash /> Delete</button>
            </div> */}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<FaTicketAlt size={22} />} title="Event Type" value={event.isPaid ? `Paid (₹${event.price})` : 'Free'} />
          <StatCard icon={<FaBullseye size={22} />} title="Capacity" value={event.participantLimit || 'Unlimited'} />
          <StatCard icon={<FaUserCheck size={22} />} title="Registered" value={event.currentApplications ?? 0} />
          <StatCard icon={<FaUsers size={22} />} title="Slots Remaining" value={event.participantLimit ? (event.participantLimit - (event.currentApplications ?? 0)) : '∞'} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details, Description, Participants */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <img
                src={event.eventImageURL || 'https://via.placeholder.com/800x400?text=Event+Image'}
                alt={event.eventName}
                className="w-full h-auto max-h-full object-cover rounded-lg mb-6"
              />
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Event Description</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{event.eventDescription}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Event Details</h2>

              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Event Name: </span>
                  {event.eventName}
                </p>

                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Organizer: </span>
                  {event.organizerName}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Organizer: </span>
                  {event.organizerEmail}
                </p>

                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Date: </span>
                  {new Date(event.eventDate).toLocaleDateString()}
                </p>

                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Time: </span>
                  {event.eventTime}
                </p>

                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Time: </span>
                  {event.eventEndDate}
                </p>


                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Location: </span>
                  {event.location}
                </p>

                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  <span className="font-semibold text-gray-800 dark:text-gray-200"> DutyLeave: </span>
                  {event.allowDutyLeav ? 'Allowed' : 'Not Allowed'}
                </p>

                {event.eventVideoURL && (
                  <div className="mt-4">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Event Video:</span>
                    <video
                      className="w-full mt-2 rounded-lg"
                      src={event.eventVideoURL}
                      controls
                    />
                  </div>
                )}

                {event.qrCodeImageURL && (
                  <div className="mt-4">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">QR Code:</span>
                    <img
                      src={event.qrCodeImageURL}
                      alt="QR Code"
                      className="w-40 mt-2 rounded-lg"
                    />
                  </div>
                )}

              </div>
            </div>

            {/* Latest Participants */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest Participants</h2>
                {event.participants?.length > 0 && (
                  <button onClick={() => setIsModalOpen(true)} className="px-4 py-1.5 text-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900 rounded-lg font-semibold transition">
                    View All ({event.participants.length})
                  </button>
                )}
              </div>
              {latestParticipants.length > 0 ? (
                <ul className="space-y-4">
                  {latestParticipants.map(p => (
                    <li key={p._id} className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-500">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white">{p.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{p.email}</p>
                        </div>
                      </div>
                      <p className="text-sm font-mono text-gray-500 dark:text-gray-400">{p.student_id}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 py-4 text-center">No one has registered for this event yet.</p>
              )}
            </div>
          </div>

          {/* Right Column (can be used for other info if needed) */}
          <div className="lg:col-span-1">
            {/* You can add more info cards or actions here */}
          </div>
        </div>
      </div>

      <ParticipantModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        participants={event.participants || []}
        theme={currentTheme}
      />
    </div>
  );
};

export default EventDetailManage;