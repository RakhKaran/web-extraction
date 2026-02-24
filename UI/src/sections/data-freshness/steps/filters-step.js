import { Grid, Typography, FormControlLabel, Checkbox, MenuItem, Stack, Button, IconButton } from '@mui/material';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { RHFTextField, RHFSelect } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';

export default function FiltersStep() {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'additionalFilters',
  });

  const filters = watch('filters') || {};

  const handleCheckboxChange = (field, value) => {
    const currentFilters = watch('filters') || {};
    setValue('filters', {
      ...currentFilters,
      [field]: value,
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Filter Records to Check
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Select which records should be checked for freshness
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.isActive === true}
                onChange={(e) => handleCheckboxChange('isActive', e.target.checked ? true : undefined)}
              />
            }
            label="Only check active records (isActive = true)"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={filters.isDeleted === false}
                onChange={(e) => handleCheckboxChange('isDeleted', e.target.checked ? false : undefined)}
              />
            }
            label="Only check non-deleted records (isDeleted = false)"
          />
        </Stack>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          Date Range Filter (Optional)
        </Typography>
      </Grid>

      <Grid item xs={12} md={4}>
        <RHFTextField
          name="filters.dateField"
          label="Date Field"
          placeholder="e.g., scrappedAt"
          fullWidth
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <RHFSelect name="filters.dateRange" label="Date Range" fullWidth>
          <MenuItem value="">No Filter</MenuItem>
          <MenuItem value="last-7-days">Last 7 days</MenuItem>
          <MenuItem value="last-30-days">Last 30 days</MenuItem>
          <MenuItem value="last-90-days">Last 90 days</MenuItem>
          <MenuItem value="all-time">All time</MenuItem>
        </RHFSelect>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          Additional Filters (Optional)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Add custom field filters
        </Typography>

        <Stack spacing={2}>
          {fields.map((field, index) => (
            <Stack key={field.id} direction="row" spacing={2} alignItems="center">
              <RHFTextField
                name={`additionalFilters.${index}.field`}
                label="Field Name"
                size="small"
                sx={{ flex: 1 }}
              />
              <RHFSelect
                name={`additionalFilters.${index}.operator`}
                label="Operator"
                size="small"
                sx={{ width: 150 }}
              >
                <MenuItem value="equals">Equals</MenuItem>
                <MenuItem value="not-equals">Not Equals</MenuItem>
                <MenuItem value="contains">Contains</MenuItem>
              </RHFSelect>
              <RHFTextField
                name={`additionalFilters.${index}.value`}
                label="Value"
                size="small"
                sx={{ flex: 1 }}
              />
              <IconButton size="small" color="error" onClick={() => remove(index)}>
                <Iconify icon="eva:trash-2-outline" />
              </IconButton>
            </Stack>
          ))}

          <Button
            variant="outlined"
            startIcon={<Iconify icon="eva:plus-fill" />}
            onClick={() => append({ field: '', operator: 'equals', value: '' })}
            sx={{ alignSelf: 'flex-start' }}
          >
            Add Filter
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}
