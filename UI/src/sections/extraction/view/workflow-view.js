// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useGetWorkflow } from 'src/api/workflow';

import WorkflowViewForm from '../workflow-view-form';

// ----------------------------------------------------------------------

export default function WorkflowView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { workflow: currentWorkflow } = useGetWorkflow(id);

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
            name: 'Workflow',
            href: paths.dashboard.processes.root,
          },
          {
            name: currentWorkflow?.processes,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <WorkflowViewForm currentWorkflow={currentWorkflow} />
    </Container>
  );
}
