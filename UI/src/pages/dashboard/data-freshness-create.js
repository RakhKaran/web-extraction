import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  Stepper,
  Step,
  StepLabel,
  Button,
  Stack,
  Box,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { FormProvider, useForm } from 'react-hook-form';
import {
  createFreshnessCheck,
  updateFreshnessCheck,
  getFreshnessCheckById,
} from 'src/api/data-freshness';
import BasicInfoStep from 'src/sections/data-freshness/steps/basic-info-step';
import DataSourceStep from 'src/sections/data-freshness/steps/data-source-step';
import FiltersStep from 'src/sections/data-freshness/steps/filters-step';
import FreshnessCheckStep from 'src/sections/data-freshness/steps/freshness-check-step';
import UpdateStrategyStep from 'src/sections/data-freshness/steps/update-strategy-step';
import ScheduleStep from 'src/sections/data-freshness/steps/schedule-step';

const steps = [
  'Basic Information',
  'Data Source',
  'Filters',
  'Freshness Check',
  'Update Strategy',
  'Schedule',
];

export default function DataFreshnessCreatePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const methods = useForm({
    defaultValues: {
      name: '',
      description: '',
      sourceModel: '',
      sourceRepository: '',
      urlField: '',
      filters: {},
      freshnessCheck: {
        type: 'simple',
        requiredSelectors: [],
        fieldsToRescrape: [],
        session: {
          enabled: false,
          storageStatePath: '',
        },
      },
      updateStrategy: {
        onNotFound: {
          action: 'update-fields',
          fields: {
            isActive: false,
            deletedAt: '{{currentDate}}',
            freshnessStatus: 'expired',
          },
        },
        onFound: {
          action: 'update-timestamp',
          fields: {
            lastCheckedAt: '{{currentDate}}',
            freshnessStatus: 'live',
            freshnessCheckCount: '{{increment}}',
          },
        },
      },
      schedule: {
        frequency: 'daily',
        time: '02:00',
        timezone: 'Asia/Kolkata',
      },
      batchProcessing: {
        batchSize: 50,
        delayBetweenJobs: 2000,
        maxJobsPerRun: 500,
      },
    },
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (id) {
      loadFreshnessCheck();
    }
  }, [id]);

  const loadFreshnessCheck = async () => {
    try {
      setLoading(true);
      const data = await getFreshnessCheckById(id);
      reset(data);
    } catch (error) {
      console.error('Error loading freshness check:', error);
      enqueueSnackbar('Failed to load freshness check', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Clean up the data - remove fields that are not in the model
      const cleanData = {
        name: data.name,
        description: data.description,
        sourceModel: data.sourceModel,
        sourceRepository: data.sourceRepository,
        urlField: data.urlField,
        filters: data.filters || {},
        freshnessCheck: data.freshnessCheck,
        updateStrategy: data.updateStrategy,
        schedule: data.schedule,
        batchProcessing: data.batchProcessing,
      };

      // Remove UI-only fields that are not part of the model
      if (cleanData.filters) {
        delete cleanData.filters.additionalFilters;
        delete cleanData.filters.dateField;
        delete cleanData.filters.dateRange;
      }

      // Remove fieldsArray from updateStrategy (UI-only)
      if (cleanData.updateStrategy?.onNotFound) {
        delete cleanData.updateStrategy.onNotFound.fieldsArray;
      }
      if (cleanData.updateStrategy?.onFound) {
        delete cleanData.updateStrategy.onFound.fieldsArray;
      }

      if (id) {
        await updateFreshnessCheck(id, cleanData);
        enqueueSnackbar('Freshness check updated successfully', { variant: 'success' });
      } else {
        await createFreshnessCheck(cleanData);
        enqueueSnackbar('Freshness check created successfully', { variant: 'success' });
      }
      navigate('/dashboard/data-freshness');
    } catch (error) {
      console.error('Error saving freshness check:', error);
      enqueueSnackbar(error?.response?.data?.error?.message || 'Failed to save freshness check', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Only allow submission on the last step
    if (activeStep !== steps.length - 1) {
      console.log('Form submission prevented - not on last step');
      return;
    }
    console.log('Submitting form from step:', activeStep);
    handleSubmit(onSubmit)(e);
  };

  const handleFinalSubmit = () => {
    console.log('Final submit button clicked');
    handleSubmit(onSubmit)();
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <BasicInfoStep />;
      case 1:
        return <DataSourceStep />;
      case 2:
        return <FiltersStep />;
      case 3:
        return <FreshnessCheckStep />;
      case 4:
        return <UpdateStrategyStep />;
      case 5:
        return <ScheduleStep />;
      default:
        return 'Unknown step';
    }
  };

  return (
    <>
      <Helmet>
        <title>{id ? 'Edit' : 'Create'} Freshness Check</title>
      </Helmet>

      <Container maxWidth="lg">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">{id ? 'Edit' : 'Create'} Freshness Check</Typography>
          <Button variant="outlined" onClick={() => navigate('/dashboard/data-freshness')}>
            Cancel
          </Button>
        </Stack>

        <Card sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <FormProvider {...methods}>
            <form onSubmit={handleFormSubmit}>
              <Box sx={{ minHeight: 400 }}>{getStepContent(activeStep)}</Box>

              <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
                <Button disabled={activeStep === 0} onClick={handleBack}>
                  Back
                </Button>

                <Stack direction="row" spacing={2}>
                  {activeStep === steps.length - 1 ? (
                    <Button 
                      type="button" 
                      variant="contained" 
                      disabled={loading}
                      onClick={handleFinalSubmit}
                    >
                      {id ? 'Update' : 'Create'} & Schedule
                    </Button>
                  ) : (
                    <Button type="button" variant="contained" onClick={handleNext}>
                      Next
                    </Button>
                  )}
                </Stack>
              </Stack>
            </form>
          </FormProvider>
        </Card>
      </Container>
    </>
  );
}
