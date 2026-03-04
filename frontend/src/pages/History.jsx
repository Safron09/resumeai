import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import AppLayout from '../components/AppLayout'

function StatusBadge({ status }) {
  const styles = {
    done: 'bg-green-500/10 text-green-400',
    processing: 'bg-yellow-500/10 text-yellow-400',
    pending: 'bg-white/5 text-gray-500',
    failed: 'bg-red-500/10 text-red-400',
  }
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${styles[status] ?? styles.pending}`}>
      {status}
    </span>
  )
}

function ScoreChip({ label, value }) {
  if (value == null) return null
  return (
    <span className="text-xs text-gray-500">
      {label}: <span className="text-gray-300 font-medium">{value}</span>
    </span>
  )
}

export default function History() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/generate/history/')
      .then(({ data }) => setJobs(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-lg font-semibold text-gray-100 mb-6">Generation History</h1>

        {loading ? (
          <div className="flex items-center gap-3 text-gray-500 text-sm">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading…
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-surface border border-white/5 rounded-2xl p-12 text-center space-y-3">
            <p className="text-gray-400 text-sm">No resumes generated yet.</p>
            <Link
              to="/dashboard"
              className="inline-block text-sm text-accent hover:underline"
            >
              Generate your first resume →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <Link
                key={job.id}
                to={`/history/${job.id}`}
                className="block bg-surface border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusBadge status={job.status} />
                      <span className="text-xs text-gray-600">{job.template} · {job.tone}</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <ScoreChip label="ATS" value={job.ats_score} />
                      <ScoreChip label="Human" value={job.human_score} />
                      <ScoreChip label="Keywords" value={job.keyword_match != null ? `${job.keyword_match}%` : null} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-gray-600">
                      {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <svg className="w-4 h-4 text-gray-600 group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
