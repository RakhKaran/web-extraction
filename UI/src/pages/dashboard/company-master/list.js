import { Helmet } from 'react-helmet-async';
import { CompanyListView } from 'src/sections/company-master/view';

// ----------------------------------------------------------------------
export default function CompanyListPage() {
  return (
    <>
      <Helmet>
        <title>Dashboard: Company List</title>
      </Helmet>
      <CompanyListView />
    </>
  )
}