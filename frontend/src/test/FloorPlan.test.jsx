import { render, screen, fireEvent } from '@testing-library/react';
import FloorPlan from '../dashboard/components/FloorPlan';

const rooms = [
  { roomNumber: 101, status: 'available', hasTask: true },
  { roomNumber: 102, status: 'occupied' },
  { roomNumber: 103, status: 'needs-cleaning', hasNote: true },
];

describe('FloorPlan — rendering', () => {
  test('fills each room rect with the color for its status', () => {
    render(<FloorPlan rooms={rooms} />);
    expect(screen.getByTestId('room-rect-101').getAttribute('fill')).toBe('#d1fae5'); // available
    expect(screen.getByTestId('room-rect-102').getAttribute('fill')).toBe('#fee2e2'); // occupied
    expect(screen.getByTestId('room-rect-103').getAttribute('fill')).toBe('#fef3c7'); // needs-cleaning
  });

  test('renders the flag icon only when a room has an open task or note', () => {
    render(<FloorPlan rooms={rooms} />);
    expect(screen.getByTestId('room-flag-101')).toBeInTheDocument(); // hasTask
    expect(screen.getByTestId('room-flag-103')).toBeInTheDocument(); // hasNote
    expect(screen.queryByTestId('room-flag-102')).not.toBeInTheDocument(); // neither
  });
});

describe('FloorPlan — selection', () => {
  test('clicking a room fires onRoomSelect with that room', () => {
    const onRoomSelect = vi.fn();
    render(<FloorPlan rooms={rooms} onRoomSelect={onRoomSelect} />);
    fireEvent.click(screen.getByTestId('room-101'));
    expect(onRoomSelect).toHaveBeenCalledWith(expect.objectContaining({ roomNumber: 101 }));
  });

  test('Enter and Space activate a focused room', () => {
    const onRoomSelect = vi.fn();
    render(<FloorPlan rooms={rooms} onRoomSelect={onRoomSelect} />);
    const room = screen.getByTestId('room-102');
    fireEvent.keyDown(room, { key: 'Enter' });
    fireEvent.keyDown(room, { key: ' ' });
    expect(onRoomSelect).toHaveBeenCalledTimes(2);
  });

  test('rooms are exposed as buttons for keyboard/AT users', () => {
    render(<FloorPlan rooms={rooms} onRoomSelect={vi.fn()} />);
    // role=button + tabindex makes them keyboard-operable
    expect(screen.getByTestId('room-101').getAttribute('role')).toBe('button');
    expect(screen.getByTestId('room-101').getAttribute('tabindex')).toBe('0');
  });
});

describe('FloorPlan — readonly mode', () => {
  // Readonly drops the interactive *cursor* affordance, but rooms intentionally
  // stay keyboard-operable so the manager can still open a room's read-only
  // detail. (The "no action controls" guarantee for the manager is proven in
  // ManagerRoomDetail.test.jsx, where the detail has zero action buttons.)
  test('drops the interactive cursor class but rooms stay operable and open detail', () => {
    const onRoomSelect = vi.fn();
    render(<FloorPlan rooms={rooms} mode="readonly" onRoomSelect={onRoomSelect} />);
    const room = screen.getByTestId('room-101');
    expect(room.getAttribute('class')).not.toContain('is-interactive');
    expect(room.getAttribute('role')).toBe('button'); // still operable for keyboard/AT
    fireEvent.click(room);
    expect(onRoomSelect).toHaveBeenCalledWith(expect.objectContaining({ roomNumber: 101 }));
  });

  test('interactive mode marks rooms interactive', () => {
    render(<FloorPlan rooms={rooms} mode="interactive" onRoomSelect={vi.fn()} />);
    expect(screen.getByTestId('room-101').getAttribute('class')).toContain('is-interactive');
  });
});
