import { render, screen, within } from '@testing-library/react';
import RoomDetailPanel from '../dashboard/components/RoomDetailPanel';

const room = {
  roomNumber: 101,
  status: 'occupied',
  booking: { guestName: 'Ana Kovač' },
  guestName: 'Ana Kovač',
  checkOut: '2026-06-03',
  openTasks: [{ _id: 't1', description: 'Replace towels', createdAt: new Date().toISOString() }],
  openNotes: [{ _id: 'q1', note: 'VIP guest', createdAt: new Date().toISOString() }],
};

const noop = () => {};

function renderPanel(extra = {}) {
  return render(
    <RoomDetailPanel
      room={room}
      onClose={noop}
      onSetStatus={noop}
      onCheckout={noop}
      onAddTask={noop}
      onAddNote={noop}
      {...extra}
    />
  );
}

describe('RoomDetailPanel — reception capability set (default)', () => {
  test('renders set-status, checkout, +Task and +Note, plus the guest', () => {
    renderPanel();
    const panel = screen.getByTestId('room-detail-panel');
    expect(within(panel).getByRole('group', { name: /set room status/i })).toBeInTheDocument();
    expect(within(panel).getByTestId('checkout-button')).toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: '+ Task' })).toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: '+ Note' })).toBeInTheDocument();
    expect(within(panel).getByText('Ana Kovač')).toBeInTheDocument();
  });
});

describe('RoomDetailPanel — cleaning capability set', () => {
  const cleaningCaps = { setStatus: true, checkout: false, createTask: false, createNote: false, showGuest: false };

  test('hides checkout, +Task/+Note and the guest name; status limited to Available', () => {
    renderPanel({ capabilities: cleaningCaps, allowedStatuses: ['available'] });
    const panel = screen.getByTestId('room-detail-panel');

    expect(within(panel).queryByTestId('checkout-button')).not.toBeInTheDocument();
    expect(within(panel).queryByRole('button', { name: '+ Task' })).not.toBeInTheDocument();
    expect(within(panel).queryByRole('button', { name: '+ Note' })).not.toBeInTheDocument();
    expect(within(panel).queryByText('Ana Kovač')).not.toBeInTheDocument();

    expect(within(panel).getByRole('button', { name: 'Available' })).toBeInTheDocument();
    expect(within(panel).queryByRole('button', { name: 'Occupied' })).not.toBeInTheDocument();
    expect(within(panel).queryByRole('button', { name: 'Needs Cleaning' })).not.toBeInTheDocument();
  });
});
