import EmptyState from './EmptyState';
import { IconSpinner, IconAlertCircle } from './icons';

// loading / error / empty states in one place
export default function StateMessage({ isLoading, error, isEmpty, emptyText = 'No records found.' }) {
  if (isLoading) {
    return (
      <div className="state">
        <IconSpinner size={22} />
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state state-error">
        <IconAlertCircle size={22} />
        <span>{error.message}</span>
      </div>
    );
  }

  if (isEmpty) {
    return <EmptyState title="No records found" message={emptyText} />;
  }

  return null;
}
