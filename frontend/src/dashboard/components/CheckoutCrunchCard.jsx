import './CheckoutCrunchCard.css';
import { roundPct } from '../lib/format.js';

/**
 * Signature manager metric: checkout-crunch readiness against the 1 PM deadline.
 * Props: deadlineLabel, due, ready, remaining (numbers).
 */
export default function CheckoutCrunchCard({ deadlineLabel = '1 PM', due = 0, ready = 0, remaining = 0 }) {
  const pct = due > 0 ? roundPct((ready / due) * 100) : 100;
  const tone = remaining > 0 ? 'warn' : 'ok';

  return (
    <section className={`ibh-crunch tone-${tone}`} data-testid="checkout-crunch" aria-label="Checkout crunch readiness">
      <div className="ibh-crunch-head">
        <h2 className="ibh-crunch-title">Checkout crunch readiness</h2>
        <span className="ibh-crunch-deadline">Deadline {deadlineLabel}</span>
      </div>

      <div className="ibh-crunch-headline">
        <strong>{due} due</strong> by {deadlineLabel} · {ready} ready · {remaining} remaining
      </div>

      <div
        className="ibh-crunch-bar"
        role="progressbar"
        aria-valuenow={ready}
        aria-valuemin={0}
        aria-valuemax={due}
        aria-label={`${ready} of ${due} rooms turned over`}
      >
        <div className="ibh-crunch-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="ibh-crunch-foot">{pct}% turned over</div>
    </section>
  );
}
