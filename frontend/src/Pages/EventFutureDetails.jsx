import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { AdminContext } from '../context/AppContext';

const EventfutureDetails = () => {
  const { backendUrl, token } = useContext(AdminContext);
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/public/event/${id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });

        setEvent(response.data.event);
      } catch (error) {
        console.error('Failed to fetch event details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, backendUrl, token]);

  if (loading) {
    return <p className="text-center py-10">Loading event details...</p>;
  }

  if (!event) {
    return <p className="text-center py-10">Event not found.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4">{event.eventName}</h1>
      <p className="text-gray-600 mb-2">Date: {new Date(event.eventDate).toLocaleDateString()}</p>
      <p className="text-gray-600 mb-2">Location: {event.location}</p>
      <p className="text-gray-600 mb-2">Organizer: {event.organizerName}</p>
      <p className="text-gray-600 mb-4">Views: {event.viewCount}</p>

      {event.imageUrl && (
        <img
          src={event.imageUrl}
          alt={event.eventName}
          className="rounded-lg shadow mb-6 max-h-96 object-cover w-full"
        />
      )}

      <p className="text-gray-800">{event.description}</p>
    </div>
  );
};

export default EventfutureDetails;
