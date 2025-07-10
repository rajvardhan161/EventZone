import React from 'react';
import EventCard from './EventCard';

// Import local event images
import techConf from '../assets/photo/wallpaperflare.com_wallpaper (26).jpg';
import musicFest from '../assets/photo/wallpaperflare.com_wallpaper (24).jpg';
import artExhibit from '../assets/photo/wallpaperflare.com_wallpaper (23).jpg';
import foodWine from '../assets/photo/wallpaperflare.com_wallpaper (21).jpg';

const MainContent = () => {
  const featuredEvents = [
    {
      id: 1,
      title: 'Tech Conference 2024',
      date: 'Oct 20-22, 2024',
      location: 'San Francisco',
      imageUrl: techConf,
    },
    {
      id: 2,
      title: 'Music Festival',
      date: 'Nov 15-17, 2024',
      location: 'Austin, TX',
      imageUrl: musicFest,
    },
    {
      id: 3,
      title: 'Art Exhibition',
      date: 'Dec 1, 2024',
      location: 'New York City',
      imageUrl: artExhibit,
    },
    {
      id: 4,
      title: 'Food & Wine Tasting',
      date: 'Dec 8, 2024',
      location: 'Napa Valley',
      imageUrl: foodWine,
    },
  ];

  return (
    <main className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        {/* Upcoming Events Section */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            Upcoming Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default MainContent;
