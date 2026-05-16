import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoomsPage from '../pages/RoomsPage';

const mockRooms = [
  { _id: '1', roomNumber: '101', status: 'available' },
  { _id: '2', roomNumber: '102', status: 'occupied' },
  { _id: '3', roomNumber: '103', status: 'needs-cleaning' },
];

function mockFetchSuccess(rooms = mockRooms) {
  global.fetch = vi.fn().mockResolvedValue({
    json: async () => ({ success: true, data: rooms }),
  });
}

function mockFetchFailure() {
  global.fetch = vi.fn().mockResolvedValue({
    json: async () => ({ success: false, error: 'Server error' }),
  });
}

function mockFetchNetworkError() {
  global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
}

function mockPutSuccess() {
  global.fetch = vi.fn()
    .mockResolvedValueOnce({ json: async () => ({ success: true, data: mockRooms }) })
    .mockResolvedValue({ json: async () => ({ success: true, data: {} }) });
}

function mockPutFailure() {
  global.fetch = vi.fn()
    .mockResolvedValueOnce({ json: async () => ({ success: true, data: mockRooms }) })
    .mockResolvedValue({ json: async () => ({ success: false, error: 'Update failed' }) });
}

beforeEach(() => vi.clearAllMocks());

describe('RoomsPage — initial load', () => {
  test('shows loading state before data arrives', () => {
    global.fetch = vi.fn(() => new Promise(() => {}));
    render(<RoomsPage />);
    expect(screen.getByText(/loading rooms/i)).toBeInTheDocument();
  });

  test('renders all rooms after successful fetch', async () => {
    mockFetchSuccess();
    render(<RoomsPage />);
    await waitFor(() => expect(screen.getByText('Room 101')).toBeInTheDocument());
    expect(screen.getByText('Room 102')).toBeInTheDocument();
    expect(screen.getByText('Room 103')).toBeInTheDocument();
  });

  test('shows error banner when fetch returns success: false', async () => {
    mockFetchFailure();
    render(<RoomsPage />);
    await waitFor(() => expect(screen.getByText(/server error/i)).toBeInTheDocument());
  });

  test('shows error banner on network error', async () => {
    mockFetchNetworkError();
    render(<RoomsPage />);
    await waitFor(() => expect(screen.getByText(/network error/i)).toBeInTheDocument());
  });

  test('shows "No rooms found" when API returns empty array', async () => {
    mockFetchSuccess([]);
    render(<RoomsPage />);
    await waitFor(() => expect(screen.getByText(/no rooms found/i)).toBeInTheDocument());
  });
});

describe('RoomsPage — optimistic status update', () => {
  test('updates status badge immediately when dropdown changes', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ json: async () => ({ success: true, data: mockRooms }) })
      .mockImplementationOnce(() => new Promise((resolve) =>
        setTimeout(() => resolve({ json: async () => ({ success: true }) }), 5000)
      ));

    render(<RoomsPage />);
    await waitFor(() => screen.getByText('Room 101'));

    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[0], 'occupied');

    expect(screen.getAllByText('Occupied').length).toBeGreaterThanOrEqual(1);
  });

  test('sends PUT request to correct endpoint with new status', async () => {
    mockPutSuccess();
    render(<RoomsPage />);
    await waitFor(() => screen.getByText('Room 101'));

    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[0], 'occupied');

    await waitFor(() => {
      const putCall = global.fetch.mock.calls.find((call) => call[0].includes('/api/rooms/1/status'));
      expect(putCall).toBeTruthy();
      expect(JSON.parse(putCall[1].body).status).toBe('occupied');
    });
  });

  test('rolls back status if PUT request fails', async () => {
    mockPutFailure();
    render(<RoomsPage />);
    await waitFor(() => screen.getByText('Room 101'));

    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[0], 'occupied');

    await waitFor(() => expect(selects[0]).toHaveValue('available'));
  });

  test('shows error message on the row when PUT fails', async () => {
    mockPutFailure();
    render(<RoomsPage />);
    await waitFor(() => screen.getByText('Room 101'));

    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[0], 'occupied');

    await waitFor(() => expect(screen.getByText(/failed to save/i)).toBeInTheDocument());
  });
});

describe('RoomsPage — retry', () => {
  test('retry button re-fetches rooms after error', async () => {
    mockFetchNetworkError();
    render(<RoomsPage />);
    await waitFor(() => screen.getByText(/network error/i));

    mockFetchSuccess();
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => expect(screen.getByText('Room 101')).toBeInTheDocument());
  });
});