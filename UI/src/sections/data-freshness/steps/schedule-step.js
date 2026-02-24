import { Grid, Typography, MenuItem, Divider } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';

export default function ScheduleStep() {
  const { watch } = useFormContext();
  const frequency = watch('schedule.frequency');

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Schedule Freshness Check
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Configure when and how often to run the freshness check
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <RHFSelect name="schedule.frequency" label="Frequency" required fullWidth>
          <MenuItem value="hourly">Hourly</MenuItem>
          <MenuItem value="daily">Daily</MenuItem>
          <MenuItem value="every-3-days">Every 3 Days</MenuItem>
          <MenuItem value="weekly">Weekly</MenuItem>
          <MenuItem value="monthly">Monthly</MenuItem>
        </RHFSelect>
      </Grid>

      {frequency !== 'hourly' && (
        <Grid item xs={12} md={6}>
          <RHFTextField
            name="schedule.time"
            label="Time"
            type="time"
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      )}

      <Grid item xs={12} md={6}>
        <RHFSelect name="schedule.timezone" label="Timezone" required fullWidth>
          <MenuItem value="Asia/Kolkata">Asia/Kolkata (IST)</MenuItem>
          <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
          <MenuItem value="America/Los_Angeles">America/Los_Angeles (PST)</MenuItem>
          <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
          <MenuItem value="UTC">UTC</MenuItem>
        </RHFSelect>
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" gutterBottom>
          Batch Processing Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Configure how records are processed in batches
        </Typography>
      </Grid>

      <Grid item xs={12} md={4}>
        <RHFTextField
          name="batchProcessing.batchSize"
          label="Batch Size"
          type="number"
          required
          fullWidth
          helperText="Number of records per batch"
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <RHFTextField
          name="batchProcessing.delayBetweenJobs"
          label="Delay Between Jobs (ms)"
          type="number"
          required
          fullWidth
          helperText="Delay in milliseconds"
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <RHFTextField
          name="batchProcessing.maxJobsPerRun"
          label="Max Jobs Per Run"
          type="number"
          fullWidth
          helperText="Leave empty for unlimited"
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          Recommended settings: Batch Size: 50, Delay: 2000ms (2 seconds)
        </Typography>
      </Grid>
    </Grid>
  );
}
