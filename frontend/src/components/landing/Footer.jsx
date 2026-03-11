import { Link } from 'react-router-dom'

const links = [
  { label: 'Pricing', to: '/pricing' },
  { label: 'Sign in', to: '/login' },
  { label: 'Register', to: '/register' },
  { label: 'Terms', to: '/terms' },
  { label: 'Privacy', to: '/privacy' },
  { label: 'Contact', to: '/contact' },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <Link to="/" className="text-base font-semibold tracking-tight">
          Prose<span className="text-accent">Hire</span>
        </Link>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-gray-700">© {new Date().getFullYear()} ProseHire</p>
      </div>
    </footer>
  )
}
