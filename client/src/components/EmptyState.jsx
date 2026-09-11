import { IconInbox } from './icons';

export default function EmptyState({ title = 'No records found', message, action }) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">
        <IconInbox size={28} />
      </span>
      <p className="empty-state-title">{title}</p>
      {message && <p className="empty-state-message">{message}</p>}
      {action}
    </div>
  );
}
