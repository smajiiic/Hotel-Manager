import { useState, useEffect, useCallback } from 'react'
import { AuthContext } from '../hooks/useAuth.js'
import { apiPost } from '../api/client.js'

const STORAGE_KEY = 'ibh_user'

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeStoredUser(user) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // localStorage unavailable (private mode, disk full) — fall back to in-memory only.
  }
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)
  // verifying is the in-flight flag for the speculative GET shape below.
  // Currently held at false because the verify endpoint doesn't exist yet.
  const [verifying] = useState(false)

  // TODO(arda): swap this to /api/auth/me once available — and remove the
  // speculative GET. The mount → GET → setVerifying(false) → 401-via-event
  // flow is already wired. Activating it requires:
  //   1. Change `useState(false)` above to `useState(() => readStoredUser() !== null)`
  //      and destructure as `[verifying, setVerifying]`.
  //   2. Uncomment the apiGet block inside the first-mount useEffect below.
  //   3. 401 responses already route through the 'auth:expired' window
  //      listener — no changes needed there.

  const login = useCallback(async (username, password) => {
    const data = await apiPost('/api/auth/login', { username, password })
    setUser(data)
    writeStoredUser(data)
    return data
  }, [])

  const logout = useCallback(async () => {
    // Optimistic: clear local state synchronously so the UI flips to logged-out
    // instantly. POST happens in the background; failure leaves the server
    // session to age out via the cookie's 24h maxAge (backend/app.js).
    setUser(null)
    writeStoredUser(null)
    try {
      await apiPost('/api/auth/logout')
    } catch {
      // Server unreachable or session already gone — local state is cleared.
    }
  }, [])

  // Forced logout on 401: client.js dispatches 'auth:expired' on any 401 and
  // hard-navigates to /login. We listen here to clear our state + storage so
  // the next mount doesn't restore a stale user.
  useEffect(() => {
    const onExpired = () => {
      setUser(null)
      writeStoredUser(null)
    }
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [])

  // First-mount session verification — speculative shape, no-op until /api/auth/me lands.
  useEffect(() => {
    // Uncomment when /api/auth/me ships:
    //   apiGet('/api/auth/me')
    //     .then(() => setVerifying(false))
    //     .catch(() => setVerifying(false))  // 401s handled by 'auth:expired'
  }, [])

  const value = {
    user,
    role: user?.role ?? null,
    isAuthenticated: Boolean(user),
    verifying,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
