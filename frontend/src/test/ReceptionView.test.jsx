import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ReceptionView from '../dashboard/views/ReceptionView';

vi.mock('../hooks/useSocket', () => ({ useSocketEvent: () => {} }));

const ROOM101 = { _id: 'rm_101', roomNumber: 101, status: 'occupied' };
const ROOMS = [ROOM101, { _id: 'rm_102', roomNumber: 102, status: 'available' }];
const TASKS = [{ _id: 't1', roomId: 101, description: 'Replace towels', status: 'pending', createdAt: new Date().toISOString() }];
const REQUESTS = [{ _id: 'q1', roomId: 101, note: 'VIP guest', resolved: false, createdAt: new Date().toISOString() }];
const BOOKINGS = [{ _id: 'b1', guestName: 'Ana Kovač', roomId: 101, checkIn: '2026-06-01', checkOut: '2026-06-03', occupancyStatus: 'checked-in' }];

const ok = (data, status = 200) => Promise.resolve({ ok: true, status, json: async () => ({ success: true, data }) });

function makeFetch({ checkoutHangs = false } = {}) {
  return vi.fn((url, opts = {}) => {
    const u = String(url);
    const m = (opts.method || 'GET').toUpperCase();
    if (m === 'PUT' && /\/api\/rooms\/[^/]+\/status$/.test(u)) return ok({ ...ROOM101, status: JSON.parse(opts.body).status });
    if (m === 'POST' && /\/api\/rooms\/[^/]+\/checkout$/.test(u)) return checkoutHangs ? new Promise(() => {}) : ok({ room: { ...ROOM101, status: 'needs-cleaning' }, booking: null });
    if (m === 'POST' && /\/api\/tasks$/.test(u)) return ok({ _id: 'tNew', ...JSON.parse(opts.body), status: 'pending' }, 201);
    if (m === 'POST' && /\/api\/requests$/.test(u)) return ok({ _id: 'qNew', ...JSON.parse(opts.body), resolved: false }, 201);
    if (m === 'GET' && /\/api\/rooms$/.test(u)) return ok(ROOMS);
    if (m === 'GET' && /\/api\/tasks$/.test(u)) return ok(TASKS);
    if (m === 'GET' && /\/api\/requests$/.test(u)) return ok(REQUESTS);
    if (m === 'GET' && /\/api\/bookings$/.test(u)) return ok(BOOKINGS);
    return ok([]);
  });
}

const renderReception = () => render(<MemoryRouter><ReceptionView /></MemoryRouter>);
const calls = (re, method) =>
  global.fetch.mock.calls.filter((c) => re.test(String(c[0])) && (c[1]?.method || 'GET').toUpperCase() === method);

async function openRoom101() {
  fireEvent.click(await screen.findByTestId('room-101'));
  return screen.findByTestId('room-detail-panel');
}

beforeEach(() => vi.clearAllMocks());

describe('ReceptionView — loading & error', () => {
  test('shows loading state before data arrives', () => {
    global.fetch = vi.fn(() => new Promise(() => {}));
    renderReception();
    expect(screen.getByText(/loading the hotel/i)).toBeInTheDocument();
  });

  test('shows an error state when a fetch fails', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, status: 200, json: async () => ({ success: false, error: 'Server boom' }) }));
    renderReception();
    expect(await screen.findByText(/could not load the floor plan/i)).toBeInTheDocument();
  });
});

describe('ReceptionView — status change', () => {
  test('set-status calls PUT /api/rooms/:_id/status with the room _id', async () => {
    global.fetch = makeFetch();
    renderReception();
    const panel = await openRoom101();
    await userEvent.click(within(panel).getByRole('button', { name: 'Needs Cleaning' }));

    await waitFor(() => {
      const put = calls(/\/api\/rooms\/rm_101\/status$/, 'PUT');
      expect(put).toHaveLength(1);
      expect(JSON.parse(put[0][1].body).status).toBe('needs-cleaning');
    });
  });
});

describe('ReceptionView — checkout', () => {
  test('checkout is gated by ConfirmModal: no call until confirmed, then POST /checkout', async () => {
    global.fetch = makeFetch();
    renderReception();
    const panel = await openRoom101();

    await userEvent.click(within(panel).getByTestId('checkout-button'));
    // Confirm dialog up, but no checkout call yet
    expect(screen.getByText('Check out room?')).toBeInTheDocument();
    expect(calls(/\/checkout$/, 'POST')).toHaveLength(0);

    await userEvent.click(screen.getByRole('button', { name: /^check out$/i }));
    await waitFor(() => expect(calls(/\/api\/rooms\/rm_101\/checkout$/, 'POST')).toHaveLength(1));
  });

  test('double-submit guard: a second confirm click while in-flight fires only one POST', async () => {
    global.fetch = makeFetch({ checkoutHangs: true });
    renderReception();
    const panel = await openRoom101();

    await userEvent.click(within(panel).getByTestId('checkout-button'));
    const confirm = screen.getByRole('button', { name: /^check out$/i });
    await userEvent.click(confirm);
    await userEvent.click(confirm); // in-flight; should be ignored

    expect(calls(/\/checkout$/, 'POST')).toHaveLength(1);
  });
});

describe('ReceptionView — create task / note', () => {
  test('+Task posts to /api/tasks with roomId = roomNumber', async () => {
    global.fetch = makeFetch();
    renderReception();
    const panel = await openRoom101();

    await userEvent.click(within(panel).getByRole('button', { name: '+ Task' }));
    await userEvent.type(within(panel).getByLabelText('Add task'), 'Fix lamp');
    await userEvent.click(within(panel).getByRole('button', { name: 'Add task' }));

    await waitFor(() => {
      const post = calls(/\/api\/tasks$/, 'POST');
      expect(post).toHaveLength(1);
      const body = JSON.parse(post[0][1].body);
      expect(body).toMatchObject({ description: 'Fix lamp', roomId: 101 });
    });
  });

  test('+Note posts to /api/requests with roomId = roomNumber', async () => {
    global.fetch = makeFetch();
    renderReception();
    const panel = await openRoom101();

    await userEvent.click(within(panel).getByRole('button', { name: '+ Note' }));
    await userEvent.type(within(panel).getByLabelText('Add note'), 'Bring towels');
    await userEvent.click(within(panel).getByRole('button', { name: 'Add note' }));

    await waitFor(() => {
      const post = calls(/\/api\/requests$/, 'POST');
      expect(post).toHaveLength(1);
      const body = JSON.parse(post[0][1].body);
      expect(body).toMatchObject({ note: 'Bring towels', roomId: 101 });
    });
  });
});
