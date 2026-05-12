import { Helmet } from 'react-helmet-async';
import OverviewAnalyticsView from 'src/sections/overview/analytics/view/overview-analytics-view';
// sections

// ----------------------------------------------------------------------

export default function OverviewAnalyticsPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Dashboard</title>
      </Helmet>

      <OverviewAnalyticsView />
    </>
  );
}
