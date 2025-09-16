/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
} from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';
import WorkflowInstanceUploadDoc from './component/workflowInstance-upload-doc';
import WorkflowInstanceCredentials from './component/workflowInstance-api-section';

// ----------------------------------------------------------------------

function SwitchComponent({ channelType, extraDetails }) {
  switch (channelType) {
    case 'ui':
      return <WorkflowInstanceUploadDoc handleClose={extraDetails?.handleClose} data={extraDetails?.workflowInstanceData} />;

    case 'api':
      return <WorkflowInstanceCredentials handleClose={extraDetails?.handleClose} data={extraDetails?.workflowInstanceData}/>;

    default:
      return null;
  }
}
SwitchComponent.propTypes = {
  channelType: PropTypes.string,
  extraDetails: PropTypes.object
}


export default function WorkflowInstanceNewEditForm({ currentWorkflowInstance }) {
  const router = useRouter();
  const [workflowsData, setWorkflowsData] = useState([]);
  const [channelType, setChannelType] = useState('');
  const [extraDetailsData, setExtraDetailsData] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const NewProcessTypeSchema = Yup.object().shape({
    workflowInstanceName: Yup.string().required('Workflow Type is required'),
    workflowInstanceDescription: Yup.string(),
    workflow: Yup.object().required("Please select workflow"),
  });

  const defaultValues = useMemo(
    () => ({
      workflowInstanceName: currentWorkflowInstance?.workflowInstanceName || '',
      workflowInstanceDescription: currentWorkflowInstance?.workflowInstanceDescription || '',
      workflow: null,
    }),
    [currentWorkflowInstance]
  );

  const methods = useForm({
    resolver: yupResolver(NewProcessTypeSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (formData) => {
    try {
      console.info('DATA', formData);

      const inputData = {
        workflowInstanceName: formData.workflowInstanceName,
        workflowInstanceDescription: formData.workflowInstanceDescription,
        workflowId: formData.workflow.id,
        isInstanceRunning: false,
        isActive: currentWorkflowInstance ? formData.isActive : true,
      };

      let response;
      if (!currentWorkflowInstance) {
        response = await axiosInstance.post('/workflow-instances', inputData);
      } else {
        await axiosInstance.patch(`/workflow-instances/${currentWorkflowInstance.id}`, inputData);
        reset();
        enqueueSnackbar(currentWorkflowInstance ? 'Update success!' : 'Create success!');
        router.push(paths.dashboard.workflowInstance.list);
      }

      if (response?.data) {
        const workflowData = response.data;
        const bluePrint = workflowData?.workflow?.workflowBluePrint?.bluePrint ?? [];

        const ingestionNode = bluePrint?.find((node) => node?.nodeName === 'Ingestion');

        enqueueSnackbar(currentWorkflowInstance ? 'Update success!' : 'Create success!');

        if ((ingestionNode?.component?.channelType === 'ui' || ingestionNode?.component?.channelType === 'api')) {
          setChannelType(ingestionNode?.component?.channelType ? ingestionNode?.component?.channelType : '');
          setExtraDetailsData(
            {
              handleClose,
              workflowInstanceData: workflowData
            }
          );
        } else {
          reset();
          router.push(paths.dashboard.workflowInstance.list);
        }
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar(typeof error === 'string' ? error : error.error.message, {
        variant: 'error',
      });
    }
  });

  const handleClose = useCallback(() => {
    reset();
    router.push(paths.dashboard.workflowInstance.list);
    setChannelType('');
    setExtraDetailsData(null);
  }, [reset, router])

  useEffect(() => {
    if (currentWorkflowInstance) {
      reset(defaultValues);
      setValue('workflow', currentWorkflowInstance?.workflow ? currentWorkflowInstance?.workflow : null);
      setWorkflowsData((prev) => [...prev, currentWorkflowInstance?.workflow]);
    }
  }, [currentWorkflowInstance, defaultValues, reset, setValue]);

  useEffect(() => {
    if (currentWorkflowInstance) {
      const bluePrint = currentWorkflowInstance?.workflow?.workflowBlueprint?.bluePrint ?? [];
      const ingestionNode = bluePrint?.find((node) => node?.nodeName === 'Ingestion');

      if ((ingestionNode?.component?.channelType === 'ui' || ingestionNode?.component?.channelType === 'api')) {
        setChannelType(ingestionNode?.component?.channelType ? ingestionNode?.component?.channelType : '');
        setExtraDetailsData(
          {
            handleClose,
            workflowInstanceData: currentWorkflowInstance
          }
        );
      }
    }
  }, [currentWorkflowInstance, handleClose])

  const fetchWorkflows = async (searchTerm) => {
    try {
      console.log(searchTerm);
      if (searchTerm.length > 0) {
        const filter = {
          where: {
            name: { like: `%${searchTerm || ''}%` }
          }
        }
        const filterString = encodeURIComponent(JSON.stringify(filter));
        const { data } = await axiosInstance.get(`/workflows?filter=${filterString}`);
        setWorkflowsData(data);
      };
    } catch (error) {
      console.error('error while fetching processes', error);
    }
  }

  return (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <RHFTextField name="workflowInstanceName" label="Workflow Instance Name" />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <RHFAutocomplete
                    name="workflow"
                    label="Select Workflow *"
                    options={workflowsData || []}
                    onInputChange={(event) => fetchWorkflows(event?.target?.value)}
                    getOptionLabel={(option) => `${option?.name}` || ''}
                    isOptionEqualToValue={(option, value) => option?.id === value.id}
                    filterOptions={(options, { inputValue }) =>
                      options?.filter((option) => option?.name?.toLowerCase().includes(inputValue?.toLowerCase()))
                    }
                    renderOption={(props, option) => (
                      <li {...props}>
                        <div>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {`${option?.name}`}
                          </Typography>
                        </div>
                      </li>
                    )}

                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <RHFTextField multiline rows={3} name="workflowInstanceDescription" label="Workflow Instance Description" />
                </Grid>
              </Grid>

              <Stack alignItems="flex-end" sx={{ mt: 3 }}>
                {((!currentWorkflowInstance && channelType === '') || (currentWorkflowInstance)) && <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  {!currentWorkflowInstance ? 'Create Workflow Instance' : 'Save Changes'}
                </LoadingButton>}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
      <Box component='div' sx={{ mt: 2 }}>
        <SwitchComponent channelType={channelType} extraDetails={extraDetailsData} />
      </Box>
    </>
  );
}

WorkflowInstanceNewEditForm.propTypes = {
  currentWorkflowInstance: PropTypes.object,
};
