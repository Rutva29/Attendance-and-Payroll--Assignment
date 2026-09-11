import { useQuery } from '@tanstack/react-query';
import { statisticsService } from '../services/statisticsService';
import { queryKeys } from '../services/queryKeys';

export function useAttendanceStreak(month) {
  return useQuery({
    queryKey: queryKeys.attendanceStreak(month),
    queryFn: () => statisticsService.attendanceStreak(month),
  });
}

export function usePayroll(month) {
  return useQuery({
    queryKey: queryKeys.payroll(month),
    queryFn: () => statisticsService.payroll(month),
  });
}

export function useRisk(month) {
  return useQuery({
    queryKey: queryKeys.risk(month),
    queryFn: () => statisticsService.risk(month),
  });
}
