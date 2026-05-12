import { Helmet } from 'react-helmet-async';
import { CompanyEditView } from 'src/sections/company-master/view';

// ----------------------------------------------------------------------

export default function CompanyEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Company Edit</title>
      </Helmet>
      <CompanyEditView />
    </>
  );
}
