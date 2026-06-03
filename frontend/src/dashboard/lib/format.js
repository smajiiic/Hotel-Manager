// Display helpers. Per spec, any number shown in the UI is rounded.

export const round = (n) => Math.round(Number(n) || 0);

// Round to a whole percentage, clamped to 0–100.
export const roundPct = (n) => Math.min(100, Math.max(0, Math.round(Number(n) || 0)));

// "3" -> "3", "3.0" guard for ratios used in metric cards.
export const ratioPct = (part, whole) => (whole > 0 ? roundPct((part / whole) * 100) : 0);
