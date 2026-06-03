import './MetricCards.css';
import { Link } from 'react-router-dom';

/**
 * Compact horizontal stat row.
 * items: [{ key, label, value, sub?, tone, Icon?, trend?:{dir,pct}, link?:{label,to} }]
 * variant: 'lead' (default) | 'secondary' (smaller tiles)
 */
export default function MetricCards({ items = [], variant = 'lead' }) {
  return (
    <div
      className={`ibh-metrics ibh-reveal ${variant === 'secondary' ? 'ibh-metrics--secondary' : ''}`}
      data-testid="metric-cards"
    >
      {items.map((m) => (
        <div key={m.key} className={`ibh-metric tone-${m.tone ?? 'teal'}`} data-testid={`metric-${m.key}`}>
          {m.Icon && (
            <span className="ibh-metric-icon" aria-hidden="true"><m.Icon size={20} /></span>
          )}
          <span className="ibh-metric-value">{m.value}</span>
          <span className="ibh-metric-body">
            <span className="ibh-metric-label">{m.label}</span>
            {m.trend && (
              <span className={`ibh-metric-trend ${m.trend.dir === 'down' ? 'is-down' : 'is-up'}`}>
                {m.trend.dir === 'down' ? '↘' : '↗'} {m.trend.pct}%
              </span>
            )}
            {m.link && <Link className="ibh-metric-link" to={m.link.to}>{m.link.label} →</Link>}
            {m.sub && !m.trend && !m.link && <span className="ibh-metric-sub">{m.sub}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}
