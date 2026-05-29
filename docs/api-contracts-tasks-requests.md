# API Contracts — `/api/tasks` and `/api/requests`

This document specifies the REST contracts the frontend expects when the backend
ships `TaskService` and `RequestService`. The frontend's `tasksApi.js` and
`requestsApi.js` are already wired to call these endpoints; until the backend
routes exist, both are env-gated to fall back to mock implementations (see
`VITE_USE_REAL_API` in `frontend/.env.example`).

All endpoints share the project-wide response envelope
`{ success: boolean, data: any, error: string }` already established by
`/api/auth/*`, `/api/rooms`, and `/api/bookings`. Authentication is via the
existing `express-session` cookie; `credentials: 'include'` is sent by
`frontend/src/api/client.js`. On 401 the client dispatches an `auth:expired`
window event and hard-navigates to `/login`.

Implementation references the SRS:
- **REQ2.*** — task management (create / assign / complete / delete)
- **REQ3.*** — shift-note / guest-request management

---

## Roles

Per CLAUDE.md §9 and SRS REQ1.3 (role-based access):

| Role         | Tasks                                | Requests                |
| ------------ | ------------------------------------ | ----------------------- |
| `reception`  | full CRUD                            | full CRUD               |
| `cleaning`   | read; PATCH `:id/complete` only      | read only               |
| `manager`    | read only                            | read only               |

Backend MUST enforce these (frontend role-gating is UX only). Reject
unauthorized operations with `403 { success: false, error: 'Forbidden' }`.

---

## Response envelope (shared)

| HTTP | Body shape                                | When                                                          |
| ---- | ----------------------------------------- | ------------------------------------------------------------- |
| 200  | `{ success: true, data: <T> }`            | success                                                       |
| 400  | `{ success: false, error: <string> }`     | malformed request body, missing required fields, bad types    |
| 401  | `{ success: false, error: <string> }`     | no session / expired session — triggers frontend `auth:expired` |
| 403  | `{ success: false, error: 'Forbidden' }`  | authenticated but role lacks permission                       |
| 404  | `{ success: false, error: <string> }`     | resource by `:id` not found                                   |
| 500  | `{ success: false, error: <string> }`     | unhandled server error                                        |

The `error` field SHOULD be a short human-readable message. The frontend
surfaces it verbatim in some places and maps to friendlier copy in others
(e.g. login uses a generic "Invalid username or password" regardless of
backend wording).

---

## Data shapes

```js
Task {
  _id:         string,                       // Mongo ObjectId
  description: string,                       // required
  status:      'pending' | 'completed',      // default 'pending'
  roomId:      string,                       // Mongo ObjectId of a Room
  assignedTo:  string | object | null,       // see "Open question" below
  createdBy:   string,                       // set server-side from session
  createdAt:   string,                       // ISO timestamp
  completedAt: string | null                 // ISO timestamp; null until completed
}

Request {
  _id:       string,                         // Mongo ObjectId
  note:      string,                         // required, non-empty
  roomId:    string,                         // Mongo ObjectId of a Room
  createdBy: string,                         // set server-side from session
  createdAt: string                          // ISO timestamp
}
```

**Open question on `Task.assignedTo`:** mock currently stores a username string
(e.g. `'amina'`). The real backend may return a populated user object
`{ _id, username, role }`. `TaskCard.jsx` currently `String(task.assignedTo)`s
it defensively — pick a shape and document here; the frontend will adapt.

---

## `/api/tasks`

### GET `/api/tasks`
List tasks. All roles. Backend SHOULD return active tasks sorted by `createdAt`
descending; the frontend does no extra sort.

- Request body: none
- Query params: none required for v1
- Success: `200 { success: true, data: Task[] }`
- Failure: `401`

### POST `/api/tasks`
Create a task. **Reception only.**

- Request body: `{ description: string, roomId: string, assignedTo?: string }`
  - `description` required, non-empty
  - `roomId` required, must reference an existing Room
  - `assignedTo` optional
- Server sets: `_id`, `createdBy` (from session), `createdAt`, `status: 'pending'`
- Success: `201 { success: true, data: Task }` (the newly-created task)
- Failure: `400` (validation), `401`, `403` (non-reception)

### PUT `/api/tasks/:id`
Replace / patch an existing task. **Reception only.**

- URL param: `:id` — task `_id`
- Request body: any subset of `{ description, roomId, assignedTo, status }`
- Success: `200 { success: true, data: Task }` (the updated task)
- Failure: `400`, `401`, `403`, `404`

### PATCH `/api/tasks/:id/complete`
Mark a task complete. **Reception or cleaning** (this is cleaning's only write).

- URL param: `:id`
- Request body: none
- Server sets: `status: 'completed'`, `completedAt: <now>`
- Success: `200 { success: true, data: Task }`
- Failure: `401`, `403` (manager), `404`, `409` (already completed — optional, frontend tolerates)

### DELETE `/api/tasks/:id`
Delete a task. **Reception only.**

- URL param: `:id`
- Request body: none
- Success: `200 { success: true }` (no `data` field needed)
- Failure: `401`, `403`, `404`

---

## `/api/requests`

### GET `/api/requests`
List shift notes / guest requests. All roles. Backend SHOULD return notes
sorted by `createdAt` descending; the frontend already client-side sorts.

- Request body: none
- Success: `200 { success: true, data: Request[] }`
- Failure: `401`

### POST `/api/requests`
Create a note. **Reception only.**

- Request body: `{ roomId: string, note: string }`
  - `roomId` required, must reference an existing Room
  - `note` required, non-empty (trimmed); reasonable max length (e.g. 2000 chars)
- Server sets: `_id`, `createdBy` (from session), `createdAt`
- **Note:** the frontend currently sends `createdBy: user?.username` as a
  convenience for the mock layer; the real backend MUST ignore this field
  and set `createdBy` from `req.session.userId` for security.
- Success: `201 { success: true, data: Request }`
- Failure: `400`, `401`, `403`

### DELETE `/api/requests/:id`
Delete a note. **Reception only.**

- URL param: `:id`
- Request body: none
- Success: `200 { success: true }`
- Failure: `401`, `403`, `404`

---

## Acceptance for the swap (per CLAUDE.md §1.6 Task 16 / Task 17)

When the backend lands:
1. Set `VITE_USE_REAL_API=true` in `frontend/.env` (already gated).
2. Run frontend dev: `cd frontend && npm run dev` with backend on `:5050`.
3. E2E for `/api/tasks`: login → land on `/tasks` → see real tasks → create task → mark complete.
4. E2E for `/api/requests`: login → `/requests` → see real notes → add note → delete note (with ConfirmDialog).
5. All existing frontend tests still pass with mocks active (default).
