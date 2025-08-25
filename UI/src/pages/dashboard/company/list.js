import { Helmet } from 'react-helmet-async';
// sections
import CompanyListView from 'src/sections/company/view/company-list-view';

// ----------------------------------------------------------------------

export default function CompanyListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Company List</title>
      </Helmet>

      <CompanyListView />
    </>
  );
}
