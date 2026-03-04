import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import GuestRoute from './components/GuestRoute'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Guest-only */}
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

      {/* Protected */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/onboarding" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    </Routes>
  )
}
