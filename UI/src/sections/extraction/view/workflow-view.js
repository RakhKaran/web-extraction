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
        heading="View"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Extraction',
            href: paths.dashboard.workflow.list,
          },
          {
            name: currentWorkflow?.name || 'Workflow',
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
