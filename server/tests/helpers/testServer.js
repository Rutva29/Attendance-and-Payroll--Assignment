// runs tests against a separate "_test" db, rebuilt from schema+seed each time
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
process.env.DB_NAME = `${process.env.DB_NAME}_test`;

const { setupDatabase } = require('../../src/db/setup');
const app = require('../../src/app');
const pool = require('../../src/db/pool');

let server;
let baseUrl;

async function startTestServer() {
  await setupDatabase(process.env.DB_NAME);
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
}

async function stopTestServer() {
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
}

async function api(method, route, body) {
  const response = await fetch(`${baseUrl}${route}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
}

module.exports = { startTestServer, stopTestServer, api };
