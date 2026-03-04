const features = [
  {
    icon: '🗂',
    title: 'Stored Profile',
    description:
      'Upload your LinkedIn PDF once. Your full professional history is stored and reused for every generation — no re-entering data.',
  },
  {
    icon: '🎚',
    title: 'Humanization Slider',
    description:
      'A 1–5 scale from pure corporate ATS language to natural, conversational prose. Choose how human-sounding your resume should be.',
  },
  {
    icon: '🕵️',
    title: 'Imperfection Mode',
    description:
      'Subtle strategic imperfections that make your resume appear hand-written. Bypasses AI detection while keeping quality high.',
  },
  {
    icon: '🎯',
    title: 'ATS Scoring',
    description:
      'Every resume is scored for ATS compatibility and keyword match against the job description before you download it.',
  },
  {
    icon: '📄',
    title: 'PDF + DOCX Export',
    description:
      'Download your resume as a clean, ATS-readable PDF or a formatted DOCX. Both are ready to submit immediately.',
  },
  {
    icon: '📋',
    title: 'Resume History',
    description:
      'Every resume you generate is saved. Revisit, re-download, or use a past job description as a starting point.',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-accent text-sm font-medium mb-3 uppercase tracking-widest">Features</p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-50 tracking-tight">
            Everything you need. Nothing you don't.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-surface border border-white/5 rounded-2xl p-6 hover:border-accent/20 hover:bg-accent/[0.02] transition-all group"
            >
              <div className="text-2xl mb-4">{f.icon}</div>
              <h3 className="text-base font-semibold text-gray-100 mb-2 group-hover:text-accent transition-colors">
                {f.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
