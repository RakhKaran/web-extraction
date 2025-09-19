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
import { useFieldArray, useFormContext } from "react-hook-form";

export default function TransformationComponents() {
  const [databases, setDatabases] = useState([]);
  const [stagingId, setStagingId] = useState("");
  const [productionId, setProductionId] = useState("");
  const [productionFields, setProductionFields] = useState([]);
  const [stagingFields, setStagingFields] = useState([]);
  const [customSelected, setCustomSelected] = useState({});
  const [nullableSelected, setNullableSelected] = useState({});
  const [duplicatesAllowed, setDuplicatesAllowed] = useState(false);

  const { control, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "customFields",
  });
  // const values = watch("customFields");
const values=["today","yesterday","day","days","days","week","weeks","weeks","month","months","year","years","date","date"];

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
    { label: "isDeleted", value: "isDeleted" },
    { label: "createdAt", value: "createdAt" },
    { label: "updatedAt", value: "updatedAt" },
    { label: "deletedAt", value: "deletedAt" },
    { label: "scrappedAt", value: "scrappedAt" },
  ];

  const fieldsType = [
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
        if (res.data?.fields) setStagingFields(res.data.fields);
      })
      .catch((err) => {
        console.error("Error fetching source fields:", err);
        setStagingFields([]);
      });
  }, [stagingId]);

  // Fetch fields for selected Production model
  useEffect(() => {
    if (!productionId) {
      setProductionFields([]);
      return;
    }
    axiosInstance
      .get(`/deliver/${productionId}/fields/false`)
      .then((res) => {
        if (res.data?.fields) setProductionFields(res.data.fields);
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
          name="stagingModelName"
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
      {stagingId && (
        <Grid item xs={12}>
          <RHFSelect
            fullWidth
            label="Select Production Model"
            name="deliverModelName"
            value={productionId}
            onChange={(e) => setProductionId(e.target.value)}
          >
            {databases.map((db) => (
              <MenuItem key={db.id} value={db.id}>
                {db.modelName}
              </MenuItem>
            ))}
          </RHFSelect>
        </Grid>
      )}

      {/* Production fields mapping */}
      {productionId && productionFields.length > 0 && (
        <Grid item xs={12}>
          {/* One toggle for all fields */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6">isDuplicatesAllowed?</Typography>
            <Switch
              checked={duplicatesAllowed}
              onChange={(e) => setDuplicatesAllowed(e.target.checked)}
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
          </Stack>

          {/* Production model fields */}
      {productionFields.map((field) => {
  const isCustom = customSelected[field.name] === true;
  const isNullAccepted = nullableSelected[field.name] === true;

  return (
    <Stack key={field.name} spacing={1} sx={{ width: "100%", mt: 3 }}>
      {/* Row with field name, type, map dropdown, and custom/nullable */}
      <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
        <RHFTextField
          fullWidth
          value={field.name}
          name={`modelField.${field.name}.modelField`}
          label="Production Field"
          InputProps={{ readOnly: true }}
        />

        <RHFTextField
          fullWidth
          value={field.type}
          name={`type.${field.name}.type`}
          label="Field Type"
          InputProps={{ readOnly: true }}
        />

        {/* Map from staging dropdown */}
        <RHFSelect
          fullWidth
          label="Map from Staging"
          name={`mappedField.${field.name}`}
          onChange={(e) => {
            if (e.target.value === "custom") {
              setCustomSelected((prev) => ({
                ...prev,
                [field.name]: true,
              }));
            } else {
              setCustomSelected((prev) => ({
                ...prev,
                [field.name]: false,
              }));
            }
          }}
        >
          {stagingFields.map((srcField) => (
            <MenuItem key={srcField.name} value={srcField.name}>
              {srcField.name}
            </MenuItem>
          ))}
          <MenuItem value="custom">Custom</MenuItem>
        </RHFSelect>

        {isCustom && (
          <RHFTextField
            fullWidth
            name={`custom.${field.name}`}
            label="Custom Value"
          />
        )}

        <FormControlLabel
          control={
            <Checkbox
              checked={isNullAccepted}
              onChange={(e) =>
                setNullableSelected((prev) => ({
                  ...prev,
                  [field.name]: e.target.checked,
                }))
              }
            />
          }
          label="Nullable"
        />
      </Stack>

      {/* Render rules below the row if type is Date */}
      
      {field.type.toLowerCase() === "date" && (
  <Stack spacing={2} sx={{ mt: 1 }}>
    <Typography variant="h6">Rules for Date:</Typography>
    {rulesOptions.map((rule, idx) => (
      <Stack key={idx} direction="row" spacing={2} alignItems="center">
        {/* Read-only rule label */}
        <RHFTextField
          fullWidth
          value={rule.label}
          name={`rules.${field.name}.${idx}.label`}
          label="Rule"
          InputProps={{ readOnly: true }}
        />

        {/* Dropdown for selecting values */}
        <RHFSelect
          fullWidth
          name={`rules.${field.name}.${idx}.value`}
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
          <Typography variant="h6">additionalFields:</Typography>
          {fields.map((item, index) => (
            <Stack direction="row" spacing={2} key={index} sx={{ width: "100%", mt: 2 }}>
              <RHFSelect
                fullWidth
                name={`customFields[${index}].modelField`}
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
                name={`customFields[${index}].type`}
                label="Type"
              >
                {fieldsType.map((f) => (
                  <MenuItem key={f.value} value={f.value}>
                    {f.label}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFSelect
                fullWidth
                name={`customFields[${index}].value`}
                label="Value"
              >
                {valueType.map((f) => (
                  <MenuItem key={f.value} value={f.value}>
                    {f.label}
                  </MenuItem>
                ))}
              </RHFSelect>


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
        </Grid>
      )}
    </Grid>
  );
}
