import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

// Placeholder images for team members - replace with actual paths
import teamMember1 from '../assets/photo/sanjeev.png';
import teamMember2 from '../assets/photo/sajal.png';
import teamMember3 from '../assets/photo/deepak.png';
import teamMember4 from '../assets/photo/ayush.png';
// Import the hero image
import heroImage from '../assets/photo/lpu.png';

// Import testimonial images
import user1Image from '../assets/photo/teac.jpg'; // Assuming teac.jpg is in the same assets/photo directory
import user2Image from '../assets/photo/girl.jpg'; // Assuming girl.jpg is in the same assets/photo directory

const AboutPage = () => {
  const { token, userData } = useContext(AppContext);
  const { currentTheme } = useTheme();

  const {
    primary,
    secondary,
    background,
    text,
    accent,
    hoverPrimary,
    hoverSecondary,
    footerBg,
    footerLink,
    testimonialBg,
  } = currentTheme;

  const teamMembers = [
    {
      id: 1,
      name: "Sanjeev Kumar",
      imageUrl: teamMember1,
      position: "Backend and Frontend Developer",
      email: "event@mednova.store",
      
      linkedin: "https://www.linkedin.com/in/sanjeevkumaryadav/",
      description: "Passionate about building robust and scalable backend systems  to power seamless event experiences."
    },
    {
      id: 2,
      name: "Sajal",
      imageUrl: teamMember2,
      position: "Frontend Developer",
      email: "sajal@eventzone.com",
     
      linkedin: "https://linkedin.com/in/sajaldev",
      description: "Crafting intuitive and engaging user interfaces that make discovering and managing events a joy."
    },
    {
      id: 3,
      name: "Deepak",
      imageUrl: teamMember3,
      position: "Lead Designer",
      email: "deepak.design@eventzone.com",
     
      linkedin: "https://linkedin.com/in/deepakdesigner",
      description: "Translating ideas into visually compelling designs that capture the essence of every event."
    },
    {
      id: 4,
      name: "Ayushman Sharma",
      imageUrl: teamMember4,
      position: "UI/UX Designer",
      email: "ayushman.uiux@eventzone.com",
  
      linkedin: "https://linkedin.com/in/ayushmandesign",
      description: "Focusing on user-centered design to create memorable and accessible event journeys."
    },
  ];

  // --- Dynamic Style Helpers ---
  const getThemedStyle = (colorProp) => ({
    color: currentTheme[colorProp] || colorProp,
    fontFamily: currentTheme.fontFamily || 'inherit',
  });

  const getThemedBgStyle = (colorProp) => ({
    backgroundColor: currentTheme[colorProp] || colorProp,
  });

  return (
    <div className={`font-sans antialiased`} style={{ backgroundColor: background, color: text }}>

      {/* Hero Section */}
      <section
        className="relative text-white py-28 px-4 text-center flex items-center justify-center bg-cover bg-center"
        style={{
          minHeight: '70vh',
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroImage})`, // Apply hero image with overlay
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container mx-auto z-10">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-4 leading-tight animate-fade-in-up" style={getThemedStyle('text')}>
            About EventZone
          </h1>
          <p className="text-xl lg:text-2xl font-light mb-8 animate-in" style={{ animationDelay: '0.2s', color: 'rgba(255, 255, 255, 0.9)' }}>
            Connecting colleges with unforgettable events, seamlessly.
          </p>
          {/* Call to Action Button */}
          <a
            href="#team"
            className={`inline-block px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl`}
            style={{
              backgroundColor: accent,
              color: 'white',
              boxShadow: `0 4px 6px -1px ${accent}80, 0 2px 4px -1px ${accent}80`
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = hoverPrimary}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = accent}
          >
            Meet Our Innovators
          </a>
        </div>
      </section>

      {/* Main Content Section */}
      <main className="container mx-auto px-4 py-20">

        {/* Mission Section */}
        <section className="max-w-5xl mx-auto text-center mb-20">
          <h2 className={`text-4xl sm:text-5xl font-bold mb-8`} style={getThemedStyle('secondary')}>
            Our Mission
          </h2>
          <div className="text-lg leading-relaxed space-y-6" style={getThemedStyle('text')}>
            <p>
              EventZone is passionately dedicated to revolutionizing how college communities discover, organize, and engage with events. We recognize the electrifying and dynamic nature of campus life, and we've built a robust, centralized platform to streamline everything from intimate club gatherings and insightful workshops to electrifying cultural festivals and innovative hackathons.
            </p>
            <p>
              Our core objective is to cultivate a thriving and interconnected campus ecosystem by making event management effortless and event participation profoundly engaging for every student, faculty member, and organizer. We believe in unlocking the full potential of campus life, fostering connections, promoting learning, and igniting memorable experiences.
            </p>
            <p>
              Whether you're aiming to amplify the reach of your next flagship event or seeking out stimulating campus activities, EventZone is your ultimate companion. We aspire to be the heartbeat of college events, ensuring that no opportunity for growth, collaboration, or pure enjoyment goes unnoticed.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 px-6 rounded-lg shadow-xl mb-20 border border-gray-200" style={getThemedBgStyle('background')}>
          <h2 className={`text-4xl sm:text-5xl font-bold text-center mb-12`} style={getThemedStyle('primary')}>
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center p-6 rounded-lg bg-white shadow-md hover:shadow-xl transition-all duration-300" style={getThemedBgStyle('background')}>
              <div className="text-5xl mb-4" style={getThemedStyle('secondary')}>🌟</div>
              <h3 className="text-2xl font-bold mb-3" style={getThemedStyle('text')}>Community</h3>
              <p className="text-gray-700" style={getThemedStyle('text')}>Fostering connections and shared experiences within college campuses.</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-white shadow-md hover:shadow-xl transition-all duration-300" style={getThemedBgStyle('background')}>
              <div className="text-5xl mb-4" style={getThemedStyle('primary')}>💡</div>
              <h3 className="text-2xl font-bold mb-3" style={getThemedStyle('text')}>Innovation</h3>
              <p className="text-gray-700" style={getThemedStyle('text')}>Continuously seeking new ways to enhance event engagement and discovery.</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-white shadow-md hover:shadow-xl transition-all duration-300" style={getThemedBgStyle('background')}>
              <div className="text-5xl mb-4" style={getThemedStyle('accent')}>🤝</div>
              <h3 className="text-2xl font-bold mb-3" style={getThemedStyle('text')}>Simplicity</h3>
              <p className="text-gray-700" style={getThemedStyle('text')}>Making event organization and participation as easy as possible.</p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="mt-16">
          <h2 className={`text-4xl sm:text-5xl font-bold text-center mb-16`} style={getThemedStyle('secondary')}>
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {teamMembers.map((member, index) => (
              <div
                key={member.id}
                className="text-center flex flex-col items-center bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500 ease-in-out transform hover:-translate-y-3 hover:scale-105 border border-gray-200 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`relative w-40 h-40 rounded-full overflow-hidden mb-5 border-4 shadow-xl transition-all duration-300 group-hover:shadow-2xl`}
                  style={{ borderColor: primary }}
                >
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-1" style={getThemedStyle('text')}>{member.name}</h3>
                <p className="text-base font-medium mb-2" style={{ color: primary }}>{member.position}</p>
                <p className="text-sm mb-4 italic min-h-[50px]" style={getThemedStyle('text')}>
                  {member.description}
                </p>
                <div className="text-sm space-y-2 flex flex-col items-center" style={getThemedStyle('text')}>
                  <a
                    href={`mailto:${member.email}`}
                    className={`flex items-center transition-colors duration-200 hover:underline`}
                    style={{ WebkitTapHighlightColor: 'transparent', color: text }}
                    onMouseOver={(e) => e.currentTarget.style.color = primary}
                    onMouseOut={(e) => e.currentTarget.style.color = text}
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-4.001a2.73 2.73 0 00-.747 1.533l-1.897 8.568a2.73 2.73 0 002.716 2.707L18 19.998h-14v-14l-1.997.001a2.73 2.73 0 00-1.533-.747z"></path></svg>
                    {member.email}
                  </a>
                  <p className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v7h7a1 1 0 010 2h-7v7a1 1 0 11-2 0V13H3a1 1 0 010-2h7V3z" clipRule="evenodd"></path></svg>
                    {member.phone}
                  </p>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center transition-colors duration-200 hover:underline`}
                    style={{ WebkitTapHighlightColor: 'transparent', color: text }}
                    onMouseOver={(e) => e.currentTarget.style.color = secondary}
                    onMouseOut={(e) => e.currentTarget.style.color = text}
                  >
                    <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 24 24"><path d="M19 0H5a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5V5a5 5 0 00-5-5zM10 18a1 1 0 01-1-1v-6a1 1 0 012 0v6a1 1 0 01-1 1zm-4.764-7.999a1.765 1.765 0 111.764 1.764A1.765 1.765 0 015.236 10zm0-2a3.765 3.765 0 113.764 3.764A3.765 3.765 0 015.236 8zM10 13a1 1 0 01-1-1V7a1 1 0 112 0v5a1 1 0 01-1 1z"></path></svg>
                    LinkedIn
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="mt-24 py-16 px-6 rounded-xl shadow-inner border border-gray-100" style={getThemedBgStyle('testimonialBg')}>
          <h2 className={`text-4xl sm:text-5xl font-bold text-center mb-12`} style={getThemedStyle('secondary')}>
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 ">
            {/* Testimonial 1 */}
            <div className="p-8 rounded-lg shadow-lg text-center border border-gray-200" style={getThemedBgStyle('background')}>
              <p className="text-xl leading-relaxed mb-6" style={getThemedStyle('text')}>
                "EventZone transformed how we organize our annual college fest. The platform is incredibly intuitive, and it made promotion and ticket management a breeze!"
              </p>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full overflow-hidden mb-3 bg-gray-300">
                  {/* Use the imported image variable */}
                  <img src={user1Image} alt="User 1" className="w-full h-full object-cover" loading="lazy"/>
                </div>
                <h4 className="text-lg font-semibold mb-1" style={getThemedStyle('text')}>Raj Kumar</h4>
                <p className="text-sm" style={getThemedStyle('text')}>Student Council President</p>
              </div>
            </div>
            {/* Testimonial 2 */}
            <div className="p-8 rounded-lg shadow-lg text-center border border-gray-200" style={getThemedBgStyle('background')}>
              <p className="text-xl leading-relaxed mb-6" style={getThemedStyle('text')}>
                "As a new student, finding events was always a challenge. EventZone's discovery features are fantastic, and I've attended more activities than ever before!"
              </p>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full overflow-hidden mb-3 bg-gray-300">
                  {/* Use the imported image variable */}
                  <img src={user2Image} alt="User 2" className="w-full h-full object-cover" loading="lazy"/>
                </div>
                <h4 className="text-lg font-semibold mb-1" style={getThemedStyle('text')}>puja Patel</h4>
                <p className="text-sm" style={getThemedStyle('text')}>First Year Student</p>
              </div>
            </div>
          </div>
        </section>

      </main>


    </div>
  );
};

export default AboutPage;