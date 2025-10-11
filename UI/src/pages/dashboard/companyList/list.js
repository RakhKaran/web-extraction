import { Helmet } from 'react-helmet-async';
import { CompanyListListView } from 'src/sections/companyList/view';
// sections


// ----------------------------------------------------------------------

export default function CompaniesListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Company List</title>
      </Helmet>

      <CompanyListListView />
    </>
  );
}
