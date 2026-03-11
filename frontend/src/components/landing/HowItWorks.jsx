const steps = [
  {
    number: '01',
    title: 'Upload your LinkedIn PDF once',
    description:
      'Export your LinkedIn profile as a PDF. We parse it and store your full professional history — experience, skills, education — permanently.',
    detail: 'LinkedIn → Me → Save to PDF',
  },
  {
    number: '02',
    title: 'Paste any job description',
    description:
      'Drop in the JD from any job posting. Pick your template, tone, and humanization level. One click to generate.',
    detail: 'Works with any company, any role',
  },
  {
    number: '03',
    title: 'Download a tailored resume',
    description:
      'Get a resume optimized for that specific job in seconds. ATS-scored, keyword-matched, and human-sounding. PDF or DOCX.',
    detail: 'Ready in under 10 seconds',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-accent text-sm font-medium mb-3 uppercase tracking-widest">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-50 tracking-tight">
            Three steps. One profile. Infinite resumes.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[calc(16.66%+1.5rem)] right-[calc(16.66%+1.5rem)] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {steps.map((step) => (
            <div key={step.number} className="relative bg-surface border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-colors">
              {/* Step number */}
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 mb-6">
                <span className="text-accent text-sm font-semibold">{step.number}</span>
              </div>

              <h3 className="text-lg font-semibold text-gray-100 mb-3 leading-snug">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{step.description}</p>
              <p className="text-xs text-accent/70 font-medium">{step.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
