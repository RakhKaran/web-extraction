import { useState, useCallback } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// _mock
import { _jobs, JOB_PUBLISH_OPTIONS, JOB_DETAILS_TABS } from 'src/_mock';
import Label from 'src/components/label';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
//
import { mockJob } from 'src/sections/job/mockData';
import JobsDetailsContent from '../jobs-details-content';
import { useGetJob } from 'src/api/job';


// ----------------------------------------------------------------------

export default function JobsDetailsView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const {jobList: currentJob}= useGetJob(id);

  const [publish, setPublish] = useState(false);

  const [currentTab, setCurrentTab] = useState('title');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const handleChangePublish = useCallback((newValue) => {
    setPublish(newValue);
  }, []);

  const renderTabs = (
    <Tabs
      value={currentTab}
      onChange={handleChangeTab}
      sx={{
        mb: { xs: 3, md: 5 },
      }}
    >
      {JOB_DETAILS_TABS.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="end"
          value={tab.value}
          label={tab.label}
          icon={
            tab.value === 'candidates' ? (
              <Label variant="filled">{currentJob?.candidates.length || 0}</Label>
            ) : (
              ''
            )
          }
        />
      ))}
    </Tabs>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Job Details"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Jobs', href: paths.dashboard.job.list },
          { name: currentJob?.title || 'Details' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.job.list}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
          >
            Back
          </Button>
        }
      />

      {renderTabs}

      {currentTab === 'title' && currentJob && <JobsDetailsContent job={currentJob} />}
    </Container>
  );
}
