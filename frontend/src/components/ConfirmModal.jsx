// src/components/ConfirmModal.jsx
import { useEffect } from 'react';

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
    animation: 'fadeIn 0.15s ease',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    animation: 'slideUp 0.2s ease',
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#fef3c7',
    margin: '0 auto 1rem auto',
    fontSize: '1.5rem',
  },
  title: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  message: {
    margin: '0 0 1.5rem 0',
    fontSize: '0.9rem',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: '1.5',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
  },
  cancelBtn: {
    flex: 1,
    padding: '0.6rem 1rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    backgroundColor: '#fff',
    color: '#374151',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  confirmBtn: {
    flex: 1,
    padding: '0.6rem 1rem',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#ef4444',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
};

const keyframes = `
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  @keyframes slideUp { from { transform: translateY(12px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
`;

export default function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <>
      <style>{keyframes}</style>
      <div
        style={styles.overlay}
        onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div style={styles.modal}>
          <div style={styles.icon}>⚠️</div>
          <h2 id="confirm-modal-title" style={styles.title}>{title}</h2>
          <p style={styles.message}>{message}</p>
          <div style={styles.actions}>
            <button
              style={styles.cancelBtn}
              onClick={onCancel}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              {cancelLabel}
            </button>
            <button
              style={styles.confirmBtn}
              onClick={onConfirm}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
