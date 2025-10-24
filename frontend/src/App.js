import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from '@/components/ui/sonner';
import '@/App.css';

// Pages
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Vehicles from '@/pages/Vehicles';
import VehicleDetail from '@/pages/VehicleDetail';
import Faults from '@/pages/Faults';
import Stations from '@/pages/Stations';
import Users from '@/pages/Users';
import Assignments from '@/pages/Assignments';
import Services from '@/pages/Services';
import Requests from '@/pages/Requests';
import FaultTypes from '@/pages/FaultTypes';
import Statistics from '@/pages/Statistics';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Axios interceptor for auth token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${API}/auth/me`);
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />}
          />
          <Route
            path="/"
            element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/vehicles"
            element={user ? <Vehicles user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/vehicles/:id"
            element={user ? <VehicleDetail user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/faults"
            element={user ? <Faults user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/stations"
            element={user ? <Stations user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/assignments"
            element={user ? <Assignments user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/users"
            element={user?.role === 'manager' ? <Users user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
          />
          <Route
            path="/services"
            element={user ? <Services user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/requests"
            element={user ? <Requests user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/fault-types"
            element={user?.role === 'manager' ? <FaultTypes user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
          />
          <Route
            path="/statistics"
            element={user?.role === 'manager' ? <Statistics user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;