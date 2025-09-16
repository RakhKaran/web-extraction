// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useGetProcessInstanceDocuments } from 'src/api/process-instance';

import ProcessInstanceExtractedDocuments from '../extractedDocuments/processInstance-extracted-docs';

// ----------------------------------------------------------------------

export default function ProcessInstanceExtractedDocumentsView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  console.log('id', id);
  const { processInstancesDocs : currentDocs } = useGetProcessInstanceDocuments(id);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Extracted Docs"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Process Instance',
            href: paths.dashboard.processesInstance.root,
          },
          {
            name: currentDocs?.data[0]?.processInstances?.processInstanceName,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ProcessInstanceExtractedDocuments currentDocs={currentDocs} />
    </Container>
  );
}
