import { Helmet } from 'react-helmet-async';
// sections

import { JobsListView } from 'src/sections/jobList/view';

// ----------------------------------------------------------------------

export default function JobListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Job List</title>
      </Helmet>

      <JobsListView />
    </>
  );
}
