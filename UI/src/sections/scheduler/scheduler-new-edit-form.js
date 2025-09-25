import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
// utils
import { fData } from 'src/utils/format-number';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// assets

// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFSelect } from 'src/components/hook-form';
import RHFSwitch from 'src/components/hook-form/rhf-switch';
import RHFTextField from 'src/components/hook-form/rhf-text-field';
import { RHFUploadAvatar } from 'src/components/hook-form/rhf-upload';
import RHFAutocomplete from 'src/components/hook-form/rhf-autocomplete';

import { Dialog, DialogContent, DialogTitle, IconButton, InputAdornment, MenuItem, TextField, Tooltip } from '@mui/material';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useBoolean } from 'src/hooks/use-boolean';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { useGetWorkflows } from 'src/api/workflow';

const schedulerTypes = [
  { value: 0, label: 'One Time' },
  { value: 1, label: 'Recurring' },
];

const schedulerForValues = [
  { value: 0, label: 'Jobs' },
  { value: 1, label: 'Company' },
];

const intervalTypeValues = [
  { value: 1, label: 'Hours' },
  { value: 2, label: 'Days' },
  { value: 3, label: 'Weeks' },
  { value: 4, label: 'Months' },
];

export default function SchedulerNewEditForm({ currentScheduler, open, onClose }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { workflows, workflowsEmpty } = useGetWorkflows();

  const SchedulerSchema = Yup.object().shape({
    schedularName: Yup.string().required('Name is required'),
    schedulerType: Yup.number().required('Scheduler type is required'),
    schedulerFor: Yup.number().required('Scheduler for is required'),
    // intervalType is required only if schedulerType === 1
    intervalType: Yup.number().when('schedulerType', {
      is: 1,
      then: (schema) => schema.required('Interval type is required'),
      otherwise: (schema) => schema.notRequired(),
    }),

    // interval is required only if schedulerType === 1
    interval: Yup.number().when('schedulerType', {
      is: 1,
      then: (schema) => schema.required('Interval is required'),
      otherwise: (schema) => schema.notRequired(),
    }),

    // date is required only if schedulerType === 0
    date: Yup.string().when('schedulerType', {
      is: 0,
      then: (schema) => schema.required('Date is required'),
      otherwise: (schema) => schema.notRequired(),
    }),

    // time is required only if schedulerType === 0
    time: Yup.string().when('schedulerType', {
      is: 0,
      then: (schema) => schema.required('Time is required'),
      otherwise: (schema) => schema.notRequired(),
    }),

    extraction: Yup.string().required('Please select extraction'),
    isActive: Yup.boolean().required('Please select active status'),
  });
  const defaultValues = useMemo(
    () => ({
      schedularName: currentScheduler?.schedularName || '',
      schedulerType: currentScheduler?.schedulerType || 0,
      schedulerFor: currentScheduler?.schedulerFor || 0,
      intervalType: currentScheduler?.intervalType || undefined,
      interval: currentScheduler?.interval || undefined,
      date: currentScheduler?.date || '',
      time: currentScheduler?.time || '',
      extraction: currentScheduler?.workflowId || undefined,
      isActive: currentScheduler?.isActive || true,
    }),
    [currentScheduler]
  );

  const methods = useForm({
    resolver: yupResolver(SchedulerSchema),
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { isSubmitting, errors },
  } = methods;

  console.log('errors', errors);
  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const inputData = {
        schedularName: data.schedularName,
        schedulerType: data.schedulerType,
        schedulerFor: data.schedulerFor,
        intervalType: data.intervalType,
        interval: data.interval,
        workflowId: data.extraction,
        isActive: data.isActive,
        isDeleted: false,
      };

      if (data.date && data.time) {
        inputData.date = new Date(data.date);
        inputData.time = data.time;
      }

      if (currentScheduler) {
        inputData.isDeleted = currentScheduler.isDeleted;
      }

      if (!currentScheduler) {
        await axiosInstance.post('/schedulers', inputData);
      } else {
        await axiosInstance.patch(`/schedulers/${currentScheduler.id}`, inputData);
      }

      reset();
      enqueueSnackbar(currentScheduler ? 'Scheduler updated successfully!' : 'Scheduler created successfully!');
      router.push(paths.dashboard.scheduler.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error?.message || 'Something went wrong', {
        variant: 'error',
      });
    }
  });

  useEffect(() => {
    if (currentScheduler) {
      reset(defaultValues);
    }
  }, [currentScheduler, defaultValues, reset, workflows]);


  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="schedularName" label="Scheduler Name" />
              <RHFSelect name="schedulerType" label="Scheduler Type ">
                {schedulerTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </RHFSelect>
              <RHFSelect name="schedulerFor" label="Scheduler For ">
                {schedulerForValues.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </RHFSelect>
              <RHFSelect name="extraction" label="Select Extraction Blueprint">
                {workflows && workflows.length > 0 ? (
                  workflows.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value="">
                    No Blueprints
                  </MenuItem>
                )}
              </RHFSelect>
              {values.schedulerType === 1 && (
                <>
                  <RHFSelect
                    name="intervalType"
                    label="Interval Type"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment sx={{ mr: 2 }} position="end">
                          <Tooltip title="Select type of interval">
                            <IconButton edge="end">
                              <Iconify icon="mdi:information-outline" fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  >
                    {intervalTypeValues.map((option) => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </RHFSelect>
                  <RHFTextField
                    name="interval"
                    label="Interval"
                    type='number'
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Number of selected interval type to wait before the next scheduler execution">
                            <IconButton edge="end">
                              <Iconify icon="mdi:information-outline" fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                </>
              )}
              {values.schedulerType === 0 && (
                <>
                  <Controller
                    name="date"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <DatePicker
                        label="Date"
                        minDate={new Date()}
                        value={new Date(field.value)}
                        onChange={(newValue) => {
                          field.onChange(newValue);
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!error,
                            helperText: error?.message,
                          },
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="time"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TimePicker
                        label="Time"
                        value={new Date(field.value)}
                        onChange={(newValue) => {
                          field.onChange(newValue);
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!error,
                            helperText: error?.message,
                          },
                        }}
                      />
                    )}
                  />
                </>
              )}

            </Box>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {currentScheduler ? 'Save Changes' : 'Create Scheduler'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

SchedulerNewEditForm.propTypes = {
  currentScheduler: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func,

};
