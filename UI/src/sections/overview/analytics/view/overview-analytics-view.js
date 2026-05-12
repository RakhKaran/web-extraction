import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import {useSettingsContext} from 'src/components/settings';
import {useGetAnalyticsOverview} from 'src/api/analytics';
import AnalyticsCurrentVisits from '../analytics-current-visits';
import AnalyticsOrderTimeline from '../analytics-order-timeline';
import AnalyticsWebsiteVisits from '../analytics-website-visits';
import AnalyticsWidgetSummary from '../analytics-widget-summary';
import AnalyticsTrafficBySite from '../analytics-traffic-by-site';

export default function OverviewAnalyticsView() {
  const settings = useSettingsContext();
  const {analytics, analyticsLoading} = useGetAnalyticsOverview();

  if (analyticsLoading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Box sx={{py: 10, display: 'flex', justifyContent: 'center'}}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const summary = analytics?.summary || {};
  const sourceDistribution = analytics?.sourceDistribution || [];
  const jobsLast7Days = analytics?.jobsLast7Days || {labels: [], values: []};
  const recentRuns = analytics?.recentSchedulerRuns || [];
  const freshnessLastRun = analytics?.freshness?.lastRun;

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography variant="h4" sx={{mb: {xs: 3, md: 5}}}>
        Hi, Welcome back
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Total Jobs"
            total={summary.totalJobs || 0}
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Active Jobs"
            total={summary.activeJobs || 0}
            color="info"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Expired Jobs"
            total={summary.expiredJobs || 0}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Running Schedulers"
            total={summary.runningSchedulers || 0}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsWebsiteVisits
            title="Jobs Added (Last 7 Days)"
            subheader="Created records trend"
            chart={{
              labels: jobsLast7Days.labels,
              series: [
                {
                  name: 'Jobs',
                  type: 'line',
                  fill: 'solid',
                  data: jobsLast7Days.values,
                },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsCurrentVisits
            title="Job Status Split (Last 7 Days)"
            chart={{
              series: [
                {label: 'Active', value: summary.activeJobs || 0},
                {label: 'Expired', value: summary.expiredJobs || 0},
              ],
            }}
          />
        </Grid>

        {recentRuns?.length > 0 &&<Grid xs={12} md={12} lg={12}>
          <AnalyticsOrderTimeline title="Recent Scheduler Runs" list={recentRuns} />
        </Grid>}

        {/* <Grid xs={12} md={6} lg={6}>
          <AnalyticsTrafficBySite
            title="Jobs By Source"
            list={sourceDistribution.map((item) => ({
              label: item.label,
              total: item.total,
              value: item.label.toLowerCase(),
              icon: 'mdi:web',
            }))}
          />
        </Grid>

        <Grid xs={12}>
          <Typography variant="body2" color="text.secondary">
            Freshness last run:{' '}
            {freshnessLastRun
              ? `${freshnessLastRun.status} | checked ${freshnessLastRun.totalChecked} | active ${freshnessLastRun.active} | expired ${freshnessLastRun.expired} | errors ${freshnessLastRun.errors}`
              : 'No runs yet'}
          </Typography>
        </Grid> */}
      </Grid>
    </Container>
  );
}
