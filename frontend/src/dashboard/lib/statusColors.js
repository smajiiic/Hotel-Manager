// Single source for status presentation across the dashboard. Fills match
// StatusBadge's palette (green = available, rose = occupied, amber =
// needs-cleaning) so the floor plan and the badges read as one system.

export const STATUS_META = {
  available: {
    label: 'Available',
    fill: '#d1fae5',
    stroke: '#6ee7b7',
    dot: '#1f7a3c',
    text: '#065f46',
  },
  occupied: {
    label: 'Occupied',
    fill: '#fee2e2',
    stroke: '#fca5a5',
    dot: '#a01b1b',
    text: '#991b1b',
  },
  'needs-cleaning': {
    label: 'Needs Cleaning',
    fill: '#fef3c7',
    stroke: '#fcd34d',
    dot: '#8a5a00',
    text: '#92400e',
  },
};

const FALLBACK = {
  label: 'Unknown',
  fill: '#f3f4f6',
  stroke: '#d1d5db',
  dot: '#6b7280',
  text: '#374151',
};

export function statusMeta(status) {
  return STATUS_META[status] ?? { ...FALLBACK, label: status ?? 'Unknown' };
}
