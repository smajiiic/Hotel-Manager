export default function EmptyState({ message = 'Nothing here yet.' }) {
  return (
    <div
      style={{
        padding: '3rem 1.5rem',
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: '0.9rem',
      }}
    >
      {message}
    </div>
  );
}