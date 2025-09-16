// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import WorkflowInstanceNewEditForm from '../workflowInstance-new-edit-form';
//

// ----------------------------------------------------------------------

export default function WorkflowInstanceCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new Workflow Instance"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Process Instance',
            href: paths.dashboard.workflowInstance.root,
          },
          { name: 'New Workflow Instance' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <WorkflowInstanceNewEditForm />
    </Container>
  );
}
