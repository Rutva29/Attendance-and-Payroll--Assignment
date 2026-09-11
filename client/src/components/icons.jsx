// hand-rolled icons, no icon package needed

function Svg({ size = 18, children, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconDashboard(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </Svg>
  );
}

export function IconCalendarCheck(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <line x1="3" y1="9.5" x2="21" y2="9.5" />
      <line x1="8" y1="2.5" x2="8" y2="6.5" />
      <line x1="16" y1="2.5" x2="16" y2="6.5" />
      <path d="M8.5 14.5l2 2 4.5-4.5" />
    </Svg>
  );
}

export function IconBarChart(props) {
  return (
    <Svg {...props}>
      <line x1="4" y1="20" x2="20" y2="20" />
      <rect x="6" y="12" width="3.5" height="8" rx="0.8" />
      <rect x="12" y="7" width="3.5" height="13" rx="0.8" />
      <rect x="17" y="10" width="3.5" height="10" rx="0.8" />
    </Svg>
  );
}

export function IconUsers(props) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" />
      <circle cx="17" cy="8.5" r="2.4" />
      <path d="M15.8 14.8c2.4 0.3 4.2 2.2 4.2 5.2" />
    </Svg>
  );
}

export function IconClockCheck(props) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="12" r="8" />
      <path d="M11 7.5V12l3 2" />
    </Svg>
  );
}

export function IconAlertCircle(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="7.5" x2="12" y2="13" />
      <circle cx="12" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconWallet(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="6.5" width="18" height="13" rx="2" />
      <path d="M3 9.5h18" />
      <rect x="14.5" y="12" width="4.5" height="4" rx="1" />
    </Svg>
  );
}

export function IconEdit(props) {
  return (
    <Svg {...props}>
      <path d="M4 16.5V20h3.5L18.5 9 15 5.5 4 16.5z" />
      <line x1="13.2" y1="7.3" x2="16.7" y2="10.8" />
    </Svg>
  );
}

export function IconTrash(props) {
  return (
    <Svg {...props}>
      <line x1="4" y1="7" x2="20" y2="7" />
      <path d="M6 7l1 13a1.5 1.5 0 0 0 1.5 1.4h7a1.5 1.5 0 0 0 1.5-1.4L18 7" />
      <path d="M9.5 7V4.8A1 1 0 0 1 10.5 3.8h3a1 1 0 0 1 1 1V7" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </Svg>
  );
}

export function IconFilter(props) {
  return (
    <Svg {...props}>
      <path d="M4 5h16l-6.2 7.4V19l-3.6 2v-8.6L4 5z" />
    </Svg>
  );
}

export function IconPlus(props) {
  return (
    <Svg {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </Svg>
  );
}

export function IconX(props) {
  return (
    <Svg {...props}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </Svg>
  );
}

export function IconInbox(props) {
  return (
    <Svg {...props}>
      <path d="M4 12.5l2.3-7A1.5 1.5 0 0 1 7.7 4.5h8.6a1.5 1.5 0 0 1 1.4 1l2.3 7" />
      <rect x="3" y="12.5" width="18" height="7" rx="1.5" />
      <path d="M4 13.5h4.2a0.9 0.9 0 0 1 0.8 0.5l0.6 1.2a1 1 0 0 0 0.9 0.6h2.9a1 1 0 0 0 0.9-0.6l0.6-1.2a0.9 0.9 0 0 1 0.8-0.5H20" />
    </Svg>
  );
}

export function IconCalendarDay(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <line x1="3" y1="9.5" x2="21" y2="9.5" />
      <line x1="8" y1="2.5" x2="8" y2="6.5" />
      <line x1="16" y1="2.5" x2="16" y2="6.5" />
    </Svg>
  );
}

export function IconChevronDown(props) {
  return (
    <Svg {...props}>
      <polyline points="6 9 12 15 18 9" />
    </Svg>
  );
}

export function IconShield(props) {
  return (
    <Svg {...props}>
      <path d="M12 3l7 3v5.5c0 4.6-3 7.9-7 9.5-4-1.6-7-4.9-7-9.5V6l7-3z" />
    </Svg>
  );
}

export function IconSpinner(props) {
  return (
    <Svg className="icon-spin" {...props}>
      <path d="M12 3a9 9 0 1 0 9 9" />
    </Svg>
  );
}
