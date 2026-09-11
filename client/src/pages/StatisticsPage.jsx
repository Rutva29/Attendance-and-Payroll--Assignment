import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import MonthPicker from '../components/MonthPicker';
import StatCard from '../components/StatCard';
import StreakSection from '../components/StreakSection';
import PayrollSection from '../components/PayrollSection';
import RiskSection from '../components/RiskSection';
import { IconUsers, IconWallet, IconAlertCircle, IconClockCheck } from '../components/icons';
import { useAttendanceStreak, usePayroll, useRisk } from '../hooks/useStatistics';
import { currentMonth } from '../utils/attendance';
import { formatCurrency, formatMonth } from '../utils/format';

// glance-able totals so a large roster doesn't have to be scanned row by row
// to answer "how are we doing overall" - see each section's table/chart for detail
export default function StatisticsPage() {
  const [month, setMonth] = useState(currentMonth());

  const streakQuery = useAttendanceStreak(month);
  const payrollQuery = usePayroll(month);
  const riskQuery = useRisk(month);

  const streakEmployees = streakQuery.data?.employees || [];
  const payrollEmployees = payrollQuery.data?.employees || [];
  const riskEmployees = riskQuery.data?.employees || [];
  const hasKpiData = streakEmployees.length > 0 || payrollEmployees.length > 0 || riskEmployees.length > 0;

  const headcount = payrollEmployees.length || streakEmployees.length || riskEmployees.length;
  const totalNetPayable = payrollEmployees.reduce((sum, row) => sum + Number(row.netPayable), 0);
  const atRiskCount = riskEmployees.filter((row) => row.riskCategory === 'MEDIUM' || row.riskCategory === 'HIGH').length;
  const noStreakCount = streakEmployees.filter((row) => row.longestStreak === 0).length;

  return (
    <>
      <PageHeader
        title="Attendance and Payroll Statistics"
        description={`Attendance streaks, payroll deductions and risk scores for ${formatMonth(month)}.`}
        actions={<MonthPicker value={month} onChange={setMonth} />}
      />

      {hasKpiData && (
        <div className="stat-grid">
          <StatCard label="Active Employees" value={headcount} tone="primary" icon={<IconUsers size={20} />} />
          <StatCard label="Total Net Payable" value={formatCurrency(totalNetPayable)} tone="success" icon={<IconWallet size={20} />} hint={`For ${formatMonth(month)}`} />
          <StatCard label="Medium/High Risk" value={atRiskCount} tone="danger" icon={<IconAlertCircle size={20} />} hint="Last 3 months" />
          <StatCard label="No Streak Yet" value={noStreakCount} tone="warning" icon={<IconClockCheck size={20} />} hint="0-day longest streak" />
        </div>
      )}

      <StreakSection month={month} />
      <PayrollSection month={month} />
      <RiskSection month={month} />
    </>
  );
}
