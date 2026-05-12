import { Helmet } from 'react-helmet-async';
import { CompanyCreateView } from 'src/sections/company-master/view';

// ----------------------------------------------------------------------

export default function CompanyNewPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Company New</title>
      </Helmet>
      <CompanyCreateView />
    </>
  );
}
