import { useEffect, useState } from "react";
import { Grid, MenuItem, TextField, Stack } from "@mui/material";
import { RHFSelect, RHFTextField } from "src/components/hook-form";
import axiosInstance from "src/utils/axios";

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

  // Fields to exclude


  // Fetch all Deliver models for dropdown
  useEffect(() => {
    axiosInstance
      .get("/deliver")
      .then((res) => {
        if (Array.isArray(res.data)) setDatabases(res.data);
      })
      .catch((err) => console.error("Error fetching Deliver models:", err));
  }, []);

  // Fetch fields for selected model
  useEffect(() => {
    if (!selectedId) {
      setDbFields([]);
      return;
    }

    axiosInstance
      .get(`/deliver/${selectedId}/fields`)
      .then((res) => {
        if (res.data?.fields) setDbFields(res.data.fields);
      })
      .catch((err) => {
        console.error("Error fetching model fields:", err);
        setDbFields([]);
      });
  }, [selectedId]);

  return (
    <Grid container spacing={2}>
      {/* Dropdown to select Database/Model */}
      <Grid item xs={12}>
        <RHFSelect
          fullWidth
          label="Select Model"
          name="model"
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
        {dbFields
          .map((field) => (
            <Stack
              direction="row"
              spacing={2}
              key={field.name}
              sx={{ width: '100%', mt: 4 }}
            >
              {/* Field Name */}
              <RHFTextField
                fullWidth
                value={field.name}
                name="fieldName"
                label="Field Name"
                InputProps={{ readOnly: true }}
              />

              {/* Field Type */}
              <RHFTextField
                fullWidth
                value={field.type}
                name="fieldType"
                label="Field Type"
                InputProps={{ readOnly: true }}
              />

              {/* Optional: Mapping dropdown */}
              <RHFTextField
                fullWidth
                name="mapppingField"
                label="Field Name"
              />

            </Stack>
          ))}
      </Grid>
    </Grid>
  );
}
