import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookingsPage from '../pages/BookingsPage';

const offsetFromToday = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('sv-SE');
};

const mockRooms = [
  { _id: 'rm_1', roomNumber: 101, status: 'available' },
  { _id: 'rm_2', roomNumber: 102, status: 'occupied' },
  { _id: 'rm_3', roomNumber: 105, status: 'occupied' },
];

// Intentionally out of date order — page should sort by checkIn ascending.
const mockBookings = [
  { _id: 'b_3', guestName: 'Sara Petrović', roomId: 'rm_3', checkIn: offsetFromToday(3), checkOut: offsetFromToday(6), occupancyStatus: 'confirmed'   },
  { _id: 'b_1', guestName: 'Ana Kovač',     roomId: 'rm_2', checkIn: offsetFromToday(0), checkOut: offsetFromToday(3), occupancyStatus: 'checked-in'  },
  { _id: 'b_2', guestName: 'Emir Hadžić',   roomId: 'rm_1', checkIn: offsetFromToday(1), checkOut: offsetFromToday(4), occupancyStatus: 'confirmed'   },
];

// `ok: true` is required because api/client.js checks `res.ok` before
// unwrapping the {success, data} envelope.
function ok(payload) {
  return { ok: true, status: 200, json: async () => payload };
}

function mockFetchSuccess(bookings = mockBookings, rooms = mockRooms) {
  global.fetch = vi.fn((url) => {
    const u = String(url);
    if (u.includes('/api/bookings')) return Promise.resolve(ok({ success: true, data: bookings }));
    if (u.includes('/api/rooms'))    return Promise.resolve(ok({ success: true, data: rooms }));
    return Promise.reject(new Error('Unexpected URL: ' + u));
  });
}

function mockFetchFailure() {
  global.fetch = vi.fn().mockResolvedValue(ok({ success: false, error: 'Server error' }));
}

function mockFetchNetworkError() {
  global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
}

beforeEach(() => vi.clearAllMocks());

describe('BookingsPage — initial load', () => {
  test('shows loading state before data arrives', () => {
    global.fetch = vi.fn(() => new Promise(() => {})); // never resolves
    render(<BookingsPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('renders all bookings after successful fetch', async () => {
    mockFetchSuccess();
    render(<BookingsPage />);
    await waitFor(() => expect(screen.getByText('Ana Kovač')).toBeInTheDocument());
    expect(screen.getByText('Emir Hadžić')).toBeInTheDocument();
    expect(screen.getByText('Sara Petrović')).toBeInTheDocument();
  });

  test('sorts bookings by checkIn date ascending', async () => {
    mockFetchSuccess();
    render(<BookingsPage />);
    await waitFor(() => screen.getByText('Ana Kovač'));

    // mockBookings is intentionally out of order — sorted order should be
    // Ana (offset 0) → Emir (offset 1) → Sara (offset 3).
    const guestEls = screen.getAllByText(/Ana Kovač|Emir Hadžić|Sara Petrović/);
    const names = guestEls.map((el) => el.textContent);
    expect(names).toEqual(['Ana Kovač', 'Emir Hadžić', 'Sara Petrović']);
  });

  test('looks up the room number via roomId from the rooms payload', async () => {
    mockFetchSuccess();
    render(<BookingsPage />);
    await waitFor(() => screen.getByText('Ana Kovač'));

    // Ana's booking has roomId 'rm_2', which maps to roomNumber 102.
    expect(screen.getByText('Room 102')).toBeInTheDocument();
  });

  test('shows empty state when API returns no bookings', async () => {
    mockFetchSuccess([], mockRooms);
    render(<BookingsPage />);
    await waitFor(() => expect(screen.getByText(/no upcoming bookings/i)).toBeInTheDocument());
  });
});

describe('BookingsPage — error handling', () => {
  test('shows error message when API returns success: false', async () => {
    mockFetchFailure();
    render(<BookingsPage />);
    await waitFor(() => expect(screen.getByText(/server error/i)).toBeInTheDocument());
  });

  test('shows error message on network failure', async () => {
    mockFetchNetworkError();
    render(<BookingsPage />);
    await waitFor(() => expect(screen.getByText(/network error/i)).toBeInTheDocument());
  });

  test('retry button refetches and recovers from error', async () => {
    mockFetchNetworkError();
    render(<BookingsPage />);
    await waitFor(() => screen.getByText(/network error/i));

    mockFetchSuccess();
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => expect(screen.getByText('Ana Kovač')).toBeInTheDocument());
  });
});
