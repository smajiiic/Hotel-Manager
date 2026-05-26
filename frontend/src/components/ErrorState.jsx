export default function ErrorState({ message, onRetry }) {
  return (
    <div
      role="alert"
      style={{
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '10px',
        padding: '1.25rem 1.5rem',
        textAlign: 'center',
        color: '#991b1b',
      }}
    >
      <div style={{ marginBottom: onRetry ? '0.75rem' : 0, fontSize: '0.95rem' }}>
        {message}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            backgroundColor: '#fff',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            padding: '0.4rem 1rem',
            color: '#991b1b',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}