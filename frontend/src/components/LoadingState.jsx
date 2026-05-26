export default function LoadingState({ message = 'Loading…' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '0.9rem',
      }}
    >
      {message}
    </div>
  );
}