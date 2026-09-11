# Attendance and Payroll Management

A small internal HR application for recording daily employee attendance and deriving payroll
statistics from it. Attendance is classified as Full Day, Half Day or Absent from check-in and
check-out times, and three statistics are computed in SQL: longest attendance streak, salary
deductions with net pay, and a three-month attendance risk score.

## Features

- Add, edit and delete attendance records with instant working-hours calculation
- Weekend and duplicate protection on the client, the API and the database
- Attendance listing with employee, date range and attendance type filters, sortable columns
  and pagination (20 rows per page)
- Dashboard with today's attendance snapshot, this month's payroll summary and an attendance
  mix chart, all built from the same attendance and statistics data, no separate endpoint
- Statistics page with three SQL-driven reports for a selected month, each table sortable:
  - Longest attendance streak per employee
  - Salary deduction and net pay
  - Attendance stability and salary risk score
- Consistent JSON API with validation and centralized error handling
- Automated tests for the business rules, the API and the statistics queries

## Tech stack

| Layer    | Technology                                                            |
| -------- | --------------------------------------------------------------------- |
| Frontend | React 18, Vite, React Router, TanStack React Query, Axios, Recharts   |
| Backend  | Node.js 22, Express, mysql2 (raw SQL, no ORM), express-validator      |
| Database | MySQL 8 (CTEs, window functions, recursive CTE)                       |
| Tests    | Node.js built-in test runner (backend), Vitest (frontend utilities)   |

## Project structure

```
attendance-payroll/
  client/                 React application (Vite)
    src/
      components/         Form, filters, table, statistics sections, layout,
                           and shared pieces (CardHeader, SortableHeader, StatusBadge, icons)
      hooks/              React Query hooks plus the shared table-sorting hook
      pages/              Dashboard, Attendance, Statistics
      services/           Axios API layer and the React Query key factory
      types/              Attendance constants and labels
      utils/              Attendance rules, formatting, chart theme and table sorting (with tests)
  server/                 Express API
    src/
      controllers/        HTTP handlers (wrapped in asyncHandler, no repeated try/catch)
      routes/             Endpoint definitions with validation middleware
      services/           Business rules (attendance derivation, statistics periods)
      repositories/       Raw SQL through mysql2 (statistics queries live here)
      validators/         express-validator chains
      middleware/         Validation runner and error handler
      db/                 Connection pool and database setup script
      utils/              Attendance rules, ApiError and asyncHandler
    tests/                Backend tests
  database/
    schema.sql            Tables, constraints and indexes
    seed.sql              Sample employees and three months of attendance
    queries.sql           The important SQL queries with explanations
```

## Prerequisites

- Node.js 22 or newer
- MySQL 8.0 or newer
- npm

## Database setup

Make sure the local MySQL server is running (on Windows, check the MySQL service in
Services, or start it from MySQL Workbench / the MySQL Installer). Use a MySQL user with
permission to create databases, or use root locally.

Option A - let the setup script do everything (creates the database if needed, then applies
`database/schema.sql` and `database/seed.sql`):

```bash
cd server
cp .env.example .env      # fill in DB_USER / DB_PASSWORD / DB_PORT for your local install
npm install
npm run db:setup
```

If the password contains a `#` or other special character, wrap it in double quotes in
`.env`, for example `DB_PASSWORD="my#pass"`, otherwise it will be truncated.

Option B - run the scripts manually with the MySQL client:

```sql
CREATE DATABASE attendance_payroll CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE attendance_payroll;
SOURCE database/schema.sql;
SOURCE database/seed.sql;
```

`schema.sql` drops and recreates the two tables, so either option can be re-run to reset the data.

## Environment variables

Backend (`server/.env`, see `server/.env.example`):

| Variable        | Description                                  | Default                 |
| --------------- | -------------------------------------------- | ----------------------- |
| `PORT`          | API port                                     | `5000`                  |
| `CLIENT_ORIGIN` | Allowed CORS origin for the frontend         | `http://localhost:5173` |
| `DB_HOST`       | MySQL host                                   |                         |
| `DB_PORT`       | MySQL port                                   | `3306`                  |
| `DB_USER`       | MySQL user                                   |                         |
| `DB_PASSWORD`   | MySQL password                               |                         |
| `DB_NAME`       | Database name                                | `attendance_payroll`    |

Frontend (`client/.env`, optional, see `client/.env.example`):

| Variable       | Description   | Default                     |
| -------------- | ------------- | --------------------------- |
| `VITE_API_URL` | API base URL  | `http://localhost:5000/api` |

## Running the application

Backend:

```bash
cd server
npm install
npm run dev        # or npm start
```

Frontend (in a second terminal):

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173.

## Running the tests

Backend tests create and use a separate database named `<DB_NAME>_test` (for example
`attendance_payroll_test`), rebuilt from `schema.sql` and `seed.sql` before each test file.
They need a running MySQL and the same `.env` as the server.

```bash
cd server
npm test
```

Frontend utility tests:

```bash
cd client
npm test
```

## API endpoints

All responses use `{ "success": true, "data": ... }` or `{ "success": false, "message": "..." }`.

| Method | Endpoint                                        | Description                                           |
| ------ | ----------------------------------------------- | ----------------------------------------------------- |
| GET    | `/api/employees`                                | Active employees                                      |
| GET    | `/api/employees/:id`                            | One employee                                          |
| GET    | `/api/attendance`                               | List attendance, filters: `employeeId`, `startDate`, `endDate`, `attendanceType` |
| GET    | `/api/attendance/:id`                           | One attendance record                                 |
| POST   | `/api/attendance`                               | Create attendance                                     |
| PUT    | `/api/attendance/:id`                           | Update attendance                                     |
| DELETE | `/api/attendance/:id`                           | Delete attendance                                     |
| GET    | `/api/statistics/attendance-streak?month=YYYY-MM` | Longest streak per employee                         |
| GET    | `/api/statistics/payroll?month=YYYY-MM`         | Salary deduction and net pay                          |
| GET    | `/api/statistics/risk?month=YYYY-MM`            | Attendance stability and risk score                   |

Create/update request body:

```json
{
  "employeeId": 1,
  "date": "2026-09-04",
  "checkIn": "09:00",
  "checkOut": "17:30"
}
```

`checkIn` and `checkOut` may both be empty or null to record an absent day. Working hours,
attendance type and status are always derived on the server and never taken from the request.

Status codes: `400` validation error, `404` missing resource, `409` duplicate attendance,
`500` unexpected error.

## Attendance business rules

- Working hours = check-out minus check-in, rounded to two decimals. The form calculates this
  immediately and the API recalculates it before saving.
- Full Day: working hours >= 8. Half Day: >= 4 and < 8. Absent: < 4 or no times recorded.
- Check-in and check-out must be given together, and check-out must be later than check-in.
- Only Monday to Friday can be recorded. The form validates the chosen date and the API rejects
  weekends independently.
- One record per employee per date. The form checks before submitting, the API checks before
  writing, and the `UNIQUE (employee_id, date)` constraint is the final guard; a constraint
  violation is returned as a clean `409` response.
- Attendance can only be recorded for active employees.
- Dates are handled as plain `YYYY-MM-DD` strings and times as `HH:MM` strings end to end, so
  no timezone conversion takes place in the browser, the API or MySQL.

## Statistics calculation rules

All three statistics are computed entirely in SQL (see `database/queries.sql` and
`server/src/repositories/statisticsRepository.js`). Node.js only supplies the date boundaries.

### Longest attendance streak (selected month)

- A payable day is a Full Day or Half Day record on a Monday to Friday date.
- The streak is the longest run of consecutive weekdays with payable days.
- An Absent record breaks the streak. Weekends are holidays, not workdays, so they neither
  count toward the streak nor break it (a Friday and the following Monday chain together if
  both are payable).
- Returns one row per active employee with the streak length, start date and end date. Ties are
  resolved by the earliest streak.

### Salary deduction and net pay (selected month)

- Working days = number of Monday to Friday dates in the month, counted with a recursive CTE.
- Per-day salary = monthly salary / working days.
- Absent days = elapsed working days (Mon-Fri dates up to today) minus Full Day rows minus Half
  Day rows. A working day that has already passed with no attendance row counts as absent -
  it is never silently treated as present. Working days later in the month that haven't
  happened yet are excluded and never penalised.
- Half-day deduction = half days x 0.5 x per-day salary.
- Absent deduction = absent days x per-day salary.
- Net payable = monthly salary - (half-day deduction + absent deduction).
- All amounts are DECIMAL and rounded to two places in SQL.

### Attendance stability and salary risk score (last 3 months)

- Period = the selected month and the two calendar months before it. For `month=2026-09` the
  period is 1 July 2026 to 30 September 2026.
- Penalty points: Absent = 2, Half Day = 1, Full Day = 0.
- Total working days = days in the period that have an attendance record for the employee.
- Risk score = total penalty points / total working days, rounded to two decimals.
- Category: Low Risk < 0.25, Medium Risk < 0.5, High Risk >= 0.5. Employees with no records in
  the period are reported as No Data.

## SQL approach

- All queries are parameterized with mysql2 prepared statements; user input is never interpolated.
- The attendance list joins employees in a single query and appends filter conditions only when
  the filter is supplied.
- The streak query uses `ROW_NUMBER()` and the "date minus row number" technique to group
  consecutive dates, then ranks the groups per employee with a second window function.
- The payroll query uses a recursive CTE to enumerate the month and count working days, then
  chains CTEs for the attendance summary, per-day salary and deductions so each step is readable.
- The risk query aggregates penalty points with a `CASE` expression and classifies the score in
  the final `SELECT`.
- Indexes: `UNIQUE (employee_id, date)` for duplicate protection and per-employee lookups,
  `date`, `attendance_type`, and a composite `(date, employee_id, attendance_type)` covering the
  statistics queries that filter by date range and group by employee and type.

## Seed data

`database/seed.sql` creates six employees (one inactive) and attendance for every working day
from 1 July 2026 to 4 September 2026 for the five active employees. The patterns are chosen so
the statistics differ visibly per employee: one employee has almost perfect attendance, one is
absent most Mondays and Fridays (High Risk), one is absent every Friday in August (August streak
of 4), and Aarav Sharma's August starts with Full, Full, Half, Full, Absent, Full.

## A note on the dashboard

"Today's Attendance" and "This Month's Payroll" read the real current date, not a fixed
demo date. On a day nothing has been recorded yet, that panel correctly shows zeros with
a "Not Marked Yet" count rather than fake numbers, that is expected behavior for a live
system, not missing data. The seeded historical data (July to early September 2026) does
not depend on today's date and stays available in the Attendance page and the Statistics
page's month picker regardless of when the app is opened.

## Screenshots

Screenshots of the following screens can be captured after seeding the database:

- Attendance Management page (form and listing)
- Attendance filters
- Longest Attendance Streak statistic
- Salary Deduction and Net Pay statistic
- Attendance Stability and Risk Score statistic
