import AttendanceTypeBadge from './AttendanceTypeBadge';
import StatusBadge from './StatusBadge';
import CardHeader from './CardHeader';
import StateMessage from './StateMessage';
import SortableHeader from './SortableHeader';
import Pagination from './Pagination';
import { IconEdit, IconTrash } from './icons';
import { useSortableRows } from '../hooks/useSortableRows';
import { usePagination } from '../hooks/usePagination';
import { formatDate, formatHours } from '../utils/format';

const ROW_CLASS = {
  HALF_DAY: 'row-half-day',
  ABSENT: 'row-absent',
};

// missing check-in/check-out sorts last, handled by the shared sorter
const SORT_ACCESSORS = {
  employeeName: (record) => record.employeeName.toLowerCase(),
  date: (record) => record.date,
  checkIn: (record) => record.checkIn,
  checkOut: (record) => record.checkOut,
  workingHours: (record) => Number(record.workingHours),
  attendanceType: (record) => record.attendanceType,
};

const COLUMNS = [
  { key: 'employeeName', label: 'Employee' },
  { key: 'date', label: 'Date' },
  { key: 'checkIn', label: 'Check-in' },
  { key: 'checkOut', label: 'Check-out' },
  { key: 'workingHours', label: 'Working Hours', numeric: true },
  { key: 'attendanceType', label: 'Attendance Type' },
];

export default function AttendanceTable({ records, isLoading, error, onEdit, onDelete, deletingId }) {
  const rows = records || [];
  const { sortedRows, sort, handleSort } = useSortableRows(rows, SORT_ACCESSORS, { key: 'date', direction: 'desc' });
  const { pageRows, currentPage, totalPages, rangeStart, rangeEnd, setPage } = usePagination(sortedRows, `${sort.key}-${sort.direction}`);

  return (
    <div className="card">
      <CardHeader
        title="Attendance Records"
        actions={!isLoading && !error && <span className="table-summary">{rows.length} record{rows.length === 1 ? '' : 's'}</span>}
      />

      <div className="table-legend">
        <span className="table-legend-label">Row highlight:</span>
        <span className="table-legend-item">
          <span className="table-legend-swatch swatch-half-day" />
          Half Day
        </span>
        <span className="table-legend-item">
          <span className="table-legend-swatch swatch-absent" />
          Absent
        </span>
      </div>

      <StateMessage
        isLoading={isLoading}
        error={error}
        isEmpty={rows.length === 0}
        emptyText="No attendance records match the current filters. Try adjusting or clearing them."
      />

      {rows.length > 0 && (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {COLUMNS.map((column) => (
                    <SortableHeader key={column.key} label={column.label} sortKey={column.key} sort={sort} onSort={handleSort} numeric={column.numeric} />
                  ))}
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((record) => (
                  <tr key={record.id} className={ROW_CLASS[record.attendanceType] || ''}>
                    <td className="employee-cell">
                      {record.employeeName}
                      <div className="stat-hint">{record.employeeDesignation}</div>
                    </td>
                    <td>{formatDate(record.date)}</td>
                    <td>{record.checkIn || '-'}</td>
                    <td>{record.checkOut || '-'}</td>
                    <td className="numeric">{formatHours(record.workingHours)}</td>
                    <td>
                      <AttendanceTypeBadge type={record.attendanceType} />
                    </td>
                    <td>
                      <StatusBadge tone="neutral">{record.status === 'PRESENT' ? 'Present' : 'Absent'}</StatusBadge>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => onEdit(record)}
                          title="Edit attendance"
                          aria-label={`Edit attendance for ${record.employeeName} on ${formatDate(record.date)}`}
                        >
                          <IconEdit size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn-danger"
                          onClick={() => onDelete(record)}
                          disabled={deletingId === record.id}
                          title="Delete attendance"
                          aria-label={`Delete attendance for ${record.employeeName} on ${formatDate(record.date)}`}
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            total={rows.length}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
