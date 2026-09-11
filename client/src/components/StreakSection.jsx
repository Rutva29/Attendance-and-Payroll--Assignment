import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import CardHeader from './CardHeader';
import StateMessage from './StateMessage';
import SortableHeader from './SortableHeader';
import Pagination from './Pagination';
import { useAttendanceStreak } from '../hooks/useStatistics';
import { useSortableRows } from '../hooks/useSortableRows';
import { usePagination } from '../hooks/usePagination';
import { formatDate, formatMonth } from '../utils/format';
import { ATTENDANCE_TYPE_COLORS } from '../types/attendance';
import { CHART_GRID_STROKE, CHART_AXIS_LINE, CHART_AXIS_TICK, CHART_TOOLTIP_CURSOR } from '../utils/chartTheme';

const SORT_ACCESSORS = {
  employeeName: (row) => row.employeeName.toLowerCase(),
  longestStreak: (row) => row.longestStreak,
  startDate: (row) => row.startDate,
  endDate: (row) => row.endDate,
};

// a bar-per-employee chart stops being readable past a handful of employees, so the chart
// shows a fixed set of streak-length buckets instead - it reads the same at 5 employees or 500
const STREAK_BUCKETS = [
  { label: '0', test: (days) => days === 0 },
  { label: '1-5', test: (days) => days >= 1 && days <= 5 },
  { label: '6-10', test: (days) => days >= 6 && days <= 10 },
  { label: '11-15', test: (days) => days >= 11 && days <= 15 },
  { label: '16+', test: (days) => days >= 16 },
];

function bucketStreaks(rows) {
  return STREAK_BUCKETS.map(({ label, test }) => ({
    label,
    count: rows.filter((row) => test(row.longestStreak)).length,
  }));
}

export default function StreakSection({ month }) {
  const { data, isLoading, error } = useAttendanceStreak(month);
  const [search, setSearch] = useState('');
  const rows = data?.employees || [];
  const filteredRows = search
    ? rows.filter((row) => row.employeeName.toLowerCase().includes(search.toLowerCase()))
    : rows;
  const { sortedRows, sort, handleSort } = useSortableRows(filteredRows, SORT_ACCESSORS, { key: 'longestStreak', direction: 'desc' });
  const { pageRows, currentPage, totalPages, rangeStart, rangeEnd, setPage } = usePagination(sortedRows, `${search}-${sort.key}-${sort.direction}`);
  const bucketData = bucketStreaks(rows);

  return (
    <section className="card">
      <CardHeader
        title="Longest Attendance Streak"
        description={`Longest run of consecutive working days (Mon-Fri) with a Full Day or Half Day record in ${formatMonth(month)}. Weekends are holidays and are skipped; only an absence on a working day breaks the streak.`}
        actions={
          rows.length > 0 && (
            <input
              type="search"
              className="search-input"
              placeholder="Search employee..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search employee"
            />
          )
        }
      />

      <StateMessage isLoading={isLoading} error={error} isEmpty={rows.length === 0} emptyText="No employees found." />

      {rows.length > 0 && (
        <>
          <div className="chart-wrap">
            <ResponsiveContainer>
              <BarChart data={bucketData} barCategoryGap={24}>
                <CartesianGrid vertical={false} stroke={CHART_GRID_STROKE} />
                <XAxis dataKey="label" tickLine={false} axisLine={CHART_AXIS_LINE} tick={CHART_AXIS_TICK} />
                <YAxis allowDecimals={false} tick={CHART_AXIS_TICK} tickLine={false} axisLine={false} width={32} />
                <Tooltip cursor={CHART_TOOLTIP_CURSOR} formatter={(value) => [value, 'Employees']} labelFormatter={(label) => `Streak: ${label} day${label === '1' ? '' : 's'}`} />
                <Bar dataKey="count" name="Employees" fill={ATTENDANCE_TYPE_COLORS.FULL_DAY} maxBarSize={64} isAnimationActive={false} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <StateMessage isEmpty={sortedRows.length === 0} emptyText="No employees match this search." />

          {sortedRows.length > 0 && (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <SortableHeader label="Employee" sortKey="employeeName" sort={sort} onSort={handleSort} />
                      <SortableHeader label="Longest Streak (days)" sortKey="longestStreak" sort={sort} onSort={handleSort} numeric />
                      <SortableHeader label="Start Date" sortKey="startDate" sort={sort} onSort={handleSort} />
                      <SortableHeader label="End Date" sortKey="endDate" sort={sort} onSort={handleSort} />
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((row) => (
                      <tr key={row.employeeId}>
                        <td>
                          {row.employeeName}
                          <div className="stat-hint">{row.designation}</div>
                        </td>
                        <td className="numeric">
                          <div className="streak-cell">
                            <span>{row.longestStreak}</span>
                            <span className="streak-meter">
                              <span
                                className="streak-meter-fill"
                                style={{ width: `${Math.min(100, (row.longestStreak / 5) * 100)}%` }}
                              />
                            </span>
                          </div>
                        </td>
                        <td>{formatDate(row.startDate)}</td>
                        <td>{formatDate(row.endDate)}</td>
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
                total={sortedRows.length}
                onPageChange={setPage}
              />
            </>
          )}
        </>
      )}
    </section>
  );
}
