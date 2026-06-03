import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../hooks/useAuth';
import RoleHome from '../dashboard/RoleHome';

// Sockets are irrelevant to routing; stub the event hook so no real connection opens.
vi.mock('../hooks/useSocket', () => ({ useSocketEvent: () => {} }));

beforeEach(() => {
  // Every dashboard fetch resolves to an empty, valid envelope.
  global.fetch = vi.fn(() =>
    Promise.resolve({ ok: true, status: 200, json: async () => ({ success: true, data: [] }) })
  );
});

function renderAs(role) {
  const value = {
    user: { username: `${role}1`, role },
    role,
    isAuthenticated: true,
    verifying: false,
    login: vi.fn(),
    logout: vi.fn(),
  };
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={value}>
        <RoleHome />
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe('RoleHome — role routing', () => {
  test('reception lands on the command center (floor plan)', async () => {
    renderAs('reception');
    expect(await screen.findByTestId('reception-view')).toBeInTheDocument();
    expect(screen.queryByTestId('cleaning-view')).not.toBeInTheDocument();
    expect(screen.queryByTestId('manager-view')).not.toBeInTheDocument();
  });

  test('cleaning lands on the task queue', async () => {
    renderAs('cleaning');
    expect(await screen.findByTestId('cleaning-view')).toBeInTheDocument();
    expect(screen.queryByTestId('reception-view')).not.toBeInTheDocument();
    expect(screen.queryByTestId('manager-view')).not.toBeInTheDocument();
  });

  test('manager lands on the analytics overview', async () => {
    renderAs('manager');
    expect(await screen.findByTestId('manager-view')).toBeInTheDocument();
    expect(screen.queryByTestId('reception-view')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cleaning-view')).not.toBeInTheDocument();
  });
});
