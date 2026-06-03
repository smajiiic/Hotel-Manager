import './MetricCards.css';

/**
 * Presentational row of metric cards.
 * Props:
 *  - items: [{ key, label, value, tone }]  tone ∈ available|occupied|cleaning|teal
 */
export default function MetricCards({ items = [] }) {
  return (
    <div className="ibh-metrics" data-testid="metric-cards">
      {items.map((m) => (
        <div key={m.key} className={`ibh-metric tone-${m.tone ?? 'teal'}`} data-testid={`metric-${m.key}`}>
          <span className="ibh-metric-label">{m.label}</span>
          <span className="ibh-metric-value">{m.value}</span>
        </div>
      ))}
    </div>
  );
}
