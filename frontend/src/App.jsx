 
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';

import Login from './Pages/Login';
import Home from './Pages/Home';
import ForgotPasswordPage from './Pages/ForgotPasswordPage';
import Dashboard from './Pages/Dashboard';
import ProfilePage from './Pages/ProfilePage';
import Navbar from './component/Nevbar';
import EventList from './Pages/AllEvent';
import AboutPage from './Pages/AboutPage';
import Footer from './component/Footer';
import ContactPage from './Pages/ContactPage';
import { ToastContainer } from 'react-toastify';
import EventDetails from './Pages/EventDetails';
import ApplyEvent from './Pages/ApplyEvent';
import InquiryDetail from './Pages/InquiryDetail';
import UserApplicationsPage from './Pages/UserApplicationsPage';
import ApplicationDetails from './Pages/ApplicationDetails'; 
import PublicNoticesListView from './Pages/PublicNoticesListView';

const ThemedAppContent = () => {
  const { currentTheme } = useTheme();
  

  return (
    <div
      style={{
        backgroundColor: currentTheme.bgColor,
        color: currentTheme.textColor,
        fontFamily: currentTheme.fontFamily,
        minHeight: '100vh',
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <Navbar />
      

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/event" element={<EventList/>}/>
        <Route path="/about" element={<AboutPage/>}/>
        <Route path='/contact' element={<ContactPage/>}/>
        <Route path="/events/:eventId" element={<EventDetails />} />
        <Route path='/events/:eventId/apply' element={<ApplyEvent/>}/>
        <Route path='/support/inquiries/:inquiryId' element={<InquiryDetail/>}/>
        <Route path='/applications' element={<UserApplicationsPage/>}/>
        <Route path="/applications/:applicationId" element={<ApplicationDetails />} />
        
        <Route path="/announcements" element={<PublicNoticesListView />} /> 
        <Route path="*" element={<div className="p-4">404 - Page Not Found</div>} />
      </Routes>
      <Footer/>
    </div>
  );
};
 
const App = () => {
  return (
    <ThemeProvider>
      <ThemedAppContent />
    </ThemeProvider>
  );
};

export default App;
