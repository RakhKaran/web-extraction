import { Grid, Typography, MenuItem, Stack, Button, IconButton, Divider } from '@mui/material';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';

export default function UpdateStrategyStep() {
  const { control, watch } = useFormContext();

  const onNotFoundAction = watch('updateStrategy.onNotFound.action');
  const onFoundAction = watch('updateStrategy.onFound.action');

  const { fields: notFoundFields, append: appendNotFound, remove: removeNotFound } = useFieldArray({
    control,
    name: 'updateStrategy.onNotFound.fieldsArray',
  });

  const { fields: foundFields, append: appendFound, remove: removeFound } = useFieldArray({
    control,
    name: 'updateStrategy.onFound.fieldsArray',
  });

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Update Strategy
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Define what to do based on freshness check results
        </Typography>
      </Grid>

      {/* When Job is NOT Found (Expired) */}
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          When Record is NOT Found (Expired)
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <RHFSelect name="updateStrategy.onNotFound.action" label="Action" required fullWidth>
          <MenuItem value="update-fields">Update Fields</MenuItem>
          <MenuItem value="delete-record">Delete Record</MenuItem>
          <MenuItem value="do-nothing">Do Nothing (Log Only)</MenuItem>
        </RHFSelect>
      </Grid>

      {onNotFoundAction === 'update-fields' && (
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Default fields to update:
          </Typography>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <RHFTextField
                name="updateStrategy.onNotFound.fields.isActive"
                label="isActive"
                defaultValue="false"
                size="small"
                sx={{ flex: 1 }}
              />
              <RHFTextField
                name="updateStrategy.onNotFound.fields.deletedAt"
                label="deletedAt"
                defaultValue="{{currentDate}}"
                size="small"
                sx={{ flex: 1 }}
                helperText="Use {{currentDate}} for current date"
              />
            </Stack>
            <RHFTextField
              name="updateStrategy.onNotFound.fields.isDeleted"
              label="isDeleted"
              defaultValue="true"
              size="small"
              fullWidth
            />
            <RHFTextField
              name="updateStrategy.onNotFound.fields.freshnessStatus"
              label="freshnessStatus"
              defaultValue="expired"
              size="small"
              fullWidth
            />
          </Stack>
        </Grid>
      )}

      <Grid item xs={12}>
        <Divider sx={{ my: 3 }} />
      </Grid>

      {/* When Job is Found (Still Active) */}
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          When Record is Found (Still Active)
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <RHFSelect name="updateStrategy.onFound.action" label="Action" required fullWidth>
          <MenuItem value="update-timestamp">Update Timestamp</MenuItem>
          <MenuItem value="update-fields">Update Fields</MenuItem>
          <MenuItem value="do-nothing">Do Nothing</MenuItem>
        </RHFSelect>
      </Grid>

      {(onFoundAction === 'update-timestamp' || onFoundAction === 'update-fields') && (
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Default fields to update:
          </Typography>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <RHFTextField
                name="updateStrategy.onFound.fields.lastCheckedAt"
                label="lastCheckedAt"
                defaultValue="{{currentDate}}"
                size="small"
                sx={{ flex: 1 }}
                helperText="Use {{currentDate}} for current date"
              />
              <RHFTextField
                name="updateStrategy.onFound.fields.freshnessStatus"
                label="freshnessStatus"
                defaultValue="live"
                size="small"
                sx={{ flex: 1 }}
              />
            </Stack>
            <RHFTextField
              name="updateStrategy.onFound.fields.freshnessCheckCount"
              label="freshnessCheckCount"
              defaultValue="{{increment}}"
              size="small"
              fullWidth
              helperText="Use {{increment}} to increment the counter"
            />
          </Stack>
        </Grid>
      )}

      <Grid item xs={12}>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Special values: {`{{currentDate}}`} = current date/time, {`{{increment}}`} = increment counter
        </Typography>
      </Grid>
    </Grid>
  );
}
