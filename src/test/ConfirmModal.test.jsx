import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmModal from '../components/ConfirmModal';

const defaultProps = {
  isOpen: true,
  title: 'Delete this item?',
  message: 'This cannot be undone.',
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

beforeEach(() => vi.clearAllMocks());

describe('ConfirmModal — visibility', () => {
  test('renders modal when isOpen is true', () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('renders nothing when isOpen is false', () => {
    render(<ConfirmModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('ConfirmModal — content', () => {
  test('displays the title prop', () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText('Delete this item?')).toBeInTheDocument();
  });

  test('displays the message prop', () => {
    render(<ConfirmModal {...defaultProps} />);
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
  });

  test('displays custom confirmLabel', () => {
    render(<ConfirmModal {...defaultProps} confirmLabel="Yes, remove" />);
    expect(screen.getByRole('button', { name: /yes, remove/i })).toBeInTheDocument();
  });

  test('displays custom cancelLabel', () => {
    render(<ConfirmModal {...defaultProps} cancelLabel="Go back" />);
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });
});

describe('ConfirmModal — interactions', () => {
  test('calls onConfirm when confirm button is clicked', async () => {
    render(<ConfirmModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  test('calls onCancel when cancel button is clicked', async () => {
    render(<ConfirmModal {...defaultProps} />);
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  test('calls onCancel when Escape key is pressed', async () => {
    render(<ConfirmModal {...defaultProps} />);
    await userEvent.keyboard('{Escape}');
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  test('does NOT call onCancel when clicking inside the modal card', async () => {
    render(<ConfirmModal {...defaultProps} />);
    const modal = screen.getByRole('dialog');
    fireEvent.click(modal.parentElement, { target: modal });
    expect(defaultProps.onCancel).not.toHaveBeenCalled();
  });
});