import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../lib/api'
import useAuthStore from '../store/authStore'
import AppLayout from '../components/AppLayout'

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['5 resumes / month', '3 templates', 'PDF & DOCX export', 'ATS scoring'],
    cta: null,
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '$12',
    period: 'per month',
    features: ['Unlimited resumes', 'All templates', 'PDF & DOCX export', 'ATS + Human scoring', 'Imperfection mode', 'Priority support'],
    cta: 'Upgrade to Pro',
    highlight: true,
  },
]

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function SuccessToast({ onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-surface border border-accent/30 rounded-2xl px-5 py-4 shadow-2xl">
      <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
        <CheckIcon />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-100">You're now on Pro!</p>
        <p className="text-xs text-gray-500">Unlimited generations unlocked.</p>
      </div>
      <button onClick={onClose} className="ml-2 text-gray-600 hover:text-gray-400 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Billing() {
  const { user, setUser } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(false)

  const plan = user?.plan ?? 'free'

  // Show success toast when redirected back from Stripe
  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      setToast(true)
      setSearchParams({}, { replace: true })
      // Refresh user data to get updated plan
      api.get('/api/auth/me/').then(({ data }) => setUser(data)).catch(() => {})
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpgrade = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/api/auth/billing/checkout/')
      window.location.href = data.url
    } catch (err) {
      if (err.response?.status === 503) {
        setError('Stripe is not configured on this server yet. Add STRIPE_SECRET_KEY to .env to enable billing.')
      } else {
        setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
      }
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

        <div className="space-y-1">
          <Link to="/settings" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-accent transition-colors mb-2">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Settings
          </Link>
          <h1 className="text-lg font-semibold text-gray-100">Choose your plan</h1>
          <p className="text-sm text-gray-500">Upgrade anytime. Cancel anytime.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {PLANS.map((p) => {
            const isCurrent = plan === p.key
            return (
              <div
                key={p.key}
                className={`relative bg-surface rounded-2xl p-6 space-y-5 border transition-colors ${
                  p.highlight ? 'border-accent/30' : 'border-white/5'
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-6">
                    <span className="bg-accent text-bg text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Most Popular
                    </span>
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold text-gray-200">{p.name}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold text-gray-100">{p.price}</span>
                    <span className="text-xs text-gray-500">{p.period}</span>
                  </div>
                </div>

                <ul className="space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-400">
                      <CheckIcon />
                      {f}
                    </li>
                  ))}
                </ul>

                {p.cta ? (
                  isCurrent ? (
                    <div className="w-full text-center text-xs text-accent font-semibold py-2.5">
                      Current plan
                    </div>
                  ) : (
                    <button
                      onClick={handleUpgrade}
                      disabled={loading}
                      className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-bg font-semibold text-sm py-2.5 rounded-xl transition-colors"
                    >
                      {loading ? 'Redirecting…' : p.cta}
                    </button>
                  )
                ) : (
                  <div className={`w-full text-center text-xs py-2.5 font-semibold ${isCurrent ? 'text-accent' : 'text-gray-600'}`}>
                    {isCurrent ? 'Current plan' : 'Free forever'}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <p className="text-xs text-gray-600 text-center">
          Payments processed securely by Stripe. Cancel anytime from your Stripe billing portal.
        </p>
      </div>

      {toast && <SuccessToast onClose={() => setToast(false)} />}
    </AppLayout>
  )
}
