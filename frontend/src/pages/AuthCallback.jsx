import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import useAuthStore from '../store/authStore'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    const access = params.get('access')
    const refresh = params.get('refresh')
    const error = params.get('error')

    if (error || !access) {
      navigate('/login?error=oauth_failed', { replace: true })
      return
    }

    // Fetch user profile with the new token
    api.get('/api/auth/me/', {
      headers: { Authorization: `Bearer ${access}` },
    })
      .then(({ data }) => {
        setAuth(data, access, refresh)
        navigate('/dashboard', { replace: true })
      })
      .catch(() => navigate('/login?error=oauth_failed', { replace: true }))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <p className="text-gray-400 text-sm">Signing you in…</p>
    </div>
  )
}
