import {repository} from '@loopback/repository';
import {get, param} from '@loopback/rest';
import {
  DataFreshnessConfigRepository,
  DataFreshnessLogRepository,
  JobListRepository,
  SchedulerExecutionRepository,
  SchedulerRepository,
  WorkflowRepository,
} from '../repositories';

export class AnalyticsController {
  constructor(
    @repository(JobListRepository)
    public jobListRepository: JobListRepository,
    @repository(SchedulerRepository)
    public schedulerRepository: SchedulerRepository,
    @repository(WorkflowRepository)
    public workflowRepository: WorkflowRepository,
    @repository(DataFreshnessConfigRepository)
    public dataFreshnessConfigRepository: DataFreshnessConfigRepository,
    @repository(DataFreshnessLogRepository)
    public dataFreshnessLogRepository: DataFreshnessLogRepository,
    @repository(SchedulerExecutionRepository)
    public schedulerExecutionRepository: SchedulerExecutionRepository,
  ) {}

  @get('/analytics/overview')
  async getOverview(
    @param.query.string('startDate') startDateParam?: string,
    @param.query.string('endDate') endDateParam?: string,
  ) {
    let toDate = new Date();
    let fromDate = new Date();

    if (startDateParam && endDateParam) {
      fromDate = new Date(startDateParam);
      toDate = new Date(endDateParam);
    } else {
      fromDate.setDate(toDate.getDate() - 6);
      fromDate.setHours(0, 0, 0, 0);
    }
    // Set toDate to end of day to include all records on the end date
    toDate.setHours(23, 59, 59, 999);

    const [jobs, schedulers, workflows, freshnessConfigs, freshnessLogs, schedulerRuns] =
      await Promise.all([
        this.jobListRepository.find({
          where: {
            isDeleted: false,
            createdAt: {between: [fromDate, toDate]},
          },
          fields: {id: true, createdAt: true, isActive: true, source: true},
          order: ['createdAt DESC'],
          limit: 10000,
        }),
        this.schedulerRepository.find({
          where: {isDeleted: false},
          fields: {id: true, isActive: true, isScheduled: true},
        }),
        this.workflowRepository.find({
          where: {isDeleted: false},
          fields: {id: true, isActive: true},
        }),
        this.dataFreshnessConfigRepository.find({
          fields: {id: true, isActive: true},
        }),
        this.dataFreshnessLogRepository.find({
          order: ['runAt DESC'],
          limit: 20,
        }),
        this.schedulerExecutionRepository.find({
          order: ['startedAt DESC'],
          limit: 20,
        }),
      ]);

    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.isActive === true).length;
    const expiredJobs = totalJobs - activeJobs;

    const sourceMap: Record<string, number> = {};
    jobs.forEach(job => {
      const key = (job.source || 'Unknown').toString();
      sourceMap[key] = (sourceMap[key] || 0) + 1;
    });

    const sortedSources = Object.entries(sourceMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, total]) => ({label, total}));

    const dailyMap: Record<string, number> = {};
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalDays = Math.max(1, Math.min(diffDays, 90)); // Cap at 90 days for chart readability

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(fromDate);
      d.setDate(fromDate.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dailyMap[key] = 0;
    }
    jobs.forEach(job => {
      if (!job.createdAt) return;
      const key = new Date(job.createdAt).toISOString().slice(0, 10);
      if (key in dailyMap) dailyMap[key] += 1;
    });

    const freshnessLastRun = freshnessLogs[0] || null;
    const recentRuns = schedulerRuns.slice(0, 8).map(run => ({
      id: run.id,
      title: `${run.status?.toUpperCase() || 'RUN'} | ${run.searchField || run.dagName || 'Scheduler run'}`,
      type:
        run.status === 'success'
          ? 'order2'
          : run.status === 'failed'
            ? 'order5'
            : 'order3',
      time: run.startedAt || run.createdAt || new Date(),
    }));

    return {
      summary: {
        totalJobs,
        activeJobs,
        expiredJobs,
        totalSchedulers: schedulers.length,
        runningSchedulers: schedulers.filter(s => s.isScheduled).length,
        activeSchedulers: schedulers.filter(s => s.isActive).length,
        totalWorkflows: workflows.length,
        activeWorkflows: workflows.filter(w => w.isActive).length,
        totalFreshnessConfigs: freshnessConfigs.length,
        activeFreshnessConfigs: freshnessConfigs.filter(c => c.isActive).length,
      },
      sourceDistribution: sortedSources,
      jobsLast7Days: {
        labels: Object.keys(dailyMap),
        values: Object.values(dailyMap),
      },
      freshness: {
        lastRun: freshnessLastRun
          ? {
              status: freshnessLastRun.status,
              runAt: freshnessLastRun.runAt,
              totalChecked: freshnessLastRun.totalChecked || 0,
              active: freshnessLastRun.stillActive || 0,
              expired: freshnessLastRun.expired || 0,
              errors: freshnessLastRun.errors || 0,
            }
          : null,
      },
      recentSchedulerRuns: recentRuns,
    };
  }
}
