const pool = require('../db/pool');

// weekday_number counts only Mon-Fri across the range, so it advances by 1 from a Friday
// to the following Monday. weekday_number minus day_number then stays constant across a
// weekend for an employee with no gap, so weekends don't break the streak - only an actual
// absence (a weekday with no payable row) does.
const LONGEST_STREAK_SQL = `
  WITH RECURSIVE calendar_days AS (
    SELECT CAST(? AS DATE) AS calendar_date
    UNION ALL
    SELECT calendar_date + INTERVAL 1 DAY
    FROM calendar_days
    WHERE calendar_date < CAST(? AS DATE)
  ),
  weekdays AS (
    SELECT
      calendar_date,
      ROW_NUMBER() OVER (ORDER BY calendar_date) AS weekday_number
    FROM calendar_days
    WHERE WEEKDAY(calendar_date) < 5
  ),
  payable_days AS (
    SELECT
      a.employee_id,
      a.date,
      w.weekday_number,
      ROW_NUMBER() OVER (PARTITION BY a.employee_id ORDER BY a.date) AS day_number
    FROM attendance a
    JOIN weekdays w ON w.calendar_date = a.date
    WHERE a.date BETWEEN ? AND ?
      AND a.attendance_type IN ('FULL_DAY', 'HALF_DAY')
  ),
  streaks AS (
    SELECT
      employee_id,
      MIN(date) AS start_date,
      MAX(date) AS end_date,
      COUNT(*) AS streak_length
    FROM payable_days
    GROUP BY employee_id, (weekday_number - day_number)
  ),
  ranked_streaks AS (
    SELECT
      employee_id,
      start_date,
      end_date,
      streak_length,
      ROW_NUMBER() OVER (PARTITION BY employee_id ORDER BY streak_length DESC, start_date ASC) AS streak_rank
    FROM streaks
  )
  SELECT
    e.id AS employeeId,
    e.name AS employeeName,
    e.designation,
    COALESCE(s.streak_length, 0) AS longestStreak,
    s.start_date AS startDate,
    s.end_date AS endDate
  FROM employees e
  LEFT JOIN ranked_streaks s ON s.employee_id = e.id AND s.streak_rank = 1
  WHERE e.status = 'ACTIVE'
  ORDER BY longestStreak DESC, e.name ASC
`;

async function longestStreakByEmployee(startDate, endDate) {
  const [rows] = await pool.execute(LONGEST_STREAK_SQL, [startDate, endDate, startDate, endDate]);
  return rows;
}

// recursive CTE counts actual Mon-Fri days in the month, no hardcoded 22
// elapsed_working_days caps at today so future working days are never treated as absent -
// only a past/current working day with no FULL_DAY/HALF_DAY row counts against the employee,
// instead of silently defaulting a missing record to "present".
const PAYROLL_SQL = `
  WITH RECURSIVE month_dates AS (
    SELECT CAST(? AS DATE) AS calendar_date
    UNION ALL
    SELECT calendar_date + INTERVAL 1 DAY
    FROM month_dates
    WHERE calendar_date < CAST(? AS DATE)
  ),
  working_days AS (
    SELECT
      COUNT(*) AS total_working_days,
      SUM(calendar_date <= CAST(? AS DATE)) AS elapsed_working_days
    FROM month_dates
    WHERE WEEKDAY(calendar_date) < 5
  ),
  attendance_summary AS (
    SELECT
      employee_id,
      SUM(attendance_type = 'FULL_DAY') AS full_days,
      SUM(attendance_type = 'HALF_DAY') AS half_days
    FROM attendance
    WHERE date BETWEEN ? AND ?
    GROUP BY employee_id
  ),
  salary_base AS (
    SELECT
      e.id,
      e.name,
      e.designation,
      e.monthly_salary,
      w.total_working_days,
      ROUND(e.monthly_salary / w.total_working_days, 2) AS per_day_salary,
      COALESCE(s.half_days, 0) AS half_days,
      GREATEST(w.elapsed_working_days - COALESCE(s.full_days, 0) - COALESCE(s.half_days, 0), 0) AS absent_days
    FROM employees e
    CROSS JOIN working_days w
    LEFT JOIN attendance_summary s ON s.employee_id = e.id
    WHERE e.status = 'ACTIVE'
  ),
  deductions AS (
    SELECT
      salary_base.*,
      ROUND(half_days * per_day_salary * 0.5, 2) AS half_day_deduction,
      ROUND(absent_days * per_day_salary, 2) AS absent_deduction
    FROM salary_base
  )
  SELECT
    id AS employeeId,
    name AS employeeName,
    designation,
    monthly_salary AS monthlySalary,
    total_working_days AS totalWorkingDays,
    per_day_salary AS perDaySalary,
    half_days AS halfDays,
    absent_days AS absentDays,
    half_day_deduction AS halfDayDeduction,
    absent_deduction AS absentDeduction,
    half_day_deduction + absent_deduction AS totalDeduction,
    monthly_salary - (half_day_deduction + absent_deduction) AS netPayable
  FROM deductions
  ORDER BY name ASC
`;

async function payrollByEmployee(startDate, endDate, today) {
  const [rows] = await pool.execute(PAYROLL_SQL, [startDate, endDate, today, startDate, endDate]);
  return rows;
}

// risk score = penalty points / working days. absent=2, half day=1, full day=0.
// WEEKDAY guard here too, same as the streak query, just to be explicit about it
const RISK_SQL = `
  WITH attendance_points AS (
    SELECT
      e.id,
      e.name,
      e.designation,
      COUNT(a.id) AS total_working_days,
      COALESCE(SUM(a.attendance_type = 'FULL_DAY'), 0) AS full_days,
      COALESCE(SUM(a.attendance_type = 'HALF_DAY'), 0) AS half_days,
      COALESCE(SUM(a.attendance_type = 'ABSENT'), 0) AS absent_days,
      COALESCE(SUM(CASE a.attendance_type
        WHEN 'ABSENT' THEN 2
        WHEN 'HALF_DAY' THEN 1
        ELSE 0
      END), 0) AS penalty_points
    FROM employees e
    LEFT JOIN attendance a ON a.employee_id = e.id AND a.date BETWEEN ? AND ? AND WEEKDAY(a.date) < 5
    WHERE e.status = 'ACTIVE'
    GROUP BY e.id, e.name, e.designation
  ),
  scored AS (
    SELECT
      attendance_points.*,
      ROUND(penalty_points / NULLIF(total_working_days, 0), 2) AS risk_score
    FROM attendance_points
  )
  SELECT
    id AS employeeId,
    name AS employeeName,
    designation,
    total_working_days AS totalWorkingDays,
    full_days AS fullDays,
    half_days AS halfDays,
    absent_days AS absentDays,
    penalty_points AS penaltyPoints,
    risk_score AS riskScore,
    CASE
      WHEN risk_score IS NULL THEN 'NO_DATA'
      WHEN risk_score < 0.25 THEN 'LOW'
      WHEN risk_score < 0.5 THEN 'MEDIUM'
      ELSE 'HIGH'
    END AS riskCategory
  FROM scored
  ORDER BY risk_score DESC, name ASC
`;

async function riskByEmployee(startDate, endDate) {
  const [rows] = await pool.execute(RISK_SQL, [startDate, endDate]);
  return rows;
}

module.exports = { longestStreakByEmployee, payrollByEmployee, riskByEmployee };
