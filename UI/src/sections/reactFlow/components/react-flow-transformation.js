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
import TransformationComponents from "../transformation-components/transformationComponents";


// Deliver options
const deliverOptions = [
  { label: "Database", value: "database", isDisabled: false },
  { label: "API", value: "api", isDisabled: false },
];

// Yup validation schemas
const deliverSchemas = Yup.object().shape({
  database: Yup.object().shape({
    deliverModelName: Yup.string().required("Model is required"),
    deliverRepositoryName: Yup.string().required("Model is required"),
    deliverModelId: Yup.string().required("Model id is required"),
  }),
  api: Yup.object().shape({
    endpoint: Yup.string().url("Invalid URL").required("Endpoint is required"),
    headers: Yup.string().nullable(),
    payload: Yup.object().required("Payload mapping is required"),
  }),
});


const stagingSchemas = Yup.object().shape({
  database: Yup.object().shape({
    stagingModelName: Yup.string().required("Model is required"),
    stagingRepositoryName: Yup.string().required("Model is required"),
    stagingModelId: Yup.string().required("Model id is required"),
  }),
  api: Yup.object().shape({
    endpoint: Yup.string().url("Invalid URL").required("Endpoint is required"),
    headers: Yup.string().nullable(),
    payload: Yup.object().required("Payload mapping is required"),
  }),
});

const getValidationSchema = (stagingMode, deliverMode) =>
  Yup.object().shape({
    stagingMode: Yup.string().required('Staging mode is required'),
    deliverMode: Yup.string().required('Deliver mode is required'),
    ...(deliverSchemas[deliverMode] ? deliverSchemas[deliverMode] : {}),
    ...(stagingSchemas[stagingMode] ? stagingSchemas[stagingMode] : {}),
    fields: Yup.array().of(Yup.object().shape({
      modelField: Yup.string().required("Model field name is required"),
      type: Yup.string().required('Field type is required'),
      mappedField: Yup.string().required('Mapped field is required'),
      isNullAccepted: Yup.boolean().required('Please check the value'),
      rules: Yup.array(),
    })).min(1, "Field mapping is required"),
    duplicatesAllowed: Yup.boolean().required('Value is required'),
    duplicatesMatching: Yup.string().when('duplicatesAllowed', {
      is: false,
      then: (schema) => schema.required('Please select matching type'),
      otherwise: (schema) => schema.notRequired(),
    }),

    duplicatesConstraints: Yup.array()
      .of(
        Yup.object().shape({
          fields: Yup.array()
            .of(Yup.string().required('Select field required'))
            .when(['$duplicatesAllowed', '$duplicatesMatching'], {
              is: (duplicatesAllowed, duplicatesMatching) =>
                duplicatesAllowed === false && duplicatesMatching === 'custom',
              then: (schema) => schema.required('Field selection required'),
              otherwise: (schema) => schema.notRequired(),
            }),

          type: Yup.string()
            .when(['$duplicatesAllowed', '$duplicatesMatching'], {
              is: (duplicatesAllowed, duplicatesMatching) =>
                duplicatesAllowed === false && duplicatesMatching === 'custom',
              then: (schema) => schema.required('Type is required'),
              otherwise: (schema) => schema.notRequired(),
            }),

          algorithm: Yup.string().when('type', {
            is: 'string',
            then: (schema) => schema.required('Algorithm is required'),
            otherwise: (schema) => schema.notRequired(),
          }),

          threshold: Yup.number().when('type', {
            is: 'string',
            then: (schema) => schema.required('Please select threshold'),
            otherwise: (schema) => schema.notRequired(),
          }),
        })
      )
      .when(['duplicatesAllowed', 'duplicatesMatching'], {
        is: (duplicatesAllowed, duplicatesMatching) =>
          duplicatesAllowed === false && duplicatesMatching === 'custom',
        then: (schema) => schema.min(1, 'At least one constraint is required'),
        otherwise: (schema) => schema.notRequired(),
      }),
    additionalFields: Yup.array(),
    dataAcceptanceRule: Yup.array()
  });

function setFields(data = []) {
  return data.map((item) => ({
    ...item,
    rules: Array.isArray(item.rules)
      ? item.rules.map((rule) => {
        const key = Object.keys(rule)[0];
        const value = rule[key];
        return { label: key, value };
      })
      : [],
  }));
}

function storeFields(data = []) {
  return data.map((item) => ({
    ...item,
    rules: Array.isArray(item.rules)
      ? item.rules.map((rule) => ({
        [rule.label]: rule.value,
      }))
      : [],
  }));
}


export default function ReactFlowTransformation({ data }) {
  const [isOpen, setIsOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [dynamicSchema, setDynamicSchema] = useState(getValidationSchema(''));

  // default values
  const defaultValues = useMemo(
    () => ({
      stagingMode: data.bluePrint?.stagingMode || "",
      deliverMode: data.bluePrint?.deliverMode || "",
      stagingModelName: data.bluePrint?.stagingModelName || "",
      stagingModelId: data.bluePrint?.stagingModelId || "",
      stagingRepositoryName: data.bluePrint?.stagingRepositoryName || "",
      deliverModelId: data.bluePrint?.deliverModelId || "",
      deliverModelName: data.bluePrint?.deliverModelName || "",
      deliverRepositoryName: data.bluePrint?.deliverRepositoryName || "",
      fields: data?.bluePrint?.fields?.length > 0 ? setFields(data?.bluePrint?.fields) : [],
      additionalFields: data?.bluePrint?.additionalFields || [],
      dataAcceptanceRule: data?.bluePrint?.dataAcceptanceRule || [],
      duplicatesAllowed: data?.bluePrint?.duplicatesAllowed || false,
      duplicatesConstraints: data?.bluePrint?.duplicatesConstraints || [],
      duplicatesMatching: data?.bluePrint?.duplicatesMatching || 'exact',
      endpoint: data.bluePrint?.endpoint || "",
      headers: data.bluePrint?.headers || "",
      payload: data.bluePrint?.payloadMapping || {},
    }),
    [data]
  );

  const methods = useForm({
    resolver: yupResolver(dynamicSchema),
    defaultValues,
  });

  console.log('defaultValues', defaultValues);

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting , errors},
  } = methods;

  const values = watch();


  console.log({errors})

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = handleSubmit(async (formData) => {
    const newData = {
      id: data.id,
      nodeName: data.label,
      type: data.type,
      fields: storeFields(formData.fields),
      additionalFields: formData.additionalFields,
      dataAcceptanceRule: formData.dataAcceptanceRule,
      stagingMode: formData.stagingMode,
      deliverMode: formData.deliverMode,
      stagingModelName: formData.stagingModelName,
      deliverModelName: formData.deliverModelName,
      stagingRepositoryName: formData.stagingRepositoryName,
      deliverRepositoryName: formData.deliverRepositoryName,
      stagingModelId: formData.stagingModelId,
      deliverModelId: formData.deliverModelId,
      duplicatesAllowed: formData.duplicatesAllowed,
      duplicatesMatching: formData.duplicatesMatching,
      duplicatesConstraints: formData.duplicatesConstraints
    }
    console.log({newData})
    data.functions.handleBluePrintComponent(data.label, data.id, newData);
    setIsOpen(false);
  });

  useEffect(() => {
    setDynamicSchema(getValidationSchema(values.stagingMode, values.deliverMode));
  }, [values.stagingMode, values.deliverMode]);

  const renderModeFields = (mode) => {
    switch (mode) {
      case "database":
        return <TransformationComponents />;
      case "api":
        return ('Not Done');
      default:
        return null;
    }
  };

  return (
    <Stack sx={{ marginTop: 3, zIndex: 100000 }} spacing={1}>
      <ReactFlowCustomNodeStructure data={data} />
      <Typography variant="h5">5. {data.label}</Typography>

      {data?.isProcessInstance !== true && (
        <Button
          sx={{ width: "200px", color: "royalBlue", borderColor: "royalBlue" }}
          onClick={() => setIsOpen(true)}
          variant="outlined"
        >
          Transformation
        </Button>
      )}

      {data?.isProcessInstance === true && (
        <Button
          sx={{ width: "200px", color: "royalBlue", borderColor: "royalBlue" }}
          variant="outlined"
          onClick={() => setLogsOpen(true)}
        >
          View Logs
        </Button>
      )}

      {/* Modal for Deliver config */}
      <CustomProcessDialogue
        isOpen={isOpen}
        handleCloseModal={() => setIsOpen(false)}
        title="Transformation"
      >
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Grid container spacing={2}>
            {/* Mode select */}
            <Grid item xs={12} md={12}>
              <RHFSelect name="stagingMode" label="Select Staging Mode">
                {deliverOptions.map((model) => (
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

            <Grid item xs={12} md={12}>
              <RHFSelect name="deliverMode" label="Select Deliver Mode">
                {deliverOptions.map((model) => (
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

            {/* Dynamic fields */}
            <Grid item xs={12} md={12} sx={{ mt: 2 }}>
              {renderModeFields(values.deliverMode)}
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
              Save
            </LoadingButton>
          </Stack>
        </FormProvider>
      </CustomProcessDialogue>

      {/* Logs modal */}
      <LogsProcessDialogue
        isOpen={logsOpen}
        handleCloseModal={() => setLogsOpen(false)}
        processInstanceId={14}
        nodeName={data.label}
      />
    </Stack>
  );
}

ReactFlowTransformation.propTypes = {
  data: PropTypes.object,
};
