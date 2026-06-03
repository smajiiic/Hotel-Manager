import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CleaningView from '../dashboard/views/CleaningView';

vi.mock('../hooks/useSocket', () => ({ useSocketEvent: () => {} }));

const ROOMS = [
  { _id: 'rm_103', roomNumber: 103, status: 'needs-cleaning' },
  { _id: 'rm_105', roomNumber: 105, status: 'available' },
];
const TASKS = [{ _id: 'tc', roomId: 103, description: 'Clean room 103', status: 'pending', createdAt: new Date().toISOString() }];
const REQUESTS = [];

const ok = (data, status = 200) => Promise.resolve({ ok: true, status, json: async () => ({ success: true, data }) });

function makeFetch() {
  return vi.fn((url, opts = {}) => {
    const u = String(url);
    const m = (opts.method || 'GET').toUpperCase();
    if (m === 'PATCH' && /\/api\/tasks\/[^/]+\/complete$/.test(u)) return ok({ _id: 'tc', status: 'completed' });
    if (m === 'PUT' && /\/api\/rooms\/[^/]+\/status$/.test(u)) return ok({ ...ROOMS[0], status: JSON.parse(opts.body).status });
    if (m === 'GET' && /\/api\/rooms$/.test(u)) return ok(ROOMS);
    if (m === 'GET' && /\/api\/tasks$/.test(u)) return ok(TASKS);
    if (m === 'GET' && /\/api\/requests$/.test(u)) return ok(REQUESTS);
    return ok([]);
  });
}

const renderCleaning = () => render(<MemoryRouter><CleaningView /></MemoryRouter>);
const calls = (re, method) =>
  global.fetch.mock.calls.filter((c) => re.test(String(c[0])) && (c[1]?.method || 'GET').toUpperCase() === method);

beforeEach(() => vi.clearAllMocks());

describe('CleaningView — queue', () => {
  test('shows the loading state first', () => {
    global.fetch = vi.fn(() => new Promise(() => {}));
    renderCleaning();
    expect(screen.getByText(/loading your queue/i)).toBeInTheDocument();
  });

  test('renders queue items and exposes no checkout or create controls', async () => {
    global.fetch = makeFetch();
    renderCleaning();
    const queue = await screen.findByTestId('task-queue');

    expect(within(queue).getByText('Clean room 103')).toBeInTheDocument();
    expect(within(queue).getByRole('button', { name: 'Mark complete' })).toBeInTheDocument();

    // On the queue tab the action panel is by construction not mounted — these
    // guard against checkout/create chrome accidentally rendering view-wide.
    // (Panel-level suppression is proven in the floor-plan-tab test below.)
    expect(screen.queryByTestId('checkout-button')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '+ Task' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '+ Note' })).not.toBeInTheDocument();
  });

  test('shows an error state when a fetch fails', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, status: 200, json: async () => ({ success: false, error: 'boom' }) }));
    renderCleaning();
    expect(await screen.findByText(/could not load your work/i)).toBeInTheDocument();
  });

  test('Mark complete calls PATCH /api/tasks/:id/complete', async () => {
    global.fetch = makeFetch();
    renderCleaning();
    const queue = await screen.findByTestId('task-queue');
    await userEvent.click(within(queue).getByRole('button', { name: 'Mark complete' }));

    await waitFor(() => expect(calls(/\/api\/tasks\/tc\/complete$/, 'PATCH')).toHaveLength(1));
  });
});

describe('CleaningView — floor plan tab', () => {
  test('room panel is limited to Available, with no checkout/create and no guest', async () => {
    global.fetch = makeFetch();
    renderCleaning();
    await screen.findByTestId('task-queue');

    await userEvent.click(screen.getByRole('tab', { name: 'Floor plan' }));
    fireEvent.click(await screen.findByTestId('room-103'));
    const panel = await screen.findByTestId('room-detail-panel');

    expect(within(panel).getByRole('button', { name: 'Available' })).toBeInTheDocument();
    expect(within(panel).queryByRole('button', { name: 'Occupied' })).not.toBeInTheDocument();
    expect(within(panel).queryByRole('button', { name: 'Needs Cleaning' })).not.toBeInTheDocument();
    expect(within(panel).queryByTestId('checkout-button')).not.toBeInTheDocument();
    expect(within(panel).queryByRole('button', { name: '+ Task' })).not.toBeInTheDocument();

    // The real no-guest guarantee at this level: cleaning NEVER fetches bookings,
    // so guest data has no path into the view at all. (Suppression-when-present is
    // proven in RoomDetailPanel.test.jsx with showGuest=false + a booking.)
    expect(global.fetch.mock.calls.some((c) => /\/api\/bookings/.test(String(c[0])))).toBe(false);
  });
});
