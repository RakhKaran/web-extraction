import { Helmet } from 'react-helmet-async';
// sections
import { WorkflowInstanceListView } from 'src/sections/extraction-Instance/view';

// ----------------------------------------------------------------------

export default function WorkflowInstanceListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: WorkflowInstance List</title>
      </Helmet>

      <WorkflowInstanceListView />
    </>
  );
}
