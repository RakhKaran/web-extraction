import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import MenuItem from '@mui/material/MenuItem';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFSelect } from 'src/components/hook-form';
import RHFTextField from 'src/components/hook-form/rhf-text-field';
import axiosInstance from 'src/utils/axios';

// ✅ keep values as real booleans
const Status = [
  { value: true, label: 'Active' },
  { value: false, label: 'In-active' },
];

export default function CompanyNewEditForm({ currentCompany, open, onClose }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const companySchema = Yup.object().shape({
    companyName: Yup.string().required('Company name is required'),
    description: Yup.string(),
    isActive: Yup.boolean().required('Status is required'),
  });

  const defaultValues = useMemo(
    () => ({
      companyName: currentCompany?.companyName || '',
      description: currentCompany?.description || '',
      isActive: currentCompany?.isActive ?? true, // default to true if not set
    }),
    [currentCompany]
  );

  const methods = useForm({
    resolver: yupResolver(companySchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const inputData = {
        companyName: data.companyName,
        description: data.description,
        isActive: data.isActive, // already boolean ✅
      };

      if (!currentCompany) {
        await axiosInstance.post('/company-masters', inputData);
      } else {
        await axiosInstance.patch(`/company-masters/${currentCompany.id}`, inputData);
      }

      reset();
      enqueueSnackbar(
        currentCompany ? 'CompanyCreateView updated successfully!' : 'CompanyCreateView created successfully!'
      );
      router.push(paths.dashboard.companyMaster.list);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(
        typeof error === 'string' ? error : error?.message || 'Something went wrong',
        { variant: 'error' }
      );
    }
  });

  useEffect(() => {
    if (currentCompany) {
      reset(defaultValues);
    }
  }, [currentCompany, defaultValues, reset]);

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
              <RHFTextField name="companyName" label="Company Name" />

              <RHFSelect name="isActive" label="Status">
                {Status.map((option) => (
                  <MenuItem key={String(option.value)} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFTextField
                name="description"
                label="Description"
                multiline
                rows={3}
                sx={{ gridColumn: 'span 2' }}
              />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {currentCompany ? 'Save Changes' : 'Create Company'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

CompanyNewEditForm.propTypes = {
  currentCompany: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func,
};
