import React from 'react';

const EventCard = ({ event }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition hover:scale-105 hover:shadow-xl flex flex-col">
      <img src={event.imageUrl} alt={event.title} className="w-full h-56 object-cover" />
      <div className="p-6 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">{event.title}</h3>
          <p className="text-gray-600 mb-1">{event.date}</p>
          <p className="text-gray-600 mb-4">{event.location}</p>
        </div>
        <a href={`/events/${event.id}`} className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-md font-medium text-center transition-colors duration-200 inline-block">
          View Details
        </a>
      </div>
    </div>
  );
};

export default EventCard;