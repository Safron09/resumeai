import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/landing/Navbar'
import Footer from '../components/landing/Footer'
import useAuthStore from '../store/authStore'

// ── CTA logic ────────────────────────────────────────────────────────────────

function usePlanCTA() {
  const { isLoggedIn, user } = useAuthStore()
  const plan = user?.plan ?? null

  return {
    free: isLoggedIn && plan === 'free'
      ? { label: 'Current Plan', current: true }
      : { label: 'Get Started Free', to: '/register' },

    pro: !isLoggedIn
      ? { label: 'Get Started Free', to: '/register' }
      : plan === 'free'
        ? { label: 'Upgrade to Pro', to: '/settings/billing' }
        : plan === 'pro'
          ? { label: 'Current Plan', current: true }
          : { label: 'Contact Us', to: '/contact' },

    teams: plan === 'teams'
      ? { label: 'Current Plan', current: true }
      : { label: 'Contact Us', to: '/contact' },
  }
}

// ── Data ──────────────────────────────────────────────────────────────────────

const FEATURES = [
  { label: 'Resume generations',    free: '5',           pro: 'Unlimited',    teams: 'Unlimited' },
  { label: 'Stored profiles',       free: '1',           pro: '1',            teams: 'Multiple' },
  { label: 'Export formats',        free: 'PDF',         pro: 'PDF + DOCX',   teams: 'PDF + DOCX' },
  { label: 'Templates',             free: 'Basic',       pro: 'All',          teams: 'All' },
  { label: 'Humanization slider',   free: false,         pro: true,           teams: true },
  { label: 'Imperfection mode',     free: false,         pro: true,           teams: true },
  { label: 'ATS scoring',           free: false,         pro: true,           teams: true },
  { label: 'Keyword match score',   free: false,         pro: true,           teams: true },
  { label: 'Resume history',        free: false,         pro: true,           teams: true },
  { label: 'Watermark on exports',  free: true,          pro: false,          teams: false },
  { label: 'Career coach tools',    free: false,         pro: false,          teams: true },
  { label: 'Bulk generation',       free: false,         pro: false,          teams: true },
  { label: 'White-label exports',   free: false,         pro: false,          teams: true },
  { label: 'Support',               free: 'Community',   pro: 'Email',        teams: 'Priority' },
]

const FAQS = [
  {
    q: 'Does it actually work with ATS systems?',
    a: "Yes. Every resume is optimized through a dedicated ATS pass that enforces standard section headers, cleans formatting ATS can't parse, and aligns keyword density to the job description. The ATS score tells you exactly how compatible it is before you download.",
  },
  {
    q: 'Is my data private?',
    a: "Your LinkedIn PDF and resume data are stored securely and never shared or used to train AI models. We use Cloudinary for file storage and Neon PostgreSQL for profile data — both encrypted at rest and in transit.",
  },
  {
    q: 'Can I cancel anytime?',
    a: "Yes. Cancel from your billing settings at any time. You keep Pro access until the end of the billing period. No questions asked.",
  },
  {
    q: "What is imperfection mode?",
    a: "AI-written text has patterns detectors can spot. Imperfection mode adds subtle, strategic variations — a slightly different date format, one softened bullet, a touch of informal phrasing — that make your resume read as genuinely hand-crafted. Quality stays high; AI-perfection disappears.",
  },
  {
    q: 'Do I need to re-enter my information for every resume?',
    a: "Never. You upload your LinkedIn PDF once during onboarding. Every resume you generate after that pulls from your stored profile automatically.",
  },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function CTAButton({ cta, highlight }) {
  if (!cta) return null
  if (cta.current) {
    return (
      <div className="w-full text-center py-3 rounded-xl text-sm font-medium border border-white/10 text-gray-500 cursor-default">
        Current Plan
      </div>
    )
  }
  return (
    <Link
      to={cta.to}
      className={`block w-full text-center py-3 rounded-xl text-sm font-semibold transition-colors ${
        highlight
          ? 'bg-accent hover:bg-accent/90 text-bg'
          : 'border border-white/10 hover:border-white/20 text-gray-300 hover:text-white'
      }`}
    >
      {cta.label}
    </Link>
  )
}

function FeatureValue({ value }) {
  if (value === true)  return <span className="text-accent text-base">✓</span>
  if (value === false) return <span className="text-white/15 text-base">—</span>
  return <span className="text-gray-300 text-sm">{value}</span>
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="text-sm font-medium text-gray-200">{q}</span>
        <span className={`text-gray-500 text-lg flex-shrink-0 transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <p className="text-sm text-gray-400 leading-relaxed pb-5">{a}</p>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Pricing() {
  const [proLifetime, setProLifetime] = useState(false)
  const cta = usePlanCTA()

  return (
    <div className="min-h-screen bg-bg text-gray-100">
      <Navbar />

      <main className="pt-24">
        {/* Header */}
        <section className="text-center px-6 py-16">
          <p className="text-accent text-sm font-medium uppercase tracking-widest mb-3">Pricing</p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-50 mb-4">
            Start free. Upgrade when ready.
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            No credit card required for the free plan. Cancel Pro anytime.
          </p>
        </section>

        {/* Plan cards */}
        <section className="px-6 pb-20">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-5">

            {/* Free */}
            <div className="bg-surface border border-white/5 rounded-2xl p-8 flex flex-col">
              <div className="mb-8">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Free</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold text-gray-50">$0</span>
                  <span className="text-gray-500 text-sm">/ forever</span>
                </div>
                <p className="text-gray-400 text-sm">Try it out, no credit card needed.</p>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {['5 resume generations', 'PDF export', '1 stored profile', 'Basic templates', 'Watermark on exports'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <span className="text-accent flex-shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>
              <CTAButton cta={cta.free} highlight={false} />
            </div>

            {/* Pro */}
            <div className="relative bg-accent/5 border border-accent/30 rounded-2xl p-8 flex flex-col">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-accent text-bg text-xs font-semibold px-4 py-1 rounded-full whitespace-nowrap">
                  Most popular
                </span>
              </div>

              <div className="mb-6">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Pro</p>

                {/* Monthly / Lifetime toggle */}
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => setProLifetime(false)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      !proLifetime ? 'bg-accent/20 text-accent' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setProLifetime(true)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                      proLifetime ? 'bg-accent/20 text-accent' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Lifetime
                    <span className="bg-accent/20 text-accent text-[10px] px-1.5 py-0.5 rounded font-semibold">
                      Save 45%
                    </span>
                  </button>
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold text-gray-50">
                    {proLifetime ? '$79' : '$12'}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {proLifetime ? ' one-time' : ' / month'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  {proLifetime ? 'Pay once, use forever.' : 'Billed monthly, cancel anytime.'}
                </p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {[
                  'Unlimited generations',
                  'PDF + DOCX export',
                  'All templates',
                  'Humanization slider (1–5)',
                  'Imperfection mode',
                  'ATS score + keyword match',
                  'Full resume history',
                  'No watermark',
                  'Email support',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <span className="text-accent flex-shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>
              <CTAButton cta={cta.pro} highlight={true} />
            </div>

            {/* Teams */}
            <div className="bg-surface border border-white/5 rounded-2xl p-8 flex flex-col">
              <div className="mb-8">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Teams</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-bold text-gray-50">$29</span>
                  <span className="text-gray-500 text-sm">/ seat / month</span>
                </div>
                <p className="text-gray-400 text-sm">For recruiters and career coaches.</p>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {[
                  'Everything in Pro',
                  'Multiple stored profiles',
                  'Bulk generation',
                  'Career coach tools',
                  'White-label exports',
                  'Priority support',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <span className="text-accent flex-shrink-0">✓</span>{f}
                  </li>
                ))}
              </ul>
              <CTAButton cta={cta.teams} highlight={false} />
            </div>

          </div>
        </section>

        {/* Comparison table */}
        <section className="px-6 pb-24 border-t border-white/5 pt-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-50 text-center mb-10 tracking-tight">
              Full feature comparison
            </h2>

            <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-4 border-b border-white/5">
                <div className="p-5" />
                {['Free', 'Pro', 'Teams'].map((col, i) => (
                  <div key={col} className={`p-5 text-center ${i === 1 ? 'bg-accent/5' : ''}`}>
                    <p className={`text-sm font-semibold ${i === 1 ? 'text-accent' : 'text-gray-300'}`}>{col}</p>
                  </div>
                ))}
              </div>

              {/* Rows */}
              {FEATURES.map((row, idx) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-4 border-b border-white/5 last:border-0 ${
                    idx % 2 === 0 ? '' : 'bg-white/[0.01]'
                  }`}
                >
                  <div className="p-4 pl-5">
                    <span className="text-sm text-gray-400">{row.label}</span>
                  </div>
                  {[row.free, row.pro, row.teams].map((val, i) => (
                    <div key={i} className={`p-4 flex items-center justify-center ${i === 1 ? 'bg-accent/[0.03]' : ''}`}>
                      <FeatureValue value={val} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 pb-24 border-t border-white/5 pt-16">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-50 text-center mb-10 tracking-tight">
              Frequently asked questions
            </h2>
            <div className="bg-surface border border-white/5 rounded-2xl px-6">
              {FAQS.map((faq) => (
                <FAQItem key={faq.q} {...faq} />
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-8">
              Still have questions?{' '}
              <Link to="/contact" className="text-accent hover:underline">Contact us</Link>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
