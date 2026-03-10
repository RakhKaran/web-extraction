import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Box,
} from '@mui/material';
import { format } from 'date-fns';
import Iconify from 'src/components/iconify';

export default function DataFreshnessCard({
  check,
  onEdit,
  onDelete,
  onRun,
  onPause,
  onResume,
  onViewLogs,
}) {
  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'default';
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      hourly: 'Every Hour',
      daily: 'Daily',
      'every-3-days': 'Every 3 Days',
      weekly: 'Weekly',
      monthly: 'Monthly',
      custom: 'Custom',
    };
    return labels[frequency] || frequency;
  };

  const getCheckTypeLabel = (type) => {
    const labels = {
      simple: 'Simple (HTTP)',
      'full-rescrape': 'Full Re-scrape',
    };
    return labels[type] || type;
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h6">{check.name}</Typography>
              <Chip
                label={check.isActive ? 'Active' : 'Paused'}
                color={getStatusColor(check.isActive)}
                size="small"
              />
            </Stack>

            <Stack direction="row" spacing={1}>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={onEdit}>
                  <Iconify icon="eva:edit-fill" />
                </IconButton>
              </Tooltip>

              {check.isActive ? (
                <Tooltip title="Pause">
                  <IconButton size="small" onClick={onPause}>
                    <Iconify icon="eva:pause-circle-fill" />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Resume">
                  <IconButton size="small" onClick={onResume}>
                    <Iconify icon="eva:play-circle-fill" />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="Run Now">
                <IconButton size="small" onClick={onRun} color="primary">
                  <Iconify icon="eva:refresh-fill" />
                </IconButton>
              </Tooltip>

              <Tooltip title="View Logs">
                <IconButton size="small" onClick={onViewLogs}>
                  <Iconify icon="eva:file-text-fill" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete">
                <IconButton size="small" onClick={onDelete} color="error">
                  <Iconify icon="eva:trash-2-fill" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {/* Description */}
          {check.description && (
            <Typography variant="body2" color="text.secondary">
              {check.description}
            </Typography>
          )}

          {/* Details */}
          <Stack direction="row" spacing={4} flexWrap="wrap">
            <Box>
              <Typography variant="caption" color="text.secondary">
                Database
              </Typography>
              <Typography variant="body2">{check.sourceModel}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                URL Field
              </Typography>
              <Typography variant="body2">{check.urlField}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Check Type
              </Typography>
              <Typography variant="body2">{getCheckTypeLabel(check.freshnessCheck?.type)}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Expire After
              </Typography>
              <Typography variant="body2">
                {check.freshnessCheck?.durationDays ? `${check.freshnessCheck.durationDays} days` : 'Not Set'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Schedule
              </Typography>
              <Typography variant="body2">
                {getFrequencyLabel(check.schedule?.frequency)}
                {check.schedule?.time && ` at ${check.schedule.time}`}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Batch Size
              </Typography>
              <Typography variant="body2">{check.batchProcessing?.batchSize || 50}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Delay Between Jobs
              </Typography>
              <Typography variant="body2">
                {check.batchProcessing?.delayBetweenJobs || 2000}ms
              </Typography>
            </Box>

            {check.batchProcessing?.maxJobsPerRun && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Max Jobs Per Run
                </Typography>
                <Typography variant="body2">{check.batchProcessing.maxJobsPerRun}</Typography>
              </Box>
            )}
          </Stack>

          {/* Last Run Info */}
          {check.lastRunAt && (
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Last Run
                </Typography>
                <Typography variant="body2">
                  {format(new Date(check.lastRunAt), 'MMM dd, yyyy HH:mm')}
                </Typography>
              </Box>

              {check.nextRunAt && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Next Run
                  </Typography>
                  <Typography variant="body2">
                    {format(new Date(check.nextRunAt), 'MMM dd, yyyy HH:mm')}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}

        </Stack>
      </CardContent>
    </Card>
  );
}

DataFreshnessCard.propTypes = {
  check: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onRun: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  onResume: PropTypes.func.isRequired,
  onViewLogs: PropTypes.func.isRequired,
};
