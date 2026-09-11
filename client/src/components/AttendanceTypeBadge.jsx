import StatusBadge from './StatusBadge';
import { ATTENDANCE_TYPE_LABELS } from '../types/attendance';

const TONE = {
  FULL_DAY: 'primary',
  HALF_DAY: 'warning',
  ABSENT: 'danger',
};

export default function AttendanceTypeBadge({ type }) {
  return <StatusBadge tone={TONE[type]}>{ATTENDANCE_TYPE_LABELS[type]}</StatusBadge>;
}
