import PropTypes from 'prop-types';
// @mui
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
// utils
import { fDate } from 'src/utils/format-time';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function CandidateDetailsContent({ candidate }) {
  const {
    id,
    fullName,
    profileUrl,
    company,
    designation,
    profileAbout,
    location,
    experience,
    education,
    skills,
    redirectUrl,
    createdAt,
  } = candidate;

  const filteredSkills = skills.filter((skill) => skill.skillName);

  const renderProfile = (
    <Stack component={Card} spacing={3} sx={{ p: 3 }}>
      <Stack spacing={2} alignItems="center">
        <Avatar
          alt={fullName}
          src={profileUrl}
          sx={{ width: 120, height: 120 }}
        />
        <Stack spacing={1} alignItems="center">
          <Typography variant="h4">{fullName}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {designation} {company}
          </Typography>
          {location && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Iconify icon="eva:pin-fill" width={16} height={16} />
              <Typography variant="body2">{location}</Typography>
            </Stack>
          )}
        </Stack>

        <Button
          variant="contained"
          endIcon={<Iconify icon="eva:external-link-fill" />}
          onClick={() => window.open(redirectUrl, '_blank')}
        >
          View LinkedIn Profile
        </Button>
      </Stack>
    </Stack>
  );

  const renderAbout = (
    <Stack component={Card} spacing={2} sx={{ p: 3 }}>
      <Stack spacing={1}>
        <Typography variant="h6">About</Typography>
        <Typography variant="body2" color="text.secondary">
          {profileAbout}
        </Typography>
      </Stack>
    </Stack>
  );

  const renderExperience = (
    <Stack component={Card} spacing={2} sx={{ p: 3 }}>
      <Typography variant="h6">Experience</Typography>
      {experience && experience.length > 0 ? (
        <Stack spacing={2}>
          {experience.map((exp, index) => (
            <Box key={index} sx={{ pb: 2, borderBottom: index !== experience.length - 1 ? 1 : 0, borderColor: 'divider' }}>
              <Stack spacing={0.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="carbon:skill-level-basic" width={16} height={16} />
                  <Typography variant="subtitle2">{exp.role}</Typography>
                </Stack>
                {exp.companyName && (
                  <Typography variant="body2" color="text.secondary">
                    {exp.companyName}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  {exp.duration}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No experience information available
        </Typography>
      )}
    </Stack>
  );

  const renderEducation = (
    <Stack component={Card} spacing={2} sx={{ p: 3 }}>
      <Typography variant="h6">Education</Typography>
      {education && education.length > 0 ? (
        <Stack spacing={2}>
          {education.map((edu, index) => (
            <Box key={index} sx={{ pb: 2, borderBottom: index !== education.length - 1 ? 1 : 0, borderColor: 'divider' }}>
              <Stack spacing={0.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="eva:book-fill" width={16} height={16} />
                  <Typography variant="subtitle2">{edu.schoolName}</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {edu.degree}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No education information available
        </Typography>
      )}
    </Stack>
  );

  const renderSkills = (
    <Stack component={Card} spacing={2} sx={{ p: 3 }}>
      <Typography variant="h6">Skills</Typography>
      {filteredSkills.length > 0 ? (
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
          {filteredSkills.map((skill, index) => (
            <Chip
              key={index}
              label={skill.skillName}
              variant="soft"
              icon={<Iconify icon="eva:checkmark-circle-fill" />}
            />
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No skills information available
        </Typography>
      )}
    </Stack>
  );

  const renderMetadata = (
    <Stack component={Card} spacing={2} sx={{ p: 3 }}>
      {[
        {
          label: 'Profile Added',
          value: fDate(createdAt),
          icon: <Iconify icon="solar:calendar-date-bold" />,
        },
      ].map((item) => (
        <Stack key={item.label} spacing={1.5} direction="row">
          {item.icon}
          <ListItemText
            primary={item.label}
            secondary={item.value}
            primaryTypographyProps={{
              typography: 'body2',
              color: 'text.secondary',
              mb: 0.5,
            }}
            secondaryTypographyProps={{
              typography: 'subtitle2',
              color: 'text.primary',
              component: 'span',
            }}
          />
        </Stack>
      ))}
    </Stack>
  );

  return (
    <Grid container spacing={3}>
      <Grid xs={12} md={4}>
        {renderProfile}
        <Box sx={{ mt: 3 }}>
          {renderAbout}
        </Box>
        <Box sx={{ mt: 3 }}>
          {renderMetadata}
        </Box>
      </Grid>

      <Grid xs={12} md={8}>
        {renderSkills}
        <Box sx={{ mt: 3 }}>
          {renderExperience}
        </Box>
        <Box sx={{ mt: 3 }}>
          {renderEducation}
        </Box>
      </Grid>
    </Grid>
  );
}

CandidateDetailsContent.propTypes = {
  candidate: PropTypes.object,
};
