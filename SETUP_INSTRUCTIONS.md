# Setup Instructions - Attendance and Payroll Management

This file covers everything needed to install, configure and run the project locally:
prerequisites, database setup, environment variables, and how to start the backend and
frontend. The database schema and SQL queries are in the database folder, described below.

## 1. Prerequisites

- Node.js 22 or newer
- MySQL 8.0 or newer
- npm (comes with Node.js)

## 2. Project structure

```
attendance-payroll/
  client/            React frontend (Vite)
  server/            Express backend (REST API)
  database/
    schema.sql       Table definitions, constraints and indexes
    seed.sql         Sample employees and attendance data
    queries.sql      The main SQL queries used by the app, with short explanations
  README.md          Full project documentation
```

## 3. Database setup

Make sure MySQL is running first (on Windows, check the MySQL service in Services, or
start it from MySQL Workbench or the MySQL Installer).

### Option A: automatic setup script

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in your MySQL username, password, host and port.

If the password contains a `#` or any other special character, wrap it in double quotes,
for example:

```
DB_PASSWORD="my#pass"
```

Without quotes, the value gets cut off at the `#`.

Then run:

```bash
npm install
npm run db:setup
```

This creates the database if it does not exist yet, then applies `database/schema.sql`
and `database/seed.sql` automatically.

### Option B: manual setup with the MySQL client

```sql
CREATE DATABASE attendance_payroll CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE attendance_payroll;
SOURCE database/schema.sql;
SOURCE database/seed.sql;
```

`schema.sql` drops and recreates both tables, so either option can be re-run any time to
reset the data back to the original seed.

## 4. Environment variables

### Backend (server/.env, see server/.env.example)

| Variable      | Description                          | Default                 |
|---------------|---------------------------------------|--------------------------|
| PORT          | API port                              | 5000                     |
| CLIENT_ORIGIN | Allowed frontend origin for CORS      | http://localhost:5173    |
| DB_HOST       | MySQL host                            | (required)               |
| DB_PORT       | MySQL port                            | 3306                     |
| DB_USER       | MySQL user                            | (required)               |
| DB_PASSWORD   | MySQL password                        | (required)               |
| DB_NAME       | Database name                         | attendance_payroll       |

### Frontend (client/.env, optional, see client/.env.example)

| Variable      | Description   | Default                     |
|---------------|---------------|------------------------------|
| VITE_API_URL  | API base URL  | http://localhost:5000/api    |

The frontend already falls back to `http://localhost:5000/api` on its own, so a `.env`
file is only needed if the backend runs on a different host or port.

## 5. Install and run the backend

```bash
cd server
npm install
npm run dev
```

The API starts on http://localhost:5000. Check it is working by opening
http://localhost:5000/api/health in a browser, it should return a small JSON response.

## 6. Install and run the frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

The app opens on http://localhost:5173.

## 7. Running the tests

Backend tests use a separate database named `<DB_NAME>_test` (for example
`attendance_payroll_test`), which is rebuilt from `schema.sql` and `seed.sql`
automatically before the tests run. MySQL must be running and `server/.env` must be
configured first.

```bash
cd server
npm test
```

Frontend utility tests:

```bash
cd client
npm test
```

## 8. Building the frontend for production

```bash
cd client
npm run build
```

The production build is written to `client/dist`.


