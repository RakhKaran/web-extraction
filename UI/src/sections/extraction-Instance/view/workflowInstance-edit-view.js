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
import Iconify from 'src/components/iconify';
import { Tab, Tabs } from '@mui/material';
import { useCallback, useState } from 'react';
import WorkflowInstanceNewEditForm from '../workflowInstance-new-edit-form';

// ----------------------------------------------------------------------

export default function WorkflowInstanceEditView() {
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

      <WorkflowInstanceNewEditForm currentWorkflowInstance={currentWorkflowInstance} />
    </Container>
  );
}
