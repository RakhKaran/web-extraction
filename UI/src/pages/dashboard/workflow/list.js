import { Helmet } from 'react-helmet-async';
// sections
import { WorkflowListView } from 'src/sections/extraction/view';

// ----------------------------------------------------------------------

export default function WorkflowListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Workflow List</title>
      </Helmet>

      <WorkflowListView />
    </>
  );
}
