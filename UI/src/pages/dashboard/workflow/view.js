import { Helmet } from 'react-helmet-async';
// sections
import WorkflowView from 'src/sections/workflow-section/view/workflow-view';

// ----------------------------------------------------------------------

export default function WorkflowViewPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Workflow View</title>
      </Helmet>

      <WorkflowView />
    </>
  );
}
