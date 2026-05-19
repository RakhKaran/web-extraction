// @mui
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// sections
import CandidateDetailsToolbar from '../candidate-details-toolbar';
import CandidateDetailsContent from '../candidate-details-content';
import { useGetCompany } from 'src/api/company';

// ----------------------------------------------------------------------

export default function CandidateDetailsView() {
  const settings = useSettingsContext();
  const params = useParams();
  const { id } = params;

  const { company: currentCandidate, companyLoading } = useGetCompany(id);

  if (companyLoading || !currentCandidate) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={currentCandidate?.fullName || 'Candidate'}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Candidates', href: paths.dashboard.company.root },
          { name: currentCandidate?.fullName || 'Details' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <CandidateDetailsToolbar backLink={paths.dashboard.company.root} />
      <CandidateDetailsContent candidate={currentCandidate} />
    </Container>
  );
}
