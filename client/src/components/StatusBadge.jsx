const TONE_CLASS = {
  primary: 'badge-full-day',
  warning: 'badge-half-day',
  danger: 'badge-absent',
  neutral: 'badge-neutral',
  success: 'badge-low',
  medium: 'badge-medium',
  high: 'badge-high',
};

// tone picks the color, children is the text
export default function StatusBadge({ tone = 'neutral', children }) {
  return <span className={`badge ${TONE_CLASS[tone] || TONE_CLASS.neutral}`}>{children}</span>;
}
