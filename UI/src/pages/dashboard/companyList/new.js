import { Helmet } from 'react-helmet-async';
import { CompanyCreateView, CompanyListCreateView } from 'src/sections/companyList/view';
// sections


// ----------------------------------------------------------------------

export default function CompaniesCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new Company</title>
      </Helmet>

      <CompanyListCreateView />
    </>
  );
}
