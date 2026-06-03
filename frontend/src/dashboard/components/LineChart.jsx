import './LineChart.css';

const WIDTH = 540;
const PAD = { top: 16, right: 16, bottom: 30, left: 34 };

/**
 * Minimal responsive SVG line/area chart — no chart library (no new deps).
 * Props:
 *  - data: [{ label, value }]
 *  - title, ariaLabel
 *  - height (px in the viewBox)
 * Provides a visually-hidden data list for screen readers (an SVG isn't read aloud).
 */
export default function LineChart({ data = [], title, ariaLabel, height = 190 }) {
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;
  const baseY = PAD.top + innerH;
  const max = Math.max(1, ...data.map((d) => d.value));
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    ...d,
    x: PAD.left + i * stepX,
    y: PAD.top + innerH - (d.value / max) * innerH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = points.length
    ? `${linePath} L ${PAD.left + innerW} ${baseY} L ${PAD.left} ${baseY} Z`
    : '';

  return (
    <figure className="ibh-chart">
      {title && <figcaption className="ibh-chart-title">{title}</figcaption>}
      <svg
        className="ibh-chart-svg"
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-label={ariaLabel || title}
        preserveAspectRatio="xMidYMid meet"
      >
        <line className="ibh-chart-axis" x1={PAD.left} y1={baseY} x2={PAD.left + innerW} y2={baseY} />
        {areaPath && <path className="ibh-chart-area" d={areaPath} />}
        {linePath && <path className="ibh-chart-line" d={linePath} />}
        {points.map((p, i) => (
          <g key={p.label ?? i}>
            <circle className="ibh-chart-dot" cx={p.x} cy={p.y} r="3.5" />
            {i % 2 === 0 && (
              <text className="ibh-chart-xlabel" x={p.x} y={height - 10} textAnchor="middle">
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
      <ul className="ibh-sr-only">
        {data.map((d, i) => (
          <li key={d.label ?? i}>{d.label}: {d.value}</li>
        ))}
      </ul>
    </figure>
  );
}
