import './AppShell.css';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

const ROLE_LABEL = {
  reception: 'Reception',
  cleaning: 'Cleaning',
  manager: 'Manager',
};

// Shared shell for all three role dashboards: brand + role indicator + avatar.
export default function AppShell() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const initial = (user?.username?.charAt(0) ?? '?').toUpperCase();

  return (
    <div className="ibh-shell">
      <header className="ibh-shell-header">
        <span className="ibh-shell-brand">
          <span className="ibh-shell-brand-mark" aria-hidden="true">IB</span>
          Isa Begov Hamam
        </span>

        <div className="ibh-shell-right">
          {role && (
            <span className="ibh-role-pill" data-testid="role-indicator">
              {ROLE_LABEL[role] ?? role}
            </span>
          )}
          {user && (
            <div className="ibh-shell-user">
              <span className="ibh-avatar" aria-hidden="true">{initial}</span>
              <span className="ibh-shell-username">{user.username}</span>
            </div>
          )}
          <button type="button" className="ibh-shell-signout" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </header>

      <main className="ibh-shell-main">
        <Outlet />
      </main>
    </div>
  );
}
