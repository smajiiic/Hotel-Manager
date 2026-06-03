// Hand-rolled thin line icons (no icon dependency). Each takes { size, className,
// strokeWidth } and inherits color via currentColor. 24x24 viewBox.

function Svg({ size = 22, className, strokeWidth = 1.7, children, filled = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const IconFloorPlan = (p) => (
  <Svg {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 9v12" /></Svg>
);
export const IconTasks = (p) => (
  <Svg {...p}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1M8.5 11l2 2 4-4" /></Svg>
);
export const IconBookings = (p) => (
  <Svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></Svg>
);
export const IconNotes = (p) => (
  <Svg {...p}><path d="M4 5h16v11H9l-4 3v-3H4z" /></Svg>
);
export const IconHousekeeping = (p) => (
  <Svg {...p}><path d="M14 3l-2 6M8 11h8l-1 9H9zM10 11l-3-1M16 11l2-2" /></Svg>
);
export const IconReports = (p) => (
  <Svg {...p}><path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-7" /></Svg>
);
export const IconSettings = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></Svg>
);

export const IconBed = (p) => (
  <Svg {...p}><path d="M3 18v-7a2 2 0 0 1 2-2h11a3 3 0 0 1 3 3v6M3 13h16M3 18v2M19 18v2M6 9V7h5v2" /></Svg>
);
export const IconPerson = (p) => (
  <Svg {...p}><circle cx="12" cy="8" r="3.4" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></Svg>
);
export const IconBroom = (p) => (
  <Svg {...p}><path d="M16 3l-6 6M10 9l-4 7h9l1-7zM10 16l-1 4M14 16l1 4" /></Svg>
);
export const IconClipboard = (p) => (
  <Svg {...p}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1M8.5 10h7M8.5 14h5" /></Svg>
);
export const IconChat = (p) => (
  <Svg {...p}><path d="M4 5h16v11H9l-4 3v-3H4z" /></Svg>
);

export const IconBell = (p) => (
  <Svg {...p}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0" /></Svg>
);
export const IconChevronDown = (p) => (<Svg {...p}><path d="M6 9l6 6 6-6" /></Svg>);
export const IconChevronRight = (p) => (<Svg {...p}><path d="M9 6l6 6-6 6" /></Svg>);
export const IconClose = (p) => (<Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>);
export const IconPlus = (p) => (<Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>);
export const IconMinus = (p) => (<Svg {...p}><path d="M5 12h14" /></Svg>);
export const IconTarget = (p) => (<Svg {...p}><circle cx="12" cy="12" r="7" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><circle cx="12" cy="12" r="1.5" filled /></Svg>);
export const IconExpand = (p) => (<Svg {...p}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></Svg>);
export const IconExit = (p) => (<Svg {...p}><path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 8l-4 4 4 4M6 12h9" /></Svg>);
export const IconEnter = (p) => (<Svg {...p}><path d="M10 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M14 8l4 4-4 4M8 12h10" /></Svg>);
export const IconCheck = (p) => (<Svg {...p}><path d="M5 13l4 4L19 7" /></Svg>);
export const IconUndo = (p) => (<Svg {...p}><path d="M9 7L4 12l5 5M4 12h11a5 5 0 0 1 0 10h-1" /></Svg>);
export const IconTrash = (p) => (<Svg {...p}><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6" /></Svg>);
export const IconDrop = (p) => (<Svg {...p}><path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z" /></Svg>);
export const IconStar = (p) => (<Svg {...p}><path d="M12 3l2.7 5.6 6 .8-4.4 4.2 1.1 6L12 17l-5.4 2.6 1.1-6L3.3 9.4l6-.8z" /></Svg>);
export const IconCollapse = (p) => (<Svg {...p}><path d="M15 6l-6 6 6 6" /></Svg>);
export const IconTap = (p) => (<Svg {...p}><path d="M9 11V6a1.5 1.5 0 0 1 3 0v5M12 7a1.5 1.5 0 0 1 3 0v4M15 8a1.5 1.5 0 0 1 3 0v6a5 5 0 0 1-5 5h-2a4 4 0 0 1-3-1.5l-3-3.5a1.5 1.5 0 0 1 2.3-2L9 17" /></Svg>);
