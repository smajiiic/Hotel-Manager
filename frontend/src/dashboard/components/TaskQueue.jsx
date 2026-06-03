import './TaskQueue.css';
import EmptyState from '../../components/EmptyState.jsx';
import { formatRelative } from '../../utils/formatRelative.js';

function tierClass(item) {
  if (item.isTurnover) return 'tier-turnover';
  if (item.isCleaning) return 'tier-cleaning';
  return 'tier-general';
}

/**
 * Prioritized cleaning queue (presentational).
 * Props:
 *  - items: from buildCleaningQueue()
 *  - busyIds: Set of item ids with an in-flight action
 *  - error: string | null (action error banner)
 *  - onComplete(item), onSetAvailable(item)
 */
export default function TaskQueue({ items = [], busyIds = new Set(), error = null, onComplete, onSetAvailable }) {
  return (
    <div data-testid="task-queue">
      {error && <div className="ibh-queue-error" role="alert">{error}</div>}
      {items.length === 0 ? (
        <EmptyState message="All caught up — no open tasks right now." />
      ) : (
        <ul className="ibh-queue">
          {items.map((item) => {
            const busy = busyIds.has(item.id);
            const showComplete = item.type === 'task';
            // "Set available" lives only on the synthetic needs-cleaning room item,
            // so a room never shows two flip buttons. Cleaning tasks use Mark
            // complete (which auto-flips the room) instead.
            const showSetAvailable = item.type === 'room' && Boolean(item.roomId);

            return (
            <li
              key={item.id}
              className={`ibh-queue-item ${tierClass(item)}`}
              data-testid={`queue-item-${item.id}`}
            >
              <div className="ibh-queue-main">
                <div className="ibh-queue-room">Room {item.roomNumber}</div>
                <div className="ibh-queue-title">{item.title}</div>
                <div className="ibh-queue-tags">
                  {item.isTurnover && <span className="ibh-tag tag-turnover">Checkout turnover</span>}
                  {item.isCleaning && !item.isTurnover && <span className="ibh-tag tag-cleaning">Cleaning</span>}
                  {item.since && <span className="ibh-queue-since">{formatRelative(item.since)}</span>}
                </div>
              </div>

              <div className="ibh-queue-actions">
                {showComplete && (
                  <button
                    type="button"
                    className="ibh-complete-btn"
                    disabled={busy}
                    onClick={() => onComplete(item)}
                  >
                    {busy ? 'Working…' : 'Mark complete'}
                  </button>
                )}
                {showSetAvailable && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onSetAvailable(item)}
                  >
                    {busy ? 'Working…' : 'Set available'}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      )}
    </div>
  );
}
