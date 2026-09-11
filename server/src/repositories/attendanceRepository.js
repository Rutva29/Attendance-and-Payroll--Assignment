const pool = require('../db/pool');

// join employee here so we're not doing one lookup per row
const ATTENDANCE_SELECT = `
  SELECT
    a.id,
    a.employee_id AS employeeId,
    e.name AS employeeName,
    e.designation AS employeeDesignation,
    a.date,
    TIME_FORMAT(a.check_in, '%H:%i') AS checkIn,
    TIME_FORMAT(a.check_out, '%H:%i') AS checkOut,
    a.working_hours AS workingHours,
    a.attendance_type AS attendanceType,
    a.status,
    a.created_at AS createdAt,
    a.modified_at AS modifiedAt
  FROM attendance a
  INNER JOIN employees e ON e.id = a.employee_id
`;

async function findAll({ employeeId, startDate, endDate, attendanceType }) {
  const conditions = [];
  const params = [];

  if (employeeId) {
    conditions.push('a.employee_id = ?');
    params.push(employeeId);
  }
  if (startDate) {
    conditions.push('a.date >= ?');
    params.push(startDate);
  }
  if (endDate) {
    conditions.push('a.date <= ?');
    params.push(endDate);
  }
  if (attendanceType) {
    conditions.push('a.attendance_type = ?');
    params.push(attendanceType);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.execute(
    `${ATTENDANCE_SELECT} ${where} ORDER BY a.date DESC, e.name ASC`,
    params
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(`${ATTENDANCE_SELECT} WHERE a.id = ?`, [id]);
  return rows[0] || null;
}

async function findByEmployeeAndDate(employeeId, date, excludeId = null) {
  const [rows] = await pool.execute(
    `SELECT id FROM attendance
     WHERE employee_id = ? AND date = ? AND (? IS NULL OR id <> ?)`,
    [employeeId, date, excludeId, excludeId]
  );
  return rows[0] || null;
}

async function create(record) {
  const [result] = await pool.execute(
    `INSERT INTO attendance (employee_id, date, check_in, check_out, working_hours, attendance_type, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [record.employeeId, record.date, record.checkIn, record.checkOut, record.workingHours, record.attendanceType, record.status]
  );
  return result.insertId;
}

async function update(id, record) {
  const [result] = await pool.execute(
    `UPDATE attendance
     SET employee_id = ?, date = ?, check_in = ?, check_out = ?, working_hours = ?, attendance_type = ?, status = ?
     WHERE id = ?`,
    [record.employeeId, record.date, record.checkIn, record.checkOut, record.workingHours, record.attendanceType, record.status, id]
  );
  return result.affectedRows > 0;
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM attendance WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, findByEmployeeAndDate, create, update, remove };
