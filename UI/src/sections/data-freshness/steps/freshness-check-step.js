import { Grid, Typography, MenuItem, Stack, Button, IconButton, FormControlLabel, Checkbox } from '@mui/material';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';

export default function FreshnessCheckStep() {
  const { control, watch, setValue } = useFormContext();
  const checkType = watch('freshnessCheck.type');
  const sessionEnabled = watch('freshnessCheck.session.enabled');

  const { fields: selectorFields, append: appendSelector, remove: removeSelector } = useFieldArray({
    control,
    name: 'freshnessCheck.requiredSelectors',
  });

  const { fields: rescrapeFields, append: appendRescrape, remove: removeRescrape } = useFieldArray({
    control,
    name: 'freshnessCheck.fieldsToRescrape',
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
          Configure how to determine if a record is still active
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <RHFSelect name="freshnessCheck.type" label="Check Type" required fullWidth>
          <MenuItem value="simple">Simple (Just check if page exists - HTTP 200)</MenuItem>
          <MenuItem value="content">Content (Check if specific elements exist)</MenuItem>
          <MenuItem value="full-rescrape">Full Re-scrape (Re-scrape and compare data)</MenuItem>
        </RHFSelect>
      </Grid>

      {checkType === 'content' && (
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Required Selectors
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            These elements must exist for the record to be considered active
          </Typography>

          <Stack spacing={2}>
            {selectorFields.map((field, index) => (
              <Stack key={field.id} direction="row" spacing={2} alignItems="center">
                <RHFTextField
                  name={`freshnessCheck.requiredSelectors.${index}`}
                  label={`Selector ${index + 1}`}
                  placeholder="e.g., h1.job-title"
                  fullWidth
                />
                <IconButton size="small" color="error" onClick={() => removeSelector(index)}>
                  <Iconify icon="eva:trash-2-outline" />
                </IconButton>
              </Stack>
            ))}

            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={() => appendSelector('')}
              sx={{ alignSelf: 'flex-start' }}
            >
              Add Selector
            </Button>
          </Stack>
        </Grid>
      )}

      {checkType === 'full-rescrape' && (
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Fields to Re-scrape
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Specify which fields to re-scrape and their selectors
          </Typography>

          <Stack spacing={2}>
            {rescrapeFields.map((field, index) => (
              <Stack key={field.id} direction="row" spacing={2} alignItems="center">
                <RHFTextField
                  name={`freshnessCheck.fieldsToRescrape.${index}.field`}
                  label="Field Name"
                  placeholder="e.g., title"
                  sx={{ flex: 1 }}
                />
                <RHFTextField
                  name={`freshnessCheck.fieldsToRescrape.${index}.selector`}
                  label="Selector"
                  placeholder="e.g., h1.job-title"
                  sx={{ flex: 1 }}
                />
                <IconButton size="small" color="error" onClick={() => removeRescrape(index)}>
                  <Iconify icon="eva:trash-2-outline" />
                </IconButton>
              </Stack>
            ))}

            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={() => appendRescrape({ field: '', selector: '' })}
              sx={{ alignSelf: 'flex-start' }}
            >
              Add Field
            </Button>
          </Stack>
        </Grid>
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
