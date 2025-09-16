import { Helmet } from 'react-helmet-async';
// sections
import { WorkflowEditView } from 'src/sections/workflow-section/view';

// ----------------------------------------------------------------------

export default function WorkflowEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Workflow Edit</title>
      </Helmet>

      <WorkflowEditView />
    </>
  );
}
