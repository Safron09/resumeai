import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import useAuthStore from '../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: undefined, general: undefined })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      const { data } = await api.post('/api/auth/login/', form)
      setAuth(data.user, data.access, data.refresh)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const data = err.response?.data
      if (err.response?.status >= 500 || !data) {
        setErrors({ general: 'Something went wrong. Please try again.' })
      } else if (typeof data === 'object' && !Array.isArray(data)) {
        const mapped = {}
        Object.entries(data).forEach(([k, v]) => {
          mapped[k] = Array.isArray(v) ? v[0] : v
        })
        setErrors(mapped)
      } else {
        setErrors({ general: String(data) })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/login/google-oauth2/`
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <span className="text-2xl font-semibold tracking-tight">
            Resume<span className="text-accent">AI</span>
          </span>
          <p className="text-gray-400 mt-2 text-sm">Sign in to your account</p>
        </div>

        <div className="bg-surface rounded-2xl p-8 shadow-xl border border-white/5">
          <button
            type="button"
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-sm font-medium text-gray-200 transition-colors mb-6"
          >
            <GoogleIcon />
            Sign in with Google
          </button>

          <Divider />

          {errors.general && (
            <p className="text-red-400 text-sm mb-4 text-center">{errors.general}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email" error={errors.email}>
              <input
                type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com" required
                className={inputClass(errors.email)}
              />
            </Field>

            <Field label="Password" error={errors.password}>
              <input
                type="password" name="password" value={form.password} onChange={handleChange}
                placeholder="••••••••" required
                className={inputClass(errors.password)}
              />
            </Field>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-gray-500 hover:text-accent transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-accent hover:bg-accent/90 disabled:opacity-60 text-bg font-semibold rounded-xl py-3 text-sm transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent hover:underline font-medium">Create one</Link>
        </p>
      </div>
    </div>
  )
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function inputClass(error) {
  return `w-full bg-bg border ${error ? 'border-red-500/60' : 'border-white/10'} rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-colors`
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

function Divider() {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
      <div className="relative flex justify-center text-xs text-gray-500">
        <span className="px-3 bg-surface">or continue with email</span>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
