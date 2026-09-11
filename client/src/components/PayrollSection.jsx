import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import CardHeader from './CardHeader';
import StateMessage from './StateMessage';
import SortableHeader from './SortableHeader';
import Pagination from './Pagination';
import { usePayroll } from '../hooks/useStatistics';
import { useSortableRows } from '../hooks/useSortableRows';
import { usePagination } from '../hooks/usePagination';
import { formatCurrency, formatMonth } from '../utils/format';
import { ATTENDANCE_TYPE_COLORS } from '../types/attendance';
import { CHART_GRID_STROKE, CHART_AXIS_LINE, CHART_AXIS_TICK, CHART_TOOLTIP_CURSOR, CHART_LEGEND_TEXT, CHART_BAR_SEPARATOR } from '../utils/chartTheme';

const CHART_EMPLOYEE_LIMIT = 10;

// Working Days and Per-day Salary are same for everyone this month, no point sorting them
const SORT_ACCESSORS = {
  employeeName: (row) => row.employeeName.toLowerCase(),
  monthlySalary: (row) => Number(row.monthlySalary),
  halfDays: (row) => row.halfDays,
  absentDays: (row) => row.absentDays,
  totalDeduction: (row) => Number(row.totalDeduction),
  netPayable: (row) => Number(row.netPayable),
};

export default function PayrollSection({ month }) {
  const { data, isLoading, error } = usePayroll(month);
  const [search, setSearch] = useState('');
  const rows = data?.employees || [];
  const workingDays = rows[0]?.totalWorkingDays;
  const filteredRows = search
    ? rows.filter((row) => row.employeeName.toLowerCase().includes(search.toLowerCase()))
    : rows;
  const { sortedRows, sort, handleSort } = useSortableRows(filteredRows, SORT_ACCESSORS, { key: 'employeeName', direction: 'asc' });
  const { pageRows, currentPage, totalPages, rangeStart, rangeEnd, setPage } = usePagination(sortedRows, `${search}-${sort.key}-${sort.direction}`);

  // a bar-per-employee chart stops being readable past a handful of employees, so it's
  // capped to the employees with the biggest deduction instead of showing everyone
  const chartRows = [...rows].sort((a, b) => Number(b.totalDeduction) - Number(a.totalDeduction)).slice(0, CHART_EMPLOYEE_LIMIT);

  return (
    <section className="card">
      <CardHeader
        title="Salary Deduction and Net Pay"
        description={`Per-day salary = monthly salary / working days (Monday to Friday) in ${formatMonth(month)}${workingDays ? ` (${workingDays} days)` : ''}. Half day deducts 0.5 day, absence deducts 1 day.`}
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
          {rows.length > CHART_EMPLOYEE_LIMIT && (
            <span className="stat-hint">Showing the {CHART_EMPLOYEE_LIMIT} employees with the biggest deduction</span>
          )}
          <div className="chart-wrap">
            <ResponsiveContainer>
              <BarChart data={chartRows} barCategoryGap={24}>
                <CartesianGrid vertical={false} stroke={CHART_GRID_STROKE} />
                <XAxis dataKey="employeeName" tickLine={false} axisLine={CHART_AXIS_LINE} tick={CHART_AXIS_TICK} />
                <YAxis tick={CHART_AXIS_TICK} tickLine={false} axisLine={false} width={64} tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                <Tooltip cursor={CHART_TOOLTIP_CURSOR} formatter={(value) => formatCurrency(value)} />
                <Legend formatter={(value) => <span style={{ color: CHART_LEGEND_TEXT }}>{value}</span>} itemSorter={(item) => ['netPayable', 'totalDeduction'].indexOf(item.dataKey)} />
                <Bar dataKey="netPayable" name="Net payable" stackId="salary" fill={ATTENDANCE_TYPE_COLORS.FULL_DAY} stroke={CHART_BAR_SEPARATOR} maxBarSize={48} isAnimationActive={false} />
                <Bar dataKey="totalDeduction" name="Deductions" stackId="salary" fill={ATTENDANCE_TYPE_COLORS.ABSENT} stroke={CHART_BAR_SEPARATOR} maxBarSize={48} isAnimationActive={false} />
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
                      <SortableHeader label="Monthly Salary" sortKey="monthlySalary" sort={sort} onSort={handleSort} numeric />
                      <th className="numeric">Working Days</th>
                      <th className="numeric">Per-day Salary</th>
                      <SortableHeader label="Half Days" sortKey="halfDays" sort={sort} onSort={handleSort} numeric />
                      <SortableHeader label="Absent Days" sortKey="absentDays" sort={sort} onSort={handleSort} numeric />
                      <th className="numeric">Half-day Deduction</th>
                      <th className="numeric">Absent Deduction</th>
                      <SortableHeader label="Total Deductions" sortKey="totalDeduction" sort={sort} onSort={handleSort} numeric />
                      <SortableHeader label="Net Payable" sortKey="netPayable" sort={sort} onSort={handleSort} numeric />
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((row) => (
                      <tr key={row.employeeId}>
                        <td>
                          {row.employeeName}
                          <div className="stat-hint">{row.designation}</div>
                        </td>
                        <td className="numeric">{formatCurrency(row.monthlySalary)}</td>
                        <td className="numeric">{row.totalWorkingDays}</td>
                        <td className="numeric">{formatCurrency(row.perDaySalary)}</td>
                        <td className="numeric">{row.halfDays}</td>
                        <td className="numeric">{row.absentDays}</td>
                        <td className="numeric">{formatCurrency(row.halfDayDeduction)}</td>
                        <td className="numeric">{formatCurrency(row.absentDeduction)}</td>
                        <td className="numeric">{formatCurrency(row.totalDeduction)}</td>
                        <td className="numeric">
                          <span className="net-pay-value">{formatCurrency(row.netPayable)}</span>
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
