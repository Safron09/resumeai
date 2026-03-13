import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function Navbar() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const navigate = useNavigate()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-md bg-bg/80">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="text-lg font-semibold tracking-tight">
          Prose<span className="text-accent">Hire</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">How it works</a>
          <Link to="/pricing" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">Pricing</Link>
          <Link to="/contact" className="text-sm text-gray-400 hover:text-gray-100 transition-colors">Contact Us</Link>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-accent hover:bg-accent/90 text-bg font-semibold text-sm px-5 py-2 rounded-lg transition-colors"
            >
              Dashboard
            </button>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-400 hover:text-gray-100 transition-colors hidden sm:block">
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-accent hover:bg-accent/90 text-bg font-semibold text-sm px-5 py-2 rounded-lg transition-colors"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
