import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Contact({ mode = 'contact' }) {
  const isBug = mode === 'bug'

  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // mailto fallback — no backend needed
    const subject = isBug
      ? encodeURIComponent('Bug Report — ProseHire')
      : encodeURIComponent('Contact — ProseHire')
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    )
    window.location.href = `mailto:safron@prosehire.com?subject=${subject}&body=${body}`
    setTimeout(() => {
      setSubmitted(true)
      setLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <Link to="/" className="text-base font-semibold tracking-tight mb-10 block">
          Prose<span className="text-accent">Hire</span>
        </Link>

        <div className="bg-surface border border-white/5 rounded-2xl p-8">
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">✓</div>
              <h2 className="text-xl font-semibold text-gray-100 mb-2">Message sent</h2>
              <p className="text-sm text-gray-400 mb-6">We'll get back to you shortly.</p>
              <Link
                to={isBug ? '/dashboard' : '/'}
                className="text-sm text-accent hover:text-accent/80 transition-colors"
              >
                ← {isBug ? 'Back to Dashboard' : 'Back to Home'}
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-100 mb-1">
                {isBug ? 'Report a Bug' : 'Contact Us'}
              </h1>
              <p className="text-sm text-gray-500 mb-8">
                {isBug
                  ? "Something broken? Tell us what happened and we'll fix it."
                  : "Questions, feedback, or partnership inquiries — we'd love to hear from you."}
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                    className="w-full bg-bg border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-bg border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    {isBug ? 'Describe the bug' : 'Message'}
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder={
                      isBug
                        ? 'What happened? What did you expect? Steps to reproduce...'
                        : 'How can we help?'
                    }
                    className="w-full bg-bg border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-accent/50 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-bg font-semibold text-sm py-2.5 rounded-lg transition-colors"
                >
                  {loading ? 'Sending...' : isBug ? 'Submit Bug Report' : 'Send Message'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
