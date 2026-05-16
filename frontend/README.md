# Isa Begov Hamam — Service Tracker (Frontend)

Internal web app for Isa Begov Hamam, a 15-room boutique hotel in Sarajevo.
Replaces a mix of WhatsApp and paper with a single tool for tasks, room
status, shift notes, and bookings.

CS308 group project, IUS. Frontend lead: Tarik.

## Stack

- Vite + React (JSX, not TypeScript)
- React Router v6+
- Plain CSS (no Tailwind / MUI / CSS-in-JS)
- Backend: Node + Express + MongoDB, session cookies for auth — separate repo, not built yet (see "Mock backend" below)

## Run

```bash
npm install
npm run dev
```

Dev server: <http://localhost:5173>.

No `.env` is required for sprint 1 — every API call is intercepted by the mock layer so the dev proxy in `vite.config.js` never gets hit. `.env.example` exists for sprint 2 when the real backend lands.

## Mock backend (sprint 1)

The backend isn't built yet. Until it is:

- Fixtures live in `src/mocks/` — `tasks.js`, `requests.js`, `rooms.js`, `users.js`.
- The clients in `src/api/` (`tasksApi.js`, `requestsApi.js`, `roomsApi.js`) currently return from those mocks with a ~200ms delay so the UI exercises real loading states.
- The real fetch wrapper sits in `src/api/client.js`, ready to use. It handles the `{ success, data, error }` envelope, sends the session cookie via `credentials: 'include'`, and redirects to `/login` on 401.
- Each `*Api.js` file ends with a commented "sprint 2 swap" block showing the exact lines to paste in once `/api/*` goes live. Components never import from `mocks/` directly — they only see the api functions — so each module is a one-file swap.

### Hardcoded auth

`src/hooks/useAuth.js` returns a hardcoded user instead of pinging `/api/auth/me`. To test role-gated UI before the real session ships, edit the role in `src/mocks/users.js`:

```js
export const mockCurrentUser = { username: 'tarik', role: 'reception' }
//                                                       ^^^^^^^^^^^
// Change to: 'reception' | 'cleaning' | 'manager'
```

Effect on the UI:

| Role        | Nav links visible                  | Mark complete on tasks |
|-------------|------------------------------------|------------------------|
| `reception` | Tasks, Requests, Rooms, Bookings   | shown                  |
| `cleaning`  | Tasks, Rooms                       | shown                  |
| `manager`   | Tasks, Requests, Rooms, Bookings   | hidden (read-only)     |

`useAuth().logout()` is a no-op in sprint 1; it'll call `POST /api/auth/logout` in sprint 2.

## Folder layout

```
src/
  main.jsx
  App.jsx                  BrowserRouter, ProtectedRoute wrapping, routes
  api/
    client.js              real fetch wrapper (used in sprint 2)
    tasksApi.js            mock-backed, sprint 2 swap commented at the bottom
    requestsApi.js
    roomsApi.js
  mocks/
    tasks.js               7 tasks, mix of pending/completed
    requests.js            4 shift notes
    rooms.js               15 rooms, mixed statuses
    users.js               hardcoded current user
  components/
    Layout.jsx             header + NavBar + <Outlet/>
    NavBar.jsx             role-aware nav
    ProtectedRoute.jsx     auth gate + optional roles prop
    TaskCard.jsx           single task row
    ConfirmDialog.jsx      reusable modal for destructive actions
  pages/
    LoginPage.jsx          teammate-owned placeholder
    TasksPage.jsx          Tarik — sprint 1 focus
    RequestsPage.jsx       Tarik — placeholder until sprint 2
    RoomsPage.jsx          teammate-owned placeholder
    BookingsPage.jsx       teammate-owned placeholder
    NotFoundPage.jsx       Tarik — 404 fallback
  hooks/
    useAuth.js             hardcoded for sprint 1
  styles/
    global.css             reset, button base, ConfirmDialog modal
    layout.css             header, NavBar, main content wrapper
    tasks.css              TasksPage + TaskCard
```

## Page ownership

| Page              | Owner    | State                                  |
|-------------------|----------|----------------------------------------|
| `LoginPage`       | teammate | placeholder — replace file contents    |
| `TasksPage`       | Tarik    | done — list + filter + mark complete   |
| `RequestsPage`    | Tarik    | placeholder until sprint 2             |
| `RoomsPage`       | teammate | placeholder — replace file contents    |
| `BookingsPage`    | teammate | placeholder — replace file contents    |
| `NotFoundPage`    | Tarik    | done                                   |

`Layout.jsx`, `NavBar.jsx`, `ProtectedRoute.jsx`, `ConfirmDialog.jsx`, plus the entire `api/` and `mocks/` trees are Tarik's. Teammates consume them but don't edit them — the routing in `App.jsx` already plugs the teammate pages into `<Layout/>` via `<Outlet/>`.

## Conventions

- camelCase variables, PascalCase components, camelCase non-component files
- Every API response is `{ success, data, error }` — handled in `client.js`
- Mobile-first CSS; test at 380px width; tap targets ≥ 44px
- Confirmation dialog (`ConfirmDialog`) before any destructive action
- Branches: `feature/[module]-[short-desc]` (e.g. `feature/tasks-list-page`)

## Roles

- `reception` — full CRUD on tasks & requests, updates room status
- `cleaning` — views tasks, marks complete, views rooms (mobile-first user)
- `manager` — read-only across everything

Role-gating helper for sprint 2: `<ProtectedRoute roles={['reception','manager']}>...`.
