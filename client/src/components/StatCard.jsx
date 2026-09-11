const TONE_CLASS = {
  primary: 'stat-icon-primary',
  success: 'stat-icon-success',
  warning: 'stat-icon-warning',
  danger: 'stat-icon-danger',
};

export default function StatCard({ label, value, hint, icon, tone = 'primary' }) {
  return (
    <div className="card stat-card">
      {icon && <span className={`stat-icon ${TONE_CLASS[tone] || TONE_CLASS.primary}`}>{icon}</span>}
      <div className="stat-card-body">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {hint && <span className="stat-hint">{hint}</span>}
      </div>
    </div>
  );
}
