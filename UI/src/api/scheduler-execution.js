import axiosInstance, {endpoints} from 'src/utils/axios';

export async function getSchedulerExecutions(schedulerId, limit = 25, skip = 0) {
  const res = await axiosInstance.get(
    endpoints.schedulerExecution.listByScheduler(schedulerId, limit, skip)
  );
  return res.data || [];
}

export async function getSchedulerExecutionLogs(executionId, limit = 200, skip = 0) {
  const res = await axiosInstance.get(endpoints.schedulerExecution.logs(executionId, limit, skip));
  return res.data || [];
}
