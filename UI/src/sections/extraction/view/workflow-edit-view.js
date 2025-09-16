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
import Iconify from 'src/components/iconify';
import { Tab, Tabs } from '@mui/material';
import { useCallback, useState } from 'react';
import WorkflowNewEditForm from '../workflow-new-edit-form';

// ----------------------------------------------------------------------

export default function WorkflowEditView() {
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
            name: 'Process Type',
            href: paths.dashboard.workflow.root,
          },
          {
            name: currentWorkflow?.workflow,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <WorkflowNewEditForm currentWorkflow={currentWorkflow} />
    </Container>
  );
}
