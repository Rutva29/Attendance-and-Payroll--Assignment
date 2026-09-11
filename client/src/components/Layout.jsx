import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { IconDashboard, IconCalendarCheck, IconBarChart } from './icons';

const NAV_ITEMS = [
  { to: '/', end: true, label: 'Dashboard', icon: IconDashboard },
  { to: '/attendance', end: false, label: 'Attendance', icon: IconCalendarCheck },
  { to: '/statistics', end: false, label: 'Statistics', icon: IconBarChart },
];

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/attendance': 'Attendance',
  '/statistics': 'Statistics',
};

const TODAY_LABEL = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default function Layout() {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || 'Attendance and Payroll';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand-mark">AP</span>
          <span className="sidebar-brand-text">Attendance &amp; Payroll</span>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, end, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="app-body">
        <header className="topbar">
          <h1 className="topbar-title">{pageTitle}</h1>
          <div className="topbar-right">
            <span className="topbar-date">{TODAY_LABEL}</span>
            <span className="topbar-user">
              <span className="topbar-user-avatar">A</span>
              <span>Admin</span>
            </span>
          </div>
        </header>
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
