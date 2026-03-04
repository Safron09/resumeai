import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function GuestRoute({ children }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  return isLoggedIn ? <Navigate to="/dashboard" replace /> : children
}
