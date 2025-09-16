import { Helmet } from 'react-helmet-async';
// sections
import { ProcessInstanceExtractedDocumentsView } from 'src/sections/processInstance/view';

// ----------------------------------------------------------------------

export default function ProcessInstanceExtractedDocumentsPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: ProcessInstance Extracted Documents</title>
      </Helmet>

      <ProcessInstanceExtractedDocumentsView />
    </>
  );
}
