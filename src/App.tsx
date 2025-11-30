import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Reservation from './pages/Reservation';
import CheckIn from './pages/CheckIn';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Calendar from './pages/Calendar';
import MyReservations from './pages/MyReservations';
import './App.css';

function AppContent() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">도서관 예약 시스템</h1>
            <div className="space-x-4">
              {user ? (
                <>
                  <a href="/" className="text-blue-600 hover:text-blue-800">
                    홈
                  </a>
                  <a href="/calendar" className="text-blue-600 hover:text-blue-800">
                    캘린더
                  </a>
                  <a href="/my-reservations" className="text-blue-600 hover:text-blue-800">
                    내 예약
                  </a>
                  {isAdmin && (
                    <a href="/admin" className="text-blue-600 hover:text-blue-800">
                      관리자
                    </a>
                  )}
                  <a href="/checkin" className="text-blue-600 hover:text-blue-800">
                    체크인
                  </a>
                  <button
                    onClick={logout}
                    className="text-red-600 hover:text-red-800"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <a href="/login" className="text-blue-600 hover:text-blue-800">
                  로그인
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/my-reservations" element={<MyReservations />} />
        <Route path="/reservation/:spaceId" element={<Reservation />} />
        <Route path="/checkin" element={<CheckIn />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
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