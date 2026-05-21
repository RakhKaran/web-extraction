import { useState, useEffect } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';

import {useSettingsContext} from 'src/components/settings';
import {useGetAnalyticsOverview} from 'src/api/analytics';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { fDate } from 'src/utils/format-time';
import Iconify from 'src/components/iconify';

import AnalyticsCurrentVisits from '../analytics-current-visits';
import AnalyticsOrderTimeline from '../analytics-order-timeline';
import AnalyticsWebsiteVisits from '../analytics-website-visits';
import AnalyticsWidgetSummary from '../analytics-widget-summary';
import AnalyticsTrafficBySite from '../analytics-traffic-by-site';

export default function OverviewAnalyticsView() {
  const settings = useSettingsContext();
  
  const [filterType, setFilterType] = useState('last7');
  const [apiStartDate, setApiStartDate] = useState(null);
  const [apiEndDate, setApiEndDate] = useState(null);

  useEffect(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    if (filterType === 'today') {
      setApiStartDate(start);
      setApiEndDate(today);
    } else if (filterType === 'last7') {
      start.setDate(start.getDate() - 6);
      setApiStartDate(start);
      setApiEndDate(today);
    } else if (filterType === 'last14') {
      start.setDate(start.getDate() - 13);
      setApiStartDate(start);
      setApiEndDate(today);
    } else if (filterType === 'month') {
      start.setMonth(start.getMonth() - 1);
      setApiStartDate(start);
      setApiEndDate(today);
    }
  }, [filterType]);

  const {analytics, analyticsLoading} = useGetAnalyticsOverview(apiStartDate, apiEndDate);

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
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{mb: {xs: 3, md: 5}}}>
        <Typography variant="h4">
          Hi, Welcome back
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          {filterType === 'custom' && (
            <>
              <DatePicker
                label="Start Date"
                value={apiStartDate}
                onChange={(newValue) => setApiStartDate(newValue)}
                slotProps={{ textField: { size: 'small' } }}
              />
              <DatePicker
                label="End Date"
                value={apiEndDate}
                onChange={(newValue) => setApiEndDate(newValue)}
                slotProps={{ textField: { size: 'small' } }}
              />
            </>
          )}

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                if (e.target.value === 'custom' && !apiStartDate && !apiEndDate) {
                  // Initialize custom dates with current dates if empty
                  setApiStartDate(new Date());
                  setApiEndDate(new Date());
                }
              }}
              renderValue={(selected) => {
                if (selected === 'custom') {
                  return 'Custom Range';
                }
                const map = {
                  today: 'Today',
                  last7: 'Last 7 Days',
                  last14: 'Last 14 Days',
                  month: '1 Month',
                };
                return map[selected];
              }}
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="last7">Last 7 Days</MenuItem>
              <MenuItem value="last14">Last 14 Days</MenuItem>
              <MenuItem value="month">1 Month</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Total Jobs"
            total={summary.totalJobs || 0}
            color="primary"
            icon={<Iconify icon="solar:documents-bold" width={64} sx={{ color: 'primary.main', opacity: 0.8 }} />}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Active Jobs"
            total={summary.activeJobs || 0}
            color="success"
            icon={<Iconify icon="solar:check-circle-bold" width={64} sx={{ color: 'success.main', opacity: 0.8 }} />}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Expired Jobs"
            total={summary.expiredJobs || 0}
            color="warning"
            icon={<Iconify icon="solar:close-circle-bold" width={64} sx={{ color: 'warning.main', opacity: 0.8 }} />}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Running Schedulers"
            total={summary.runningSchedulers || 0}
            color="info"
            icon={<Iconify icon="solar:settings-bold" width={64} sx={{ color: 'info.main', opacity: 0.8 }} />}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsWebsiteVisits
            title="Jobs Added"
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
            title="Job Status Split"
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
