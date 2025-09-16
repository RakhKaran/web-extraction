import { Helmet } from 'react-helmet-async';
// sections
import ProcessInstanceView from 'src/sections/processInstance/view/processInstance-view';

// ----------------------------------------------------------------------

export default function ProcessInstanceViewPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: ProcessInstance View</title>
      </Helmet>

      <ProcessInstanceView />
    </>
  );
}
