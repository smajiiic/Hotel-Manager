import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../hooks/useAuth.js';
import DashboardPage from '../pages/DashboardPage.jsx';

const offsetFromToday = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('sv-SE');
};

const mockRooms = [
  { _id: 'rm_1', roomNumber: 101, status: 'available' },
  { _id: 'rm_2', roomNumber: 102, status: 'available' },
  { _id: 'rm_3', roomNumber: 103, status: 'occupied' },
  { _id: 'rm_4', roomNumber: 104, status: 'occupied' },
  { _id: 'rm_5', roomNumber: 105, status: 'occupied' },
  { _id: 'rm_6', roomNumber: 106, status: 'needs-cleaning' },
];

const mockBookings = [
  { _id: 'b_1', guestName: 'Ana',   roomId: 'rm_1', checkIn: offsetFromToday(0),  checkOut: offsetFromToday(3),  occupancyStatus: 'checked-in' },
  { _id: 'b_2', guestName: 'Emir',  roomId: 'rm_2', checkIn: offsetFromToday(0),  checkOut: offsetFromToday(2),  occupancyStatus: 'checked-in' },
  { _id: 'b_3', guestName: 'Sara',  roomId: 'rm_3', checkIn: offsetFromToday(-2), checkOut: offsetFromToday(0),  occupancyStatus: 'checked-in' },
  { _id: 'b_4', guestName: 'Damir', roomId: 'rm_4', checkIn: offsetFromToday(5),  checkOut: offsetFromToday(8),  occupancyStatus: 'confirmed' },
];

function ok(payload) {
  return { ok: true, status: 200, json: async () => payload };
}

function mockFetchSuccess(rooms = mockRooms, bookings = mockBookings) {
  global.fetch = vi.fn((url) => {
    const u = String(url);
    if (u.includes('/api/rooms'))    return Promise.resolve(ok({ success: true, data: rooms }));
    if (u.includes('/api/bookings')) return Promise.resolve(ok({ success: true, data: bookings }));
    return Promise.reject(new Error('Unexpected URL: ' + u));
  });
}

function mockFetchFailure() {
  global.fetch = vi.fn().mockResolvedValue(ok({ success: false, error: 'Server error' }));
}

function mockFetchNetworkError() {
  global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
}

const fakeAuth = {
  user: { username: 'admin', role: 'manager' },
  role: 'manager',
  verifying: false,
  login: vi.fn(),
  logout: vi.fn(),
};

function renderDashboard(authValue = fakeAuth) {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={authValue}>
        <DashboardPage />
      </AuthContext.Provider>
    </BrowserRouter>
  );
}

beforeEach(() => vi.clearAllMocks());

describe('DashboardPage — initial load', () => {
  test('shows loading state before data arrives', () => {
    global.fetch = vi.fn(() => new Promise(() => {}));
    renderDashboard();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('renders welcome message with username from auth', async () => {
    mockFetchSuccess();
    renderDashboard();
    await waitFor(() => expect(screen.getByText(/welcome back, admin/i)).toBeInTheDocument());
  });

  test('renders all four module cards', async () => {
    mockFetchSuccess();
    renderDashboard();
    await waitFor(() => screen.getByText(/^Rooms$/i));

    expect(screen.getByText(/^Rooms$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Bookings$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Tasks$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Requests$/i)).toBeInTheDocument();
  });
});

describe('DashboardPage — rooms summary', () => {
  test('counts rooms by status correctly', async () => {
    mockFetchSuccess();
    renderDashboard();
    await waitFor(() => screen.getByText(/available/i));

    // mockRooms has 2 available, 3 occupied, 1 needs-cleaning, 6 total
    expect(screen.getByText('6')).toBeInTheDocument(); // total rooms
    expect(screen.getByText('Available').nextSibling.textContent).toBe('2');
    expect(screen.getByText('Occupied').nextSibling.textContent).toBe('3');
    expect(screen.getByText('Needs cleaning').nextSibling.textContent).toBe('1');
  });

  test('handles empty rooms array without crashing', async () => {
    mockFetchSuccess([], mockBookings);
    renderDashboard();
    await waitFor(() => screen.getByText(/available/i));

    expect(screen.getByText('Available').nextSibling.textContent).toBe('0');
    expect(screen.getByText('Occupied').nextSibling.textContent).toBe('0');
  });
});

describe('DashboardPage — bookings summary', () => {
  test('counts checked-in bookings correctly', async () => {
    mockFetchSuccess();
    renderDashboard();
    await waitFor(() => screen.getByText(/currently checked in/i));

    // 3 of mockBookings have occupancyStatus 'checked-in'
    expect(screen.getByText('Currently checked in').nextSibling.textContent).toBe('3');
  });

  test('counts arriving today bookings correctly', async () => {
    mockFetchSuccess();
    renderDashboard();
    await waitFor(() => screen.getByText(/arriving today/i));

    // 2 bookings have checkIn === today (offset 0)
    expect(screen.getByText('Arriving today').nextSibling.textContent).toBe('2');
  });

  test('counts departing today bookings correctly', async () => {
    mockFetchSuccess();
    renderDashboard();
    await waitFor(() => screen.getByText(/departing today/i));

    // 1 booking has checkOut === today (b_3 with offset 0)
    expect(screen.getByText('Departing today').nextSibling.textContent).toBe('1');
  });
});

describe('DashboardPage — placeholders', () => {
  test('shows wiring-in-progress note for tasks and requests', async () => {
    mockFetchSuccess();
    renderDashboard();
    await waitFor(() => screen.getByText(/^Tasks$/i));

    const notes = screen.getAllByText(/wiring in progress/i);
    expect(notes.length).toBe(2);
  });
});

describe('DashboardPage — error handling', () => {
  test('shows error message when API returns success: false', async () => {
    mockFetchFailure();
    renderDashboard();
    await waitFor(() => expect(screen.getByText(/server error/i)).toBeInTheDocument());
  });

  test('retry button recovers from error and loads data', async () => {
    mockFetchNetworkError();
    renderDashboard();
    await waitFor(() => screen.getByText(/network error/i));

    mockFetchSuccess();
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => expect(screen.getByText(/welcome back, admin/i)).toBeInTheDocument());
  });
});