import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import * as Yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import {
  Button,
  Chip,
  Grid,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
// import { useGetDocumentTypes } from "src/api/documentType";
import FormProvider, { RHFAutocomplete, RHFSelect } from "src/components/hook-form";
import ReactFlowCustomNodeStructure from "../react-flow-custom-node";
import CustomProcessDialogue from "./components-dialogue";
import LogsProcessDialogue from "./logs-dialogue";

// Model options
const modelOptions = [
  { label: "ML", value: "ml", isDisabled: true },
  { label: "Gen AI", value: "genai", isDisabled: false },
  { label: "Computer Vision", value: "computervision", isDisabled: true },
  { label: "NLP", value: "nlp", isDisabled: true },
];

export default function ReactFlowClassify({ data }) {
  const [isOpen, setIsOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [documentTypesData, setDocumentTypesData] = useState([]);
//   const { documentTypes, documentTypesEmpty } = useGetDocumentTypes();

//   useEffect(() => {
//     if (documentTypes && !documentTypesEmpty) {
//       setDocumentTypesData(documentTypes);
//     }
//   }, [documentTypes, documentTypesEmpty]);

  const handleOpenModal = () => setIsOpen(true);
  const handleCloseModal = () => setIsOpen(false);

  // Open logs modal
  const handleOpenLogsModal = () => {
    setLogsOpen(true);
  };

  // Close logs modal
  const handleCloseLogsModal = () => {
    setLogsOpen(false);
  }

  const newClassificationSchema = Yup.object().shape({
    model: Yup.string().required("Model is required"),
    categories: Yup.array().of(Yup.object()).min(1, "Please select category"),
  })

  const defaultValues = useMemo(
    () => ({
      model: data.bluePrint?.model || '',
      categories: data.bluePrint?.categories || []
    }),
    [data]
  );

  const methods = useForm({
    resolver: yupResolver(newClassificationSchema),
    defaultValues
  })

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = handleSubmit(async (formData) => {
    console.log('classify formData', formData);
    data.functions.handleBluePrintComponent(data.label, formData);
    handleCloseModal();
  })

  return (
    <Stack sx={{ marginTop: 3, zIndex: 100000 }} spacing={1}>
      <ReactFlowCustomNodeStructure data={data} />
      <Typography variant="h5">2. {data.label}</Typography>
      {/* Model section */}
      {values && values.model && (
        <Stack spacing={1} direction='column'>
          <Typography variant='h5'>Selected Model</Typography>
          <Typography variant='h6'>{modelOptions.find((model) => model.value === values.model).label}</Typography>
        </Stack>
      )}
      {/* Classification Section */}
      <Typography variant="h6">Target Classification</Typography>
      {values.categories.length > 0 && values.categories.map((item) => {
        if (item) {
          const fileURL = item.sampleDocument.fileUrl;
          return (
            <>
              <Typography sx={{ fontWeight: 'bold' }} variant="body1">{item.documentType}</Typography>
              <Typography variant="body1"><a href={fileURL} target="_blank" rel="noopener noreferrer">Click Here</a> for sample doc</Typography>
            </>
          )
        }
        return null;
      })}
      {(data?.isProcessInstance !== true) && <Button
        sx={{ width: "200px", color: "royalBlue", borderColor: "royalBlue" }}
        onClick={handleOpenModal}
        variant="outlined"
      >
        Add Category
      </Button>}
      {(data?.isProcessInstance === true) && <Button sx={{ width: '200px', color: 'royalBlue', borderColor: 'royalBlue' }} variant='outlined' onClick={() => handleOpenLogsModal()}>View Logs</Button>}

      {/* Dialog */}
      <CustomProcessDialogue
        isOpen={isOpen}
        handleCloseModal={handleCloseModal}
        title='Add Category'
      >
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
              <RHFSelect name="model" label="Select model">
                {modelOptions.length > 0 ? modelOptions.map((model) => (
                  <MenuItem disabled={model.isDisabled} key={model.value} value={model.value}>{model.label}</MenuItem>
                )) : (
                  <MenuItem value=''>No models found</MenuItem>
                )}
              </RHFSelect>
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFAutocomplete
                name="categories"
                label="Categories"
                multiple
                disableCloseOnSelect
                options={documentTypesData || []}
                getOptionLabel={(doc) => doc?.documentType || ''}
                isOptionEqualToValue={(doc, value) => doc?.id === value?.id}
                renderOption={(props, doc) => (
                  <li {...props} key={doc.id}>
                    {doc.documentType}
                  </li>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip label={option.documentType} {...getTagProps({ index })} />
                  ))
                }
              />
            </Grid>
          </Grid>
          <Stack alignItems="flex-end" sx={{ mt: 3, display: 'flex', gap: '10px' }}>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              Add
            </LoadingButton>
          </Stack>
        </FormProvider>
      </CustomProcessDialogue>

      {/* logs modal */}
      <LogsProcessDialogue isOpen={logsOpen} handleCloseModal={handleCloseLogsModal} processInstanceId={14} nodeName={data.label} />
    </Stack>
  );
}

ReactFlowClassify.propTypes = {
  data: PropTypes.object,
};
