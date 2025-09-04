import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import {
  Button,
  Grid,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import FormProvider, { RHFSelect } from "src/components/hook-form";
import ReactFlowCustomNodeStructure from "../react-flow-custom-node";
import CustomProcessDialogue from "./components-dialogue";
import LogsProcessDialogue from "./logs-dialogue";
import JobDetailsFields from "../locate-components/jobDetailsComponents";

// Import our separated field groups

const modelOptions = [
  { label: "Job List", value: "jobList", isDisabled: false },
  { label: "Job Details", value: "jobDetails", isDisabled: false },
];

export default function ReactFlowClassify({ data }) {
  const [isOpen, setIsOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);

  const handleOpenModal = () => setIsOpen(true);
  const handleCloseModal = () => setIsOpen(false);
  const handleOpenLogsModal = () => setLogsOpen(true);
  const handleCloseLogsModal = () => setLogsOpen(false);

  // Yup schema (can be extended with conditional validation later)
  const newClassificationSchema = Yup.object().shape({
    mode: Yup.string().required("Mode is required"),
  });

  const defaultValues = useMemo(
    () => ({
      mode: data.bluePrint?.mode || "",
      selector: data.bluePrint?.selector || { name: "", selectorType: "" },
      fields: data.bluePrint?.fields || {},
    }),
    [data]
  );

  const methods = useForm({
    resolver: yupResolver(newClassificationSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = handleSubmit(async (formData) => {
    console.log("classify formData", formData);
    data.functions.handleBluePrintComponent(data.label, formData);
    handleCloseModal();
  });

  // Switch case for rendering correct fields
  const renderModeFields = (mode) => {
    switch (mode) {
      case "jobList":
       return null
       
      //  <JobListFields />;
      case "jobDetails":
        return <JobDetailsFields />;
      default:
        return null;
    }
  };

  return (
    <Stack sx={{ marginTop: 3, zIndex: 100000 }} spacing={1}>
      <ReactFlowCustomNodeStructure data={data} />
      <Typography variant="h5">3. {data.label}</Typography>
      {data?.isProcessInstance !== true && (
        <Button
          sx={{ width: "200px", color: "royalBlue", borderColor: "royalBlue" }}
          onClick={handleOpenModal}
          variant="outlined"
        >
          Add Mode
        </Button>
      )}
      {data?.isProcessInstance === true && (
        <Button
          sx={{ width: "200px", color: "royalBlue", borderColor: "royalBlue" }}
          variant="outlined"
          onClick={() => handleOpenLogsModal()}
        >
          View Logs
        </Button>
      )}

      {/* Dialog */}
      <CustomProcessDialogue
        isOpen={isOpen}
        handleCloseModal={handleCloseModal}
        title="Add Mode"
      >
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Grid container spacing={2}>
            {/* Mode selector */}
            <Grid item xs={12} md={12}>
              <RHFSelect name="mode" label="Select Mode">
                {modelOptions.map((model) => (
                  <MenuItem
                    disabled={model.isDisabled}
                    key={model.value}
                    value={model.value}
                  >
                    {model.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Grid>
              <Stack spacing={2} sx={{ mt: 2 }}>
                {renderModeFields(values.mode)}
              </Stack>
          </Grid>
          <Stack
            alignItems="flex-end"
            sx={{ mt: 3, display: "flex", gap: "10px" }}
          >
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              Add
            </LoadingButton>
          </Stack>
        </FormProvider>
      </CustomProcessDialogue>

      {/* logs modal */}
      <LogsProcessDialogue
        isOpen={logsOpen}
        handleCloseModal={handleCloseLogsModal}
        processInstanceId={14}
        nodeName={data.label}
      />
    </Stack>
  );
}

ReactFlowClassify.propTypes = {
  data: PropTypes.object,
};
