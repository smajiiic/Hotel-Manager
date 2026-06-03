import './TopBar.css';
import { useEffect, useRef, useState } from 'react';
import {
  IconPerson, IconBroom, IconReports, IconBell, IconFloorPlan,
  IconSettings, IconExit, IconChevronRight,
} from './icons.jsx';

const ROLE_LABEL = { reception: 'Reception', cleaning: 'Cleaning', manager: 'Manager' };
const ROLE_ICON = { reception: IconPerson, cleaning: IconBroom, manager: IconReports };

export default function TopBar({
  subtitle, role, user, drawerOpen = false,
  notifications = [], onNotification, onLogout, onSettings, onMenu,
}) {
  const [acctOpen, setAcctOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const rightRef = useRef(null);

  useEffect(() => {
    if (!acctOpen && !bellOpen) return;
    const onClick = (e) => { if (rightRef.current && !rightRef.current.contains(e.target)) { setAcctOpen(false); setBellOpen(false); } };
    const onKey = (e) => { if (e.key === 'Escape') { setAcctOpen(false); setBellOpen(false); } };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); };
  }, [acctOpen, bellOpen]);

  const initial = (user?.username?.charAt(0) ?? '?').toUpperCase();
  const RoleIcon = ROLE_ICON[role] ?? IconPerson;
  const count = notifications.length;
  const shown = notifications.slice(0, 8);
  const toggleAcct = () => { setBellOpen(false); setAcctOpen((o) => !o); };
  const toggleBell = () => { setAcctOpen(false); setBellOpen((o) => !o); };
  const pick = (item) => { setBellOpen(false); onNotification?.(item); };

  return (
    <header className="ibh-topbar">
      <div className="ibh-topbar-left">
        <button
          type="button"
          id="ibh-hamburger"
          className="ibh-hamburger"
          aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={drawerOpen}
          aria-controls="ibh-sidebar"
          onClick={onMenu}
        >
          <IconFloorPlan size={22} />
        </button>
        <div>
          <h1 className="ibh-topbar-title">Isa Begov Hamam — Service Tracker</h1>
          {subtitle && <p className="ibh-topbar-sub">{subtitle}</p>}
        </div>
      </div>

      <div className="ibh-topbar-right" ref={rightRef}>
        {/* Static role indicator — not a control */}
        <span className="ibh-role-pill" aria-label={`Signed-in role: ${ROLE_LABEL[role] ?? role}`}>
          <RoleIcon size={18} />
          <span className="ibh-role-pill-label">{ROLE_LABEL[role] ?? role ?? 'Role'}</span>
        </span>

        <button type="button" className="ibh-bell" aria-label={`Notifications (${count})`} aria-haspopup="menu" aria-expanded={bellOpen} onClick={toggleBell}>
          <IconBell size={22} />
          {count > 0 && <span className="ibh-bell-badge">{count > 9 ? '9+' : count}</span>}
        </button>

        <button type="button" className="ibh-avatar" aria-haspopup="menu" aria-expanded={acctOpen} onClick={toggleAcct}>
          {initial}
          <span className="ibh-avatar-online" aria-hidden="true" />
        </button>

        {bellOpen && (
          <div className="ibh-menu ibh-bell-menu" role="menu">
            <div className="ibh-menu-head">Needs attention · {count}</div>
            {shown.length === 0 ? (
              <div className="ibh-menu-empty">All clear — nothing needs attention.</div>
            ) : (
              shown.map((item) => (
                <button key={item.id} type="button" role="menuitem" className="ibh-menu-item" onClick={() => pick(item)}>
                  <span className={`ibh-menu-dot type-${item.type}`} aria-hidden="true" />
                  <span className="ibh-menu-item-label">{item.label}</span>
                  <IconChevronRight size={15} />
                </button>
              ))
            )}
            {count > shown.length && <div className="ibh-menu-more">+{count - shown.length} more</div>}
          </div>
        )}

        {acctOpen && (
          <div className="ibh-menu ibh-acct-menu" role="menu">
            <div className="ibh-menu-head">{user?.username} · {ROLE_LABEL[role] ?? role}</div>
            <button type="button" role="menuitem" className="ibh-menu-item" onClick={() => { setAcctOpen(false); onSettings?.(); }}>
              <IconSettings size={16} /> <span className="ibh-menu-item-label">Settings</span>
            </button>
            <button type="button" role="menuitem" className="ibh-menu-item" onClick={() => { setAcctOpen(false); onLogout?.(); }}>
              <IconExit size={16} /> <span className="ibh-menu-item-label">Sign out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
