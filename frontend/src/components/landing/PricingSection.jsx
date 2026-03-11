import { Link } from 'react-router-dom'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Try it out, no credit card needed.',
    features: ['5 resume generations', 'PDF export', '1 stored profile', 'Watermark on exports'],
    cta: 'Get Started Free',
    ctaTo: '/register',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/month',
    description: 'For serious job seekers.',
    features: [
      'Unlimited generations',
      'PDF + DOCX export',
      'All templates',
      'Humanization slider (1–5)',
      'ATS score + keyword match',
      'Full resume history',
      'No watermark',
    ],
    cta: 'Upgrade to Pro',
    ctaTo: '/register',
    highlight: true,
  },
  {
    name: 'Teams',
    price: '$29',
    period: '/seat/month',
    description: 'For recruiters and career coaches.',
    features: [
      'Everything in Pro',
      'Multiple profiles',
      'Bulk generation',
      'Career coach tools',
      'White-label exports',
      'Priority support',
    ],
    cta: 'Contact Us',
    ctaTo: '/contact',
    highlight: false,
  },
]

export default function PricingSection() {
  return (
    <section className="py-24 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-accent text-sm font-medium mb-3 uppercase tracking-widest">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-50 tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-400">
            Start free.{' '}
            <Link to="/pricing" className="text-accent hover:underline">
              See full plan comparison →
            </Link>
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 border flex flex-col ${
                plan.highlight
                  ? 'bg-accent/5 border-accent/30'
                  : 'bg-surface border-white/5'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-bg text-xs font-semibold px-4 py-1 rounded-full">
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-gray-50">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <span className="text-accent mt-0.5 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to={plan.ctaTo}
                className={`block text-center font-semibold text-sm py-3 rounded-xl transition-colors ${
                  plan.highlight
                    ? 'bg-accent hover:bg-accent/90 text-bg'
                    : 'border border-white/10 hover:border-white/20 text-gray-300 hover:text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
