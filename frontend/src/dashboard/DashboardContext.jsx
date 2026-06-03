import { createContext, useContext, useState } from 'react';

// Shared dashboard UI state: the selected room (drives the two-state layout —
// rail in + sidebar collapsed) and fullscreen "booking mode". AppShell provides
// it; views consume it via useDashboard().
export const DashboardContext = createContext(null);

// Returns the shared context when inside AppShell, else a self-contained local
// fallback. The fallback keeps the views fully functional when rendered alone
// (e.g. in unit tests) without an AppShell provider.
export function useDashboard() {
  const ctx = useContext(DashboardContext);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  return ctx ?? { selectedNumber, setSelectedNumber, fullscreen, setFullscreen };
}
