import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import PageHeader from '../components/PageHeader';
import CardHeader from '../components/CardHeader';
import StatCard from '../components/StatCard';
import StateMessage from '../components/StateMessage';
import EmptyState from '../components/EmptyState';
import { IconCalendarCheck, IconAlertCircle, IconClockCheck, IconWallet } from '../components/icons';
import { useEmployees } from '../hooks/useEmployees';
import { useAttendanceList } from '../hooks/useAttendance';
import { usePayroll } from '../hooks/useStatistics';
import { currentMonth, monthRange, todayDate, isWeekend } from '../utils/attendance';
import { formatCurrency, formatDate, formatMonth } from '../utils/format';
import { ATTENDANCE_TYPE_COLORS, ATTENDANCE_TYPE_LABELS } from '../types/attendance';
import { CHART_LEGEND_TEXT, CHART_BAR_SEPARATOR } from '../utils/chartTheme';

function countByType(records, type) {
  return records.filter((record) => record.attendanceType === type).length;
}

export default function DashboardPage() {
  const month = currentMonth();
  const today = todayDate();
  const todayIsWeekend = isWeekend(today);

  const employeesQuery = useEmployees();
  const monthAttendanceQuery = useAttendanceList(monthRange(month));
  const todayAttendanceQuery = useAttendanceList({ startDate: today, endDate: today });
  const payrollQuery = usePayroll(month);

  const employees = employeesQuery.data || [];
  const monthRecords = monthAttendanceQuery.data || [];
  const todayRecords = todayAttendanceQuery.data || [];
  const payroll = payrollQuery.data?.employees || [];

  const isLoading =
    employeesQuery.isLoading ||
    monthAttendanceQuery.isLoading ||
    todayAttendanceQuery.isLoading ||
    payrollQuery.isLoading;
  const error = employeesQuery.error || monthAttendanceQuery.error || todayAttendanceQuery.error || payrollQuery.error;

  const totalSalaryBudget = payroll.reduce((sum, row) => sum + Number(row.monthlySalary), 0);
  const totalDeductions = payroll.reduce((sum, row) => sum + Number(row.totalDeduction), 0);
  const totalNetPayable = payroll.reduce((sum, row) => sum + Number(row.netPayable), 0);

  const todayFullDay = countByType(todayRecords, 'FULL_DAY');
  const todayHalfDay = countByType(todayRecords, 'HALF_DAY');
  const todayAbsent = countByType(todayRecords, 'ABSENT');
  const notMarked = Math.max(0, employees.length - todayRecords.length);

  const mixData = ['FULL_DAY', 'HALF_DAY', 'ABSENT']
    .map((type) => ({ type, name: ATTENDANCE_TYPE_LABELS[type], value: countByType(monthRecords, type) }))
    .filter((slice) => slice.value > 0);

  return (
    <>
      <PageHeader title="Dashboard" description={`Overview for ${formatMonth(month)}.`} />

      <StateMessage isLoading={isLoading} error={error} />

      {!isLoading && !error && (
        <>
          <div className="card">
            <CardHeader
              title="Today's Attendance"
              description={
                todayIsWeekend
                  ? `${formatDate(today)} is a weekend, no attendance is expected today.`
                  : `Live snapshot for ${formatDate(today)}, out of ${employees.length} active employee${employees.length === 1 ? '' : 's'}.`
              }
            />
            {todayIsWeekend ? (
              <EmptyState title="Non-working day" message="Attendance cannot be recorded on Saturday or Sunday." />
            ) : (
              <div className="stat-grid">
                <StatCard label="Full Day" value={todayFullDay} tone="primary" icon={<IconCalendarCheck size={20} />} />
                <StatCard label="Half Day" value={todayHalfDay} tone="warning" icon={<IconCalendarCheck size={20} />} />
                <StatCard label="Absent" value={todayAbsent} tone="danger" icon={<IconAlertCircle size={20} />} />
                <StatCard
                  label="Not Marked Yet"
                  value={notMarked}
                  tone="primary"
                  icon={<IconClockCheck size={20} />}
                  hint="No attendance entered today"
                />
              </div>
            )}
          </div>

          <div className="card">
            <CardHeader title="This Month's Payroll" description={`Salary summary for ${formatMonth(month)}.`} />
            <div className="stat-grid">
              <StatCard
                label="Total Salary Budget"
                value={formatCurrency(totalSalaryBudget)}
                tone="primary"
                icon={<IconWallet size={20} />}
                hint="Before deductions"
              />
              <StatCard
                label="Total Deductions"
                value={formatCurrency(totalDeductions)}
                tone="danger"
                icon={<IconAlertCircle size={20} />}
                hint="Half day and absent deductions"
              />
              <StatCard
                label="Net Payable"
                value={formatCurrency(totalNetPayable)}
                tone="success"
                icon={<IconWallet size={20} />}
                hint="After deductions"
              />
            </div>
          </div>

          <div className="card">
            <CardHeader
              title="Attendance Mix"
              description={`Share of Full Day, Half Day and Absent records in ${formatMonth(month)}.`}
            />
            {mixData.length === 0 ? (
              <EmptyState title="No attendance recorded yet" message="Attendance for this month will appear here once it is added." />
            ) : (
              <div className="chart-wrap">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={mixData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="55%"
                      outerRadius="85%"
                      paddingAngle={2}
                      isAnimationActive={false}
                    >
                      {mixData.map((slice) => (
                        <Cell key={slice.type} fill={ATTENDANCE_TYPE_COLORS[slice.type]} stroke={CHART_BAR_SEPARATOR} strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      formatter={(value) => <span style={{ color: CHART_LEGEND_TEXT }}>{value}</span>}
                      itemSorter={(item) => ['FULL_DAY', 'HALF_DAY', 'ABSENT'].indexOf(item.payload.type)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
