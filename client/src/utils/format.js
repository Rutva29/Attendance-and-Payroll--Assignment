const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatCurrency(value) {
  return currencyFormatter.format(Number(value) || 0);
}

// avoid new Date() here, it would shift the date with timezone
export function formatDate(date) {
  if (!date) return '-';
  const [year, month, day] = date.split('-');
  return `${day} ${MONTH_NAMES[Number(month) - 1]} ${year}`;
}

export function formatMonth(month) {
  const [year, monthNumber] = month.split('-');
  return `${MONTH_NAMES[Number(monthNumber) - 1]} ${year}`;
}

// display only - classifyAttendance/calculateWorkingHours still work off the raw decimal
export function formatHours(hours) {
  const totalMinutes = Math.round(Number(hours) * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
