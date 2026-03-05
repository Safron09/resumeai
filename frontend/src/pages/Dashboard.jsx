import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import useAuthStore from '../store/authStore'
import AppLayout from '../components/AppLayout'

// ── Generation counter ────────────────────────────────────────────────────────

function GenerationCounter({ used, max = 5 }) {
  const color =
    used <= 2 ? 'text-green-400' :
    used <= 4 ? 'text-yellow-400' :
    'text-red-400'

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-6 rounded-full transition-colors ${
              i < used ? (used <= 2 ? 'bg-green-400' : used <= 4 ? 'bg-yellow-400' : 'bg-red-400') : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <span className={`text-xs font-medium ${color}`}>{used}/{max} used</span>
      {used >= max && (
        <Link to="/pricing" className="text-xs text-accent hover:underline ml-1">
          Upgrade →
        </Link>
      )}
    </div>
  )
}

// ── Pill selector ─────────────────────────────────────────────────────────────

function PillSelector({ options, value, onChange }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            value === opt
              ? 'bg-accent/20 text-accent border border-accent/30'
              : 'bg-white/5 text-gray-400 border border-white/5 hover:border-white/10 hover:text-gray-300'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label, tooltip }) {
  return (
    <div className="flex items-center gap-3 group relative">
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-accent' : 'bg-white/10'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
      <span className="text-sm text-gray-300">{label}</span>
      {tooltip && (
        <div className="relative">
          <svg className="w-3.5 h-3.5 text-gray-600 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-52 bg-surface border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-400 leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-xl">
            {tooltip}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Score badge ───────────────────────────────────────────────────────────────

function ScoreBadge({ label, value, color }) {
  return (
    <div className="bg-bg border border-white/5 rounded-xl p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}

// ── Result card ───────────────────────────────────────────────────────────────

function ResultCard({ result, jobId }) {
  const [downloading, setDownloading] = useState({})

  const handleDownload = async (fmt) => {
    setDownloading((d) => ({ ...d, [fmt]: true }))
    try {
      const resp = await api.get(`/api/generate/${jobId}/download/${fmt}/`, { responseType: 'blob' })
      const blob = new Blob([resp.data])
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resume.${fmt}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // silently ignore — user can retry
    } finally {
      setDownloading((d) => ({ ...d, [fmt]: false }))
    }
  }

  return (
    <div className="bg-surface border border-accent/20 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-100">Your resume is ready</h3>
        <span className="text-xs text-accent bg-accent/10 px-2.5 py-1 rounded-full font-medium">Done</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <ScoreBadge label="ATS Score" value={result.ats_score} color="text-green-400" />
        <ScoreBadge label="Human Score" value={result.human_score} color="text-accent" />
        <ScoreBadge label="Keyword Match" value={`${result.keyword_match}%`} color="text-blue-400" />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => handleDownload('pdf')}
          disabled={downloading.pdf}
          className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 disabled:opacity-60 text-bg font-semibold text-sm py-2.5 rounded-xl transition-colors"
        >
          {downloading.pdf ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          )}
          {downloading.pdf ? 'Preparing…' : 'Download PDF'}
        </button>
        <button
          onClick={() => handleDownload('docx')}
          disabled={downloading.docx}
          className="flex-1 flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 disabled:opacity-60 text-gray-300 font-semibold text-sm py-2.5 rounded-xl transition-colors"
        >
          {downloading.docx ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          )}
          {downloading.docx ? 'Preparing…' : 'Download DOCX'}
        </button>
      </div>

      <Link to="/history" className="block text-center text-xs text-gray-500 hover:text-accent transition-colors">
        View in History →
      </Link>
    </div>
  )
}

// ── Dashboard page ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, setHasProfile, incrementGenerationsUsed } = useAuthStore()

  const [profileLoading, setProfileLoading] = useState(true)
  const [jd, setJd] = useState('')
  const [urlMode, setUrlMode] = useState(false)
  const [template, setTemplate] = useState('Classic')
  const [tone, setTone] = useState('Balanced')
  const [humanization, setHumanization] = useState(3)
  const [imperfection, setImperfection] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genStatus, setGenStatus] = useState('')   // 'polling' | 'done' | 'failed'
  const [result, setResult] = useState(null)        // ResumeResult object
  const [currentJobId, setCurrentJobId] = useState(null)
  const [error, setError] = useState('')

  const pollRef = useRef(null)

  const plan = user?.plan ?? 'free'
  const used = user?.generations_used ?? 0
  const atLimit = plan === 'free' && used >= 5

  // Check profile on load
  useEffect(() => {
    api.get('/api/profile/')
      .then(() => { setHasProfile(true); setProfileLoading(false) })
      .catch((err) => {
        if (err.response?.status === 404) {
          navigate('/onboarding', { replace: true })
        } else {
          setProfileLoading(false)
        }
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Clean up polling on unmount
  useEffect(() => () => clearInterval(pollRef.current), [])

  const startPolling = (jobId) => {
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await api.get(`/api/generate/${jobId}/status/`)
        if (data.status === 'done') {
          clearInterval(pollRef.current)
          const { data: resultData } = await api.get(`/api/generate/${jobId}/result/`)
          setResult(resultData)
          setGenStatus('done')
          setGenerating(false)
          incrementGenerationsUsed()
        } else if (data.status === 'failed') {
          clearInterval(pollRef.current)
          setGenStatus('failed')
          setError('Generation failed. Please try again.')
          setGenerating(false)
        }
      } catch {
        clearInterval(pollRef.current)
        setGenStatus('failed')
        setError('Connection error. Please try again.')
        setGenerating(false)
      }
    }, 2000)
  }

  const handleGenerate = async () => {
    if (!jd.trim() || atLimit || generating) return
    setGenerating(true)
    setResult(null)
    setError('')
    setGenStatus('polling')

    try {
      const { data } = await api.post('/api/generate/', {
        job_description: jd,
        template,
        tone,
        humanization_level: humanization,
        imperfection_mode: imperfection,
      })
      setCurrentJobId(data.job_id)
      startPolling(data.job_id)
    } catch (err) {
      if (err.response?.status === 403) {
        navigate('/pricing')
      } else {
        const msg =
          err.response?.data?.detail ||
          err.response?.data?.non_field_errors?.[0] ||
          (err.response ? `Server error ${err.response.status}` : 'Network error — is the backend running?')
        setError(msg)
      }
      setGenerating(false)
      setGenStatus('')
    }
  }

  const generateDisabled = !jd.trim() || atLimit || generating

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500 text-sm">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading…
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {plan === 'free' && (
          <div className="flex items-center justify-between bg-surface border border-white/5 rounded-xl px-5 py-3">
            <span className="text-xs text-gray-500">Free plan</span>
            <GenerationCounter used={used} />
          </div>
        )}

        {/* Job description input */}
        <div className="bg-surface border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-200">Job Description</label>
            <button
              onClick={() => { setUrlMode(!urlMode); setJd('') }}
              className="text-xs text-gray-500 hover:text-accent transition-colors"
            >
              {urlMode ? 'Paste text instead' : 'Paste a URL instead'}
            </button>
          </div>

          {urlMode ? (
            <input
              type="url"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="https://jobs.example.com/senior-pm-123"
              className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-colors"
            />
          ) : (
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the job description here..."
              rows={7}
              className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-colors resize-none"
            />
          )}
        </div>

        {/* Options */}
        <div className="bg-surface border border-white/5 rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-medium text-gray-200">Options</h2>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs text-gray-500 w-28 flex-shrink-0">Template</span>
              <PillSelector options={['Classic', 'Modern', 'Minimal']} value={template} onChange={setTemplate} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs text-gray-500 w-28 flex-shrink-0">Tone</span>
              <PillSelector options={['Formal', 'Balanced', 'Casual']} value={tone} onChange={setTone} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <span className="text-xs text-gray-500 w-28 flex-shrink-0 pt-1">Humanization</span>
              <div className="flex-1 space-y-2">
                <input
                  type="range" min={1} max={5} value={humanization}
                  onChange={(e) => setHumanization(Number(e.target.value))}
                  className="w-full accent-[#6EE7B7] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-600">
                  <span>Pure ATS</span>
                  <span className="text-accent font-medium">Level {humanization}</span>
                  <span>Natural Human</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs text-gray-500 w-28 flex-shrink-0">Imperfection</span>
              <Toggle
                checked={imperfection}
                onChange={setImperfection}
                label="Imperfection mode"
                tooltip="Adds subtle human imperfections to bypass AI detection tools — without reducing quality."
              />
            </div>
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={generateDisabled}
          className="w-full flex items-center justify-center gap-3 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-bg font-semibold py-4 rounded-xl text-sm transition-colors"
        >
          {generating ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {genStatus === 'polling' ? 'Generating your resume…' : 'Generating…'}
            </>
          ) : atLimit ? (
            'Limit reached — upgrade to generate'
          ) : (
            <>
              Generate Resume
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </>
          )}
        </button>

        {atLimit && (
          <p className="text-center text-xs text-gray-500 -mt-2">
            <Link to="/pricing" className="text-accent hover:underline">Upgrade to Pro</Link> for unlimited generations
          </p>
        )}

        {error && (
          <p className="text-center text-xs text-red-400">{error}</p>
        )}

        {/* Result card */}
        {result && genStatus === 'done' && (
          <ResultCard result={result} jobId={currentJobId} />
        )}
      </div>
    </AppLayout>
  )
}
