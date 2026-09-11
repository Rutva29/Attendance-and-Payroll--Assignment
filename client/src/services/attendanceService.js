import api from './api';

function withoutEmptyValues(filters) {
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value != null));
}

export const attendanceService = {
  list: (filters = {}) => api.get('/attendance', { params: withoutEmptyValues(filters) }),
  create: (payload) => api.post('/attendance', payload),
  update: (id, payload) => api.put(`/attendance/${id}`, payload),
  remove: (id) => api.delete(`/attendance/${id}`),
};
