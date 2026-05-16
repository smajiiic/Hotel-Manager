import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoomRow from '../components/RoomRow';

function renderInGrid(ui) {
  return render(
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr' }}>
      {ui}
    </div>
  );
}

const mockRoom = { _id: 'abc123', roomNumber: '101', status: 'available' };
const mockOnStatusChange = vi.fn();

beforeEach(() => vi.clearAllMocks());

describe('RoomRow — rendering', () => {
  test('displays the room number', () => {
    renderInGrid(<RoomRow room={mockRoom} updating={false} error={null} onStatusChange={mockOnStatusChange} />);
    expect(screen.getByText('Room 101')).toBeInTheDocument();
  });

  test('renders a StatusBadge with the current status', () => {
    renderInGrid(<RoomRow room={mockRoom} updating={false} error={null} onStatusChange={mockOnStatusChange} />);
    expect(screen.getAllByText('Available')[0]).toBeInTheDocument();
  });

  test('renders the dropdown with current status selected', () => {
    renderInGrid(<RoomRow room={mockRoom} updating={false} error={null} onStatusChange={mockOnStatusChange} />);
    expect(screen.getByRole('combobox')).toHaveValue('available');
  });

  test('renders all three status options in dropdown', () => {
    renderInGrid(<RoomRow room={mockRoom} updating={false} error={null} onStatusChange={mockOnStatusChange} />);
    expect(screen.getByRole('option', { name: 'Available' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Occupied' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Needs Cleaning' })).toBeInTheDocument();
  });
});

describe('RoomRow — updating state', () => {
  test('disables dropdown while updating', () => {
    renderInGrid(<RoomRow room={mockRoom} updating={true} error={null} onStatusChange={mockOnStatusChange} />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  test('shows "Saving…" text while updating', () => {
    renderInGrid(<RoomRow room={mockRoom} updating={true} error={null} onStatusChange={mockOnStatusChange} />);
    expect(screen.getByText('Saving…')).toBeInTheDocument();
  });

  test('dropdown is enabled when not updating', () => {
    renderInGrid(<RoomRow room={mockRoom} updating={false} error={null} onStatusChange={mockOnStatusChange} />);
    expect(screen.getByRole('combobox')).not.toBeDisabled();
  });
});

describe('RoomRow — error state', () => {
  test('shows error message when error prop is set', () => {
    renderInGrid(<RoomRow room={mockRoom} updating={false} error="Failed to save. Try again." onStatusChange={mockOnStatusChange} />);
    expect(screen.getByText('Failed to save. Try again.')).toBeInTheDocument();
  });

  test('shows no error when error prop is null', () => {
    renderInGrid(<RoomRow room={mockRoom} updating={false} error={null} onStatusChange={mockOnStatusChange} />);
    expect(screen.queryByText(/failed/i)).not.toBeInTheDocument();
  });
});

describe('RoomRow — interactions', () => {
  test('calls onStatusChange with roomId and new status on dropdown change', async () => {
    renderInGrid(<RoomRow room={mockRoom} updating={false} error={null} onStatusChange={mockOnStatusChange} />);
    await userEvent.selectOptions(screen.getByRole('combobox'), 'occupied');
    expect(mockOnStatusChange).toHaveBeenCalledWith('abc123', 'occupied');
  });

  test('calls onStatusChange with needs-cleaning when selected', async () => {
    renderInGrid(<RoomRow room={mockRoom} updating={false} error={null} onStatusChange={mockOnStatusChange} />);
    await userEvent.selectOptions(screen.getByRole('combobox'), 'needs-cleaning');
    expect(mockOnStatusChange).toHaveBeenCalledWith('abc123', 'needs-cleaning');
  });
});