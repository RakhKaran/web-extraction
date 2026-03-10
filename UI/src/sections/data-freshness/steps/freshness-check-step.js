import { Grid, Typography, MenuItem, Stack, Button, IconButton, FormControlLabel, Checkbox } from '@mui/material';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import { useGetWorkflows } from 'src/api/workflow';

export default function FreshnessCheckStep() {
  const { control, watch, setValue } = useFormContext();
  const checkType = watch('freshnessCheck.type');
  const sessionEnabled = watch('freshnessCheck.session.enabled');
  const { workflows } = useGetWorkflows();

  const { fields: mappingFields, append: appendMapping, remove: removeMapping } = useFieldArray({
    control,
    name: 'freshnessCheck.sourceWorkflowMappings',
  });

  const handleSessionChange = (checked) => {
    setValue('freshnessCheck.session.enabled', checked);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          How to Check Freshness
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Configure when data should expire and how re-scraping should resolve the correct blueprint.
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <RHFSelect name="freshnessCheck.type" label="Check Type" required fullWidth>
          <MenuItem value="simple">Simple (URL availability check)</MenuItem>
          <MenuItem value="full-rescrape">Full Re-scrape (follow mapped blueprint)</MenuItem>
        </RHFSelect>
      </Grid>

      <Grid item xs={12} md={6}>
        <RHFTextField
          name="freshnessCheck.durationDays"
          label="Expire After Days"
          type="number"
          placeholder="e.g., 30"
          helperText="If a record is older than this duration, it will be marked expired."
          fullWidth
        />
      </Grid>

      {checkType === 'full-rescrape' && (
        <>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Source Resolution
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Re-scrape must know which workflow/blueprint to use. Pick the record field that stores the source
              and map each source value to a workflow.
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <RHFTextField
              name="freshnessCheck.sourceIdentifierField"
              label="Source Field In Record"
              placeholder="e.g., sourcePlatform"
              helperText="This field should identify the source for each record."
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={2}>
              {mappingFields.map((field, index) => (
                <Stack key={field.id} direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                  <RHFTextField
                    name={`freshnessCheck.sourceWorkflowMappings.${index}.sourceValue`}
                    label="Source Value"
                    placeholder="e.g., naukri"
                    sx={{ flex: 1 }}
                  />
                  <RHFSelect
                    name={`freshnessCheck.sourceWorkflowMappings.${index}.workflowId`}
                    label="Workflow"
                    sx={{ flex: 1 }}
                  >
                    {workflows.map((workflow) => (
                      <MenuItem key={workflow.id} value={workflow.id}>
                        {workflow.name}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                  <IconButton size="small" color="error" onClick={() => removeMapping(index)}>
                    <Iconify icon="eva:trash-2-outline" />
                  </IconButton>
                </Stack>
              ))}

              <Button
                variant="outlined"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={() => appendMapping({ sourceValue: '', workflowId: '' })}
                sx={{ alignSelf: 'flex-start' }}
              >
                Add Source Mapping
              </Button>
            </Stack>
          </Grid>
        </>
      )}

      {checkType !== 'simple' && (
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Session Configuration (Optional)
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={sessionEnabled}
                onChange={(e) => handleSessionChange(e.target.checked)}
              />
            }
            label="Use saved session (for sites requiring login)"
          />

          {sessionEnabled && (
            <RHFTextField
              name="freshnessCheck.session.storageStatePath"
              label="Session File Name"
              placeholder="e.g., naukri.json"
              fullWidth
              sx={{ mt: 2 }}
            />
          )}
        </Grid>
      )}
    </Grid>
  );
}
