import { useAuth } from '../hooks/useAuth.js';
import ReceptionView from './views/ReceptionView.jsx';
import CleaningView from './views/CleaningView.jsx';
import ManagerView from './views/ManagerView.jsx';

// Role-routing layer: each role does a genuinely different job, so each lands on
// its own primary view — not one screen with permission filters.
const VIEW_BY_ROLE = {
  reception: ReceptionView,
  cleaning: CleaningView,
  manager: ManagerView,
};

export default function RoleHome() {
  const { role } = useAuth();
  const View = VIEW_BY_ROLE[role];

  if (!View) {
    return (
      <section>
        <h1>Unknown role</h1>
        <p className="muted">No dashboard is configured for your account.</p>
      </section>
    );
  }

  return <View />;
}
