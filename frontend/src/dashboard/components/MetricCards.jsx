import './MetricCards.css';

/**
 * Presentational row of metric cards.
 * Props:
 *  - items: [{ key, label, value, sub?, tone }]  tone ∈ available|occupied|cleaning|teal
 *  - variant: 'lead' (default, auto-fit grid) | 'secondary' (small left-aligned tiles)
 */
export default function MetricCards({ items = [], variant = 'lead' }) {
  return (
    <div
      className={`ibh-metrics ${variant === 'secondary' ? 'ibh-metrics--secondary' : ''}`}
      data-testid="metric-cards"
    >
      {items.map((m) => (
        <div key={m.key} className={`ibh-metric tone-${m.tone ?? 'teal'}`} data-testid={`metric-${m.key}`}>
          <span className="ibh-metric-label">{m.label}</span>
          <span className="ibh-metric-value">{m.value}</span>
          {m.sub && <span className="ibh-metric-sub">{m.sub}</span>}
        </div>
      ))}
    </div>
  );
}
