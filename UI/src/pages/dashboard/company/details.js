import { Helmet } from 'react-helmet-async';
// sections
import CandidateDetailsView from 'src/sections/company/view/candidate-details-view';

// ----------------------------------------------------------------------

export default function CandidateDetailsPage() {
  return (
    <>
      <Helmet>
        <title>Dashboard: Candidate Details</title>
      </Helmet>

      <CandidateDetailsView />
    </>
  );
}
