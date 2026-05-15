import { render, screen } from '@testing-library/react';
import StatusBadge from '../components/StatusBadge';

describe('StatusBadge', () => {
  test('renders "Available" for available status', () => {
    render(<StatusBadge status="available" />);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  test('renders "Occupied" for occupied status', () => {
    render(<StatusBadge status="occupied" />);
    expect(screen.getByText('Occupied')).toBeInTheDocument();
  });

  test('renders "Needs Cleaning" for needs-cleaning status', () => {
    render(<StatusBadge status="needs-cleaning" />);
    expect(screen.getByText('Needs Cleaning')).toBeInTheDocument();
  });

  test('renders without crashing for an unknown status', () => {
    render(<StatusBadge status="unknown-status" />);
    expect(screen.getByText('unknown-status')).toBeInTheDocument();
  });

  test('applies green background for available status', () => {
    const { container } = render(<StatusBadge status="available" />);
    expect(container.firstChild).toHaveStyle({ backgroundColor: '#d1fae5' });
  });

  test('applies red background for occupied status', () => {
    const { container } = render(<StatusBadge status="occupied" />);
    expect(container.firstChild).toHaveStyle({ backgroundColor: '#fee2e2' });
  });

  test('applies amber background for needs-cleaning status', () => {
    const { container } = render(<StatusBadge status="needs-cleaning" />);
    expect(container.firstChild).toHaveStyle({ backgroundColor: '#fef3c7' });
  });
});