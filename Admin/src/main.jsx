 
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import AdminContextProvider from './context/AdminContext.jsx';

createRoot(document.getElementById('root')).render(
  
    <BrowserRouter>
      <ThemeProvider>
        <AdminContextProvider>
          <App />
        </AdminContextProvider>
      </ThemeProvider>
    </BrowserRouter>
 
);
