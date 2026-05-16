// TODO sprint 2: wire to GET /api/auth/me on mount + POST /api/auth/logout.
// For now we hardcode the current user from mocks. Components only call
// useAuth(), so swapping this implementation later won't touch any UI.
import { mockCurrentUser } from '../mocks/users.js'

export function useAuth() {
  return {
    user: mockCurrentUser,
    role: mockCurrentUser.role,
    logout: () => {
      console.warn('logout() is a no-op in sprint 1 — wired up in sprint 2')
    },
  }
}
