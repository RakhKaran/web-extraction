// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// utils
import { useParams } from 'src/routes/hook';
// api
import { useGetCompany } from 'src/api/companyList';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import CompanyNewEditForm from '../company-new-edit-form';



//


// ----------------------------------------------------------------------

export default function CompanyListEditView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const {companyList:currentCompany}= useGetCompany(id)



  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Company',
            href: paths.dashboard.companyList.root,
          },
          {
            name: currentCompany?.companyName,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <CompanyNewEditForm currentCompany={currentCompany} />
    </Container>
  );
}
