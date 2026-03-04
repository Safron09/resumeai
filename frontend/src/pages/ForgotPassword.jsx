import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Forgot password:', email)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="text-2xl font-semibold tracking-tight">
            Resume<span className="text-accent">AI</span>
          </span>
          <p className="text-gray-400 mt-2 text-sm">Reset your password</p>
        </div>

        <div className="bg-surface rounded-2xl p-8 shadow-xl border border-white/5">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-100 mb-2">Check your email</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                We sent a reset link to{' '}
                <span className="text-gray-200 font-medium">{email}</span>.
                It expires in 30 minutes.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 text-sm text-gray-500 hover:text-accent transition-colors"
              >
                Try a different email
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Enter the email associated with your account and we'll send you a password reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90 text-bg font-semibold rounded-xl py-3 text-sm transition-colors"
                >
                  Send reset link
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-accent hover:underline font-medium">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
