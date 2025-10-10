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
import JobListFields from "../locate-components/jobListComponents";
import ActionsComponent from "./react-flow-actions-component";

// Import our separated field groups

const modelOptions = [
  { label: "List", value: "list", isDisabled: false },
  { label: "Details", value: "detail", isDisabled: false },
];

function setFields(fieldsObj = {}) {
  return Object.entries(fieldsObj).map(([key, value]) => {
    if (typeof value === "string") {
      // simple selector string
      return {
        fieldName: key,
        selector: value,
        selectorType: "css", // default type for simple strings
      };
    } else if (typeof value === "object" && !Array.isArray(value)) {
      // object with selector/type
      return {
        fieldName: key,
        selector: value.selector || "",
        selectorType: value.type || "css",
        attribute: value.attr,
        children: value.item
          ? setFields(value.item) // recursively handle children
          : [],
      };
    }
    return null;
  }).filter(Boolean);
}

function storeFields(fieldsArray = []) {
  let fields = {};

  fieldsArray.forEach((field) => {
    if (field.selectorType === "list") {
      fields[field.fieldName] = {
        selector: field.selector,
        type: field.selectorType,
        item: field.children && field.children.length > 0
          ? storeFields(field.children)
          : {}
      };
    } else {
      fields[field.fieldName] = {
        selector: field.selector,
        type: field.selectorType,
      };

      if (field.attribute) {
        fields[field.fieldName].attr = field.attribute;
      }
    }
  });

  return fields;
}

export default function ReactFlowClassify({ data }) {
  const [isOpen, setIsOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);

  const handleOpenModal = () => setIsOpen(true);
  const handleCloseModal = () => setIsOpen(false);
  const handleOpenLogsModal = () => setLogsOpen(true);
  const handleCloseLogsModal = () => setLogsOpen(false);

  const fieldSchema = Yup.object().shape({
    fieldName: Yup.string().required("Field name is required"),
    selector: Yup.string().required("Selector is required"),
    selectorType: Yup.string().required("Selector type is required"),
    attribute: Yup.string().when("selectorType", {
      is: (val) => val !== "list" && val !== "object",
      then: (schema) => schema.required("Attribute is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    children: Yup.array().of(
      Yup.lazy(() => fieldSchema)
    ).optional(),  // children allowed but not mandatory
  });


  // Now define the full schema
  const newClassificationSchema = Yup.object().shape({
    mode: Yup.string().required("Mode is required"),
    selector: Yup.object().shape({
      name: Yup.string().when("..mode", {
        is: "list",
        then: (schema) => schema.required("Selector name is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
      selectorType: Yup.string().when("..mode", {
        is: "list",
        then: (schema) => schema.required("Selector type is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
    }),
    fields: Yup.array()
      .of(fieldSchema)
      .when("mode", {
        is: "list",
        then: (schema) => schema.notRequired(),
        otherwise: (schema) => schema.notRequired(),
      }),
    actionFlow: Yup.array().of(Yup.object().shape({
      selector: Yup.string().required('selector is required'),
      action: Yup.string().required('Please select action type'),
    })),
    paginationFields: Yup.object().shape({
      numberOfPages: Yup.number()
        .when("mode", {
          is: "list",
          then: (schema) => schema.required("Number of pages to scrape is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
      nextPageSelectorName: Yup.string()
        .when("mode", {
          is: "list",
          then: (schema) => schema.required("Next page selector is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
    }),
  });

  const defaultValues = useMemo(
    () => ({
      mode: data.bluePrint?.mode || "",
      selector: data.bluePrint?.selector || { name: "", selectorType: "" },
      fields: setFields(data.bluePrint?.fields) || [],
      actionFlow: data?.bluePrint?.actionFlow || [],
      paginationFields: data?.bluePrint?.paginationFields || null,
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
    formState: { isSubmitting, errors },
  } = methods;

  console.log('error', errors);
  const values = watch();

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = handleSubmit(async (formData) => {
    console.log("Escalation Matrix", formData);
    const newData = {
      id: data.id,
      nodeName: data.label,
      type: data.type,
      mode: formData.mode,
      actionFlow: formData.actionFlow,
    }

    if (formData.mode === 'list') {
      newData.selector = formData.selector;
      newData.paginationFields = formData.paginationFields;
    }

    if (formData.mode === 'detail') {
      newData.fields = storeFields(formData.fields);
    };

    data.functions?.handleBluePrintComponent?.(data.label, data.id, newData);
    handleCloseModal();
  });

  // Switch case for rendering correct fields
  const renderModeFields = (mode) => {
    switch (mode) {
      case "list":
        return <JobListFields />;

      case "detail":
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
            <Grid item xs={12} md={12} sx={{ mt: 2 }}>
              {renderModeFields(values.mode)}
            </Grid>
            <Grid item xs={12} md={12} sx={{ mt: 2 }}>
              <ActionsComponent />
            </Grid>
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
