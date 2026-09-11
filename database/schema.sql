-- schema for attendance_payroll db
-- either create the db manually and run this, or just use `npm run db:setup` in /server
--   CREATE DATABASE attendance_payroll CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
--   USE attendance_payroll;

DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS employees;

CREATE TABLE employees (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name           VARCHAR(100) NOT NULL,
  email          VARCHAR(150) NOT NULL,
  designation    VARCHAR(100) NOT NULL,
  monthly_salary DECIMAL(10, 2) NOT NULL,
  status         ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_employees_email (email),
  KEY idx_employees_status (status)
) ENGINE = InnoDB;

CREATE TABLE attendance (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  employee_id     INT UNSIGNED NOT NULL,
  date            DATE NOT NULL,
  check_in        TIME NULL,
  check_out       TIME NULL,
  working_hours   DECIMAL(5, 2) NOT NULL DEFAULT 0,
  attendance_type ENUM('FULL_DAY', 'HALF_DAY', 'ABSENT') NOT NULL,
  -- PRESENT if check-in/check-out recorded, ABSENT otherwise
  status          ENUM('PRESENT', 'ABSENT') NOT NULL DEFAULT 'PRESENT',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  -- one record per employee per day, enforced by the db itself
  UNIQUE KEY uq_attendance_employee_date (employee_id, date),
  KEY idx_attendance_date (date),
  KEY idx_attendance_type (attendance_type),
  -- covers the stats queries filtering by date range + employee/type
  KEY idx_attendance_date_employee_type (date, employee_id, attendance_type),
  CONSTRAINT fk_attendance_employee
    FOREIGN KEY (employee_id) REFERENCES employees (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;
