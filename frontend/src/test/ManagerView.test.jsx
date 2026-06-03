import { render, screen, within } from '@testing-library/react';
import ManagerView from '../dashboard/views/ManagerView';
import { getManagerMetrics } from '../dashboard/data/managerMetrics';

vi.mock('../hooks/useSocket', () => ({ useSocketEvent: () => {} }));

beforeEach(() => {
  // Heatmap data is irrelevant here; metrics come from the mock managerMetrics module.
  global.fetch = vi.fn(() =>
    Promise.resolve({ ok: true, status: 200, json: async () => ({ success: true, data: [] }) })
  );
});

describe('ManagerView — analytics cards render the shaped (mock) data', () => {
  test('checkout-crunch hero renders the shaped readiness figures', async () => {
    render(<ManagerView />);
    const crunch = await screen.findByTestId('checkout-crunch');
    const m = getManagerMetrics().checkoutCrunch;

    expect(within(crunch).getByText('Checkout crunch readiness')).toBeInTheDocument();
    // headline composes "<due> due by <deadline> · <ready> ready · <remaining> remaining"
    expect(
      within(crunch).getByText((_, el) => {
        const t = el?.textContent?.replace(/\s+/g, ' ') ?? '';
        return (
          el?.classList?.contains('ibh-crunch-headline') &&
          t.includes(`${m.due} due`) &&
          t.includes(`${m.ready} ready`) &&
          t.includes(`${m.remaining} remaining`)
        );
      })
    ).toBeInTheDocument();
  });

  test('lead metric cards render the shaped values', async () => {
    render(<ManagerView />);
    await screen.findByTestId('checkout-crunch');

    expect(within(screen.getByTestId('metric-turnaround')).getByText(/min$/)).toBeInTheDocument();
    expect(within(screen.getByTestId('metric-turnaround')).getByText('checkout → available')).toBeInTheDocument();
    expect(within(screen.getByTestId('metric-tasks')).getByText(/done$/)).toBeInTheDocument();
    expect(within(screen.getByTestId('metric-tasks')).getByText(/outstanding.*%/)).toBeInTheDocument();
    expect(screen.getByTestId('metric-requests')).toBeInTheDocument();
  });

  test('secondary tiles render occupancy + status mix', async () => {
    render(<ManagerView />);
    await screen.findByTestId('checkout-crunch');

    expect(within(screen.getByTestId('metric-occupancy')).getByText(/%$/)).toBeInTheDocument();
    expect(within(screen.getByTestId('metric-occupancy')).getByText(/of 15 rooms/)).toBeInTheDocument();
    expect(screen.getByTestId('metric-mix')).toBeInTheDocument();
  });

  test('renders exactly one chart (tasks completed through the day)', async () => {
    render(<ManagerView />);
    await screen.findByTestId('checkout-crunch');
    expect(screen.getByText('Tasks completed through the day')).toBeInTheDocument();
  });

  test('renders the floor plan as a read-only heatmap (no interactive affordance)', async () => {
    render(<ManagerView />);
    const room = await screen.findByTestId('room-101');
    expect(room.getAttribute('class')).not.toContain('is-interactive');
  });
});
