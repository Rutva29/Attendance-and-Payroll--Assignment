const pool = require('../db/pool');

const EMPLOYEE_COLUMNS = `
  id,
  name,
  email,
  designation,
  monthly_salary AS monthlySalary,
  status,
  created_at AS createdAt,
  modified_at AS modifiedAt
`;

async function findActive() {
  const [rows] = await pool.execute(
    `SELECT ${EMPLOYEE_COLUMNS} FROM employees WHERE status = 'ACTIVE' ORDER BY name`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(`SELECT ${EMPLOYEE_COLUMNS} FROM employees WHERE id = ?`, [id]);
  return rows[0] || null;
}

module.exports = { findActive, findById };
