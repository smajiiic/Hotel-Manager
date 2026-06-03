import './AppShell.css';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import { DashboardContext } from '../DashboardContext.jsx';
import { useNotifications } from '../hooks/useNotifications.js';

// Floor-plan home subtitle is role-specific; other sections name themselves.
const HOME_SUBTITLE = {
  reception: 'Rooms · 15 rooms',
  cleaning: 'Task queue',
  manager: 'Operations overview',
};
const SECTION_SUBTITLE = {
  '/tasks': 'Tasks',
  '/requests': 'Requests',
  '/guests': 'Bookings',
  '/settings': 'Settings',
};

// Three-zone shell with a two-state layout: by default just sidebar + full-width
// plan; selecting a room slides the rail in and collapses the sidebar to icons.
// A fullscreen "booking mode" hides the chrome to show only plan + rail.
export default function AppShell() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const onFloorPlan = location.pathname === '/';

  const [selectedNumber, setSelectedNumber] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [userCollapsed, setUserCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { items: notifications } = useNotifications();
  const openTaskCount = notifications.filter((n) => n.type === 'task').length;

  // The room rail + booking mode only make sense on the floor plan. Clear them
  // when navigating to another section — done as a render-time state adjustment
  // (React's sanctioned alternative to a setState-in-effect) so the rail never
  // bleeds across pages.
  const [railPath, setRailPath] = useState(location.pathname);
  if (location.pathname !== railPath) {
    setRailPath(location.pathname);
    if (!onFloorPlan) {
      if (selectedNumber != null) setSelectedNumber(null);
      if (fullscreen) setFullscreen(false);
    }
  }

  const roomSelected = selectedNumber != null;
  const collapsed = roomSelected || userCollapsed;
  const subtitle = onFloorPlan ? (HOME_SUBTITLE[role] ?? '') : (SECTION_SUBTITLE[location.pathname] ?? '');

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }); };

  // Escape exits fullscreen — but only when no room rail is open (the rail
  // handles its own Escape to close first).
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e) => { if (e.key === 'Escape' && selectedNumber == null) setFullscreen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen, selectedNumber]);

  // Mobile drawer: Escape closes; focus into the drawer on open, back to the hamburger on close.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    document.querySelector('#ibh-sidebar a, #ibh-sidebar button')?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.getElementById('ibh-hamburger')?.focus();
    };
  }, [menuOpen]);

  const ctx = { selectedNumber, setSelectedNumber, fullscreen, setFullscreen };

  const shellClass = ['ibh-shell',
    collapsed ? 'is-collapsed' : '',
    roomSelected ? 'is-room-selected' : '',
    fullscreen ? 'is-fullscreen' : '',
  ].filter(Boolean).join(' ');

  const handleNotification = (item) => {
    if (item.type === 'task') {
      navigate('/tasks');
    } else {
      setSelectedNumber(item.roomNumber);
      navigate('/');
    }
  };

  return (
    <DashboardContext.Provider value={ctx}>
      <div className={shellClass}>
        <Sidebar
          open={menuOpen}
          collapsed={collapsed}
          taskBadge={openTaskCount}
          onNavigate={closeMenu}
          onToggleCollapse={() => setUserCollapsed((c) => !c)}
        />
        {menuOpen && <div className="ibh-shell-scrim" onClick={closeMenu} aria-hidden="true" />}

        <TopBar
          subtitle={subtitle}
          role={role}
          user={user}
          drawerOpen={menuOpen}
          notifications={notifications}
          onNotification={handleNotification}
          onLogout={handleLogout}
          onSettings={() => navigate('/settings')}
          onMenu={() => setMenuOpen((o) => !o)}
        />

        <main className="ibh-shell-content">
          <Outlet />
        </main>
      </div>
    </DashboardContext.Provider>
  );
}
