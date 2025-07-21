import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';

import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AllUsers from './pages/AllUsers';
import UserProfile from './pages/UserProfile';
import AllInquiriesPage from './pages/AllInquiriesPage';
import InquiryDetailPage from './pages/InquiryDetailPage';
import AllEventRequestsPage from './pages/AllEventRequestsPage';
import EventRequestDetailPage from './pages/EventRequestDetailPage'; 
import EventManagement from './pages/EventManagement';
import AdminApplicationsView from './pages/ApplicationsView';
import AdminEventApplicationsView from './pages/AdminEventApplicationsView';
import UpcomingEvents from './pages/UpcomingEvents';
import CreateNoticePage from './pages/CreateNoticePage';
import AllNoticesPage from './pages/AllNoticesPage';
import EditNoticePage from './pages/EditNoticePage';
const ThemedAppContent = () => {
  const { currentTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const hideLayoutRoutes = ['/']; // hide sidebar and navbar here
  const shouldHideLayout = hideLayoutRoutes.includes(location.pathname);

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

      {/* Only show Navbar and Sidebar if not on login page */}
      {!shouldHideLayout && (
        <>
          {/* ---------- DESKTOP SIDEBAR ---------- */}
          <div className="hidden md:block">
            <Sidebar />
          </div>

          {/* ---------- MOBILE SLIDING SIDEBAR ---------- */}
          <div
            className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-gray-900 border-r shadow-lg transition-transform duration-300 ease-in-out md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
          >
            <Sidebar onLinkClick={() => setSidebarOpen(false)} />
          </div>

          {/* ---------- BACKDROP ---------- */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* ---------- NAVBAR ---------- */}
          <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        </>
      )}

      {/* ---------- MAIN CONTENT ---------- */}
      <div className={`${!shouldHideLayout ? 'md:ml-60 pt-20' : ''}`}>
        <main className="p-4 md:p-6 lg:p-8 overflow-auto">
          <Routes>
            <Route path="/" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/users" element={<AllUsers />} />
            <Route path="/users/:userId" element={<UserProfile />} />
            <Route path="/inquiries" element={<AllInquiriesPage />} />
            <Route path="/inquiries/:inquiryId" element={<InquiryDetailPage />} />
            <Route path="/event-requests" element={<AllEventRequestsPage />} /> 
            <Route path="/event-requests/:requestId" element={<EventRequestDetailPage />} />
            <Route path="/create-event" element={<EventManagement />} /> 
            <Route path="/applications" element={<AdminApplicationsView/>}/>
            <Route path="/events/upcoming" element={<UpcomingEvents />} />
            <Route path="/events/:eventId/applications" element={<AdminEventApplicationsView />} />
            <Route path="/notices/create" element={<CreateNoticePage />} />
            <Route path="/notices" element={<AllNoticesPage />} />
            <Route path="notices/edit/:id" element={<EditNoticePage />} />
          </Routes>
        </main>
      </div>
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
