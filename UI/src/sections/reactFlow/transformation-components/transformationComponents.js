import { useEffect, useState } from "react";
import { Grid, MenuItem, Stack } from "@mui/material";
import { RHFSelect, RHFTextField } from "src/components/hook-form";
import axiosInstance from "src/utils/axios";

export default function TransformationComponents() {
  const [databases, setDatabases] = useState([]);
  const [sourceId, setSourceId] = useState("");   // Step 1: Source (Staging)
  const [targetId, setTargetId] = useState("");   // Step 2: Target (Production)
  const [targetFields, setTargetFields] = useState([]);

  // Fetch all Deliver models
  useEffect(() => {
    axiosInstance
      .get("/deliver")
      .then((res) => {
        if (Array.isArray(res.data)) setDatabases(res.data);
      })
      .catch((err) => console.error("Error fetching Deliver models:", err));
  }, []);

  // Fetch fields only for target Production model
  useEffect(() => {
    if (!targetId) {
      setTargetFields([]);
      return;
    }

    const targetModel = databases.find((db) => db.id === targetId);

    if (targetModel?.modelName?.startsWith("Production")) {
      axiosInstance
        .get(`/deliver/${targetId}/fields`)
        .then((res) => {
          if (res.data?.fields) setTargetFields(res.data.fields);
        })
        .catch((err) => {
          console.error("Error fetching model fields:", err);
          setTargetFields([]);
        });
    } else {
      setTargetFields([]); // Clear if not production
    }
  }, [targetId, databases]);

  return (
    <Grid container spacing={3}>
      {/* Step 1: Select Source Model (Staging only) */}
      <Grid item xs={12}>
        <RHFSelect
          fullWidth
          label="Select Staging Source Model"
          name="sourceModel"
          value={sourceId}
          onChange={(e) => setSourceId(e.target.value)}
        >
          {databases
            .filter((db) => db.modelName.startsWith("Staging"))
            .map((db) => (
              <MenuItem key={db.id} value={db.id}>
                {db.modelName}
              </MenuItem>
            ))}
        </RHFSelect>
      </Grid>

      {/* Step 2: Select Target Model (Production only, exclude Staging sourceId) */}
      {sourceId && (
        <Grid item xs={12}>
          <RHFSelect
            fullWidth
            label="Select (Production) Model "
            name="targetModel"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
          >
            {databases
              .filter(
                (db) =>
                  db.modelName.startsWith("Production") && db.id !== sourceId
              )
              .map((db) => (
                <MenuItem key={db.id} value={db.id}>
                  {db.modelName}
                </MenuItem>
              ))}
          </RHFSelect>
        </Grid>
      )}

      {/* Step 3: Show fields of Target Production Model */}
      {targetId && targetFields.length > 0 && (
        <Grid item xs={12}>
          {targetFields.map((field) => (
            <Stack
              direction="row"
              spacing={2}
              key={field.name}
              sx={{ width: "100%", mt: 3 }}
            >
              {/* Field Name */}
              <RHFTextField
                fullWidth
                value={field.name}
                name={`target.${field.name}.fieldName`}
                label="Field Name"
                InputProps={{ readOnly: true }}
              />

              {/* Field Type */}
              <RHFTextField
                fullWidth
                value={field.type}
                name={`target.${field.name}.fieldType`}
                label="Field Type"
                InputProps={{ readOnly: true }}
              />

              {/* Mapping Input */}
              <RHFTextField
                fullWidth
                name={`mapping.${field.name}`}
                label="Mapping Field"
                placeholder="Enter field name"
              />
            </Stack>
          ))}
        </Grid>
      )}
    </Grid>
  );
}
