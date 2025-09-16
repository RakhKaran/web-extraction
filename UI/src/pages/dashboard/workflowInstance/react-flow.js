import { Helmet } from 'react-helmet-async';
// sections
import { ReactFlowProcessInstanceView } from 'src/sections/reactFlow/view';

// ----------------------------------------------------------------------

export default function ProcessInstanceReactFlowPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: ProcessInstance Blueprint</title>
      </Helmet>

      <ReactFlowProcessInstanceView />
    </>
  );
}
