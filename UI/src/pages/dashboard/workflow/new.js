import { Helmet } from 'react-helmet-async';
// sections
import { WorkflowCreateView } from 'src/sections/workflow-section/view';

// ----------------------------------------------------------------------

export default function WorkflowCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new Workflow</title>
      </Helmet>

      <WorkflowCreateView />
    </>
  );
}
