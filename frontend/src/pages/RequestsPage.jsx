import { useEffect, useState, useCallback } from 'react'
import { getRequests, createRequest, deleteRequest } from '../api/requestsApi.js'
import { getRooms } from '../api/roomsApi.js'
import { useAuth } from '../hooks/useAuth.js'
import RequestRow from '../components/RequestRow.jsx'
import RequestForm from '../components/RequestForm.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import '../styles/requests.css'

function RequestsPage() {
  const { user, role } = useAuth()
  const canEdit = role === 'reception'

  const [requests, setRequests] = useState([])
  const [rooms, setRooms] = useState([])
  const [status, setStatus] = useState('loading')
  const [loadError, setLoadError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const load = useCallback(async () => {
    setStatus('loading')
    setLoadError(null)
    try {
      const [requestList, roomList] = await Promise.all([getRequests(), getRooms()])
      const sorted = [...requestList].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      )
      setRequests(sorted)
      setRooms(roomList)
      setStatus(sorted.length === 0 ? 'empty' : 'populated')
    } catch (err) {
      setLoadError(err?.message ?? 'Failed to load shift notes')
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const roomById = Object.fromEntries(rooms.map((r) => [r._id, r]))

  const handleAdd = async ({ roomId, note }) => {
    setActionError(null)
    // createdBy is honored by the mock; the real backend sets it from the
    // session and will ignore any value we send here.
    const created = await createRequest({ roomId, note, createdBy: user?.username })
    setRequests((prev) => [created, ...prev])
    setShowForm(false)
    if (status === 'empty') setStatus('populated')
  }

  const handleConfirmDelete = async () => {
    const target = pendingDelete
    setPendingDelete(null)
    if (!target) return
    setActionError(null)
    try {
      await deleteRequest(target._id)
      setRequests((prev) => {
        const next = prev.filter((r) => r._id !== target._id)
        if (next.length === 0) setStatus('empty')
        return next
      })
    } catch (err) {
      setActionError(err?.message ?? 'Failed to delete note')
    }
  }

  return (
    <section className="requests-page">
      <header className="requests-header">
        <h1>Shift Notes</h1>
        {canEdit && !showForm && (
          <button
            type="button"
            className="requests-add"
            onClick={() => {
              setActionError(null)
              setShowForm(true)
            }}
          >
            + Add note
          </button>
        )}
      </header>

      {showForm && (
        <RequestForm
          rooms={rooms}
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
          onError={(msg) => setActionError(msg)}
        />
      )}

      {actionError && (
        <div className="requests-banner" role="alert">
          {actionError}
        </div>
      )}

      {status === 'loading' && <div className="requests-status">Loading…</div>}

      {status === 'error' && (
        <div className="requests-status requests-status-error">
          <span>{loadError}</span>
          <button type="button" onClick={load}>Retry</button>
        </div>
      )}

      {status === 'empty' && (
        <div className="requests-status">No shift notes yet.</div>
      )}

      {status === 'populated' && (
        <ul className="requests-list">
          {requests.map((req) => (
            <li key={req._id}>
              <RequestRow
                request={req}
                room={roomById[req.roomId]}
                canDelete={canEdit}
                onDelete={() => setPendingDelete(req)}
              />
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this note?"
        message={pendingDelete?.note}
        confirmLabel="Delete"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  )
}

export default RequestsPage
