import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import AttendanceForm from '../components/AttendanceForm';
import AttendanceFilters, { EMPTY_FILTERS } from '../components/AttendanceFilters';
import AttendanceTable from '../components/AttendanceTable';
import { IconPlus, IconAlertCircle } from '../components/icons';
import { useEmployees } from '../hooks/useEmployees';
import { useAttendanceList, useAttendanceMutations } from '../hooks/useAttendance';
import { attendanceService } from '../services/attendanceService';
import { formatDate } from '../utils/format';

export default function AttendancePage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const employeesQuery = useEmployees();
  const attendanceQuery = useAttendanceList(filters);
  const { create, update, remove } = useAttendanceMutations();

  const employees = employeesQuery.data || [];

  // quick check before submit, DB unique constraint is still the real guard
  async function assertNoDuplicate(payload) {
    const existing = await attendanceService.list({
      employeeId: payload.employeeId,
      startDate: payload.date,
      endDate: payload.date,
    });
    const duplicate = existing.find((record) => record.id !== editingRecord?.id);
    if (duplicate) {
      throw new Error(`${duplicate.employeeName} already has attendance on ${formatDate(payload.date)}.`);
    }
  }

  async function handleSubmit(payload) {
    await assertNoDuplicate(payload);
    if (editingRecord) {
      await update.mutateAsync({ id: editingRecord.id, ...payload });
      setEditingRecord(null);
    } else {
      await create.mutateAsync(payload);
    }
  }

  function handleAddClick() {
    setEditingRecord(null);
    setIsFormOpen(true);
  }

  function handleEdit(record) {
    setEditingRecord(record);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCloseForm() {
    setEditingRecord(null);
    setIsFormOpen(false);
  }

  async function handleDelete(record) {
    const confirmed = window.confirm(
      `Delete attendance for ${record.employeeName} on ${formatDate(record.date)}? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeleteError('');
    try {
      await remove.mutateAsync(record.id);
      if (editingRecord?.id === record.id) {
        handleCloseForm();
      }
    } catch (error) {
      setDeleteError(error.message);
    }
  }

  return (
    <>
      <PageHeader
        title="Attendance Management"
        description="Manage employee attendance and working hours."
        actions={
          !isFormOpen && (
            <button type="button" className="btn btn-primary" onClick={handleAddClick}>
              <IconPlus size={16} />
              Add Attendance
            </button>
          )
        }
      />

      {employeesQuery.error && (
        <div className="alert alert-error">
          <IconAlertCircle size={14} />
          {employeesQuery.error.message}
        </div>
      )}

      {isFormOpen && (
        <AttendanceForm
          employees={employees}
          editingRecord={editingRecord}
          onSubmit={handleSubmit}
          onCancelEdit={handleCloseForm}
          isSubmitting={create.isPending || update.isPending}
        />
      )}

      <AttendanceFilters employees={employees} filters={filters} onChange={setFilters} />

      {deleteError && (
        <div className="alert alert-error">
          <IconAlertCircle size={14} />
          {deleteError}
        </div>
      )}

      <AttendanceTable
        records={attendanceQuery.data}
        isLoading={attendanceQuery.isLoading}
        error={attendanceQuery.error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        deletingId={remove.isPending ? remove.variables : null}
      />
    </>
  );
}
