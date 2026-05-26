import { render, screen } from '@testing-library/react';
import BookingRow from '../components/BookingRow';

// Same date helpers as the component uses — keeps tests timezone-safe.
const todayLocal = () => new Date().toLocaleDateString('sv-SE');
const offsetFromToday = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('sv-SE');
};

const mockRoom = { _id: 'rm_105', roomNumber: 105, status: 'occupied' };

const mockBooking = {
  _id: 'bkg_1',
  guestName: 'Emir Hadžić',
  roomId: 'rm_105',
  checkIn: offsetFromToday(-2),
  checkOut: offsetFromToday(3),
  occupancyStatus: 'checked-in',
};

beforeEach(() => vi.clearAllMocks());

describe('BookingRow — basic rendering', () => {
  test('displays the guest name', () => {
    render(<BookingRow booking={mockBooking} room={mockRoom} />);
    expect(screen.getByText('Emir Hadžić')).toBeInTheDocument();
  });

  test('displays the room number when room is provided', () => {
    render(<BookingRow booking={mockBooking} room={mockRoom} />);
    expect(screen.getByText('Room 105')).toBeInTheDocument();
  });

  test('falls back to "Room —" when room is undefined', () => {
    render(<BookingRow booking={mockBooking} room={undefined} />);
    expect(screen.getByText('Room —')).toBeInTheDocument();
  });

  test('renders both check-in and check-out dates separated by an arrow', () => {
    render(<BookingRow booking={mockBooking} room={mockRoom} />);
    // The arrow span is aria-hidden but its glyph is still in the DOM.
    expect(screen.getByText('→')).toBeInTheDocument();
  });
});

describe('BookingRow — today-highlight badges', () => {
  test('shows "Arriving today" when checkIn is today', () => {
    const booking = { ...mockBooking, checkIn: todayLocal() };
    render(<BookingRow booking={booking} room={mockRoom} />);
    expect(screen.getByText('Arriving today')).toBeInTheDocument();
  });

  test('shows "Departing today" when checkOut is today', () => {
    const booking = { ...mockBooking, checkOut: todayLocal() };
    render(<BookingRow booking={booking} room={mockRoom} />);
    expect(screen.getByText('Departing today')).toBeInTheDocument();
  });

  test('does not show today-tags when neither date matches today', () => {
    const booking = {
      ...mockBooking,
      checkIn: offsetFromToday(5),
      checkOut: offsetFromToday(10),
    };
    render(<BookingRow booking={booking} room={mockRoom} />);
    expect(screen.queryByText('Arriving today')).not.toBeInTheDocument();
    expect(screen.queryByText('Departing today')).not.toBeInTheDocument();
  });

  test('applies "is-today" class when checkIn is today', () => {
    const booking = { ...mockBooking, checkIn: todayLocal() };
    const { container } = render(<BookingRow booking={booking} room={mockRoom} />);
    expect(container.querySelector('.booking-row')).toHaveClass('is-today');
  });

  test('does not apply "is-today" class when neither date matches today', () => {
    const booking = {
      ...mockBooking,
      checkIn: offsetFromToday(5),
      checkOut: offsetFromToday(10),
    };
    const { container } = render(<BookingRow booking={booking} room={mockRoom} />);
    expect(container.querySelector('.booking-row')).not.toHaveClass('is-today');
  });
});

describe('BookingRow — occupancyStatus badge', () => {
  test('renders "checked-in" as "checked in" (hyphen replaced with space)', () => {
    render(<BookingRow booking={mockBooking} room={mockRoom} />);
    expect(screen.getByText('checked in')).toBeInTheDocument();
  });

  test('renders "confirmed" status badge', () => {
    const booking = { ...mockBooking, occupancyStatus: 'confirmed' };
    render(<BookingRow booking={booking} room={mockRoom} />);
    expect(screen.getByText('confirmed')).toBeInTheDocument();
  });

  test('renders "checked-out" as "checked out"', () => {
    const booking = { ...mockBooking, occupancyStatus: 'checked-out' };
    render(<BookingRow booking={booking} room={mockRoom} />);
    expect(screen.getByText('checked out')).toBeInTheDocument();
  });

  test('omits the status badge when occupancyStatus is missing', () => {
    const booking = { ...mockBooking, occupancyStatus: undefined };
    const { container } = render(<BookingRow booking={booking} room={mockRoom} />);
    expect(container.querySelector('.booking-status')).not.toBeInTheDocument();
  });
});
