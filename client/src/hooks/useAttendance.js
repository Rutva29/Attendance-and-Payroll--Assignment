import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../services/attendanceService';
import { queryKeys } from '../services/queryKeys';

export function useAttendanceList(filters) {
  return useQuery({
    queryKey: queryKeys.attendance(filters),
    queryFn: () => attendanceService.list(filters),
  });
}

export function useAttendanceMutations() {
  const queryClient = useQueryClient();

  // attendance changes affect the list, dashboard and stats, refresh all of them
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.attendanceRoot() });
    queryClient.invalidateQueries({ queryKey: queryKeys.statisticsRoot() });
  };

  return {
    create: useMutation({ mutationFn: attendanceService.create, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, ...payload }) => attendanceService.update(id, payload),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: attendanceService.remove, onSuccess: invalidate }),
  };
}
