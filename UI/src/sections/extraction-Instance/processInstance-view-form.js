import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui

import Card from '@mui/material/Card';

import Grid from '@mui/material/Unstable_Grid2';

// utils

// routes

// assets

// components

import FormProvider, { RHFTextField, RHFSelect } from 'src/components/hook-form';
import { MenuItem } from '@mui/material';
import { COMMON_STATUS_OPTIONS } from 'src/utils/constants';

// ----------------------------------------------------------------------

export default function ProcessTypeViewForm({ currentProcessType }) {
  const NewProcessTypeSchema = Yup.object().shape({
    processType: Yup.string().required('Process Type is required'),
    description: Yup.string(),
    isActive: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      processType: currentProcessType?.processType || '',
      description: currentProcessType?.description || '',
      isActive: currentProcessType?.isActive ? '1' : '0' || '1',
    }),
    [currentProcessType]
  );

  const methods = useForm({
    resolver: yupResolver(NewProcessTypeSchema),
    defaultValues,
  });

  const {
    reset,
    watch,

    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (currentProcessType) {
      reset(defaultValues);
    }
  }, [currentProcessType, defaultValues, reset]);

  return (
    <FormProvider methods={methods}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Grid container spacing={2}>
              {currentProcessType && (
                <>
                  <Grid item xs={12} sm={6}>
                    <RHFSelect name="isActive" label="Status" disabled>
                      {COMMON_STATUS_OPTIONS.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </RHFSelect>
                  </Grid>
                  <Grid item xs={12} sm={6} />
                </>
              )}

              <Grid item xs={12} sm={6}>
                <RHFTextField name="processType" label="Process Type" disabled />
              </Grid>

              <Grid item xs={12} sm={6}>
                <RHFTextField name="description" label="Description" disabled />
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ProcessTypeViewForm.propTypes = {
  currentProcessType: PropTypes.object,
};
