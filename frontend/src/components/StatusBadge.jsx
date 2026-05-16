// src/components/StatusBadge.jsx

const STATUS_CONFIG = {
  available: {
    label: 'Available',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    borderColor: '#6ee7b7',
  },
  occupied: {
    label: 'Occupied',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderColor: '#fca5a5',
  },
  'needs-cleaning': {
    label: 'Needs Cleaning',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderColor: '#fcd34d',
  },
};

const styles = {
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    letterSpacing: '0.03em',
    border: '1px solid',
    whiteSpace: 'nowrap',
    transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
  },
  dot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    flexShrink: 0,
  },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    backgroundColor: '#f3f4f6',
    color: '#374151',
    borderColor: '#d1d5db',
  };

  return (
    <span
      style={{
        ...styles.badge,
        backgroundColor: config.backgroundColor,
        color: config.color,
        borderColor: config.borderColor,
      }}
    >
      <span
        style={{
          ...styles.dot,
          backgroundColor: config.color,
        }}
      />
      {config.label}
    </span>
  );
}
