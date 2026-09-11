export const ATTENDANCE_TYPES = ['FULL_DAY', 'HALF_DAY', 'ABSENT'];

export const ATTENDANCE_TYPE_LABELS = {
  FULL_DAY: 'Full Day',
  HALF_DAY: 'Half Day',
  ABSENT: 'Absent',
};

export const RISK_CATEGORY_LABELS = {
  LOW: 'Low Risk',
  MEDIUM: 'Medium Risk',
  HIGH: 'High Risk',
  NO_DATA: 'No Data',
};

// one color per attendance type, used everywhere
export const ATTENDANCE_TYPE_COLORS = {
  FULL_DAY: '#2a78d6',
  HALF_DAY: '#eda100',
  ABSENT: '#e34948',
};

// matches the badge-low/medium/high/neutral tones in index.css
export const RISK_CATEGORY_COLORS = {
  LOW: '#1e6b34',
  MEDIUM: '#8a5a00',
  HIGH: '#9c2a2a',
  NO_DATA: '#8b929b',
};
