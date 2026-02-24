import { Grid, Typography } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { RHFTextField } from 'src/components/hook-form';

export default function BasicInfoStep() {
  const { control } = useFormContext();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Basic Information
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Provide a name and description for this freshness check
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <RHFTextField
          name="name"
          label="Name"
          placeholder="e.g., Naukri Jobs Freshness Check"
          required
          fullWidth
        />
      </Grid>

      <Grid item xs={12}>
        <RHFTextField
          name="description"
          label="Description"
          placeholder="e.g., Check if Naukri jobs are still active"
          multiline
          rows={3}
          fullWidth
        />
      </Grid>
    </Grid>
  );
}
