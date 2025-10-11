import { useEffect, useState } from "react";
import {
  Checkbox,
  Grid,
  MenuItem,
  Stack,
  FormControlLabel,
  Typography,
  Switch,
  Button,
} from "@mui/material";
import { RHFSelect, RHFTextField } from "src/components/hook-form";
import axiosInstance from "src/utils/axios";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import DuplicatesValidationSection from "./duplicatesValidationSection";

export default function TransformationComponents() {
  const [databases, setDatabases] = useState([]);
  const [stagingId, setStagingId] = useState("");
  const [productionId, setProductionId] = useState("");
  const [productionFields, setProductionFields] = useState([]);
  const [stagingFields, setStagingFields] = useState([]);
  const [customSelected, setCustomSelected] = useState({});
  const [nullableSelected, setNullableSelected] = useState({});
  const [duplicatesAllowed, setDuplicatesAllowed] = useState(false);

  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "additionalFields",
  });

  const {
    fields: rulesFields,
    append: appendRulesFields,
    remove: removeRulesFields,
  } = useFieldArray({
    control,
    name: "dataAcceptanceRule",
  });
  const yupValues = watch();
  const values = ["today", "yesterday", "day", "days", "days", "week", "weeks", "weeks", "month", "months", "year", "years", "date", "date"];

  const rulesOptions = [
    { label: "Just now", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "{number} day ago", value: "day" },
    { label: "{number} days ago", value: "days" },
    { label: "{number}+ days ago", value: "days" },
    { label: "{number} week ago", value: "week" },
    { label: "{number} weeks ago", value: "weeks" },
    { label: "{number}+ weeks ago", value: "weeks" },
    { label: "{number} month ago", value: "month" },
    { label: "{number} months ago", value: "months" },
    { label: "{number} year ago", value: "year" },
    { label: "{number} years ago", value: "years" },
    { label: "posted on {date}", value: "date" },
    { label: "{date}", value: "date" },
  ];


  const fieldsDropdown = [
    { label: "isActive", value: "isActive" },
    { label: "isDeleted", value: "isDeleted" },
    { label: "createdAt", value: "createdAt" },
    { label: "updatedAt", value: "updatedAt" },
    { label: "deletedAt", value: "deletedAt" },
    { label: "scrappedAt", value: "scrappedAt" },
    { label: "Company", value: "company" },
    {label:"Designation", value: "designation"},
  ];

  const fieldsType = [
    { label: "string", value: "string" },
    { label: "Boolean", value: "boolean" },
    { label: "Date", value: "Date" },
  ];

  const valueType = [
    { label: "True", value: "true" },
    { label: "False", value: "false" },
  ];

  // Fetch all Deliver models
  useEffect(() => {
    axiosInstance
      .get("/deliver")
      .then((res) => {
        if (Array.isArray(res?.data)) setDatabases(res.data);
      })
      .catch((err) => console.error("Error fetching Deliver models:", err));

    setStagingId(watch('stagingModelId'));
    setProductionId(watch('deliverModelId'));
  }, []);

  // Fetch fields for selected Staging model
  useEffect(() => {
    if (!stagingId) {
      setStagingFields([]);
      return;
    }
    axiosInstance
      .get(`/deliver/${stagingId}/fields/true`)
      .then((res) => {
        if (res.data?.fields) {
          setStagingFields(res.data.fields);

          setValue('stagingModelName', res.data.modelName);
          setValue('stagingRepositoryName', res.data.repositoryName);
          setValue('stagingModelId', res.data.id)
        }
      })
      .catch((err) => {
        console.error("Error fetching source fields:", err);
        setStagingFields([]);
      });
  }, [stagingId]);

  // Fetch fields for selected Production model
  useEffect(() => {
    console.log({productionId})
    if (!productionId) {
      setProductionFields([]);
      return;
    }
    axiosInstance
      .get(`/deliver/${productionId}/fields/false`)
      .then((res) => {
        if (res.data?.fields?.length > 0) {
          setProductionFields(res.data.fields);
          res?.data?.fields?.forEach((field, index) => {
            setValue(`fields[${index}].modelField`, field.name, { shouldValidate: true });
            setValue(`fields[${index}].type`, field.type, { shouldValidate: true });
          })
          setValue('deliverModelName', res.data.modelName);
          setValue('deliverRepositoryName', res.data.repositoryName);
          setValue('deliverModelId', res.data.id)
        }
      })
      .catch((err) => {
        console.error("Error fetching target fields:", err);
        setProductionFields([]);
      });
  }, [productionId]);

  return (
    <Grid container spacing={3}>
      {/* Select Staging Model */}
      <Grid item xs={12}>
        <RHFSelect
          fullWidth
          label="Select Staging Model"
          name="stagingModelId"
          value={stagingId}
          onChange={(e) => setStagingId(e.target.value)}
        >
          {databases.map((db) => (
            <MenuItem key={db.id} value={db.id}>
              {db.modelName}
            </MenuItem>
          ))}
        </RHFSelect>
      </Grid>

      {/* Select Production Model */}
      <Grid item xs={12}>
        <RHFSelect
          fullWidth
          label="Select Production Model"
          name="deliverModelId"
          value={productionId}
          onChange={(e)=> {
            setProductionId(e.target.value)}}
        >
          {databases.map((db) => (
            <MenuItem key={db.id} value={db.id}>
              {db.modelName}
            </MenuItem>
          ))}
        </RHFSelect>
      </Grid>

      {/* Production fields mapping */}
      {productionId && productionFields.length > 0 && (
        <Grid item xs={12}>
          {/* Production model fields */}
          {productionFields.map((field, index) => {
            const isCustom = customSelected[field.name] === true;
            const isNullAccepted = nullableSelected[field.name] === true;

            return (
              <Stack key={field.name} spacing={1} sx={{ width: "100%", mt: 3 }}>
                <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
                  {/* modelField */}
                  <RHFTextField
                    fullWidth
                    name={`fields[${index}].modelField`}
                    label="Production Field"
                    InputProps={{ readOnly: true }}
                  />

                  {/* type */}
                  <RHFTextField
                    fullWidth
                    name={`fields[${index}].type`}
                    label="Field Type"
                    InputProps={{ readOnly: true }}
                  />

                  {/* mappedField */}
                  <RHFSelect
                    fullWidth
                    label="Map from Staging"
                    name={`fields[${index}].mappedField`}
                  // onChange={(e) => {
                  //   if (e.target.value === "custom") {
                  //     setCustomSelected((prev) => ({
                  //       ...prev,
                  //       [field.name]: true,
                  //     }));
                  //   } else {
                  //     setCustomSelected((prev) => ({
                  //       ...prev,
                  //       [field.name]: false,
                  //     }));
                  //   }
                  // }}
                  >
                    {stagingFields.map((srcField) => (
                      <MenuItem key={srcField.name} value={srcField.name}>
                        {srcField.name}
                      </MenuItem>
                    ))}
                    {/* <MenuItem value="custom">Custom</MenuItem> */}
                  </RHFSelect>
                  {/* 
                  {isCustom && (
                    <RHFTextField
                      fullWidth
                      name={`fields[${index}].customValue`}
                      label="Custom Value"
                    />
                  )} */}

                  {/* isNullAccepted */}
                  <Controller
                    name={`fields[${index}].isNullAccepted`}
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={!!field.value} />}
                        label="Nullable"
                      />
                    )}
                  />
                </Stack>

                {/* Rules (if type is Date) */}
                {field.type.toLowerCase() === "date" && (
                  <Stack spacing={2} sx={{ mt: 1 }}>
                    <Typography variant="h6">Rules for Date:</Typography>
                    {rulesOptions.map((rule, idx) => (
                      <Stack key={idx} direction="row" spacing={2} alignItems="center">
                        <RHFTextField
                          fullWidth
                          value={rule.label}
                          name={`fields[${index}].rules[${idx}].label`}
                          label="Rule"
                          InputProps={{ readOnly: true }}
                        />
                        <RHFSelect
                          fullWidth
                          name={`fields[${index}].rules[${idx}].value`}
                          label="Value"
                        >
                          {values.map((val) => (
                            <MenuItem key={val} value={val}>
                              {val}
                            </MenuItem>
                          ))}
                        </RHFSelect>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Stack>
            );
          })}

          {/* Appended custom fields */}
          <br />
          <Typography variant="h6">Additional Fields:</Typography>
          {fields.map((item, index) => (
            <Stack direction="row" spacing={2} key={index} sx={{ width: "100%", mt: 2 }}>
              <RHFSelect
                fullWidth
                name={`additionalFields[${index}].modelField`}
                label="Model Field"
              >
                {fieldsDropdown.map((f) => (
                  <MenuItem key={f.value} value={f.value}>
                    {f.label}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFSelect
                fullWidth
                name={`additionalFields[${index}].type`}
                label="Type"
              >
                {fieldsType.map((f) => (
                  <MenuItem key={f.value} value={f.value}>
                    {f.label}
                  </MenuItem>
                ))}
              </RHFSelect>

              {watch(`additionalFields[${index}].type`) === "boolean" ? (
                <RHFSelect
                  fullWidth
                  name={`additionalFields.${index}.value`}
                  label="Value"
                >
                  {valueType.map((f) => (
                    <MenuItem key={f.value} value={f.value}>
                      {f.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
              ) : (
                <RHFTextField
                  fullWidth
                  name={`additionalFields.${index}.value`}
                  label="Value"
                />
              )}
            </Stack>
          ))}

          {/* Add Fields Button */}
          <Stack direction="row" justifyContent="flex-start" sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              type="button"
              onClick={() =>
                append({ modelField: "", type: "", value: "" })
              }
            >
              + Add Field
            </Button>
          </Stack>

          {/* Appended custom fields */}
          <br />
          <Typography variant="h6">Data Acceptance Rules:</Typography>
          {rulesFields.map((item, index) => (
            <Stack direction="row" spacing={2} key={index} sx={{ width: "100%", mt: 2 }}>
              <RHFTextField
                fullWidth
                name={`dataAcceptanceRule[${index}].field`}
                label="Field"
              />

              <RHFSelect
                fullWidth
                name={`dataAcceptanceRule[${index}].type`}
                label="Type"
              >
                {fieldsType.map((f) => (
                  <MenuItem key={f.value} value={f.value}>
                    {f.label}
                  </MenuItem>
                ))}
              </RHFSelect>

              {watch(`dataAcceptanceRule[${index}].type`) === "boolean" ? (
                <RHFSelect
                  fullWidth
                  name={`dataAcceptanceRule.${index}.value`}
                  label="Value"
                >
                  {valueType.map((f) => (
                    <MenuItem key={f.value} value={f.value}>
                      {f.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
              ) : (
                <RHFTextField
                  fullWidth
                  name={`dataAcceptanceRule.${index}.value`}
                  label="Value"
                />
              )}


            </Stack>
          ))}

          {/* Add Fields Button */}
          <Stack direction="row" justifyContent="flex-start" sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              type="button"
              onClick={() =>
                appendRulesFields({ field: "", type: "", value: "" })
              }
            >
              + Add Field
            </Button>
          </Stack>

          <br />
          {/* One toggle for all fields */}
          <Stack direction='column' spacing={1}>
            <Typography variant="h6">Data Duplication Validation Rules:</Typography>

            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body1">isDuplicatesAllowed?</Typography>
              <Controller
                name="duplicatesAllowed"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <Switch
                    {...field}
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#fff",
                        transform: "translateX(20px)",
                        "& + .MuiSwitch-track": {
                          backgroundColor: "green",
                          opacity: 1,
                        },
                      },
                      "& .MuiSwitch-switchBase": {
                        color: "#fff",
                      },
                      "& .MuiSwitch-track": {
                        backgroundColor: "red",
                        opacity: 1,
                      },
                    }}
                  />
                )}
              />
            </Stack>

            {yupValues.duplicatesAllowed === false && (
              <RHFSelect name="duplicatesMatching" label="Matching Type">
                {[
                  { label: "Exact Matching", value: "exact" },
                  { label: "Custom Matching", value: "custom" },
                ].map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            )}

            {yupValues.duplicatesMatching === "custom" && yupValues.duplicatesAllowed === false && (
              <DuplicatesValidationSection fieldsOpt={productionFields} />
            )}
          </Stack>
        </Grid>
      )}
    </Grid>
  );
}
