import { render, screen, within } from '@testing-library/react';
import ManagerRoomDetail from '../dashboard/components/ManagerRoomDetail';

const room = { roomNumber: 101, status: 'needs-cleaning' };
const history = [
  { at: new Date().toISOString(), by: 'amina', to: 'needs-cleaning' },
  { at: new Date(Date.now() - 86400000).toISOString(), by: 'edin', to: 'occupied' },
];

describe('ManagerRoomDetail — read-only', () => {
  test('renders status history (who + when)', () => {
    render(<ManagerRoomDetail room={room} history={history} onClose={() => {}} />);
    expect(screen.getByText('Status history')).toBeInTheDocument();
    expect(screen.getByText(/amina/)).toBeInTheDocument();
    expect(screen.getByText(/edin/)).toBeInTheDocument();
  });

  test('exposes ZERO action controls — the only button is Close', () => {
    render(<ManagerRoomDetail room={room} history={history} onClose={() => {}} />);
    const panel = screen.getByTestId('manager-room-detail');

    expect(within(panel).queryByTestId('checkout-button')).not.toBeInTheDocument();
    expect(within(panel).queryByRole('button', { name: '+ Task' })).not.toBeInTheDocument();
    expect(within(panel).queryByRole('button', { name: '+ Note' })).not.toBeInTheDocument();
    expect(within(panel).queryByRole('group', { name: /set room status/i })).not.toBeInTheDocument();
    expect(within(panel).queryByRole('button', { name: 'Available' })).not.toBeInTheDocument();

    const buttons = within(panel).getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveAttribute('aria-label', 'Close panel');
  });
});
