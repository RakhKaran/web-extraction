import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo, useEffect, useState } from 'react';
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
import { useGetDesignations } from 'src/api/designation';
import { useGetCompanies as useGetCompanyMasters } from 'src/api/company-master';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFAutocomplete, RHFSelect } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';

const STATUS_OPTIONS = [
  { value: true, label: 'Active' },
  { value: false, label: 'In-active' },
];


export default function CompanyNewEditForm({ currentCompany, open, onClose }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [designations, setDesignations] = useState([]);
  const [companyMasters, setCompanyMasters] = useState([]);

  const designationCategories = [
    { value: 'product-management', label: 'Product Management' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'software-development', label: 'Software Development' }
  ];

  const { Designations, DesignationsLoading } = useGetDesignations();
  const { companies, companiesLoading } = useGetCompanyMasters();

  useEffect(() => {
    if (Array.isArray(companies) && !companiesLoading) {
      const activeCompanies = companies.filter((item) => item.isActive === true);
      setCompanyMasters(activeCompanies);
    }
  }, [companies, companiesLoading]);

  const CompanySchema = Yup.object().shape({
    companyName: Yup.string().required('Company Name is required'),
    designations: Yup.array()
      .of(Yup.string())
      .min(1, 'Select at least one designation')
      .required('Designation is required'),
    designationCategories: Yup.array()
      .of(Yup.string())
      .min(1, 'Select at least one category'),
    isActive: Yup.boolean().required('Status is required'),
  });

  const defaultValues = useMemo(
    () => ({
      companyName: currentCompany?.companyName || '',
      designations: currentCompany?.designations || [],
      designationCategories: currentCompany?.designationCategories || [],
      isActive: currentCompany?.isActive ?? true,
    }),
    [currentCompany]
  );

  const methods = useForm({
    resolver: yupResolver(CompanySchema),
    defaultValues,
  });

  const {
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const inputData = {
        companyName: data.companyName,
        designations: data.designations,
        designationCategories: data.designationCategories,
        isActive: data.isActive,
      };

      if (!currentCompany) {
        await axiosInstance.post('/company-lists', inputData);
      } else {
        await axiosInstance.patch(`/company-lists/${currentCompany.id}`, inputData);
      }

      reset();
      enqueueSnackbar(
        currentCompany
          ? 'LinkedIn configuration updated successfully!'
          : 'LinkedIn configuration created successfully!'
      );
      router.push(paths.dashboard.companyList.list);
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

  useEffect(() => {
    if (Array.isArray(Designations) && !DesignationsLoading) {
      const activeDesignations = Designations.filter(
        (item) => item.isActive === true && (values.designationCategories.includes(item.category) || values.designations.includes(item.designation))
      );
      setValue('designations', activeDesignations.map((item) => item.designation));
      setDesignations(activeDesignations);
    }
  }, [Designations, DesignationsLoading, values.designationCategories]);

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
              <RHFSelect name="companyName" label="Select Company">
                {companyMasters.length > 0 ? (
                  companyMasters.map((option) => (
                    <MenuItem key={option.id} value={option.companyName}>
                      {option.companyName}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value="">
                    No Company Available
                  </MenuItem>
                )}
              </RHFSelect>

              <RHFAutocomplete
                multiple
                name="designationCategories"
                label="Select Designation Category"
                options={designationCategories.map((option) => option.value)}
                getOptionLabel={(option) => option}
                filterSelectedOptions
                disableCloseOnSelect
              />

              <RHFAutocomplete
                multiple
                name="designations"
                label="Select Designations"
                options={designations.map((option) => option.designation)}
                getOptionLabel={(option) => option}
                filterSelectedOptions
                disableCloseOnSelect
              />

              <RHFSelect name="isActive" label="Status">
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={String(option.value)} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {currentCompany ? 'Save Changes' : 'Create Configuration'}
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
