import './Sidebar.css';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import {
  IconFloorPlan, IconTasks, IconPerson, IconNotes,
  IconReports, IconSettings, IconCollapse,
} from './icons.jsx';

// Every item routes to a real page. `roles` gates visibility. The home ("/")
// renders role-appropriately (RoleHome): the manager leads with "Reports" (their
// analytics + heatmap is their home), while reception/cleaning lead with the
// "Floor plan". Reception has no Reports.
const NAV = [
  { key: 'reports', label: 'Reports', Icon: IconReports, to: '/', end: true, roles: ['manager'] },
  { key: 'floorplan', label: 'Rooms', Icon: IconFloorPlan, to: '/', end: true, roles: ['reception', 'cleaning'] },
  { key: 'guests', label: 'Bookings', Icon: IconPerson, to: '/guests', roles: ['reception', 'manager'] },
  { key: 'tasks', label: 'Tasks', Icon: IconTasks, to: '/tasks', badge: true, roles: ['reception', 'cleaning', 'manager'] },
  { key: 'notes', label: 'Requests', Icon: IconNotes, to: '/requests', roles: ['reception', 'cleaning', 'manager'] },
  { key: 'settings', label: 'Settings', Icon: IconSettings, to: '/settings', roles: ['reception', 'cleaning', 'manager'] },
];

function BrandMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 3c5 0 8 4 8 9v14H8V12c0-5 3-9 8-9z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 8c2.2 0 3.5 2 3.5 4.5V26h-7V12.5C12.5 10 13.8 8 16 8z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 26h20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function Sidebar({ open = false, collapsed = false, taskBadge = 0, onNavigate, onToggleCollapse }) {
  const { role } = useAuth();
  const items = NAV.filter((n) => !role || n.roles.includes(role));

  return (
    <aside
      id="ibh-sidebar"
      className={`ibh-sidebar ${open ? 'is-open' : ''} ${collapsed ? 'is-collapsed' : ''}`}
      aria-label="Main navigation"
      role={open ? 'dialog' : undefined}
      aria-modal={open ? 'true' : undefined}
    >
      <div className="ibh-sidebar-brand">
        <span className="ibh-brand-mark"><BrandMark /></span>
        <span className="ibh-brand-name">ISA BEGOV<br />HAMAM</span>
      </div>

      <nav className="ibh-nav" aria-label="Primary">
        {items.map(({ key, label, Icon, to, end, badge }) => (
          <NavLink
            key={key}
            to={to}
            end={end}
            onClick={onNavigate}
            title={label}
            className={({ isActive }) => `ibh-nav-item ${isActive ? 'is-active' : ''}`}
          >
            <Icon size={20} />
            <span className="ibh-nav-label">{label}</span>
            {badge && taskBadge > 0 && <span className="ibh-nav-badge">{taskBadge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="ibh-sidebar-foot">
        <div className="ibh-sync">
          <span className="ibh-sync-dot" aria-hidden="true" />
          <span className="ibh-sync-text">
            <strong>Sync status</strong>
            <span>All up to date</span>
          </span>
        </div>
        <button
          type="button"
          className="ibh-collapse"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <IconCollapse size={16} />
          <span className="ibh-collapse-label">Collapse</span>
        </button>
      </div>
    </aside>
  );
}
