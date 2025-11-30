import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Home from './pages/Home';
import Reservation from './pages/Reservation';
import CheckIn from './pages/CheckIn';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Calendar from './pages/Calendar';
import MyReservations from './pages/MyReservations';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function AppContent() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100 flex flex-col">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/my-reservations" element={<MyReservations />} />
              <Route path="/reservation/:spaceId" element={<Reservation />} />
              <Route path="/checkin" element={<CheckIn />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;