import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent text-xs font-medium px-4 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
          ATS-optimized · AI-humanized · Tailored to every job
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[1.08] text-gray-50 mb-6">
          Gets past the robots.
          <br />
          <span className="text-accent">Impresses the humans.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Upload your LinkedIn profile once. Paste any job description.
          Get a tailored, ATS-optimized, humanized resume in seconds — every time.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-bg font-semibold text-base px-8 py-3.5 rounded-xl transition-colors"
          >
            Get Started Free
          </Link>
          <Link
            to="/pricing"
            className="w-full sm:w-auto border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-medium text-base px-8 py-3.5 rounded-xl transition-colors"
          >
            See Pricing →
          </Link>
        </div>

        <p className="text-gray-600 text-sm mt-5">Free plan · No credit card required · 5 resumes to start</p>

        {/* Mock terminal / product preview */}
        <div className="mt-16 max-w-3xl mx-auto bg-surface border border-white/5 rounded-2xl overflow-hidden shadow-2xl text-left">
          {/* Window bar */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-white/[0.02]">
            <span className="w-3 h-3 rounded-full bg-red-500/60" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <span className="w-3 h-3 rounded-full bg-green-500/60" />
            <span className="ml-3 text-xs text-gray-600">ProseHire — dashboard</span>
          </div>
          {/* Fake UI */}
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <span className="text-accent text-lg">✓</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Profile loaded</p>
                <p className="text-sm text-gray-200 font-medium">Jane Doe · Senior Product Manager · 8 years exp.</p>
              </div>
            </div>
            <div className="bg-bg border border-white/5 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2">Job description</p>
              <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
                We're looking for a Senior PM to lead our platform team. You'll own the roadmap for our core API products, working closely with engineering and design...
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: '92%' }} />
              </div>
              <span className="text-xs text-accent font-medium whitespace-nowrap">ATS 92 · Human 88</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-accent/10 border border-accent/20 text-accent text-xs font-medium text-center py-2 rounded-lg">
                Download PDF
              </div>
              <div className="flex-1 bg-white/5 border border-white/10 text-gray-400 text-xs font-medium text-center py-2 rounded-lg">
                Download DOCX
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
