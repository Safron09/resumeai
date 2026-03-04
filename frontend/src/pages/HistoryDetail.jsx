import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'
import AppLayout from '../components/AppLayout'

function ScoreCard({ label, value, color }) {
  return (
    <div className="bg-bg border border-white/5 rounded-xl p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}

export default function HistoryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/api/generate/${id}/result/`)
      .then(({ data }) => setResult(data))
      .catch((err) => {
        if (err.response?.status === 404 || err.response?.status === 400) {
          setError('Result not found or not ready yet.')
        } else {
          setError('Failed to load result.')
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleDownload = (fmt) => {
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/generate/${id}/download/${fmt}/`
    window.open(url, '_blank')
  }

  const handleRegenerate = () => {
    // Pre-fill dashboard with this job's description
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center text-gray-500 text-sm gap-3">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading…
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-6 py-10 text-center space-y-4">
          <p className="text-gray-400 text-sm">{error}</p>
          <Link to="/history" className="text-accent hover:underline text-sm">← Back to history</Link>
        </div>
      </AppLayout>
    )
  }

  const content = result?.content ?? {}

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {/* Back link */}
        <Link to="/history" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-accent transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to History
        </Link>

        {/* Meta */}
        <div className="bg-surface border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">
                {result.template} · {result.tone} · Humanization {result.humanization_level}/5
                {result.imperfection_mode && ' · Imperfection on'}
              </p>
              <p className="text-xs text-gray-600">
                Generated {new Date(result.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload('pdf')}
                className="flex items-center gap-1.5 bg-accent hover:bg-accent/90 text-bg text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                PDF
              </button>
              <button
                onClick={() => handleDownload('docx')}
                className="flex items-center gap-1.5 border border-white/10 hover:border-white/20 text-gray-300 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                DOCX
              </button>
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-1.5 border border-white/10 hover:border-white/20 text-gray-300 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-3 gap-3">
          <ScoreCard label="ATS Score" value={result.ats_score} color="text-green-400" />
          <ScoreCard label="Human Score" value={result.human_score} color="text-accent" />
          <ScoreCard label="Keyword Match" value={`${result.keyword_match}%`} color="text-blue-400" />
        </div>

        {/* Resume content preview */}
        <div className="bg-surface border border-white/5 rounded-2xl p-6 space-y-5 text-sm text-gray-300">
          {content.name && (
            <h2 className="text-xl font-bold text-gray-100">{content.name}</h2>
          )}

          {content.summary && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Summary</h3>
              <p className="leading-relaxed">{content.summary}</p>
            </div>
          )}

          {content.experience?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Experience</h3>
              <div className="space-y-4">
                {content.experience.map((job, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline gap-2">
                      <p className="font-semibold text-gray-200">{job.title} {job.company && <span className="font-normal text-gray-500">— {job.company}</span>}</p>
                      <span className="text-xs text-gray-600 whitespace-nowrap">{job.dates}</span>
                    </div>
                    {job.bullets?.length > 0 && (
                      <ul className="mt-1.5 space-y-1 list-disc list-inside text-gray-400">
                        {job.bullets.map((b, j) => <li key={j}>{b}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {content.education?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Education</h3>
              {(Array.isArray(content.education) ? content.education : [content.education]).map((edu, i) => (
                <p key={i} className="text-gray-400">
                  {typeof edu === 'object'
                    ? `${edu.degree || ''} — ${edu.school || ''} (${edu.dates || ''})`
                    : edu}
                </p>
              ))}
            </div>
          )}

          {content.skills?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Skills</h3>
              <p className="text-gray-400">{Array.isArray(content.skills) ? content.skills.join(', ') : content.skills}</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
