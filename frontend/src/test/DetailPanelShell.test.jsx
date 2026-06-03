import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DetailPanelShell from '../dashboard/components/DetailPanelShell';

// Harness: a trigger button that opens the shell, so we can verify focus moves
// into the dialog on open and returns to the trigger on close.
function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button data-testid="trigger" onClick={() => setOpen(true)}>open</button>
      {open && (
        <DetailPanelShell title="Test panel" onClose={() => setOpen(false)} testId="shell">
          <button data-testid="inside">inside</button>
        </DetailPanelShell>
      )}
    </>
  );
}

describe('DetailPanelShell — dialog focus management', () => {
  test('focuses the close button on open', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByTestId('trigger'));
    expect(screen.getByTestId('shell')).toBeInTheDocument();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close panel' }));
  });

  test('Escape closes the dialog and restores focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByTestId('trigger');
    await user.click(trigger);
    expect(screen.getByTestId('shell')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByTestId('shell')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });

  test('clicking the close button closes the dialog', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByTestId('trigger'));
    await user.click(screen.getByRole('button', { name: 'Close panel' }));
    expect(screen.queryByTestId('shell')).not.toBeInTheDocument();
  });
});
