import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import useAuthStore from '../store/authStore'

// ── Dropzone ──────────────────────────────────────────────────────────────────

function Dropzone({ label, hint, file, onFile, required = false }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const accept = (f) => {
    if (!f) return
    if (f.type !== 'application/pdf') return
    onFile(f)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    accept(e.dataTransfer.files[0])
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <p className="text-sm font-medium text-gray-200">{label}</p>
        {required
          ? <span className="text-[10px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">Required</span>
          : <span className="text-[10px] font-medium text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">Optional</span>
        }
      </div>

      {file ? (
        /* Success state */
        <div className="flex items-center gap-4 bg-accent/5 border border-accent/25 rounded-xl px-5 py-4">
          <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-100 font-medium truncate">{file.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024).toFixed(0)} KB · PDF</p>
          </div>
          <button
            onClick={() => onFile(null)}
            className="text-gray-600 hover:text-gray-400 transition-colors text-lg leading-none flex-shrink-0"
          >
            ×
          </button>
        </div>
      ) : (
        /* Drop zone */
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`relative border-2 border-dashed rounded-xl px-6 py-10 text-center cursor-pointer transition-all ${
            dragging
              ? 'border-accent/60 bg-accent/5'
              : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => accept(e.target.files[0])}
          />
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <p className="text-sm text-gray-300 font-medium mb-1">
            {dragging ? 'Drop it here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs text-gray-600">PDF only</p>
          {hint && <p className="text-xs text-gray-600 mt-2 italic">{hint}</p>}
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Onboarding() {
  const navigate = useNavigate()
  const { setHasProfile } = useAuthStore()

  const [inputMode, setInputMode] = useState('pdf') // 'pdf' | 'text'
  const [linkedinFile, setLinkedinFile] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)
  const [plainText, setPlainText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = inputMode === 'pdf' ? !!linkedinFile : plainText.trim().length >= 50

  const handleSubmit = async () => {
    if (!canSubmit || loading) return
    setLoading(true)
    setError('')
    try {
      const form = new FormData()
      if (inputMode === 'pdf') {
        form.append('linkedin_pdf', linkedinFile)
        if (resumeFile) form.append('resume_pdf', resumeFile)
      } else {
        form.append('plain_text', plainText.trim())
      }
      await api.post('/api/profile/upload/', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setHasProfile(true)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.detail || 'Upload failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <div className="mb-10 text-center">
        <span className="text-2xl font-semibold tracking-tight">
          Resume<span className="text-accent">AI</span>
        </span>
        <p className="text-gray-400 mt-2 text-sm">Let's build your profile — just once</p>
      </div>

      <div className="w-full max-w-lg">
        {/* Progress indicator */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-1 bg-accent rounded-full" />
          <div className={`flex-1 h-1 rounded-full transition-colors ${canSubmit ? 'bg-accent' : 'bg-white/10'}`} />
        </div>

        <div className="bg-surface border border-white/5 rounded-2xl p-8 space-y-8">

          {/* Section 1 — Input mode toggle */}
          <div>
            <div className="flex items-start gap-3 mb-5">
              <div className="w-7 h-7 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-accent text-xs font-bold">1</span>
              </div>
              <div className="flex-1">
                <h2 className="text-base font-semibold text-gray-100">Your professional profile</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  This becomes your permanent profile. All future resumes are generated from it.
                </p>
              </div>
            </div>

            {/* Mode toggle */}
            <div className="flex bg-white/5 rounded-xl p-1 mb-5">
              <button
                onClick={() => setInputMode('pdf')}
                className={`flex-1 text-sm py-2 rounded-lg font-medium transition-colors ${
                  inputMode === 'pdf'
                    ? 'bg-white/10 text-gray-100'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Upload LinkedIn PDF
              </button>
              <button
                onClick={() => setInputMode('text')}
                className={`flex-1 text-sm py-2 rounded-lg font-medium transition-colors ${
                  inputMode === 'text'
                    ? 'bg-white/10 text-gray-100'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Paste plain text
              </button>
            </div>

            {inputMode === 'pdf' ? (
              <>
                <Dropzone
                  label="LinkedIn Profile PDF"
                  hint="LinkedIn → Me → Save to PDF"
                  file={linkedinFile}
                  onFile={setLinkedinFile}
                  required
                />
                {/* How to export guide */}
                <div className="mt-3 flex items-start gap-2 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    On LinkedIn: click <span className="text-gray-300">Me</span> → <span className="text-gray-300">View Profile</span> → <span className="text-gray-300">More</span> → <span className="text-gray-300">Save to PDF</span>
                  </p>
                </div>
              </>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-200">Profile text</p>
                  <span className="text-[10px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">Required</span>
                </div>
                <textarea
                  value={plainText}
                  onChange={(e) => setPlainText(e.target.value)}
                  placeholder={`Paste your profile info here — name, job title, work experience, education, skills, contact details...\n\nExample:\nJohn Smith\nSenior Software Engineer\njohn@email.com | github.com/john | linkedin.com/in/john | New York, NY\n\nExperience:\nAcme Corp — Senior Engineer (2020–present)\n- Built scalable APIs serving 10M requests/day\n...`}
                  rows={12}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent/40 resize-none leading-relaxed"
                />
                <p className={`text-xs mt-1.5 text-right transition-colors ${
                  plainText.trim().length < 50 ? 'text-gray-600' : 'text-gray-500'
                }`}>
                  {plainText.trim().length} chars {plainText.trim().length < 50 && `(min 50)`}
                </p>
              </div>
            )}
          </div>

          {/* Divider + Section 2 — only shown in PDF mode */}
          {inputMode === 'pdf' && (
            <>
              <div className="border-t border-white/5" />
              <div>
                <div className="flex items-start gap-3 mb-5">
                  <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-gray-500 text-xs font-bold">2</span>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-100">Upload your current resume</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Optional — helps us write better bullets by learning your existing style.
                    </p>
                  </div>
                </div>
                <Dropzone
                  label="Existing Resume"
                  hint="Optional — helps us improve your bullets"
                  file={resumeFile}
                  onFile={setResumeFile}
                />
              </div>
            </>
          )}

          {/* CTA */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="w-full flex items-center justify-center gap-3 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-bg font-semibold rounded-xl py-3.5 text-sm transition-colors"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Parsing your profile…
              </>
            ) : (
              <>
                Build My Profile
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>

          {error && (
            <p className="text-center text-xs text-red-400 -mt-4">{error}</p>
          )}
          {!canSubmit && !error && (
            <p className="text-center text-xs text-gray-600 -mt-4">
              {inputMode === 'pdf' ? 'Upload your LinkedIn PDF to continue' : 'Paste at least 50 characters to continue'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
