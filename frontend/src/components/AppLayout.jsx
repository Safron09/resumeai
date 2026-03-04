import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const NAV = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'History', to: '/history' },
  { label: 'Settings', to: '/settings' },
]

export default function AppLayout({ children }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-bg/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-base font-semibold tracking-tight">
              Resume<span className="text-accent">AI</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              {NAV.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === to
                      ? 'text-gray-100 bg-white/5'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-600 hidden sm:block truncate max-w-[180px]">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
