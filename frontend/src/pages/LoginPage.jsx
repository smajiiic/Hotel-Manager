import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import '../styles/login.css'

function loginErrorMessage(err) {
  if (err?.status === 400) return 'Please fill in both fields.'
  if (err?.status === 401) return 'Invalid username or password.'
  return 'Something went wrong, please try again.'
}

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname ?? '/tasks'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(username, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(loginErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const year = new Date().getFullYear()

  return (
    <div className="login-page">
      <aside className="login-brand-panel" aria-hidden="true">
        <div className="login-brand-mark">Isa Begov Hamam</div>

        <div>
          <h2 className="login-brand-heading">
            Where heritage<br />meets <span className="login-brand-accent">hospitality</span>.
          </h2>
          <p className="login-brand-tagline">
            A modern service tracker for the historic Sarajevo bathhouse — rooms,
            bookings, requests, and staff tasks, all in one place.
          </p>
        </div>

        <div className="login-brand-footer">
          <span>Sarajevo<span className="login-brand-footer-dot"></span>Est. 1557</span>
          <span>© {year}</span>
        </div>
      </aside>

      <main className="login-form-panel">
        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">Sign in to continue</p>

          <label className="login-label" htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={submitting}
            placeholder="admin"
          />

          <label className="login-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            placeholder="••••••••"
          />

          {error && <div className="login-error" role="alert">{error}</div>}

          <button
            type="submit"
            className="login-submit"
            disabled={submitting}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </main>
    </div>
  )
}

export default LoginPage
