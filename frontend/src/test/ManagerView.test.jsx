import { render, screen, within } from '@testing-library/react';
import ManagerView from '../dashboard/views/ManagerView';
import { getManagerMetrics } from '../dashboard/data/managerMetrics';

vi.mock('../hooks/useSocket', () => ({ useSocketEvent: () => {} }));

// 15 rooms: 3 occupied, 2 needs-cleaning, 10 available → occupancy 20%, mix 3·10·2
const ROOMS = Array.from({ length: 15 }, (_, i) => ({
  _id: `rm_${101 + i}`,
  roomNumber: 101 + i,
  status: i < 3 ? 'occupied' : i < 5 ? 'needs-cleaning' : 'available',
}));
// 5 tasks: 2 completed, 3 pending → "2 done", "3 outstanding · 40% complete"
const TASKS = [
  { _id: 't1', roomId: 101, status: 'completed', createdAt: new Date().toISOString() },
  { _id: 't2', roomId: 102, status: 'completed', createdAt: new Date().toISOString() },
  { _id: 't3', roomId: 103, status: 'pending', createdAt: new Date().toISOString() },
  { _id: 't4', roomId: 104, status: 'pending', createdAt: new Date().toISOString() },
  { _id: 't5', roomId: 105, status: 'pending', createdAt: new Date().toISOString() },
];
// 2 unresolved notes
const REQUESTS = [
  { _id: 'q1', roomId: 101, note: 'A', resolved: false, createdAt: new Date().toISOString() },
  { _id: 'q2', roomId: 102, note: 'B', resolved: false, createdAt: new Date().toISOString() },
];

const ok = (data) => Promise.resolve({ ok: true, status: 200, json: async () => ({ success: true, data }) });

beforeEach(() => {
  global.fetch = vi.fn((url) => {
    const u = String(url);
    if (/\/api\/rooms$/.test(u)) return ok(ROOMS);
    if (/\/api\/tasks$/.test(u)) return ok(TASKS);
    if (/\/api\/requests$/.test(u)) return ok(REQUESTS);
    return ok([]);
  });
});

describe('ManagerView — cards reflect live rooms / tasks / notes', () => {
  test('checkout-crunch hero renders the shaped (mock) readiness figures', async () => {
    render(<ManagerView />);
    const crunch = await screen.findByTestId('checkout-crunch');
    const m = getManagerMetrics().checkoutCrunch;

    expect(within(crunch).getByText('Checkout crunch readiness')).toBeInTheDocument();
    expect(
      within(crunch).getByText((_, el) => {
        const t = el?.textContent?.replace(/\s+/g, ' ') ?? '';
        return (
          el?.classList?.contains('ibh-crunch-headline') &&
          t.includes(`${m.due} due`) &&
          t.includes(`${m.ready} ready`) &&
          t.includes(`${m.remaining} remaining`)
        );
      })
    ).toBeInTheDocument();
  });

  test('lead cards show the live task + note backlog', async () => {
    render(<ManagerView />);
    await screen.findByTestId('checkout-crunch');

    // 2 completed of 5 tasks
    expect(within(screen.getByTestId('metric-tasks')).getByText('2 done')).toBeInTheDocument();
    expect(within(screen.getByTestId('metric-tasks')).getByText(/3 outstanding .* 40% complete/)).toBeInTheDocument();
    // 2 unresolved notes
    expect(within(screen.getByTestId('metric-requests')).getByText('2')).toBeInTheDocument();
  });

  test('secondary tiles show live occupancy + status mix (matching the rooms)', async () => {
    render(<ManagerView />);
    await screen.findByTestId('checkout-crunch');

    // 3 occupied of 15 → 20%
    expect(within(screen.getByTestId('metric-occupancy')).getByText('20%')).toBeInTheDocument();
    expect(within(screen.getByTestId('metric-occupancy')).getByText('3 of 15 rooms')).toBeInTheDocument();
    // occupied · available · needs-cleaning
    expect(within(screen.getByTestId('metric-mix')).getByText('3 · 10 · 2')).toBeInTheDocument();
  });

  test('does not render the tasks-completed chart', async () => {
    render(<ManagerView />);
    await screen.findByTestId('checkout-crunch');
    expect(screen.queryByText('Tasks completed through the day')).not.toBeInTheDocument();
  });

  test('renders the floor plan as a read-only heatmap (no interactive affordance)', async () => {
    render(<ManagerView />);
    const room = await screen.findByTestId('room-101');
    expect(room.getAttribute('class')).not.toContain('is-interactive');
  });
});
