import { useQuery } from '@tanstack/react-query';
import { employeeService } from '../services/employeeService';
import { queryKeys } from '../services/queryKeys';

export function useEmployees() {
  return useQuery({
    queryKey: queryKeys.employees(),
    queryFn: employeeService.list,
    staleTime: 5 * 60 * 1000,
  });
}
