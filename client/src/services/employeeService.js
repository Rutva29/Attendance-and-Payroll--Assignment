import api from './api';

export const employeeService = {
  list: () => api.get('/employees'),
};
