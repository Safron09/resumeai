import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import useAuthStore from '../store/authStore'
import AppLayout from '../components/AppLayout'

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-6 space-y-5">
      <h2 className="text-sm font-semibold text-gray-100">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <span className="text-xs text-gray-500 w-36 flex-shrink-0">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  )
}

// ── Account section ───────────────────────────────────────────────────────────

function AccountSection({ user }) {
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState('')
  const [pwError, setPwError] = useState('')

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwLoading(true)
    setPwMsg('')
    setPwError('')
    try {
      await api.post('/api/auth/change-password/', { current_password: currentPw, new_password: newPw })
      setPwMsg('Password updated.')
      setCurrentPw('')
      setNewPw('')
    } catch (err) {
      setPwError(err.response?.data?.detail || 'Failed to update password.')
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <Section title="Account">
      <Field label="Email">
        <input
          type="email"
          value={user?.email ?? ''}
          readOnly
          className="w-full bg-bg border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
        />
      </Field>

      <form onSubmit={handlePasswordChange} className="space-y-3 pt-1">
        <p className="text-xs text-gray-500 font-medium">Change password</p>
        <Field label="Current password">
          <input
            type="password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            placeholder="Current password"
            className="w-full bg-bg border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-colors"
          />
        </Field>
        <Field label="New password">
          <input
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            placeholder="New password (min 8 chars)"
            className="w-full bg-bg border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-colors"
          />
        </Field>
        {pwMsg && <p className="text-xs text-green-400 pl-36">{pwMsg}</p>}
        {pwError && <p className="text-xs text-red-400 pl-36">{pwError}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pwLoading || !currentPw || !newPw}
            className="bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-bg text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            {pwLoading ? 'Saving…' : 'Update password'}
          </button>
        </div>
      </form>
    </Section>
  )
}

// ── Profile section ───────────────────────────────────────────────────────────

function ProfileSection() {
  const navigate = useNavigate()

  return (
    <Section title="Profile">
      <p className="text-xs text-gray-400 leading-relaxed">
        Your LinkedIn profile has been parsed and stored. To update your profile with a new PDF, click below.
      </p>
      <button
        onClick={() => navigate('/onboarding')}
        className="border border-white/10 hover:border-white/20 text-gray-300 text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
      >
        Re-upload LinkedIn PDF
      </button>
    </Section>
  )
}

// ── Billing section ───────────────────────────────────────────────────────────

function BillingSection({ user }) {
  const plan = user?.plan ?? 'free'
  const badgeColor = plan === 'pro' ? 'bg-accent/10 text-accent' : 'bg-white/5 text-gray-400'

  return (
    <Section title="Billing">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-200">Current plan</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${badgeColor}`}>{plan}</span>
          </div>
          {plan === 'free' && (
            <p className="text-xs text-gray-500">5 generations per month · Basic templates</p>
          )}
          {plan === 'pro' && (
            <p className="text-xs text-gray-500">Unlimited generations · All templates · Priority support</p>
          )}
        </div>
        {plan === 'free' ? (
          <Link
            to="/settings/billing"
            className="bg-accent hover:bg-accent/90 text-bg text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Upgrade to Pro
          </Link>
        ) : (
          <span className="text-xs text-gray-600">Manage via Stripe portal</span>
        )}
      </div>
    </Section>
  )
}

// ── Danger zone ───────────────────────────────────────────────────────────────

function DangerZone() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await api.delete('/api/auth/me/')
      logout()
      navigate('/', { replace: true })
    } catch {
      setLoading(false)
      setConfirming(false)
    }
  }

  return (
    <div className="bg-surface border border-red-500/20 rounded-2xl p-6 space-y-4">
      <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
      <p className="text-xs text-gray-400">Permanently delete your account and all associated data. This cannot be undone.</p>
      {confirming ? (
        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            {loading ? 'Deleting…' : 'Yes, delete my account'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="border border-red-500/30 hover:border-red-500/60 text-red-400 text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          Delete account
        </button>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Settings() {
  const { user } = useAuthStore()

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <h1 className="text-lg font-semibold text-gray-100">Settings</h1>
        <AccountSection user={user} />
        <ProfileSection />
        <BillingSection user={user} />
        <DangerZone />
      </div>
    </AppLayout>
  )
}
