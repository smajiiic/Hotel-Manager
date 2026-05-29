# Frontend — IsaBegov Hamam Hotel Service Tracker

React + Vite single-page app for the IsaBegov Hamam internal staff tool —
auth, role-aware navigation, tasks, rooms, requests, bookings, dashboard.
For full-stack setup (backend, MongoDB, seeding), see `../SETUP.md` at the
repo root. This README covers the frontend-only workflow.

## Prerequisites

- **Node.js 20+** (CI runs on 20)
- **Backend** running on `http://localhost:5050` — see `../SETUP.md`
- **MongoDB** running and seeded — required by the backend, not by the
  frontend itself

For UI-only development without the backend, the `tasksApi.js` and
`requestsApi.js` ship with a mock data layer by default; see "Real backend
vs mocks" below.

## Install

```bash
cd frontend
npm install
```

## Run dev server

```bash
npm run dev -- --port 3000
```

Open <http://localhost:3000>. The `--port 3000` flag is important — the
backend's CORS allowlist is `http://localhost:3000`, and the session cookie
won't survive cross-origin requests otherwise. Vite's default `:5173` will
not work for end-to-end auth.

`/api/*` is proxied to `VITE_API_PROXY` (default `http://localhost:5050` —
the backend port).

## Tests

```bash
npm test
```

Runs Vitest in jsdom with React Testing Library. CI runs the same command
on push and PR to `main` (see `../.github/workflows/ci.yml`). Setup file:
`src/test/setup.js`.

Current coverage: pages (Rooms, Bookings, Dashboard, Login), components
(RoomRow, StatusBadge, ConfirmModal, NavBar), hooks (useAuth).

## Other scripts

| Script | What it does |
| --- | --- |
| `npm run build` | Production bundle to `dist/` |
| `npm run preview` | Serve the built `dist/` for smoke-testing |
| `npm run lint` | ESLint over the source tree |

## Test credentials (seeded by `seed.js`)

| Username | Password | Role |
| --- | --- | --- |
| `admin` | `admin123` | manager |
| `reception1` | `test1234` | reception |
| `cleaning1` | `test1234` | cleaning |
| `manager1` | `test1234` | manager |

Role permissions (frontend role-gating + backend enforcement):

| | Tasks | Rooms | Requests | Bookings | Dashboard |
| --- | --- | --- | --- | --- | --- |
| `reception` | full CRUD | view, update status | full CRUD | view | — |
| `cleaning` | view, mark complete | view, update status | view | — | — |
| `manager` | view only | view only | view only | view only | view |

## Real backend vs mocks

`tasksApi.js` and `requestsApi.js` are env-gated dual-mode wrappers. Default
is **mocks active** so you can run dev / tests without the backend.

To exercise the real backend:

```bash
# in frontend/.env (copy from .env.example)
VITE_USE_REAL_API=true
```

`/api/auth`, `/api/rooms`, `/api/bookings` always hit the real backend
regardless of this flag — they don't ship a frontend mock layer (Mirza
swapped them to real in `ad216b7`).

Contract for the gated endpoints: `../docs/api-contracts-tasks-requests.md`.

## Project structure

```
frontend/src/
├── main.jsx                  entry, BrowserRouter
├── App.jsx                   routes + AuthProvider mount
├── api/                      HTTP wrappers — call backend, not models
│   ├── client.js             fetch + {success,data,error} envelope + 401 handler
│   ├── tasksApi.js           dual-mode (mock | real)
│   ├── requestsApi.js        dual-mode (mock | real)
│   ├── roomsApi.js           real backend
│   └── bookingsApi.js        real backend
├── components/               shared UI
│   ├── AuthProvider.jsx      context + localStorage persistence
│   ├── Layout.jsx            NavBar + <Outlet />
│   ├── NavBar.jsx            role-aware links + mobile drawer
│   ├── ProtectedRoute.jsx    auth gate + optional role gate
│   ├── LoadingState/ErrorState/EmptyState
│   ├── ConfirmDialog.jsx     reusable confirm modal (Tarik's)
│   ├── ConfirmModal.jsx      reusable confirm modal (Mirza's — to reconcile)
│   ├── TaskCard.jsx, RequestRow.jsx, RequestForm.jsx
│   ├── BookingRow.jsx, RoomRow.jsx, StatusBadge.jsx
├── hooks/
│   └── useAuth.js            consumes AuthContext
├── mocks/                    fixtures for the dual-mode APIs
├── pages/                    one file per route
├── styles/                   plain CSS per page + global.css
├── test/                     Vitest + RTL specs + setup.js
└── utils/
    └── formatRelative.js     timestamp formatter shared by TaskCard + RequestRow
```

## Architecture

Three-tier layered: React (presentation) → Express REST (business logic) →
MongoDB via Mongoose (data). Frontend never queries the database directly;
all data flows through `src/api/*Api.js` → `/api/*` routes → backend
services. Details in the Architectural Design Document at the repo root.

## Conventions

- Components: PascalCase (`TaskCard.jsx`); hooks / utils / api: camelCase
  (`useAuth.js`, `tasksApi.js`)
- CSS classes: kebab-case (`task-card`)
- API responses always use `{ success, data, error }`
- No `console.log` in committed code
- Confirmation dialog (`ConfirmDialog` / `ConfirmModal`) before destructive
  actions

## Git workflow

Branch off `main`, one feature per branch, push and open a PR. CI must be
green before merge.

```bash
git checkout main && git pull
git checkout -b feature/<descriptor>
# work, commit
npm test                          # must pass locally before push
git push origin feature/<descriptor>
# then open PR on GitHub
```
