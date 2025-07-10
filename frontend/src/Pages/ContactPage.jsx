import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import heroImage from '../assets/photo/lpu.png';

const ContactPage = () => {
  const { backendUrl } = useContext(AppContext);
  const { currentTheme } = useTheme();

  const {
    primary = '#3b82f6',
    secondary = '#6366f1',
    background = '#ffffff',
    text = '#374151',
    accent = '#ec4899',
    hoverPrimary = '#2563eb',
    inputBg = '#f9fafb',
    inputBorder = '#d1d5db',
  } = currentTheme;

  const [activeForm, setActiveForm] = useState('inquiry');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    student_id: '',
    email: '',
    phone: '',
    query: '',
  });

  const [eventOrgData, setEventOrgData] = useState({
    eventName: '',
    student_id: '',
    eventDate: '',
    eventTime: '',
    eventDescription: '',
    organizerName: '',
    organizerEmail: '',
    organizerPhone: '',
    query: '',
  });

  const [isLoadingInquiry, setIsLoadingInquiry] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isLoadingEventOrg, setIsLoadingEventOrg] = useState(false);
  const [eventOrgMessage, setEventOrgMessage] = useState('');

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEventOrgFormChange = (e) => {
    const { name, value } = e.target;
    setEventOrgData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    setIsLoadingInquiry(true);
    setInquiryMessage('');

    try {
      const response = await fetch(`${backendUrl}/api/user/inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setInquiryMessage('success');
        toast.success('Your inquiry has been submitted successfully!');
        setFormData({
          firstName: '',
          lastName: '',
          student_id: '',
          email: '',
          phone: '',
          query: '',
        });
      } else {
        setInquiryMessage('error');
        const errorMessage = result.message || 'Please try again later.';
        toast.error(`Error submitting inquiry: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Fetch error submitting inquiry:', error);
      setInquiryMessage('error');
      toast.error('An unexpected error occurred. Please check your connection and try again.');
    } finally {
      setIsLoadingInquiry(false);
    }
  };

  const handleSubmitEventOrganization = async (e) => {
    e.preventDefault();
    setIsLoadingEventOrg(true);
    setEventOrgMessage('');

    try {
      const response = await fetch(`${backendUrl}/api/user/event-organization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventOrgData),
      });

      const result = await response.json();

      if (response.ok) {
        setEventOrgMessage('success');
        toast.success('Your event organization request has been submitted successfully!');
        setEventOrgData({
          eventName: '',
          student_id: '',
          eventDate: '',
          eventTime: '',
          eventDescription: '',
          organizerName: '',
          organizerEmail: '',
          organizerPhone: '',
          query: '',
        });
      } else {
        setEventOrgMessage('error');
        const errorMessage = result.message || 'Please try again later.';
        toast.error(`Error submitting event request: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Fetch error submitting event organization:', error);
      setEventOrgMessage('error');
      toast.error('An unexpected error occurred. Please check your connection and try again.');
    } finally {
      setIsLoadingEventOrg(false);
    }
  };

  const getThemedStyle = (colorProp) => ({
    color: currentTheme[colorProp] || colorProp,
    fontFamily: currentTheme.fontFamily || 'inherit',
  });

  const getThemedBgStyle = (colorProp) => ({
    backgroundColor: currentTheme[colorProp] || colorProp,
  });

  const inputStyles = {
    backgroundColor: inputBg || '#ffffff',
    color: text || '#000000',
    borderColor: inputBorder || '#d1d5db',
    fontFamily: currentTheme.fontFamily || 'inherit',
  };

  const renderMessage = (message, type) => {
    if (!message) return null;
    return (
      <p className={`mt-2 text-sm ${type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
        {type === 'success' ? 'Message sent!' : 'Error sending message.'}
      </p>
    );
  };

  return (
    <div className={`font-sans antialiased`} style={{ backgroundColor: background, color: text }}>

      <section
        className="relative text-white py-28 px-4 text-center flex items-center justify-center bg-cover bg-center"
        style={{
          minHeight: '50vh',
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container mx-auto z-10">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-4 leading-tight animate-fade-in-up" style={getThemedStyle('text')}>
            Get in Touch
          </h1>
          <p className="text-xl lg:text-2xl font-light mb-8 animate-in" style={{ animationDelay: '0.2s', color: 'rgba(255, 255, 255, 0.9)' }}>
            We're here to help with any inquiries or event organization needs.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-20">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">

          <div>
            <div className="flex mb-8 border-b" style={{ borderColor: inputBorder }}>
              <button
                onClick={() => setActiveForm('inquiry')}
                className={`px-6 py-3 font-bold text-lg transition-all duration-300 ease-in-out ${activeForm === 'inquiry'
                  ? 'border-b-2'
                  : 'text-gray-500'} `}
                style={{
                  borderColor: accent,
                  color: activeForm === 'inquiry' ? text : '',
                  fontFamily: currentTheme.fontFamily || 'inherit',
                }}
              >
                General Inquiry / Problem Report
              </button>
              <button
                onClick={() => setActiveForm('event')}
                className={`px-6 py-3 font-bold text-lg transition-all duration-300 ease-in-out ${activeForm === 'event'
                  ? 'border-b-2'
                  : 'text-gray-500'} `}
                style={{
                  borderColor: accent,
                  color: activeForm === 'event' ? text : '',
                  fontFamily: currentTheme.fontFamily || 'inherit',
                }}
              >
                Event Organization
              </button>
            </div>

            {activeForm === 'inquiry' && (
              <section className="p-8 rounded-lg shadow-xl" style={getThemedBgStyle('background')}>
                <h2 className={`text-4xl sm:text-5xl font-bold mb-8`} style={getThemedStyle('secondary')}>
                  Tell Us About the Problem You're Facing
                </h2>
                <form onSubmit={handleSubmitInquiry}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="firstName" className="block mb-2 text-sm font-medium" style={getThemedStyle('text')}>First Name *</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleFormChange}
                        className="w-full p-3 rounded-lg border"
                        style={inputStyles}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block mb-2 text-sm font-medium" style={getThemedStyle('text')}>Last Name *</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleFormChange}
                        className="w-full p-3 rounded-lg border"
                        style={inputStyles}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="student_id" className="block mb-2 text-sm font-medium" style={getThemedStyle('text')}>Student ID *</label>
                    <input
                      type="text"
                      id="student_id"
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleFormChange}
                      className="w-full p-3 rounded-lg border"
                      style={inputStyles}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="email" className="block mb-2 text-sm font-medium" style={getThemedStyle('text')}>Your Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      className="w-full p-3 rounded-lg border"
                      style={inputStyles}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="phone" className="block mb-2 text-sm font-medium" style={getThemedStyle('text')}>Your Phone *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="w-full p-3 rounded-lg border"
                      style={inputStyles}
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="query" className="block mb-2 text-sm font-medium" style={getThemedStyle('text')}>Describe Your Problem</label>
                    <textarea
                      id="query"
                      name="query"
                      rows="4"
                      value={formData.query}
                      onChange={handleFormChange}
                      className="w-full p-3 rounded-lg border"
                      style={inputStyles}
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className={`w-full px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl`}
                    style={{
                      backgroundColor: accent,
                      color: 'black',
                      boxShadow: `0 4px 6px -1px ${accent}80, 0 2px 4px -1px ${accent}80`
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = hoverPrimary}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = accent}
                    disabled={isLoadingInquiry}
                  >
                    {isLoadingInquiry ? 'Sending...' : 'Submit Problem'}
                  </button>
                  {renderMessage(inquiryMessage, 'success')}
                </form>
              </section>
            )}

            {activeForm === 'event' && (
              <section className="p-8 rounded-lg shadow-xl" style={getThemedBgStyle('background')}>
                <h2 className={`text-4xl sm:text-5xl font-bold mb-8`} style={getThemedStyle('primary')}>
                  Organize an Event
                </h2>
                <p className="text-lg mb-8" style={getThemedStyle('text')}>
                  Have an idea for an event? Let us know the details.
                </p>
                <form onSubmit={handleSubmitEventOrganization}>
                  <div className="mb-4">
                    <label htmlFor="eventName" className="block mb-2 text-sm font-medium" style={getThemedStyle('text')}>Event Name *</label>
                    <input
                      type="text"
                      id="eventName"
                      name="eventName"
                      value={eventOrgData.eventName}
                      onChange={handleEventOrgFormChange}
                      className="w-full p-3 rounded-lg border"
                      style={inputStyles}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="student_id" className="block mb-2 text-sm font-medium" style={getThemedStyle('text')}>Student ID *</label>
                    <input
                      type="text"
                      id="student_id"
                      name="student_id"
                      value={eventOrgData.student_id}
                      onChange={handleEventOrgFormChange}
                      className="w-full p-3 rounded-lg border"
                      style={inputStyles}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="eventDate" className="block mb-2 text-sm font-medium" style={getThemedStyle('text')}>Event Date *</label>
                      <input
                        type="date"
                        id="eventDate"
                        name="eventDate"
                        value={eventOrgData.eventDate}
                        onChange={handleEventOrgFormChange}
                        className="w-full p-3 rounded-lg border"
                        style={inputStyles}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="eventTime" className="block mb-2 text-sm font-medium" style={getThemedStyle('text')}>Event Time *</label>
                      <input
                        type="time"
                        id="eventTime"
                        name="eventTime"
                        value={eventOrgData.eventTime}
                        onChange={handleEventOrgFormChange}
                        className="w-full p-3 rounded-lg border"
                        style={inputStyles}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="eventDescription" className="block mb-2 text-sm font-medium" style={getThemedStyle('text')}>Event Description</label>
                    <textarea
                      id="eventDescription"
                      name="eventDescription"
                      rows="4"
                      value={eventOrgData.eventDescription}
                      onChange={handleEventOrgFormChange}
                      className="w-full p-3 rounded-lg border"
                      style={inputStyles}
                    ></textarea>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="organizerName" className="block mb-2 text-sm font-medium" style={getThemedStyle('text')}>Your Name *</label>
                    <input
                      type="text"
                      id="organizerName"
                      name="organizerName"
                      value={eventOrgData.organizerName}
                      onChange={handleEventOrgFormChange}
                      className="w-full p-3 rounded-lg border"
                      style={inputStyles}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="organizerEmail" className="block mb-2 text-sm font-medium" style={getThemedStyle('text')}>Your Email *</label>
                    <input
                      type="email"
                      id="organizerEmail"
                      name="organizerEmail"
                      value={eventOrgData.organizerEmail}
                      onChange={handleEventOrgFormChange}
                      className="w-full p-3 rounded-lg border"
                      style={inputStyles}
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="organizerPhone" className="block mb-2 text-sm font-medium" style={getThemedStyle('text')}>Your Phone *</label>
                    <input
                      type="tel"
                      id="organizerPhone"
                      name="organizerPhone"
                      value={eventOrgData.organizerPhone}
                      onChange={handleEventOrgFormChange}
                      className="w-full p-3 rounded-lg border"
                      style={inputStyles}
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="query" className="block mb-2 text-sm font-medium" style={getThemedStyle('text')}>Your Query/Details</label>
                    <textarea
                      id="query"
                      name="query"
                      rows="4"
                      value={eventOrgData.query}
                      onChange={handleEventOrgFormChange}
                      className="w-full p-3 rounded-lg border"
                      style={inputStyles}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className={`w-full px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl`}
                    style={{
                      backgroundColor: accent,
                      color: 'black',
                      boxShadow: `0 4px 6px -1px ${accent}80, 0 2px 4px -1px ${accent}80`
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = hoverPrimary}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = accent}
                    disabled={isLoadingEventOrg}
                  >
                    {isLoadingEventOrg ? 'Submitting...' : 'Submit Event Request'}
                  </button>
                  {renderMessage(eventOrgMessage, 'success')}
                </form>
              </section>
            )}
          </div>

          <aside className="sticky top-20 p-8 rounded-lg shadow-xl" style={{ backgroundColor: background, height: 'fit-content' }}>
            <h2 className={`text-4xl sm:text-5xl font-bold mb-12`} style={getThemedStyle('secondary')}>
              Visit Team EventZone
            </h2>
            <div className="mb-8" style={getThemedStyle('text')}>
              <p>Call us to schedule a tour of our Houston office, right inside the 610 Loop in the Galleria/Uptown area. We are open Monday through Friday from 8:30 am to 5:30 pm CST.</p>
            </div>

            <div className="flex items-center mb-6">
              <div className="text-3xl mr-4" style={{ color: primary }}>
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3a1 1 0 011 1v7h7a1 1 0 010 2h-7v7a1 1 0 11-2 0V13H3a1 1 0 010-2h7V3z" clipRule="evenodd"></path></svg>
              </div>
              <div>
                <p className="text-sm font-medium" style={getThemedStyle('text')}>Phone No.</p>
                <p className="text-xl font-bold" style={getThemedStyle('text')}>9534755555</p>
              </div>
            </div>

            <div className="flex items-center mb-6">
              <div className="text-3xl mr-4" style={{ color: primary }}>
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-4.001a2.73 2.73 0 00-.747 1.533l-1.897 8.568a2.73 2.73 0 002.716 2.707L18 19.998h-14v-14l-1.997.001a2.73 2.73 0 00-1.533-.747z"></path></svg>
              </div>
              <div>
                <p className="text-sm font-medium" style={getThemedStyle('text')}>Team</p>
                <p className="text-xl font-bold" style={getThemedStyle('text')}>EventZone</p>
              </div>
            </div>

            <div className="flex items-center mb-6">
              <div className="text-3xl mr-4" style={{ color: primary }}>
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5a1 1 0 011-1-1V3a1 1 0 01-1-1h0a1 1 0 01-1-1H0a1 1 0 00-1 1v2a1 1 0 001 1h1a1 1 0 011 1v2a1 1 0 001 1H11.25a2.75 2.75 0 002.75 2.75h1.25a2.75 2.75 0 002.75-2.75h1.25a1 1 0 001-1v-2a1 1 0 00-1-1H16.75a2.75 2.75 0 00-2.75 2.75h-1.25a2.75 2.75 0 00-2.75 2.75H5.25a2.75 2.75 0 00-2.75-2.75H2.75A2.75 2.75 0 000 5v-1.5zM13 7h1.5a2.75 2.75 0 002.75-2.75V2.75A2.75 2.75 0 0014.5 0H13a2.75 2.75 0 00-2.75 2.75v1.5a2.75 2.75 0 002.75 2.75zm-3.75 0H9.25a2.75 2.75 0 00-2.75 2.75v1.5a2.75 2.75 0 002.75 2.75h1.25a2.75 2.75 0 002.75-2.75v-1.5a2.75 2.75 0 00-2.75-2.75z" clipRule="evenodd"></path></svg>
              </div>
              <div>
                <p className="text-sm font-medium" style={getThemedStyle('text')}>Email</p>
                <p className="text-xl font-bold" style={getThemedStyle('text')}>contact@mednova.store</p>
              </div>
            </div>

            <div className="flex items-start mb-6">
              <div className="text-3xl mr-4" style={{ color: primary }}>
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.227a1 1 0 011.012-.04l1.769.703a1 1 0 001.203-.382l1.166-1.944a1 1 0 011.012-.04l1.769.703a1 1 0 001.203-.382l1.166-1.944a1 1 0 011.012-.04l1.769.703a1 1 0 001.203-.382l.75-1.257a1 1 0 00-.125-1.273l-.851-.851a1 1 0 00-1.273-.125l-.75.75a1 1 0 01-1.203-.382l-1.166-1.944a1 1 0 00-1.012-.04l-1.769.703a1 1 0 00-1.203.382l-1.166 1.944a1 1 0 01-1.012.04l-1.769-.703a1 1 0 00-1.203-.382l-.851.851a1 1 0 00-.125 1.273l.75.75a1 1 0 01.125 1.273l-.75.75a1 1 0 00.382 1.203l1.944 1.166a1 1 0 01.04 1.012l-.703 1.769a1 1 0 00.382 1.203l.851.851a1 1 0 001.273.125l.75-.75a1 1 0 011.203.382l1.166 1.944a1 1 0 001.012.04l1.769-.703a1 1 0 001.203-.382l.851.851a1 1 0 00.125 1.273l-.851.851a1 1 0 00-1.273.125l-.75-.75a1 1 0 01-.382-1.203l1.944-1.166a1 1 0 00-1.012-.04l-1.769.703a1 1 0 00-1.203-.382l-1.166-1.944a1 1 0 00-1.012-.04l-1.769.703a1 1 0 00-1.203.382l-.851.851a1 1 0 00-1.273-.125l-.75-.75a1 1 0 01-.382-1.203l.851-.851a1 1 0 00.125-1.273l.75-.75a1 1 0 01.382-1.203l-1.944-1.166a1 1 0 00-1.012-.04zm-1.297 3.78a5.75 5.75 0 0110.58 3.229A5.75 5.75 0 0113.25 15H6.75a5.75 5.75 0 01-3.019-9.971zM8 10.75a1.25 1.25 0 00-1.25 1.25v2.5a1.25 1.25 0 002.5 0v-2.5A1.25 1.25 0 008 10.75z"></path></svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={getThemedStyle('text')}>ADDRESS</p>
                <p className="text-xl font-bold" style={getThemedStyle('text')}>Madhubani, Bihar</p>
                <p className="text-xl font-bold" style={getThemedStyle('text')}>India</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;