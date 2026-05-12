import {Helmet} from 'react-helmet-async';
import SchedulerLogsView from 'src/sections/scheduler/view/scheduler-logs-view';

export default function SchedulerLogsPage() {
  return (
    <>
      <Helmet>
        <title>Dashboard: Scheduler Logs</title>
      </Helmet>
      <SchedulerLogsView />
    </>
  );
}
