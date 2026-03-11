const levels = [
  {
    value: 1,
    label: 'Pure ATS',
    color: 'text-blue-400',
    bar: 'bg-blue-400',
    example: 'Achieved 23% YoY revenue growth by implementing cross-functional alignment initiatives across GTM and product organizations.',
  },
  {
    value: 2,
    label: 'Professional',
    color: 'text-cyan-400',
    bar: 'bg-cyan-400',
    example: 'Grew revenue by 23% year-over-year by aligning product, sales, and marketing around a unified go-to-market strategy.',
  },
  {
    value: 3,
    label: 'Balanced',
    color: 'text-accent',
    bar: 'bg-accent',
    example: 'Led a cross-functional effort that grew revenue 23% — by getting product, sales, and marketing actually working together.',
  },
  {
    value: 4,
    label: 'Conversational',
    color: 'text-emerald-400',
    bar: 'bg-emerald-400',
    example: 'Built the bridge between product and go-to-market teams. The result: 23% revenue growth in one year.',
  },
  {
    value: 5,
    label: 'Natural Human',
    color: 'text-green-400',
    bar: 'bg-green-400',
    example: 'One of my proudest wins — rallied product, sales, and marketing around a shared strategy and we hit 23% revenue growth.',
  },
]

export default function HumanizationExplainer() {
  return (
    <section className="py-24 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-accent text-sm font-medium mb-3 uppercase tracking-widest">Humanization Slider</p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-gray-50 tracking-tight mb-4">
            Sound as human as you want
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base leading-relaxed">
            Most AI resumes read like AI resumes. Our 1–5 humanization scale rewrites your bullets
            to match your voice — from ATS-safe corporate to genuinely natural prose.
          </p>
        </div>

        <div className="bg-surface border border-white/5 rounded-2xl p-8 space-y-6">
          {/* Scale bar */}
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <span className="text-xs text-gray-500 w-20">Pure ATS</span>
            <div className="flex-1 flex gap-1">
              {levels.map((l) => (
                <div key={l.value} className={`flex-1 h-2 rounded-full ${l.bar} opacity-80`} />
              ))}
            </div>
            <span className="text-xs text-gray-500 w-24 text-right">Natural Human</span>
          </div>

          {/* Level cards */}
          <div className="space-y-4">
            {levels.map((l) => (
              <div key={l.value} className="flex gap-5 items-start group">
                <div className="flex flex-col items-center gap-1 pt-1 flex-shrink-0 w-16">
                  <span className={`text-2xl font-bold ${l.color}`}>{l.value}</span>
                  <span className={`text-[10px] font-medium ${l.color} opacity-80 text-center leading-tight`}>{l.label}</span>
                </div>
                <div className="flex-1 bg-bg border border-white/5 rounded-xl px-5 py-4">
                  <p className="text-sm text-gray-300 leading-relaxed italic">"{l.example}"</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-600 text-center pt-2">
            Level 5 adds natural sentence variation and first-person voice.
            It passes AI detection tools while reading like a real person wrote it.
          </p>
        </div>
      </div>
    </section>
  )
}
