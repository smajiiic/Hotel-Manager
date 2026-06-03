import './SettingsView.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { IconExit } from '../components/icons.jsx';

const ROLE_LABEL = { reception: 'Reception', cleaning: 'Cleaning', manager: 'Manager' };
const FONTS_KEY = 'ibh-system-fonts';

// Real account & preferences page — sign out, role, and a genuine offline-fonts
// toggle (skips the web-font download, persisted across sessions).
export default function SettingsView() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [systemFonts, setSystemFonts] = useState(
    () => typeof localStorage !== 'undefined' && localStorage.getItem(FONTS_KEY) === '1'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('ibh-system-fonts', systemFonts);
  }, [systemFonts]);

  const toggleFonts = () => {
    setSystemFonts((v) => {
      const next = !v;
      try { localStorage.setItem(FONTS_KEY, next ? '1' : '0'); } catch { /* ignore */ }
      return next;
    });
  };

  const signOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <section className="ibh-role-view" data-testid="settings-view" aria-labelledby="settings-heading">
      <h1 id="settings-heading" className="ibh-settings-title">Settings</h1>
      <p className="muted">Your account and app preferences.</p>

      <div className="ibh-settings-grid">
        <div className="ibh-settings-card">
          <h2>Account</h2>
          <dl className="ibh-settings-rows">
            <div><dt>Signed in as</dt><dd>{user?.username ?? '—'}</dd></div>
            <div><dt>Role</dt><dd>{ROLE_LABEL[role] ?? role ?? '—'}</dd></div>
          </dl>
          <button type="button" className="ibh-settings-signout" onClick={signOut}>
            <IconExit size={16} /> Sign out
          </button>
        </div>

        <div className="ibh-settings-card">
          <h2>Preferences</h2>
          <label className="ibh-settings-toggle">
            <input type="checkbox" checked={systemFonts} onChange={toggleFonts} />
            <span>
              <strong>Use system fonts</strong>
              <span>Skip the web-font download — faster, and works offline.</span>
            </span>
          </label>
        </div>
      </div>
    </section>
  );
}
