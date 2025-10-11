import { Helmet } from 'react-helmet-async';
import { CompanyEditView } from 'src/sections/companyList/view';
import CompanyListEditView from 'src/sections/companyList/view/comapnyList-edit-view';


// ----------------------------------------------------------------------

export default function CompaniesEditPage() {
  return (
    <>
      <Helmet>
        <title>  Dashboard: Company Edit</title>
      </Helmet>

      <CompanyListEditView />
    </>
  );
}
