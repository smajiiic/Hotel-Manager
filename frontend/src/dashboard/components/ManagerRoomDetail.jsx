import './ManagerRoomDetail.css';
import DetailPanelShell from './DetailPanelShell.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { statusMeta } from '../lib/statusColors.js';
import { formatRelative } from '../../utils/formatRelative.js';

/**
 * Manager read-only room detail: current status + status change history.
 * No action controls (no set-status, checkout, or task/note creation) — the
 * manager's value is the bird's-eye picture, not operating the hotel.
 * Props: room (view model), history [{ at, by, to }], onClose.
 */
export default function ManagerRoomDetail({ room, history = [], onClose }) {
  if (!room) return null;

  return (
    <DetailPanelShell title={`Room ${room.roomNumber}`} onClose={onClose} testId="manager-room-detail">
      <div className="ibh-panel-section">
        <StatusBadge status={room.status} />
      </div>

      <div className="ibh-panel-section">
        <p className="ibh-panel-section-title">Status history</p>
        {history.length ? (
          <ul className="ibh-history">
            {history.map((h, i) => (
              <li key={`${h.at}-${i}`} className="ibh-history-item">
                <span
                  className="ibh-history-dot"
                  style={{ background: statusMeta(h.to).dot }}
                  aria-hidden="true"
                />
                <div className="ibh-history-body">
                  <div className="ibh-history-line">
                    Set to <strong>{statusMeta(h.to).label}</strong>
                  </div>
                  <div className="ibh-history-meta">
                    by {h.by} · {formatRelative(h.at)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <span className="ibh-empty-line">No recorded status changes.</span>
        )}
      </div>
    </DetailPanelShell>
  );
}
