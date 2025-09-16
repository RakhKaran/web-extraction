// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useGetWorkflowInstance } from 'src/api/workflow-instance';

import WorkflowInstanceViewForm from '../processInstance-view-form';

// ----------------------------------------------------------------------

export default function WorkflowInstanceView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const { workflowInstance: currentWorkflowInstance } = useGetWorkflowInstance(id);

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
            name: 'Workflow Instance',
            href: paths.dashboard.workflowInstance.root,
          },
          {
            name: currentWorkflowInstance?.workflowInstanceName,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <WorkflowInstanceViewForm currentWorkflowInstance={currentWorkflowInstance} />
    </Container>
  );
}
