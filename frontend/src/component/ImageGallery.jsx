import React from 'react';

// Import gallery images from assets
import img1 from '../assets/photo/wallpaperflare.com_wallpaper (26).jpg';
import img2 from '../assets/photo/wallpaperflare.com_wallpaper (24).jpg';
import img3 from '../assets/photo/wallpaperflare.com_wallpaper (23).jpg';
import img4 from '../assets/photo/wallpaperflare.com_wallpaper (22).jpg';
import img5 from '../assets/photo/wallpaperflare.com_wallpaper (25).jpg';
import img6 from '../assets/photo/wallpaperflare.com_wallpaper (16).jpg';

const ImageGallery = () => {
  const galleryImages = [img1, img2, img3, img4, img5, img6];

  return (
    <section className="bg-gray-100 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Event Highlights</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {galleryImages.map((imageUrl, index) => (
            <div className="gallery-item" key={index}>
              <img
                src={imageUrl}
                alt={`Gallery item ${index + 1}`}
                className="w-full h-36 object-cover rounded-lg shadow-sm transition hover:shadow-md"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImageGallery;
