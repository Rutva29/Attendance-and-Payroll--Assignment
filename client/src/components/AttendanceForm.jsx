import { useEffect, useState } from 'react';
import AttendanceTypeBadge from './AttendanceTypeBadge';
import CardHeader from './CardHeader';
import { IconAlertCircle } from './icons';
import {
  calculateWorkingHours,
  classifyAttendance,
  isFutureDate,
  isWeekend,
  todayDate,
  validateAttendanceForm,
} from '../utils/attendance';
import { formatHours } from '../utils/format';

const EMPTY_VALUES = { employeeId: '', date: '', checkIn: '', checkOut: '' };

function toFormValues(record) {
  if (!record) return EMPTY_VALUES;
  return {
    employeeId: String(record.employeeId),
    date: record.date,
    checkIn: record.checkIn || '',
    checkOut: record.checkOut || '',
  };
}

// onSubmit can throw, message gets shown to the user
export default function AttendanceForm({ employees, editingRecord, onSubmit, onCancelEdit, isSubmitting }) {
  const [values, setValues] = useState(() => toFormValues(editingRecord));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setValues(toFormValues(editingRecord));
    setErrors({});
    setSubmitError('');
    setSuccessMessage('');
  }, [editingRecord]);

  const workingHours = calculateWorkingHours(values.checkIn, values.checkOut);
  const attendanceType = classifyAttendance(workingHours);

  function updateField(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setSuccessMessage('');
    setErrors((current) => {
      const next = { ...current, [name]: undefined };
      // date picker won't block weekends, so check it here
      if (name === 'date' && value && isWeekend(value)) {
        next.date = 'Attendance cannot be recorded for Saturday or Sunday.';
      } else if (name === 'date' && value && isFutureDate(value)) {
        next.date = 'Attendance cannot be recorded for a future date.';
      }
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError('');
    setSuccessMessage('');

    const validationErrors = validateAttendanceForm(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      await onSubmit({
        employeeId: Number(values.employeeId),
        date: values.date,
        checkIn: values.checkIn || null,
        checkOut: values.checkOut || null,
      });
      setSuccessMessage(editingRecord ? 'Attendance updated.' : 'Attendance added.');
      if (!editingRecord) {
        setValues(EMPTY_VALUES);
      }
    } catch (error) {
      setSubmitError(error.message);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <CardHeader
        title={editingRecord ? 'Edit Attendance' : 'Add Attendance'}
        description="Leave check-in and check-out empty to record an absent day. Weekends and future dates are not allowed."
      />

      <div className="form-grid">
        <div className="field">
          <label>Employee</label>
          <select
            id="employeeId"
            className={errors.employeeId ? 'invalid' : ''}
            value={values.employeeId}
            onChange={(event) => updateField('employeeId', event.target.value)}
          >
            <option value="">Select employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name} ({employee.designation})
              </option>
            ))}
          </select>
          {errors.employeeId && <span className="field-error">{errors.employeeId}</span>}
        </div>

        <div className="field">
          <label>Date</label>
          <input
            id="date"
            type="date"
            max={todayDate()}
            className={errors.date ? 'invalid' : ''}
            value={values.date}
            onChange={(event) => updateField('date', event.target.value)}
            onClick={(event) => event.currentTarget.showPicker?.()}
          />
          {errors.date && <span className="field-error">{errors.date}</span>}
        </div>

        <div className="field">
          <label>Check-in</label>
          <input
            id="checkIn"
            type="time"
            className={errors.checkIn ? 'invalid' : ''}
            value={values.checkIn}
            onChange={(event) => updateField('checkIn', event.target.value)}
          />
          {errors.checkIn && <span className="field-error">{errors.checkIn}</span>}
        </div>

        <div className="field">
          <label>Check-out</label>
          <input
            id="checkOut"
            type="time"
            className={errors.checkOut ? 'invalid' : ''}
            value={values.checkOut}
            onChange={(event) => updateField('checkOut', event.target.value)}
          />
          {errors.checkOut && <span className="field-error">{errors.checkOut}</span>}
        </div>

        <div className="field">
          <label>
            Working hours <span className="field-auto-tag">Auto-calculated</span>
          </label>
          <div className="field-value">{formatHours(workingHours)}</div>
        </div>

        <div className="field">
          <label>
            Attendance type <span className="field-auto-tag">Auto-calculated</span>
          </label>
          <div className="field-static">
            <AttendanceTypeBadge type={attendanceType} />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : editingRecord ? 'Update Attendance' : 'Add Attendance'}
        </button>
        <button type="button" className="btn" onClick={onCancelEdit} disabled={isSubmitting}>
          Cancel
        </button>
        {submitError && (
          <span className="alert alert-error">
            <IconAlertCircle size={14} />
            {submitError}
          </span>
        )}
        {successMessage && <span className="alert alert-success">{successMessage}</span>}
      </div>
    </form>
  );
}
