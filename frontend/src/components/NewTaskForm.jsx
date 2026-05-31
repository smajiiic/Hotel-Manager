import { useState } from 'react'

const styles = {
  form: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '1.25rem 1.4rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    fontFamily: "'DM Sans', sans-serif",
  },
  title: { margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#111827' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  label: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    padding: '0.55rem 0.7rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    color: '#111827',
    backgroundColor: '#fff',
  },
  error: {
    color: '#b00020',
    fontSize: '0.85rem',
    backgroundColor: '#fef2f2',
    padding: '0.5rem 0.7rem',
    borderRadius: '6px',
  },
  actions: {
    display: 'flex',
    gap: '0.6rem',
    justifyContent: 'flex-end',
    marginTop: '0.35rem',
  },
  cancelBtn: {
    padding: '0.55rem 1rem',
    border: '1px solid #d1d5db',
    backgroundColor: '#fff',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    cursor: 'pointer',
    color: '#374151',
  },
  submitBtn: {
    padding: '0.55rem 1rem',
    border: 'none',
    backgroundColor: '#111827',
    color: '#fff',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    fontWeight: '600',
    cursor: 'pointer',
  },
}

function NewTaskForm({ rooms, onSubmit, onCancel }) {
  const [description, setDescription] = useState('')
  const [roomNumber, setRoomNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const trimmed = description.trim()
    if (!trimmed || !roomNumber) {
      setError('Description and room are required.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        description: trimmed,
        roomId: Number(roomNumber),
      })
    } catch (err) {
      setError(err?.message ?? 'Failed to create task.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form style={styles.form} onSubmit={handleSubmit} noValidate>
      <h3 style={styles.title}>New task</h3>

      <div style={styles.field}>
        <label style={styles.label} htmlFor="new-task-description">Description</label>
        <input
          id="new-task-description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={submitting}
          style={styles.input}
          placeholder="e.g. Replace towels, fix shower head…"
          required
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label} htmlFor="new-task-room">Room</label>
        <select
          id="new-task-room"
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
          disabled={submitting}
          style={styles.input}
          required
        >
          <option value="" disabled>Select a room…</option>
          {rooms.map((r) => (
            <option key={r._id} value={r.roomNumber}>
              Room {r.roomNumber} ({r.status})
            </option>
          ))}
        </select>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.actions}>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          style={styles.cancelBtn}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          style={styles.submitBtn}
        >
          {submitting ? 'Creating…' : 'Create task'}
        </button>
      </div>
    </form>
  )
}

export default NewTaskForm
