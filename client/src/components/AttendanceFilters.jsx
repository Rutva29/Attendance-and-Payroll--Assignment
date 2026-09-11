import { useEffect, useState } from 'react';
import { IconFilter } from './icons';
import { ATTENDANCE_TYPES, ATTENDANCE_TYPE_LABELS } from '../types/attendance';
import { isFutureDate, todayDate } from '../utils/attendance';

export const EMPTY_FILTERS = { employeeId: '', startDate: '', endDate: '', attendanceType: '' };

// local draft so filters only apply when Apply is clicked
export default function AttendanceFilters({ employees, filters, onChange }) {
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  const update = (name, value) => setDraft((current) => ({ ...current, [name]: value }));
  const hasDraftValues = Object.values(draft).some(Boolean);
  const rangeError = draft.startDate && draft.endDate && draft.startDate > draft.endDate;
  const futureError = isFutureDate(draft.startDate) || isFutureDate(draft.endDate);

  function handleApply(event) {
    event.preventDefault();
    if (rangeError || futureError) return;
    onChange(draft);
  }

  function handleClear() {
    setDraft(EMPTY_FILTERS);
    onChange(EMPTY_FILTERS);
  }

  return (
    <form className="card filter-panel" onSubmit={handleApply}>
      <div className="filter-panel-header">
        <IconFilter size={16} />
        <h2>Filters</h2>
      </div>

      <div className="filters">
        <div className="field">
          <label>Employee</label>
          <select id="filter-employee" value={draft.employeeId} onChange={(event) => update('employeeId', event.target.value)}>
            <option value="">All employees</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Start date</label>
          <input
            id="filter-start"
            type="date"
            max={todayDate()}
            value={draft.startDate}
            onChange={(event) => update('startDate', event.target.value)}
            onClick={(event) => event.currentTarget.showPicker?.()}
          />
        </div>

        <div className="field">
          <label>End date</label>
          <input
            id="filter-end"
            type="date"
            max={todayDate()}
            value={draft.endDate}
            onChange={(event) => update('endDate', event.target.value)}
            onClick={(event) => event.currentTarget.showPicker?.()}
          />
          {rangeError && <span className="field-error">End date must be on or after start date.</span>}
          {!rangeError && futureError && <span className="field-error">Filter dates cannot be in the future.</span>}
        </div>

        <div className="field">
          <label>Attendance type</label>
          <select id="filter-type" value={draft.attendanceType} onChange={(event) => update('attendanceType', event.target.value)}>
            <option value="">All types</option>
            {ATTENDANCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {ATTENDANCE_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        <div className="field filter-actions">
          <label className="field-label-spacer" aria-hidden="true">
            Actions
          </label>
          <div className="filter-actions-row">
            <button type="submit" className="btn btn-primary" disabled={Boolean(rangeError || futureError)}>
              Apply Filters
            </button>
            <button type="button" className="btn" onClick={handleClear} disabled={!hasDraftValues}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
