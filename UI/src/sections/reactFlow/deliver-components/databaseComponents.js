import { useEffect, useState } from "react";
import { Grid, MenuItem, TextField, Stack, Button, Typography } from "@mui/material";
import { RHFSelect, RHFTextField } from "src/components/hook-form";
import axiosInstance from "src/utils/axios";
import { useFieldArray, useFormContext } from "react-hook-form";
import Conditions from "./conditions";

// Dummy Locate JSON schema
// const locateSchema = {
//   jobTitle: "Frontend Developer",
//   companyName: "Tech Corp",
//   city: "Pune",
//   expYears: "3",
//   compensation: "12 LPA",
//   jobDesc: "Responsible for frontend development",
//   technologies: "React, Node.js",
// };


export default function DatabaseComponents() {
  const [databases, setDatabases] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [dbFields, setDbFields] = useState([]);
  const { control, watch, setValue } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "additionalFields",
  });

  const values = watch();

  const fieldsType = [
    { label: "string", value: "string" },
    { label: "Boolean", value: "boolean" },
    { label: "Date", value: "date" },
  ];

  const valueType = [
    { label: "True", value: "true" },
    { label: "False", value: "false" },
  ];

  // Fetch all Deliver models for dropdown
  useEffect(() => {
    axiosInstance
      .get("/deliver")
      .then((res) => {
        if (Array.isArray(res.data)) setDatabases(res.data);
      })
      .catch((err) => console.error("Error fetching Deliver models:", err));

    setSelectedId(watch('modelId'));
  }, []);

  // Fetch fields for selected model
  useEffect(() => {
    if (!selectedId) {
      setDbFields([]);
      return;
    }

    axiosInstance
      .get(`/deliver/${selectedId}/fields/false`)
      .then((res) => {
        if (res.data?.fields) {
          const newArray = res?.data?.fields?.filter(
            (field) =>
              field.name !== "scrappedAt" &&
              field.name !== "isDeleted" &&
              field.name !== "isSync"
          );
          setDbFields(newArray);

          if (newArray.length > 0) {
            newArray.forEach((item, index) => {
              setValue(`mapping.${index}.modelField`, item.name);
              setValue(`mapping.${index}.type`, item.type);
            });
          }

          setValue('model', res.data.modelName);
          setValue('modelId', res.data.id);
          setValue('repository', res.data.repositoryName);
        }
      })
      .catch((err) => {
        console.error("Error fetching model fields:", err);
        setDbFields([]);
      });
  }, [selectedId]);

  console.log('values', values);

  return (
    <Grid container spacing={2}>
      {/* Dropdown to select Database/Model */}
      <Grid item xs={12}>
        <RHFSelect
          fullWidth
          label="Select Model"
          name="modelId"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {databases.map((db) => (
            <MenuItem key={db.id} value={db.id}>
              {db.modelName}
            </MenuItem>
          ))}
        </RHFSelect>


        {/* Display fields and dummy locateData dropdown */}
        {dbFields.map((field, index) => (
          <Stack direction='column' spacing={1}>
            <Stack
              direction="row"
              spacing={2}
              key={field.name}
              sx={{ width: "100%", mt: 2 }}
            >
              {/* Model Field (readonly, pre-filled) */}
              <RHFTextField
                fullWidth
                name={`mapping.${index}.modelField`}
                label="Field Name"
                InputProps={{ readOnly: true }}
              />

              {/* Field Type (readonly, pre-filled) */}
              <RHFTextField
                fullWidth
                name={`mapping.${index}.type`}
                label="Field Type"
                InputProps={{ readOnly: true }}
              />

              {/* Mapping dropdown (user selects target field) */}
              <RHFTextField
                fullWidth
                name={`mapping.${index}.mappedField`}
                label="Mapped Field"
              />
            </Stack>

            {/* conditions for fields.. */}
            <Conditions index={index} type={field.type} />
          </Stack>
        ))}

        {/* Appended custom fields */}
        <br />
        <Typography variant="h6">Additional Fields:</Typography>
        {fields.map((item, index) => (
          <Stack direction="row" spacing={2} key={index} sx={{ width: "100%", mt: 2 }}>
            <RHFTextField
              fullWidth
              name={`additionalFields[${index}].modelField`}
              label="Field"
            />

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

            {watch(`dataAcceptanceRule[${index}].type`) === "boolean" ? (
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
              append({ field: "", type: "", value: "" })
            }
          >
            + Add Field
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}
