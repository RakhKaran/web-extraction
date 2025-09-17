import { Helmet } from 'react-helmet-async';
// sections
import { WorkflowInstanceEditView } from 'src/sections/extraction-Instance/view';

// ----------------------------------------------------------------------

export default function WorkflowInstanceEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: WorkflowInstance Edit</title>
      </Helmet>

      <WorkflowInstanceEditView />
    </>
  );
}
