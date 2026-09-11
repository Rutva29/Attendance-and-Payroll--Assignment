import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import CardHeader from './CardHeader';
import StateMessage from './StateMessage';
import StatusBadge from './StatusBadge';
import SortableHeader from './SortableHeader';
import Pagination from './Pagination';
import { useRisk } from '../hooks/useStatistics';
import { useSortableRows } from '../hooks/useSortableRows';
import { usePagination } from '../hooks/usePagination';
import { formatDate } from '../utils/format';
import { RISK_CATEGORY_LABELS, RISK_CATEGORY_COLORS } from '../types/attendance';
import { CHART_GRID_STROKE, CHART_AXIS_LINE, CHART_AXIS_TICK, CHART_TOOLTIP_CURSOR, CHART_BAR_SEPARATOR } from '../utils/chartTheme';

const RISK_TONE = {
  LOW: 'success',
  MEDIUM: 'medium',
  HIGH: 'high',
  NO_DATA: 'neutral',
};

const RISK_ORDER = ['LOW', 'MEDIUM', 'HIGH', 'NO_DATA'];

// no sort on Risk Category, it's just derived from Risk Score
const SORT_ACCESSORS = {
  employeeName: (row) => row.employeeName.toLowerCase(),
  totalWorkingDays: (row) => row.totalWorkingDays,
  fullDays: (row) => row.fullDays,
  halfDays: (row) => row.halfDays,
  absentDays: (row) => row.absentDays,
  penaltyPoints: (row) => row.penaltyPoints,
  riskScore: (row) => row.riskScore,
};

// a bar-per-employee chart stops being readable past a handful of employees, so the chart
// shows headcount per risk category instead - it reads the same at 5 employees or 500
function bucketByCategory(rows) {
  return RISK_ORDER.map((category) => ({
    category,
    label: RISK_CATEGORY_LABELS[category],
    count: rows.filter((row) => row.riskCategory === category).length,
  }));
}

export default function RiskSection({ month }) {
  const { data, isLoading, error } = useRisk(month);
  const [search, setSearch] = useState('');
  const rows = data?.employees || [];
  const filteredRows = search
    ? rows.filter((row) => row.employeeName.toLowerCase().includes(search.toLowerCase()))
    : rows;
  const { sortedRows, sort, handleSort } = useSortableRows(filteredRows, SORT_ACCESSORS, { key: 'riskScore', direction: 'desc' });
  const { pageRows, currentPage, totalPages, rangeStart, rangeEnd, setPage } = usePagination(sortedRows, `${search}-${sort.key}-${sort.direction}`);
  const bucketData = bucketByCategory(rows);

  return (
    <section className="card">
      <CardHeader
        title="Attendance Stability and Salary Risk Score"
        description={`Penalty points over the last 3 calendar months${data ? ` (${formatDate(data.startDate)} to ${formatDate(data.endDate)})` : ''}: Absent = 2, Half Day = 1, Full Day = 0. Risk score = penalty points / recorded working days. Low below 0.25, Medium below 0.5, High from 0.5.`}
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
                <Tooltip cursor={CHART_TOOLTIP_CURSOR} formatter={(value) => [value, 'Employees']} />
                <Bar dataKey="count" name="Employees" maxBarSize={64} isAnimationActive={false} radius={[4, 4, 0, 0]}>
                  {bucketData.map((bucket) => (
                    <Cell key={bucket.category} fill={RISK_CATEGORY_COLORS[bucket.category]} stroke={CHART_BAR_SEPARATOR} />
                  ))}
                </Bar>
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
                      <SortableHeader label="Working Days" sortKey="totalWorkingDays" sort={sort} onSort={handleSort} numeric />
                      <SortableHeader label="Full Days" sortKey="fullDays" sort={sort} onSort={handleSort} numeric />
                      <SortableHeader label="Half Days" sortKey="halfDays" sort={sort} onSort={handleSort} numeric />
                      <SortableHeader label="Absents" sortKey="absentDays" sort={sort} onSort={handleSort} numeric />
                      <SortableHeader label="Penalty Points" sortKey="penaltyPoints" sort={sort} onSort={handleSort} numeric />
                      <SortableHeader label="Risk Score" sortKey="riskScore" sort={sort} onSort={handleSort} numeric />
                      <th>Risk Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((row) => (
                      <tr key={row.employeeId}>
                        <td>
                          {row.employeeName}
                          <div className="stat-hint">{row.designation}</div>
                        </td>
                        <td className="numeric">{row.totalWorkingDays}</td>
                        <td className="numeric">{row.fullDays}</td>
                        <td className="numeric">{row.halfDays}</td>
                        <td className="numeric">{row.absentDays}</td>
                        <td className="numeric">{row.penaltyPoints}</td>
                        <td className="numeric">{row.riskScore === null ? '-' : row.riskScore.toFixed(2)}</td>
                        <td>
                          <StatusBadge tone={RISK_TONE[row.riskCategory]}>{RISK_CATEGORY_LABELS[row.riskCategory]}</StatusBadge>
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
