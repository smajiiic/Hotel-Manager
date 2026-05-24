import { useState } from 'react'

function RequestForm({ rooms, onSubmit, onCancel, onError }) {
  const [roomId, setRoomId] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = note.trim()
    if (!roomId || !trimmed) return
    setSubmitting(true)
    try {
      await onSubmit({ roomId, note: trimmed })
      // Parent collapses the form on success — no local reset needed.
    } catch (err) {
      onError?.(err?.message ?? 'Failed to add note')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="request-form" onSubmit={handleSubmit} noValidate>
      <label className="request-form-label" htmlFor="request-room">Room</label>
      <select
        id="request-room"
        className="request-form-select"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        disabled={submitting}
        required
      >
        <option value="" disabled>Select a room…</option>
        {rooms.map((r) => (
          <option key={r._id} value={r._id}>Room {r.roomNumber}</option>
        ))}
      </select>

      <label className="request-form-label" htmlFor="request-note">Note</label>
      <textarea
        id="request-note"
        className="request-form-textarea"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={submitting}
        rows={3}
        required
        placeholder="What does the next shift need to know?"
      />

      <div className="request-form-actions">
        <button
          type="button"
          className="request-form-cancel"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="request-form-submit"
          disabled={submitting || !roomId || !note.trim()}
        >
          {submitting ? 'Adding…' : 'Add note'}
        </button>
      </div>
    </form>
  )
}

export default RequestForm
