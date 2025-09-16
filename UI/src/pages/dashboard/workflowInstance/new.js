import { Helmet } from 'react-helmet-async';
// sections
import { WorkflowInstanceCreateView } from 'src/sections/workflow-Instance/view';

// ----------------------------------------------------------------------

export default function WorkflowInstanceCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new workflowInstance</title>
      </Helmet>

      <WorkflowInstanceCreateView />
    </>
  );
}
